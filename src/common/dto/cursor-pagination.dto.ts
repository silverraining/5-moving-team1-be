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
  cursor?: string;

  @IsObject()
  order: OrderItemMap;

  @IsInt()
  @IsOptional()
  take?: number = 5;
}
