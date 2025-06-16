import { IsInt, IsOptional, IsString } from 'class-validator';
import { IsValidOrder, OrderString } from '../validator/order.validator';

export class CursorPaginationDto {
  @IsString()
  @IsOptional()
  cursor?: string;

  @IsString()
  @IsValidOrder({ message: 'order 값이 올바른 형식이어야 합니다.' })
  order: OrderString;

  @IsInt()
  @IsOptional()
  take?: number = 5;
}
