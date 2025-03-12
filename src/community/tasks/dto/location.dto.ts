import { ApiProperty } from '@nestjs/swagger';
import { IsNumber } from 'class-validator';

export class LocationDTO {
  @ApiProperty({ description: 'Latitude coordinate of the task location' })
  @IsNumber()
  latitude: number;

  @ApiProperty({ description: 'Longitude coordinate of the task location' })
  @IsNumber()
  longitude: number;
}
