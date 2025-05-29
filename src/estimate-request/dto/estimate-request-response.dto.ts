import { ServiceRegionMap, ServiceTypeMap } from '@/common/const/service.const';
import { Expose, Type } from 'class-transformer';
import { Address } from 'src/estimate-request/entities/estimate-request.entity';

export class UserSummaryDto {
  @Expose()
  id: string;

  @Expose()
  name: string;
}

export class CustomerSummaryDto {
  @Expose()
  id: string;

  @Expose()
  imageUrl: string | null;

  @Expose()
  serviceType: ServiceTypeMap;

  @Expose()
  serviceRegion: ServiceRegionMap;

  @Type(() => UserSummaryDto)
  @Expose()
  user: UserSummaryDto;
}

export class EstimateRequestResponseDto {
  @Expose()
  id: string;

  @Expose()
  moveType: string;

  @Expose()
  status: string;

  @Expose()
  moveDate: Date;

  @Expose()
  fromAddress: Address;

  @Expose()
  toAddress: Address;

  @Expose()
  targetMoverIds: string[] | null;

  @Expose()
  confirmedOfferId: string | null;

  @Type(() => CustomerSummaryDto)
  @Expose()
  customer: CustomerSummaryDto;
}
