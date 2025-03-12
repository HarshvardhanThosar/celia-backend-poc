import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { plainToInstance } from 'class-transformer';
import { validateSync } from 'class-validator';
import { EnvSchema } from './env.schema';

@Injectable()
export class AppConfigService {
  private readonly envConfig: EnvSchema;

  constructor(private configService: ConfigService) {
    // Validate and transform environment variables
    const validatedConfig = plainToInstance(
      EnvSchema,
      this.configService.get<Record<string, any>>(''),
    );
    const errors = validateSync(validatedConfig);

    if (errors.length > 0) {
      throw new Error(`Environment validation failed: ${errors.toString()}`);
    }

    this.envConfig = validatedConfig;
  }

  get config(): EnvSchema {
    return this.envConfig;
  }
}
