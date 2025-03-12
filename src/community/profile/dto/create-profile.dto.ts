import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsUrl } from 'class-validator';

export class CreateProfileDTO {
  @IsString()
  @IsUrl()
  @ApiProperty({ description: 'URL of the user profile image' })
  profile_image: string;
}
