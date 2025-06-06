import { Expose, Transform } from 'class-transformer';
import {
  ServiceRegion,
  ServiceType,
  ServiceTypeMap,
} from '@/common/const/service.const';
import { OfferStatus } from '../entities/estimate-offer.entity';
import { RequestStatus } from '@/estimate-request/entities/estimate-request.entity';

type MinimalAddress = {
  //목록 조회시 sido + sigungu '서울 강남구', '경기 성남시 분당구' 등
  sido: string;
  sigungu: string;
};
type FullAddress = {
  // 상세페이지에 필요한 전체 주소
  fullAddress: string;
};
export class EstimateOfferResponseDto {
  @Expose()
  estimateRequestId: string;

  @Expose()
  moverId: string;

  @Expose()
  price: number;

  @Expose()
  status: OfferStatus;

  @Expose()
  requestStatus: RequestStatus; // 견적 요청 상태 (PENDING, COMPLETED 등)

  @Expose()
  isTargeted: boolean;

  @Expose()
  isConfirmed: boolean; // 견적 제안이 확정되었는지

  @Expose()
  confirmedCount: number; //기사님 카드 확정건수

  @Expose()
  confirmedAt: Date;

  @Expose()
  moveDate: Date; // 상세페이지에 '이용일'
  @Expose()
  moveType: ServiceType; // 상세페이지 '서비스'

  @Expose()
  createdAt: Date; // 상세페이지에 견적 요청일

  @Expose()
  toAddressMinimal: MinimalAddress;

  @Expose()
  fromAddressMinimal: MinimalAddress;

  @Expose()
  toAddressFull: FullAddress;

  @Expose()
  fromAddressFull: FullAddress;
  @Expose()
  mover: {
    nickname: string;
    imageUrl?: string;
    experience: number;
    serviceType: ServiceTypeMap; //제공 서비스 타입 (기사님 카드에 chip)
    intro: string;
    rating: number;
    reviewCount: number;
    likeCount: number;
    isLiked: boolean;
  };
}
