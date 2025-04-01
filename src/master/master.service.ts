// import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
// import { InjectRepository } from '@nestjs/typeorm';
// import { MongoRepository } from 'typeorm';
// import { Skill } from 'src/skills/entities/skill.entity';
// import { TaskType } from 'src/task_types/entities/task_type.entity';
// import { SkillStatus } from 'src/skills/enums/skill-status.enum';
// import { TaskTypeStatus } from 'src/task_types/enums/task-type-status.enum';

// @Injectable()
// export class MasterService implements OnModuleInit {
//   private readonly logger = new Logger(MasterService.name);

//   constructor(
//     @InjectRepository(Skill)
//     private skill_repository: MongoRepository<Skill>,

//     @InjectRepository(TaskType)
//     private task_type_repository: MongoRepository<TaskType>,
//   ) {}

//   private sleep(ms: number) {
//     return new Promise((resolve) => setTimeout(resolve, ms));
//   }

//   async onModuleInit() {
//     const MAX_RETRIES = 10 * 2;
//     const RETRY_DELAY_MS = 2000; // 2 seconds
//     let attempt = 0;

//     while (attempt < MAX_RETRIES) {
//       try {
//         this.logger.log(
//           `Seeding master data (attempt ${attempt + 1}/${MAX_RETRIES})...`,
//         );
//         const skillsMap = await this.insert_skills();
//         await this.insert_task_types(skillsMap);
//         this.logger.log('Master data inserted successfully!');
//         break; // Exit loop on success
//       } catch (error) {
//         attempt++;
//         this.logger.error(`Master data insertion failed: ${error.message}`);
//         if (attempt < MAX_RETRIES) {
//           this.logger.warn(`🔁 Retrying in ${RETRY_DELAY_MS / 1000}s...`);
//           await this.sleep(RETRY_DELAY_MS);
//         } else {
//           this.logger.error('Max retries reached. Seeding aborted.');
//         }
//       }
//     }
//   }

//   private async insert_skill(
//     name: string,
//     description: string,
//     score: number,
//   ): Promise<Skill> {
//     const existing = await this.skill_repository.findOne({ where: { name } });
//     if (existing) return existing;

//     const skill = this.skill_repository.create({
//       name,
//       description,
//       score,
//       status: SkillStatus.ACTIVE,
//       created_at: new Date(),
//       updated_at: new Date(),
//     });

//     const saved = await this.skill_repository.save(skill);
//     this.logger.debug(`Inserted skill: ${name}`);
//     return saved;
//   }

//   private async insert_skills(): Promise<Map<string, Skill>> {
//     const skillNames = [
//       'First Aid/CPR',
//       'Patient Care',
//       'Health Monitoring',
//       'Mental Health Support',
//       'Medication Management',
//       'Digital Literacy',
//       'Social Media Management',
//       'Database Management',
//       'Web Development',
//       'Multimedia Production',
//       'Cooking/Food Preparation',
//       'Gardening/Landscaping',
//       'Carpentry/Construction',
//       'Event Planning',
//       'Transportation Services',
//       'Communication',
//       'Active Listening',
//       'Problem-Solving',
//       'Empathy',
//       'Time Management',
//       'Conflict Resolution',
//       'Mentoring',
//       'Cultural Sensitivity',
//       'Leadership',
//       'Project Management',
//     ];

//     const skillsMap = new Map<string, Skill>();
//     for (const name of skillNames) {
//       const skill = await this.insert_skill(name, name, 50);
//       skillsMap.set(name, skill);
//     }
//     return skillsMap;
//   }

//   private async insert_task_type(
//     name: string,
//     description: string,
//     skillNames: string[],
//     skillsMap: Map<string, Skill>,
//   ) {
//     const existing = await this.task_type_repository.findOne({
//       where: { name },
//     });
//     if (existing) {
//       this.logger.warn(`Task type already exists: ${name}`);
//       return;
//     }

//     const missingSkills = skillNames.filter((name) => !skillsMap.has(name));
//     if (missingSkills.length) {
//       throw new Error(
//         `Missing skills for task type "${name}": ${missingSkills.join(', ')}`,
//       );
//     }

//     const skills = skillNames.map((name) => {
//       const skill = skillsMap.get(name)!;
//       return {
//         _id: skill._id,
//         name: skill.name,
//         score: skill.score,
//       };
//     });

//     const taskType = this.task_type_repository.create({
//       name,
//       description,
//       skills,
//       status: TaskTypeStatus.ACTIVE,
//       created_at: new Date(),
//       updated_at: new Date(),
//     });

//     await this.task_type_repository.save(taskType);
//     this.logger.debug(`Inserted task type: ${name}`);
//   }

