import { IsArray, IsEnum, IsOptional } from 'class-validator';
import {
  defaultServiceRegion,
  defaultServiceType,
  ServiceRegion,
  ServiceType,
} from '../const/service.const';

export class CreateServiceDto {
  @IsOptional()
  @IsArray({ message: 'serviceType은 배열이어야 합니다.' })
  @IsEnum(ServiceType, {
    each: true,
    message: 'serviceType의 각 요소는 유효한 서비스 유형이어야 합니다.',
  })
  serviceType?: ServiceType[] = defaultServiceType;

  @IsOptional()
  @IsArray({ message: 'serviceRegion은 배열이어야 합니다.' })
  @IsEnum(ServiceRegion, {
    each: true,
    message: 'serviceRegion의 각 요소는 유효한 서비스 지역이어야 합니다.',
  })
  serviceRegion?: ServiceRegion[] = defaultServiceRegion;
}
