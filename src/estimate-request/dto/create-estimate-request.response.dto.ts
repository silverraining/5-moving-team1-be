import { Expose } from 'class-transformer';

export class CreateEstimateRequestResponseDto {
  @Expose()
  id: string;

  @Expose()
  message: string;
}
