import { ServiceRegion, ServiceTypeMap } from '@/common/const/service.const';
import { OfferStatus } from '../entities/estimate-offer.entity';

export class EstimateOfferResponseDto {
  estimateRequestId: string;
  moverId: string;
  price: number;
  comment?: string;
  status: OfferStatus;
  isTargeted: boolean;
  isConfirmed: boolean;
  confirmedAt: Date;

  // mover 프로필 응답에 포함
  mover: {
    nickname: string;
    imageUrl?: string;
    career: number;
    serviceType: ServiceTypeMap;
    serviceRegion: ServiceRegion;
    intro: string;
    rating: number;
    reviewCount: number;
    likeCount: number;
    isLiked: boolean;
    experience: number;
  };
}
