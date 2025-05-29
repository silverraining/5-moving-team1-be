import { ApiProperty } from '@nestjs/swagger';
import {
  IsInt,
  IsObject,
  IsOptional,
  IsString,
  Length,
  Matches,
  Max,
  Min,
} from 'class-validator';
import {
  ServiceRegionMap,
  ServiceTypeMap,
} from 'src/common/const/service.const';
import { HasAtLeastOneTrue } from 'src/common/validator/service.validator';
import {
  defaultServiceRegionMap,
  defaultServiceTypeMap,
} from './get-mover-profiles.dto';

export class CreateMoverProfileDto {
  @IsString()
  @Length(2, 20, { message: '닉네임은 2자 이상 20자 이하여야 합니다.' })
  @Matches(/^[가-힣a-zA-Z0-9]+$/, {
    message:
      '닉네임은 한글, 영문, 숫자만 사용할 수 있으며 공백 및 특수문자는 허용되지 않습니다.',
  })
  @ApiProperty({
    description: '별명',
    example: '홍길동',
  })
  nickname: string;

  @IsOptional()
  @IsString()
  @ApiProperty({
    description: '이미지 URL',
    example: 'https://example.com/image.jpg',
  })
  imageUrl?: string;

  @IsInt()
  @Min(0, { message: '경력은 최소 0이상 입력해야 합니다.' })
  @Max(99, { message: '경력은 최대 99까지 입력해야 합니다.' })
  @ApiProperty({
    description: '경력 (년)',
    example: 5,
  })
  experience: number;

  @IsString()
  @Length(8, 50, { message: '소개는 8자 이상 50자 이하 입니다.' })
  @Matches(/^[^\r\n]*$/, {
    message: '소개에는 줄바꿈을 포함할 수 없습니다.',
  })
  @ApiProperty({
    description: '한 줄 소개',
    example: '안녕하세요! 저는 홍길동입니다. 이사 전문기사입니다.',
  })
  intro: string;

  @IsString()
  @Length(10, 500, { message: '설명은 10자 이상 500자 이하 입니다.' })
  @ApiProperty({
    description: '상세 설명',
    example:
      '저는 이사 전문 기사로, 고객님의 소중한 짐을 안전하게 옮겨드립니다.',
  })
  description: string;

  @IsObject()
  @HasAtLeastOneTrue({
    message: '서비스 타입은 최소 하나 이상 선택되어야 합니다.',
  })
  @ApiProperty({
    description: '서비스 유형',
    example: defaultServiceTypeMap,
  })
  serviceType: ServiceTypeMap;

  @IsObject()
  @HasAtLeastOneTrue({
    message: '서비스 지역은 최소 하나 이상 선택되어야 합니다.',
  })
  @ApiProperty({
    description: '서비스 지역',
    example: defaultServiceRegionMap,
  })
  serviceRegion: ServiceRegionMap;
}
