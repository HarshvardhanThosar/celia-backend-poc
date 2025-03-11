import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { MongoRepository } from 'typeorm';
import { Profile } from './entities/profile.entity';
import { UpdateProfileDTO } from './dto/update-profile.dto';
import { UserID } from 'src/keycloak/types/user';

@Injectable()
export class ProfileService {
  constructor(
    @InjectRepository(Profile)
    private readonly profile_repository: MongoRepository<Profile>,
  ) {}

  async create_profile(user_id: UserID): Promise<Profile> {
    const profile = this.profile_repository.create({
      _id: user_id,
      score: 0,
      coupons: [],
      tasks_participated: [],
      tasks_created: [],
      profile_image: undefined,
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

  async update_profile(
    user_id: UserID,
    profile_data: UpdateProfileDTO,
  ): Promise<Profile> {
    const { profile_image } = profile_data;
    const profile = await this.profile_repository.findOne({
      where: { _id: user_id },
    });

    if (!profile) {
      throw new Error('Profile not found');
    }
    if (profile_image) profile.profile_image = profile_image;
    return await this.profile_repository.save(profile);
  }
  async add_task_participation(
    user_id: UserID,
    task_id: string,
  ): Promise<void> {
    await this.profile_repository.updateOne(
      { _id: user_id },
      {
        $addToSet: { tasks_participated: task_id } as any,
      },
    );
  }

  async add_task_creation(user_id: UserID, task_id: string): Promise<void> {
    await this.profile_repository.updateOne(
      { _id: user_id },
      {
        $addToSet: { tasks_created: task_id } as any,
      },
    );
  }
}
