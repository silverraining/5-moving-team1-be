import { BaseTable } from 'src/common/entity/base-table.entity';
import { EstimateRequest } from 'src/estimate-request/entities/estimate-request.entity';
import { MoverProfile } from 'src/mover-profile/entities/mover-profile.entity';
import { Review } from 'src/review/entities/review.entity';
import { Column, Entity, ManyToOne, OneToOne, PrimaryColumn } from 'typeorm';

export enum OfferStatus {
  REQUESTED = 'REQUESTED', // 고객이 견적 요청 보냄 (기사 입장에선 대기 중)
  SUBMITTED = 'SUBMITTED', // 기사님이 견적서 보냄
  REJECTED = 'REJECTED', // 기사님이 반려함
  CONFIRMED = 'CONFIRMED', // 고객이 확정함
  CANCELED = 'CANCELED', // 고객이 다른 기사 선택 → 자동 취소
  COMPLETED = 'COMPLETED', // 이사 완료
}

@Entity()
export class EstimateOffer extends BaseTable {
  // EstimateRequest : EstimateOffer <-> 1:N 관계
  @PrimaryColumn({
    name: 'estimateRequestId',
    type: 'uuid',
  }) // PK 설정
  @ManyToOne(() => EstimateRequest, (estimate) => estimate.estimateOffers)
  estimateRequest: EstimateRequest; // 견적 요청 id

  // MoverProfile : EstimateOffer <-> 1:N 관계
  @PrimaryColumn({
    name: 'moverId',
    type: 'uuid',
  }) // PK 설정
  @ManyToOne(() => MoverProfile, (mover) => mover.estimateOffers)
  mover: MoverProfile; // 기사 id

  @Column()
  price: number; // 견적 가격

  @Column({ nullable: true })
  comment?: string; // 견적 제안 코멘트

  @Column({ type: 'enum', enum: OfferStatus })
  status: OfferStatus; // 견적 제안 상태

  @Column({ default: false })
  isConfirmed: boolean; // 고객이 확정했는지 여부

  @Column()
  confirmedAt: Date; // 고객이 확정한 날짜

  // EstimateOffer : Review <-> 1:1 관계
  @OneToOne(() => Review, (review) => review.estimateOffer, { nullable: true })
  review?: Review; // 리뷰 목록
}

/**
 * PK 설정을 estimateRequestId, moverId에 두 곳에 설정하여 중복을 방지
 * 예를 들어 한 명의 기사가 한 개의 견적 요청을 여러번 제안하는 경우를 방지 하기 위해
 * DB 무결성 유지를 위해
 */
