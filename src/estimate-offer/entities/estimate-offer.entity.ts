import { BaseTable } from 'src/common/entity/base-table.entity';
import { EstimateRequest } from 'src/estimate-request/entities/estimate-request.entity';
import { MoverProfile } from 'src/mover-profile/entities/mover-profile.entity';
import { Review } from 'src/review/entities/review.entity';
import {
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  OneToOne,
  PrimaryGeneratedColumn,
  Unique,
} from 'typeorm';

export enum OfferStatus {
  PENDING = 'PENDING', // 고객이 견적 요청 보냄 (기사 입장에선 대기 중)
  CONFIRMED = 'CONFIRMED', // 고객이 확정함
  CANCELED = 'CANCELED', // 고객이 다른 기사 선택 → 자동 취소
  COMPLETED = 'COMPLETED',
  REJECTED = 'REJECTED',
}

@Entity()
@Unique(['estimateRequestId', 'moverId']) // 복합 유니크 제약
export class EstimateOffer extends BaseTable {
  @PrimaryGeneratedColumn('uuid')
  id: string; // 견적 제안 ID

  @Index('IDX_ESTIMATE_OFFER_REQUEST_ID') // 인덱스 생성
  @Column({ type: 'uuid' })
  estimateRequestId: string;

  @Index('IDX_ESTIMATE_OFFER_MOVER_ID') // 인덱스 생성
  @Column({ type: 'uuid' })
  moverId: string;

  @Column({ nullable: true })
  price: number; // 견적 가격

  @Column({ nullable: true })
  comment?: string; // 견적 제안 코멘트

  @Column({ type: 'enum', enum: OfferStatus })
  status: OfferStatus; // 견적 제안 상태

  @Column({ default: false })
  isTargeted: boolean; // 고객이 지정한 기사가 제안한 견적 여부

  @Column({ default: false })
  isConfirmed: boolean; // 고객이 확정했는지 여부

  @Column({ nullable: true })
  confirmedAt: Date; // 고객이 확정한 날짜

  // EstimateOffer : Review <-> 1:1 관계
  @OneToOne(() => Review, (review) => review.estimateOffer, { nullable: true })
  review?: Review; // 리뷰

  // EstimateRequest : EstimateOffer <-> 1:N 관계
  @ManyToOne(() => EstimateRequest, (e) => e.estimateOffers)
  @JoinColumn({ name: 'estimateRequestId' })
  estimateRequest: EstimateRequest;

  // MoverProfile : EstimateOffer <-> 1:N 관계
  @ManyToOne(() => MoverProfile, (m) => m.estimateOffers)
  @JoinColumn({ name: 'moverId' })
  mover: MoverProfile;
}

/**
 * unique 설정을 estimateRequestId, moverId에 두 곳에 설정하여 중복을 방지
 * 예를 들어 한 명의 기사가 한 개의 견적 요청을 여러번 제안하는 경우를 방지 하기 위해
 * DB 무결성 유지를 위해
 */
