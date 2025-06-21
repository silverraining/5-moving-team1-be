import { ApiProperty } from '@nestjs/swagger';
/**
 * GenericPaginatedDto<T>
 *
 * 커서 기반 페이지네이션 응답 형식을 공통으로 정의하는 제네릭 클래스
 * 다양한 도메인(DTO) 타입에 대응할 수 있도록 제네릭으로 구현
 * 다양한 커서 페이지네이션 리스트 응답에 재사용 가능
 *
 * 예시 응답 형태:
 * {
 *   items: [...],
 *   nextCursor: '2025-07-10T00:00:00.000Z',
 *   hasNext: true,
 *   totalCount: 42
 * }
 */
export class GenericPaginatedDto<T> {
  @ApiProperty({ isArray: true })
  items: T[];

  @ApiProperty({ example: '2025-07-10T00:00:00.000Z', nullable: true })
  nextCursor: string | null;

  @ApiProperty({ example: true })
  hasNext: boolean;

  @ApiProperty({ example: 25 })
  totalCount: number;
}
