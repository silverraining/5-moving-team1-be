import { IsObject } from 'class-validator';
import {
  ServiceRegion,
  ServiceRegionMap,
  ServiceType,
  ServiceTypeMap,
} from 'src/common/const/service.const';
import { CursorPaginationDto } from 'src/common/dto/cursor-pagination.dto';
import { HasAtLeastOneTrue } from 'src/common/validator/service.validator';

function generateTrueMapFromEnum<T extends Record<string, string>>(
  enumObj: T,
): Record<T[keyof T], boolean> {
  return Object.values(enumObj).reduce(
    (acc, key) => {
      acc[key] = true;
      return acc;
    },
    {} as Record<T[keyof T], boolean>,
  );
}

const defaultServiceTypeMap = generateTrueMapFromEnum(ServiceType);
const defaultServiceRegionMap = generateTrueMapFromEnum(ServiceRegion);

export class GetMoverProfilesDto extends CursorPaginationDto {
  @IsObject()
  @HasAtLeastOneTrue({
    message: '서비스 유형은 최소 하나 이상 선택되어야 합니다.',
  })
  serviceType: Partial<ServiceTypeMap> = defaultServiceTypeMap;

  @IsObject()
  @HasAtLeastOneTrue({
    message: '서비스 지역은 최소 하나 이상 선택되어야 합니다.',
  })
  serviceRegion: Partial<ServiceRegionMap> = defaultServiceRegionMap;
}
