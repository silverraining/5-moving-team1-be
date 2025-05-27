import { IsInt, IsObject, IsOptional, IsString } from 'class-validator';
import {
  ServiceRegionMap,
  ServiceTypeMap,
} from 'src/common/const/service.const';

export class CreateMoverProfileDto {
  @IsString()
  nickname: string;

  @IsOptional()
  @IsString()
  imageUrl?: string;

  @IsInt()
  experience: number;

  @IsString()
  intro: string;

  @IsString()
  description: string;

  @IsObject()
  serviceType: ServiceTypeMap;

  @IsObject()
  serviceRegion: ServiceRegionMap;
}
