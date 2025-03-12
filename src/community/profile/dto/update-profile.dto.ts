import { ApiProperty, PartialType } from '@nestjs/swagger';
import { CreateProfileDTO } from './create-profile.dto';
import { IsString, IsUrl, IsOptional } from 'class-validator';

export class UpdateProfileDTO extends PartialType(CreateProfileDTO) {
  @ApiProperty({
    description: 'Updated URL of the user profile image',
    required: false,
  })
  @IsString()
  @IsUrl()
  @IsOptional()
  profile_image?: string;
}
