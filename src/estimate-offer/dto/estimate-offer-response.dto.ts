import { AddressDto } from '@/common/dto/address.dto';
import { EstimateOffer } from '../entities/estimate-offer.entity';

export class EstimateOfferResponseDto {
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

  fromAddress?: AddressDto;
  toAddress?: AddressDto;
  fromAddressMinimal?: { sido: string; sigungu: string };
  toAddressMinimal?: { sido: string; sigungu: string };

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
      includeFullAddress?: boolean;
      includeMinimalAddress?: boolean;
    },
  ): EstimateOfferResponseDto {
    const dto = new EstimateOfferResponseDto();

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

    if (options.includeFullAddress) {
      dto.fromAddress = AddressDto.from(offer.estimateRequest.fromAddress);
      dto.toAddress = AddressDto.from(offer.estimateRequest.toAddress);
    }

    if (options.includeMinimalAddress) {
      dto.fromAddressMinimal = {
        sido: offer.estimateRequest.fromAddress.sido,
        sigungu: offer.estimateRequest.fromAddress.sigungu,
      };
      dto.toAddressMinimal = {
        sido: offer.estimateRequest.toAddress.sido,
        sigungu: offer.estimateRequest.toAddress.sigungu,
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
