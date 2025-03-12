import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ObjectId } from 'mongodb';
import { Skill } from 'src/skills/entities/skill.entity';
import { SkillStatus } from 'src/skills/enums/skill-status.enum';
import { TaskType } from 'src/task_types/entities/task_type.entity';
import { TaskTypeStatus } from 'src/task_types/enums/task-type-status.enum';
import { Repository } from 'typeorm';

@Injectable()
export class MasterService implements OnModuleInit {
  private readonly logger = new Logger(MasterService.name);

  constructor(
    @InjectRepository(Skill)
    private skill_repository: Repository<Skill>,

    @InjectRepository(TaskType)
    private task_type_repository: Repository<TaskType>,
  ) {}

  async onModuleInit() {
    await this.insert_static_data();
  }

  private async insert_skill(
    name: string,
    description: string,
    score: number,
  ): Promise<ObjectId> {
    const existingSkill = await this.skill_repository.findOne({
      where: { name },
    });
    if (existingSkill) return existingSkill._id;

    const skill = this.skill_repository.create({
      _id: new ObjectId(),
      name,
      description,
      status: SkillStatus.ACTIVE,
      created_at: new Date(),
      updated_at: new Date(),
      score,
    });

    const saved_skill = await this.skill_repository.save(skill);
    if (!saved_skill || !saved_skill._id) {
      throw new Error(`Failed to insert skill: ${name}`);
    }
    return saved_skill._id;
  }

  private async insert_task_type(
    name: string,
    description: string,
    skill_ids: ObjectId[],
  ) {
    if (!skill_ids || skill_ids.length === 0) {
      throw new Error(`No skill IDs provided for task type: ${name}`);
    }
    const existingTaskType = await this.task_type_repository.findOne({
      where: { name },
    });
    if (existingTaskType) return existingTaskType._id;

    const taskType = this.task_type_repository.create({
      _id: new ObjectId(),
      name,
      description,
      status: TaskTypeStatus.ACTIVE,
      skills: skill_ids.map((id) => ({ _id: id }) as any),
      created_at: new Date(),
      updated_at: new Date(),
    });
    await this.task_type_repository.save(taskType);
  }

  private async insert_static_data() {
    try {
      const firstAidId = await this.insert_skill(
        'First Aid',
        'Basic emergency medical care training',
        50,
      );
      const teachingId = await this.insert_skill(
        'Teaching',
        'Providing educational support and tutoring',
        50,
      );
      const leadershipId = await this.insert_skill(
        'Leadership',
        'Guiding and managing teams effectively',
        50,
      );
      const eventMgmtId = await this.insert_skill(
        'Event Management',
        'Planning and organizing community events',
        50,
      );
      const disasterReliefId = await this.insert_skill(
        'Disaster Relief',
        'Assisting in emergency disaster situations',
        50,
      );
      const fundraisingId = await this.insert_skill(
        'Fundraising',
        'Managing and executing fundraising initiatives',
        50,
      );
      const animalWelfareId = await this.insert_skill(
        'Animal Welfare',
        'Rescuing and rehabilitating animals',
        50,
      );
      const elderlyCareId = await this.insert_skill(
        'Elderly Care',
        'Providing assistance to elderly citizens',
        50,
      );
      const technicalSupportId = await this.insert_skill(
        'Technical Support',
        'Helping communities with technology',
        50,
      );
      const environmentalConservationId = await this.insert_skill(
        'Environmental Conservation',
        'Preserving the environment',
        50,
      );

      await this.insert_task_type(
        'Medical Assistance',
        'Helping patients and medical staff',
        [firstAidId],
      );
      await this.insert_task_type(
        'Educational Support',
        'Tutoring and mentoring students',
        [teachingId],
      );
      await this.insert_task_type(
        'Community Service',
        'General volunteering for community welfare',
        [leadershipId, eventMgmtId],
      );
      await this.insert_task_type(
        'Emergency Response',
        'Helping during crises like floods or fires',
        [firstAidId, disasterReliefId],
      );
      await this.insert_task_type(
        'Environmental Cleanup',
        'Cleaning public spaces and parks',
        [environmentalConservationId],
      );
      await this.insert_task_type(
        'Fundraising Events',
        'Organizing charity and donation drives',
        [fundraisingId],
      );
      await this.insert_task_type(
        'Animal Rescue',
        'Saving and rehabilitating stray animals',
        [animalWelfareId],
      );
      await this.insert_task_type(
        'Elderly Assistance',
        'Helping elderly citizens with daily tasks',
        [elderlyCareId],
      );
      await this.insert_task_type(
        'Health Awareness Campaign',
        'Spreading awareness on health issues',
        [teachingId, leadershipId],
      );
      await this.insert_task_type(
        'Food Distribution',
        'Helping in food drives and soup kitchens',
        [eventMgmtId],
      );
      await this.insert_task_type(
        'Shelter Assistance',
        'Supporting homeless shelters and rehabilitation centers',
        [leadershipId],
      );
      await this.insert_task_type(
        'Technical Training',
        'Providing IT and vocational training to communities',
        [technicalSupportId],
      );

      this.logger.log('Static skills and task types inserted successfully!');
    } catch (error) {
      this.logger.error(
        `Failed to insert static skills and task types: ${JSON.stringify(error)}`,
      );
    }
  }
}
