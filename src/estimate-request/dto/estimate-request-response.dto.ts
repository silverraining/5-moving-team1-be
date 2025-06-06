import { Expose, Type } from 'class-transformer';
import { EstimateOfferResponseDto } from '@/estimate-offer/dto/estimate-offer-response.dto';
import { ServiceType } from '@/common/const/service.const';

type FullAddress = {
  fullAddress: string;
};

export class EstimateRequestResponseDto {
  @Expose()
  id: string;

  @Expose()
  createdAt: Date;

  @Expose()
  moveType: ServiceType;

  @Expose()
  moveDate: Date;

  @Expose()
  fromAddressFull: FullAddress;

  @Expose()
  toAddressFull: FullAddress;

  @Expose()
  @Type(() => EstimateOfferResponseDto)
  estimateOffers: EstimateOfferResponseDto[];
}
