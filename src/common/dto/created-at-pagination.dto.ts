import { IsOptional, IsString, IsInt } from 'class-validator';

export class CreatedAtCursorPaginationDto {
  @IsString()
  @IsOptional()
  cursor?: string;

  @IsInt()
  @IsOptional()
  take?: number = 5;
}
