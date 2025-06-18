import { Type } from 'class-transformer';
import {
  IsEnum,
  IsString,
  IsDateString,
  ValidateNested,
  IsOptional,
  IsArray,
  IsUUID,
} from 'class-validator';
import { ServiceType } from '@/common/const/service.const';

export class AddressDto {
  @IsString()
  sido: string;

  @IsString()
  sidoEnglish: string;

  @IsString()
  sigungu: string;

  @IsString()
  roadAddress: string;

  @IsString()
  fullAddress: string;
}

export class CreateEstimateRequestDto {
  @IsEnum(ServiceType)
  moveType: ServiceType;

  @IsDateString()
  moveDate: string;

  @ValidateNested()
  @Type(() => AddressDto)
  fromAddress: AddressDto;

  @ValidateNested()
  @Type(() => AddressDto)
  toAddress: AddressDto;

  @IsOptional()
  @IsArray()
  @IsUUID('all', { each: true }) // UUID 형식 검증 추가
  targetMoverIds?: string[];
}
