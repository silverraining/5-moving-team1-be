import {
  ServiceRegion,
  ServiceRegionMap,
  ServiceType,
  ServiceTypeMap,
} from '@/common/const/service.const';
import { HasAtLeastOneTrue } from '@/common/validator/service.validator';
import { Type } from 'class-transformer';
import { IsObject, IsOptional, IsString } from 'class-validator';

export class CreateCustomerProfileDto {
  @IsString()
  @IsOptional()
  imageUrl?: string;

  @IsObject()
  @HasAtLeastOneTrue(ServiceType, {
    message: '서비스 타입은 최소 하나 이상 선택되어야 합니다.',
  })
  serviceType: ServiceTypeMap;

  @IsObject()
  @Type(() => Object)
  @HasAtLeastOneTrue(ServiceRegion, {
    message: '서비스 지역은 최소 하나 이상 선택되어야 합니다.',
  })
  serviceRegion: ServiceRegionMap;
}
