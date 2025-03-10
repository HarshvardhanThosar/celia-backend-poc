import { Module } from '@nestjs/common';
import { ProfileService } from './profile.service';
import { ProfileController } from './profile.controller';
import { KeycloakModule } from 'src/keycloak/keycloak.module';
import { Profile } from './entities/profile.entity';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
  imports: [TypeOrmModule.forFeature([Profile]), KeycloakModule],
  controllers: [ProfileController],
  providers: [ProfileService],
})
export class ProfileModule {}
