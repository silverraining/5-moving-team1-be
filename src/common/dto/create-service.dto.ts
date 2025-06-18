import { IsObject } from 'class-validator';
import {
  ServiceRegion,
  ServiceRegionMap,
  ServiceType,
  ServiceTypeMap,
} from '../const/service.const';
import { HasAtLeastOneTrue } from '../validator/service.validator';

export class CreateServiceDto {
  @IsObject()
  @HasAtLeastOneTrue(ServiceType, {
    message: '서비스 타입은 최소 하나 이상 선택되어야 합니다.',
  })
  serviceType: ServiceTypeMap;

  @IsObject()
  @HasAtLeastOneTrue(ServiceRegion, {
    message: '서비스 지역은 최소 하나 이상 선택되어야 합니다.',
  })
  serviceRegion: ServiceRegionMap;
}
