import { IsInt, IsOptional } from 'class-validator';

export class PagePaginationDto {
  @IsInt()
  @IsOptional()
  page?: number = 1; // 페이지 번호 (1부터 시작)

  @IsInt()
  @IsOptional()
  take?: number = 6; // 페이지당 아이템 수 (기본값: 6)
}
