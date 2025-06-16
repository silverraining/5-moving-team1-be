import { IsObject, IsOptional, IsString } from 'class-validator';
import { HasAtLeastOneTrue } from '@/common/validator/service.validator';
import { ServiceRegionMap, ServiceTypeMap } from '@/common/const/service.const';

export class CreateCustomerProfileDto {
  @IsString()
  @IsOptional()
  imageUrl?: string;

  @IsObject()
  @HasAtLeastOneTrue({
    message: '서비스 타입은 최소 하나 이상 선택되어야 합니다.',
  })
  serviceType: ServiceTypeMap;

  @IsObject()
  @HasAtLeastOneTrue({
    message: '서비스 지역은 최소 하나 이상 선택되어야 합니다.',
  })
  serviceRegion: ServiceRegionMap;
}
