import { OrderField } from '@/common/dto/cursor-pagination.dto';
import { Transform } from 'class-transformer';
import { IsEnum, IsInt, IsOptional, IsString } from 'class-validator';
/**
 * EstimateRequestPaginationDto
 *
 * 기사 전용 견적 요청 목록 API에서 커서 기반 페이지네이션을 처리하기 위한 DTO
 *
 * - `cursor`: 현재 페이지의 마지막 요소를 기준으로 다음 데이터를 가져올 때 사용하는 커서 값
 * - `orderField`: 정렬 기준 필드 (기본값: moveDate).
 * - `take`: 가져올 데이터 개수 (기본값: 5)
 *
 *  `order` 필드나 `orderDirection`이 불필요해서 혼동을 줄이기 위해
 *   해당 API에서 필요한 필드만 명시적으로 선언해서 사용하기 위해 CursorPaginationDto extends 하지 않음
 *
 */
export class EstimateRequestPaginationDto {
  @IsString()
  @IsOptional()
  cursor?: string;

  @Transform(({ value }) => {
    const map = {
      move_date: OrderField.MOVE_DATE,
      created_at: OrderField.CREATED_AT,
    };
    return map[value] || value;
  })
  @IsEnum(OrderField)
  @IsOptional()
  orderField?: OrderField = OrderField.MOVE_DATE;

  @IsInt()
  @IsOptional()
  take?: number = 5;
}
