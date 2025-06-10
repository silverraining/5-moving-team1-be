import { EstimateOfferListResponseDto } from './estimate-offer-list.response.dto';
import { EstimateOffer } from '../entities/estimate-offer.entity';
// 견적 상세 조회 시 사용
export class EstimateOfferDetailResponseDto extends EstimateOfferListResponseDto {
  static override from(
    offer: EstimateOffer,
    isLiked: boolean,
    options: {
      confirmedCount: number;
      averageRating: number;
      reviewCount: number;
      likeCount: number;
      includeAddress?: boolean;
    },
  ): EstimateOfferDetailResponseDto {
    const base = super.from(offer, isLiked, options);
    return Object.assign(new EstimateOfferDetailResponseDto(), base);
  }
}
