import { AddressDto } from '@/common/dto/address.dto';
import { ServiceType } from '@/common/const/service.const';
import { EstimateOfferResponseDto } from '@/estimate-offer/dto/estimate-offer-response.dto';
import { EstimateRequest } from '../entities/estimate-request.entity';

export class EstimateRequestResponseDto {
  id: string;
  createdAt: Date;
  moveType: ServiceType;
  moveDate: Date;

  fromAddress?: AddressDto;
  toAddress?: AddressDto;
  fromAddressMinimal?: { sido: string; sigungu: string };
  toAddressMinimal?: { sido: string; sigungu: string };

  isTargeted?: boolean;
  customerName?: string;

  estimateOffers: EstimateOfferResponseDto[];

  /**
   * 정적 팩토리 메서드
   * @param request EstimateRequest 엔티티
   * @param offers 연결된 제안 목록 DTO들
   * @param options 주소 포함 여부 및 기타 옵션
   * @returns EstimateRequestResponseDto 인스턴스
   */
  static from(
    request: EstimateRequest,
    offers: EstimateOfferResponseDto[],
    options?: {
      includeAddress?: boolean;
      includeMinimalAddress?: boolean;
    },
  ): EstimateRequestResponseDto {
    const dto = new EstimateRequestResponseDto();

    dto.id = request.id;
    dto.createdAt = request.createdAt;
    dto.moveType = request.moveType;
    dto.moveDate = request.moveDate;
    dto.estimateOffers = offers;

    dto.isTargeted =
      Array.isArray(request.targetMoverIds) &&
      request.targetMoverIds.length > 0;

    dto.customerName = request.customer?.user?.name ?? null;

    if (options?.includeAddress) {
      dto.fromAddress = AddressDto.from(request.fromAddress);
      dto.toAddress = AddressDto.from(request.toAddress);
    }

    if (options?.includeMinimalAddress) {
      dto.fromAddressMinimal = {
        sido: request.fromAddress.sido,
        sigungu: request.fromAddress.sigungu,
      };
      dto.toAddressMinimal = {
        sido: request.toAddress.sido,
        sigungu: request.toAddress.sigungu,
      };
    }

    return dto;
  }
}
