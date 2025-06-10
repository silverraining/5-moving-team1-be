import { EstimateOffer } from '../entities/estimate-offer.entity';

// 견적 목록 조회 시 사용
export class EstimateOfferListResponseDto {
  estimateRequestId: string;
  moverId: string;
  price: number;
  status: string;
  requestStatus: string;
  isTargeted: boolean;
  isConfirmed: boolean;
  confirmedAt: Date;
  moveDate: Date;
  moveType: string;
  createdAt: Date;

  fromAddressMinimal: { sido: string; sigungu: string };
  toAddressMinimal: { sido: string; sigungu: string };
  fromAddressFull?: { fullAddress: string };
  toAddressFull?: { fullAddress: string };

  mover: {
    nickname: string;
    imageUrl?: string;
    experience: number;

    intro: string;
    rating: number;
    reviewCount: number;
    likeCount: number;
    isLiked: boolean;
    confirmedCount: number;
  };

  static from(
    offer: EstimateOffer,
    isLiked: boolean,
    options: {
      confirmedCount: number;
      averageRating: number;
      reviewCount: number;
      likeCount: number;
      includeAddress?: boolean;
    },
  ): EstimateOfferListResponseDto {
    const dto = new EstimateOfferListResponseDto();

    dto.estimateRequestId = offer.estimateRequestId;
    dto.moverId = offer.moverId;
    dto.price = offer.price;
    dto.status = offer.status;
    dto.requestStatus = offer.estimateRequest.status;
    dto.isTargeted = !!offer.estimateRequest.targetMoverIds?.includes(
      offer.moverId,
    );
    dto.isConfirmed = offer.estimateRequest.confirmedOfferId === offer.moverId;
    dto.confirmedAt = offer.confirmedAt;
    dto.moveDate = offer.estimateRequest.moveDate;
    dto.moveType = offer.estimateRequest.moveType;
    dto.createdAt = offer.createdAt;

    if (options.includeAddress) {
      dto.fromAddressFull = {
        fullAddress: offer.estimateRequest.fromAddress.fullAddress,
      };
      dto.toAddressFull = {
        fullAddress: offer.estimateRequest.toAddress.fullAddress,
      };
    }

    dto.mover = {
      nickname: offer.mover.nickname,
      imageUrl: offer.mover.imageUrl,
      experience: offer.mover.experience,

      intro: offer.mover.intro,
      rating: options.averageRating,
      reviewCount: options.reviewCount,
      likeCount: options.likeCount,
      isLiked,
      confirmedCount: options.confirmedCount,
    };

    return dto;
  }
}
