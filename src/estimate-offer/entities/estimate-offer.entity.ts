import { BaseTable } from 'src/common/entity/base-table.entity';
import { EstimateRequest } from 'src/estimate-request/entities/estimate-request.entity';
import { MoverProfile } from 'src/mover-profile/entities/mover-profile.entity';
import { Review } from 'src/review/entities/review.entity';
import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToOne,
  PrimaryColumn,
} from 'typeorm';

export enum OfferStatus {
  REQUESTED = 'REQUESTED', // 고객이 견적 요청 보냄 (기사 입장에선 대기 중)
  SUBMITTED = 'SUBMITTED', // 기사님이 견적서 보냄
  REJECTED = 'REJECTED', // 기사님이 반려함
  CONFIRMED = 'CONFIRMED', // 고객이 확정함
  CANCELED = 'CANCELED', // 고객이 다른 기사 선택 → 자동 취소
  COMPLETED = 'COMPLETED',
  PENDING = 'PENDING', // 이사 완료
}

@Entity()
export class EstimateOffer extends BaseTable {
  /**@PrimaryColumn + @ManyToOne 조합 문제 발생
  EstimateOffer 엔티티는 복합키(estimateRequestId, moverId)를 사용하고 있는데
  @PrimaryColumn에 직접 @ManyToOne을 붙이면 TypeORM이 내부적으로 estimateRequest를
  string으로 취급해 createdAt 같은 속성을 못 넣게 됩니다.
  @ManyToOne은 @JoinColumn과 함께 별도의 FK 필드로 분리**/

  // EstimateRequest : EstimateOffer <-> 1:N 관계
  @PrimaryColumn({ type: 'uuid' })
  estimateRequestId: string;
  // MoverProfile : EstimateOffer <-> 1:N 관계
  @PrimaryColumn({ type: 'uuid' })
  moverId: string;

  @Column()
  price: number; // 견적 가격

  @Column({ nullable: true })
  comment?: string; // 견적 제안 코멘트

  @Column({ type: 'enum', enum: OfferStatus })
  status: OfferStatus; // 견적 제안 상태

  @Column({ default: false })
  isTargeted: boolean; // 고객이 지정한 기사가 제안한 견적 여부

  @Column({ default: false })
  isConfirmed: boolean; // 고객이 확정했는지 여부

  @Column()
  confirmedAt: Date; // 고객이 확정한 날짜

  // EstimateOffer : Review <-> 1:1 관계
  @OneToOne(() => Review, (review) => review.estimateOffer, { nullable: true })
  review?: Review; // 리뷰 목록
  // 관계 설정
  @ManyToOne(() => EstimateRequest, (e) => e.estimateOffers)
  @JoinColumn({ name: 'estimateRequestId' })
  estimateRequest: EstimateRequest;

  @ManyToOne(() => MoverProfile, (m) => m.estimateOffers)
  @JoinColumn({ name: 'moverId' })
  mover: MoverProfile;
}

/**
 * PK 설정을 estimateRequestId, moverId에 두 곳에 설정하여 중복을 방지
 * 예를 들어 한 명의 기사가 한 개의 견적 요청을 여러번 제안하는 경우를 방지 하기 위해
 * DB 무결성 유지를 위해
 */
