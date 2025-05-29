import { ApiProperty } from '@nestjs/swagger';
import { IsObject } from 'class-validator';
import {
  ServiceRegion,
  ServiceRegionMap,
  ServiceType,
  ServiceTypeMap,
} from 'src/common/const/service.const';
import { CursorPaginationDto } from 'src/common/dto/cursor-pagination.dto';
import { HasAtLeastOneTrue } from 'src/common/validator/service.validator';

// 자동으로 true값을 가지는 맵을 생성하는 함수
// 만약 enum값이 추가되도 자동으로 true값을 가지는 맵이 생성됨
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

export const defaultServiceTypeMap = generateTrueMapFromEnum(ServiceType);
export const defaultServiceRegionMap = generateTrueMapFromEnum(ServiceRegion);

export class GetMoverProfilesDto extends CursorPaginationDto {
  @IsObject()
  @HasAtLeastOneTrue({
    message: '서비스 유형은 최소 하나 이상 선택되어야 합니다.',
  })
  @ApiProperty({
    description: '서비스 유형',
    example: defaultServiceTypeMap,
  })
  serviceType: Partial<ServiceTypeMap> = defaultServiceTypeMap;

  @IsObject()
  @HasAtLeastOneTrue({
    message: '서비스 지역은 최소 하나 이상 선택되어야 합니다.',
  })
  @ApiProperty({
    description: '서비스 지역',
    example: defaultServiceRegionMap,
  })
  serviceRegion: Partial<ServiceRegionMap> = defaultServiceRegionMap;
}
