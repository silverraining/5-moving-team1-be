import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsObject, IsOptional, IsString } from 'class-validator';

export enum OrderField {
  // string 맵핑 값에 무조건 소문자로 정의 postgreSQL에서 소문자만 인식함
  REVIEW_COUNT = 'review_count', // 리뷰 수
  AVERAGE_RATING = 'average_rating', // 평균 평점
  EXPERIENCE = 'experience', // 경력
  CONFIRMED_ESTIMATE_COUNT = 'confirmed_estimate_count', // 확정 견적 수
}

export enum OrderDirection {
  ASC = 'ASC', // 오름차순
  DESC = 'DESC', // 내림차순
}

export interface OrderItemMap {
  field: OrderField; // 추가적인 순서가 있을 경우 여기에 정의
  direction: OrderDirection;
}

export class CursorPaginationDto {
  @IsString()
  @IsOptional()
  @ApiProperty({
    description: '페이지네이션 커서',
    example:
      'eyJ2YWx1ZXMiOnsiaWQiOiI2YTU1NDlkMi01NzMwLTQyZWMtYmUzMy01YzVkZGYxOTE4ZDMifSwib3JkZXIiOnsiZmllbGQiOiJjb25maXJtZWRfZXN0aW1hdGVfY291bnQiLCJkaXJlY3Rpb24iOiJERVNDIn19',
  })
  cursor?: string;

  @IsObject()
  @ApiProperty({
    description: '정렬 기준',
    example: {
      field: OrderField.REVIEW_COUNT,
      direction: OrderDirection.DESC,
    },
  })
  order: OrderItemMap;

  @IsInt()
  @IsOptional()
  @ApiProperty({
    description: '페이지 크기',
    example: 5,
  })
  take?: number = 5;
}