//   private async insert_task_types(skillsMap: Map<string, Skill>) {
//     const taskTypes = [
//       {
//         name: 'Elderly Care',
//         description: 'Supporting senior citizens',
//         skills: [
//           'First Aid/CPR',
//           'Patient Care',
//           'Health Monitoring',
//           'Medication Management',
//           'Cooking/Food Preparation',
//           'Transportation Services',
//           'Communication',
//           'Active Listening',
//           'Empathy',
//           'Time Management',
//         ],
//       },
//       {
//         name: 'Childcare and Youth Development',
//         description: 'Supporting children and youth',
//         skills: [
//           'First Aid/CPR',
//           'Digital Literacy',
//           'Cooking/Food Preparation',
//           'Communication',
//           'Active Listening',
//           'Problem-Solving',
//           'Empathy',
//           'Mentoring',
//           'Cultural Sensitivity',
//           'Leadership',
//         ],
//       },
//       {
//         name: 'Healthcare Support',
//         description: 'Supplementing medical care',
//         skills: [
//           'First Aid/CPR',
//           'Patient Care',
//           'Health Monitoring',
//           'Mental Health Support',
//           'Medication Management',
//           'Database Management',
//           'Communication',
//           'Active Listening',
//           'Empathy',
//           'Time Management',
//         ],
//       },
//       {
//         name: 'Educational Support',
//         description: 'Enhancing learning',
//         skills: [
//           'Digital Literacy',
//           'Multimedia Production',
//           'Communication',
//           'Active Listening',
//           'Problem-Solving',
//           'Mentoring',
//           'Cultural Sensitivity',
//           'Leadership',
//           'Project Management',
//           'Time Management',
//         ],
//       },
//       {
//         name: 'Environmental Conservation',
//         description: 'Protecting nature',
//         skills: [
//           'Digital Literacy',
//           'Social Media Management',
//           'Gardening/Landscaping',
//           'Carpentry/Construction',
//           'Event Planning',
//           'Problem-Solving',
//           'Leadership',
//           'Project Management',
//           'Communication',
//           'Cultural Sensitivity',
//         ],
//       },
//       {
//         name: 'Animal Welfare',
//         description: 'Protecting and caring for animals',
//         skills: [
//           'First Aid/CPR',
//           'Health Monitoring',
//           'Social Media Management',
//           'Event Planning',
//           'Communication',
//           'Empathy',
//           'Time Management',
//           'Problem-Solving',
//           'Project Management',
//         ],
//       },
//       {
//         name: 'Community Development',
//         description: 'Building strong communities',
//         skills: [
//           'Digital Literacy',
//           'Social Media Management',
//           'Web Development',
//           'Carpentry/Construction',
//           'Gardening/Landscaping',
//           'Event Planning',
//           'Leadership',
//           'Project Management',
//           'Communication',
//           'Problem-Solving',
//         ],
//       },
//       {
//         name: 'Crisis Response',
//         description: 'Emergency and disaster support',
//         skills: [
//           'First Aid/CPR',
//           'Mental Health Support',
//           'Digital Literacy',
//           'Transportation Services',
//           'Communication',
//           'Problem-Solving',
//           'Empathy',
//           'Leadership',
//           'Time Management',
//           'Conflict Resolution',
//         ],
//       },
//       {
//         name: 'Specialized Support Services',
//         description: 'Tailored support for vulnerable populations',
//         skills: [
//           'Patient Care',
//           'Health Monitoring',
//           'Mental Health Support',
//           'Transportation Services',
//           'Communication',
//           'Active Listening',
//           'Empathy',
//           'Cultural Sensitivity',
//           'Problem-Solving',
//           'Conflict Resolution',
//         ],
//       },
//       {
//         name: 'Arts and Cultural Preservation',
//         description: 'Creative and cultural volunteering',
//         skills: [
//           'Digital Literacy',
//           'Social Media Management',
//           'Web Development',
//           'Multimedia Production',
//           'Event Planning',
//           'Communication',
//           'Cultural Sensitivity',
//           'Leadership',
//           'Project Management',
//           'Mentoring',
//         ],
//       },
//     ];

//     for (const taskType of taskTypes) {
//       await this.insert_task_type(
//         taskType.name,
//         taskType.description,
//         taskType.skills,
//         skillsMap,
//       );
//     }
//   }
// }

import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { MongoRepository } from 'typeorm';
import { Skill } from 'src/skills/entities/skill.entity';
import { TaskType } from 'src/task_types/entities/task_type.entity';
import { SkillStatus } from 'src/skills/enums/skill-status.enum';
import { TaskTypeStatus } from 'src/task_types/enums/task-type-status.enum';

@Injectable()
export class MasterService implements OnModuleInit {
  private readonly logger = new Logger(MasterService.name);

  constructor(
    @InjectRepository(Skill)
    private skill_repository: MongoRepository<Skill>,

    @InjectRepository(TaskType)
    private task_type_repository: MongoRepository<TaskType>,
  ) {}

