import { AddressDto } from '@/common/dto/address.dto';
import { ServiceType } from '@/common/const/service.const';
import { EstimateOfferResponseDto } from '@/estimate-offer/dto/estimate-offer-response.dto';
import { EstimateRequest } from '../entities/estimate-request.entity';

export class EstimateRequestResponseDto {
  requestId: string;
  requestStatus: EstimateRequest['status']; // 견적 요청 상태 (PENDING, CONFIRMED, REJECTED, COMPLETED, CANCELED, EXPIRED)
  createdAt: Date;
  moveType: ServiceType;
  moveDate: Date;

  fromAddress?: AddressDto;
  toAddress?: AddressDto;
  fromAddressMinimal?: { sido: string; sigungu: string };
  toAddressMinimal?: { sido: string; sigungu: string };

  isTargeted?: boolean;
  customerName?: string;
  offerCount: number; //받은 offer 개수 (request랑 offer 응답에서 구분하기 쉽게 추가했는데 필요없으면 제거 가능)
  estimateOffers?: EstimateOfferResponseDto[];

  /**
   * 정적 팩토리 메서드
   * @param request EstimateRequest 엔티티
   * @param offers 연결된 제안 목록 DTO들
   * @param options 주소 포함 여부 및 기타 옵션
   * @returns EstimateRequestResponseDto 인스턴스
   */
  static from(
    request: EstimateRequest,
    offers: EstimateOfferResponseDto[] = [],
    options?: {
      includeAddress?: boolean;
      includeMinimalAddress?: boolean;
    },
    isTargeted?: boolean,
  ): EstimateRequestResponseDto {
    const dto = new EstimateRequestResponseDto();

    dto.requestId = request.id;
    dto.requestStatus = request.status;
    dto.createdAt = request.createdAt;
    dto.moveType = request.moveType;
    dto.moveDate = request.moveDate;
    dto.estimateOffers = offers;
    dto.offerCount = offers.length;
    dto.isTargeted = isTargeted ?? false;

    if (options?.includeAddress) {
      dto.fromAddress = AddressDto.from(request.fromAddress);
      dto.toAddress = AddressDto.from(request.toAddress);
    }

    if (options?.includeMinimalAddress) {
      dto.fromAddressMinimal = {
        sido: request.fromAddress?.sido,
        sigungu: request.fromAddress?.sigungu,
      };
      dto.toAddressMinimal = {
        sido: request.toAddress?.sido,
        sigungu: request.toAddress?.sigungu,
      };
    }

    return dto;
  }
}
