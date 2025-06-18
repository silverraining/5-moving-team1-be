import {
  commaDefaultServiceRegion,
  commaDefaultServiceType,
  ServiceRegion,
  ServiceType,
} from '@/common/const/service.const';
import { IsCommaSeparatedEnum } from '@/common/validator/service.validator';
import { IsOptional, IsString } from 'class-validator';
import { CursorPaginationDto } from 'src/common/dto/cursor-pagination.dto';

export class GetMoverProfilesDto extends CursorPaginationDto {
  @IsOptional()
  @IsString()
  @IsCommaSeparatedEnum(ServiceType, {
    message: 'serviceType의 값이 유효하지 않습니다.',
  })
  serviceType?: string = commaDefaultServiceType;

  @IsOptional()
  @IsString()
  @IsCommaSeparatedEnum(ServiceRegion, {
    message: 'serviceRegion의 값이 유효하지 않습니다.',
  })
  serviceRegion?: string = commaDefaultServiceRegion;
}
