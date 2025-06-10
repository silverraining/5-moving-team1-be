import { Expose, Type } from 'class-transformer';
import { ServiceType } from '@/common/const/service.const';
import { EstimateOfferDetailResponseDto } from '@/estimate-offer/dto/estimate-offer-detail.dto';
import { EstimateRequest } from '../entities/estimate-request.entity';

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
  @Type(() => EstimateOfferDetailResponseDto)
  estimateOffers: EstimateOfferDetailResponseDto[];

  /**
   * 정적 팩토리 메서드
   * @param request EstimateRequest 엔티티
   * @param offers 해당 요청에 연결된 오퍼 응답 DTO 배열
   * @returns EstimateRequestResponseDto
   */
  static from(
    request: EstimateRequest,
    offers: EstimateOfferDetailResponseDto[],
  ): EstimateRequestResponseDto {
    return Object.assign(new EstimateRequestResponseDto(), {
      id: request.id,
      createdAt: request.createdAt,
      moveType: request.moveType,
      moveDate: request.moveDate,
      fromAddressFull: {
        fullAddress: request.fromAddress.fullAddress,
      },
      toAddressFull: {
        fullAddress: request.toAddress.fullAddress,
      },
      estimateOffers: offers,
    });
  }
}