  private sleep(ms: number) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  async onModuleInit() {
    const MAX_RETRIES = 10 * 2;
    const RETRY_DELAY_MS = 2000;
    let attempt = 0;

    while (attempt < MAX_RETRIES) {
      try {
        this.logger.log(
          `Seeding master data (attempt ${attempt + 1}/${MAX_RETRIES})...`,
        );
        const skillsMap = await this.insert_skills();
        await this.insert_task_types(skillsMap);
        this.logger.log('Master data inserted successfully!');
        break;
      } catch (error) {
        attempt++;
        this.logger.error(`Master data insertion failed: ${error.message}`);
        if (attempt < MAX_RETRIES) {
          this.logger.warn(`🔁 Retrying in ${RETRY_DELAY_MS / 1000}s...`);
          await this.sleep(RETRY_DELAY_MS);
        } else {
          this.logger.error('Max retries reached. Seeding aborted.');
        }
      }
    }
  }

  private async insert_skill(
    name: string,
    description: string,
    score: number,
  ): Promise<Skill> {
    const existing = await this.skill_repository.findOne({ where: { name } });
    if (existing) return existing;

    const skill = this.skill_repository.create({
      name,
      description,
      score,
      status: SkillStatus.ACTIVE,
      created_at: new Date(),
      updated_at: new Date(),
    });

    const saved = await this.skill_repository.save(skill);
    this.logger.debug(`Inserted skill: ${name}`);
    return saved;
  }

  private async insert_skills(): Promise<Map<string, Skill>> {
    const skillNames = [
      'Research',
      'Critical Thinking',
      'Writing',
      'Editing',
      'Analytical Thinking',
      'Communication',
      'Programming',
      'Problem Solving',
      'Subject Knowledge',
      'Reading Comprehension',
      'Creativity',
      'Design Thinking',
      'Peer Mentorship',
      'Organization',
      'Observation',
    ];

    const skillsMap = new Map<string, Skill>();
    for (const name of skillNames) {
      const skill = await this.insert_skill(name, name, 50);
      skillsMap.set(name, skill);
    }
    return skillsMap;
  }

  private async insert_task_type(
    name: string,
    description: string,
    skillNames: string[],
    skillsMap: Map<string, Skill>,
  ) {
    const existing = await this.task_type_repository.findOne({
      where: { name },
    });
    if (existing) {
      this.logger.warn(`Task type already exists: ${name}`);
      return;
    }

    const missingSkills = skillNames.filter((name) => !skillsMap.has(name));
    if (missingSkills.length) {
      throw new Error(
        `Missing skills for task type "${name}": ${missingSkills.join(', ')}`,
      );
    }

    const skills = skillNames.map((name) => {
      const skill = skillsMap.get(name)!;
      return {
        _id: skill._id,
        name: skill.name,
        score: skill.score,
      };
    });

    const taskType = this.task_type_repository.create({
      name,
      description,
      skills,
      status: TaskTypeStatus.ACTIVE,
      created_at: new Date(),
      updated_at: new Date(),
    });

    await this.task_type_repository.save(taskType);
    this.logger.debug(`Inserted task type: ${name}`);
  }

  private async insert_task_types(skillsMap: Map<string, Skill>) {
    const taskTypes = [
      {
        name: 'Quick Research',
        description:
          'Short research tasks like source gathering or summarizing.',
        skills: ['Research', 'Critical Thinking'],
      },
      {
        name: 'Essay Drafting',
        description: 'Writing brief essays or argumentative texts.',
        skills: ['Writing', 'Editing'],
      },
      {
        name: 'Survey Review',
        description: 'Reviewing and analyzing academic surveys.',
        skills: ['Analytical Thinking', 'Communication'],
      },
      {
        name: 'Programming Snippet Creation',
        description: 'Writing small reusable code components.',
        skills: ['Programming', 'Problem Solving'],
      },
      {
        name: 'Concept Explanation',
        description: 'Explaining core academic concepts in plain language.',
        skills: ['Subject Knowledge', 'Writing'],
      },
      {
        name: 'Summary Writing',
        description: 'Summarizing readings, articles, or podcasts.',
        skills: ['Reading Comprehension', 'Writing'],
      },
      {
        name: 'Poster Idea Generation',
        description: 'Creating ideas for visual academic presentations.',
        skills: ['Creativity', 'Design Thinking'],
      },
      {
        name: 'Academic Support',
        description: 'Peer mentorship and academic guidance.',
        skills: ['Communication', 'Peer Mentorship'],
      },
      {
        name: 'Resource Collection',
        description: 'Compiling useful links or references.',
        skills: ['Research', 'Organization'],
      },
      {
        name: 'Remote Feedback Task',
        description: 'Providing written feedback on peer submissions.',
        skills: ['Observation', 'Communication'],
      },
    ];

    for (const taskType of taskTypes) {
      await this.insert_task_type(
        taskType.name,
        taskType.description,
        taskType.skills,
        skillsMap,
      );
    }
  }
}
