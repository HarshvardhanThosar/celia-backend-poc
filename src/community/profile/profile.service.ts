import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { MongoRepository } from 'typeorm';
import { Profile } from './entities/profile.entity';
import { UpdateProfileDTO } from './dto/update-profile.dto';
import { UserID } from 'src/keycloak/types/user';
import { ObjectId } from 'mongodb';
import { Skill } from 'src/skills/entities/skill.entity';
import { Task } from 'src/community/tasks/entities/task.entity';
import { TaskStatus } from 'src/community/tasks/enums/task-status.enum';
import { KeycloakAdminService } from 'src/keycloak/admin/keycloak-admin.service';

@Injectable()
export class ProfileService {
  private readonly logger = new Logger(ProfileService.name);

  constructor(
    private keycloak_admin_service: KeycloakAdminService,

    @InjectRepository(Profile)
    private readonly profile_repository: MongoRepository<Profile>,

    @InjectRepository(Task)
    private readonly task_repository: MongoRepository<Task>,

    @InjectRepository(Skill)
    private readonly skill_repository: MongoRepository<Skill>,
  ) {}

  async create_profile(
    user_id: UserID,
    tnc_accepted: boolean,
  ): Promise<Profile> {
    const profile = this.profile_repository.create({
      _id: user_id,
      score: 0,
      coins: 0,
      coupons: [],
      tasks_participated: [],
      tasks_created: [],
      skills: [],
      profile_image: undefined,
      tnc_accepted,
    });
    return await this.profile_repository.save(profile);
  }

  async get_profile(user_id: UserID): Promise<Profile> {
    const profile = await this.profile_repository.findOne({
      where: { _id: user_id },
    });
    if (!profile) {
      throw new NotFoundException(`Profile not found for user ID: ${user_id}`);
    }
    return profile;
  }

  async get_all_profiles(): Promise<Profile[]> {
    return this.profile_repository.find();
  }

  async get_user_details(
    user_id: string,
  ): Promise<{ name: string; profile_image?: string }> {
    try {
      const user = await this.keycloak_admin_service.get_user_by_id(user_id);
      const profile = await this.profile_repository.findOne({
        where: { _id: user_id },
      });

      const user_data = {
        name:
          user?.firstName && user?.lastName
            ? `${user.firstName} ${user.lastName}`
            : user?.username || 'Unknown',
        profile_image: profile?.profile_image,
        _id: user_id,
      };

      return user_data;
    } catch (error) {
      this.logger.error(`Failed to fetch user details for ${user_id}`, error);
      return { name: 'Unknown' };
    }
  }

  async enrich_users(
    user_ids: string[],
  ): Promise<
    Record<string, { name: string; profile_image?: string; _id: string }>
  > {
    const enriched: Record<
      string,
      { name: string; profile_image?: string; _id: string }
    > = {};
    const seen = new Map();
    for (const user_id of user_ids) {
      if (!seen.has(user_id)) {
        seen.set(user_id, await this.get_user_details(user_id));
      }
      enriched[user_id] = seen.get(user_id);
    }
    return enriched;
  }

  async update_profile(
    user_id: UserID,
    profile_data: UpdateProfileDTO,
  ): Promise<Profile> {
    const { profile_image } = profile_data;
    const profile = await this.profile_repository.findOne({
      where: { _id: user_id },
    });
    if (!profile) throw new Error('Profile not found');

    if (profile_image) profile.profile_image = profile_image;
    return await this.profile_repository.save(profile);
  }

  async add_task_participation(
    user_id: UserID,
    task_id: string,
  ): Promise<void> {
    await this.profile_repository.updateOne(
      { _id: user_id },
      { $addToSet: { tasks_participated: task_id } as any },
    );
  }

  async add_task_creation(user_id: UserID, task_id: string): Promise<void> {
    await this.profile_repository.updateOne(
      { _id: user_id },
      { $addToSet: { tasks_created: task_id } as any },
    );
  }

  async register_preferred_skills(
    user_id: UserID,
    skill_ids: string[],
  ): Promise<Profile> {
    const profile = await this.get_profile(user_id);
    const existing_skills = new Map(
      (profile.skills || []).map((s) => [s.skill_id, s]),
    );

    for (const skill_id of skill_ids) {
      if (!existing_skills.has(skill_id)) {
        const skill = await this.skill_repository.findOne({
          where: { _id: new ObjectId(skill_id) },
        });

        if (!skill) continue;

        existing_skills.set(skill_id, {
          skill_id: skill_id,
          skill_name: skill.name,
          hours: 0,
        });
      }
    }

    profile.skills = Array.from(existing_skills.values());
    return await this.profile_repository.save(profile);
  }

  async update_skill_hours_from_attendance(
    user_id: string,
    task_id: string,
    attended_days: number,
  ): Promise<void> {
    const profile = await this.get_profile(user_id);
    const task = await this.task_repository.findOne({
      where: { _id: new ObjectId(task_id) },
    });
    if (!task) throw new NotFoundException('Task not found');
    if (task.status !== TaskStatus.COMPLETED) return;

    const skills = task.task_type?.skills || [];
    const existing_skills = new Map(
      profile.skills?.map((s) => [s.skill_id.toString(), s]) || [],
    );

    for (const skill of skills) {
      const id = skill._id.toString();
      const prev = existing_skills.get(id)?.hours || 0;
      existing_skills.set(id, {
        skill_id: skill._id.toString(),
        skill_name: skill.name,
        hours: prev + attended_days * task.hours_required_per_day,
      });
    }

    const total_score = (task.score_breakdown || []).reduce(
      (sum, item) => sum + (item.score || 0),
      0,
    );

    profile.score += total_score;
    profile.coins = (profile.coins || 0) + total_score;
    profile.skills = Array.from(existing_skills.values());

    await this.profile_repository.save(profile);
  }

  async calculate_attendance_streak(user_id: string): Promise<number> {
    const tasks = await this.task_repository.find({
      where: {
        status: TaskStatus.COMPLETED,
        $or: [
          { 'participants.user_id': user_id },
          { attendance_log: { $exists: true } },
        ],
      },
    });

    const attended_dates = new Set<string>();
    for (const task of tasks) {
      if (!task.attendance_log) continue;
      for (const [date, users] of Object.entries(task.attendance_log)) {
        if ((users as string[]).includes(user_id)) {
          attended_dates.add(date);
        }
      }
    }

    const today = new Date();
    let streak = 0;
    for (let i = 0; ; i++) {
      const checkDate = new Date(today);
      checkDate.setDate(today.getDate() - i);
      const key = checkDate.toISOString().split('T')[0];
      if (attended_dates.has(key)) {
        streak++;
      } else {
        break;
      }
    }

    return streak;
  }
}
