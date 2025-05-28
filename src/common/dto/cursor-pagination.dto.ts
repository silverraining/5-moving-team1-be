import { IsInt, IsObject, IsOptional, IsString } from 'class-validator';

export enum OrderField {
  REVIEW_COUNT = 'reviewCount', // 리뷰 수
  AVERAGE_RATING = 'averageRating', // 평균 평점
  EXPERIENCE = 'experience', // 경력
  CONFIRMED_ESTIMATE_COUNT = 'confirmedEstimateCount', // 확정 견적 수
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
  cursor?: string;

  @IsObject()
  @IsOptional()
  order?: OrderItemMap;

  @IsInt()
  @IsOptional()
  take?: number = 5;
}
