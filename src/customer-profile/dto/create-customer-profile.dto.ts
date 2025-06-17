import {
  defaultServiceRegion,
  defaultServiceType,
  ServiceRegion,
  ServiceType,
} from '@/common/const/service.const';
import { IsCommaSeparatedEnum } from '@/common/validator/service.validator';
import { IsOptional, IsString } from 'class-validator';

export class CreateCustomerProfileDto {
  @IsString()
  @IsOptional()
  imageUrl?: string;

  @IsOptional()
  @IsString()
  @IsCommaSeparatedEnum(ServiceType, {
    message: 'serviceType의 값이 유효하지 않습니다.',
  })
  serviceType?: string = defaultServiceType;

  @IsOptional()
  @IsString()
  @IsCommaSeparatedEnum(ServiceRegion, {
    message: 'serviceRegion의 값이 유효하지 않습니다.',
  })
  serviceRegion?: string = defaultServiceRegion;
}
