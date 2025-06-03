import { BaseTable } from 'src/common/entity/base-table.entity';
import { CustomerProfile } from 'src/customer-profile/entities/customer-profile.entity';
import { EstimateOffer } from 'src/estimate-offer/entities/estimate-offer.entity';
import { MoverProfile } from 'src/mover-profile/entities/mover-profile.entity';
import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToOne,
  PrimaryColumn,
} from 'typeorm';

@Entity()
export class Review extends BaseTable {
  // EstimateOffer : Review <-> 1:1 관계
  @PrimaryColumn({
    name: 'estimateOfferId',
    type: 'uuid',
  })
  @OneToOne(() => EstimateOffer, (offer) => offer.review)
  @JoinColumn({ name: 'estimateOfferId' }) // FK 컬럼 이름 지정
  estimateOffer: EstimateOffer; // 견적 제안 id

  @PrimaryColumn({
    name: 'customerId',
    type: 'uuid',
  })
  @ManyToOne(() => CustomerProfile, (customer) => customer.reviews)
  @JoinColumn({ name: 'customerId' }) // FK 컬럼 이름 지정
  customer: CustomerProfile; // 고객 id

  @Column()
  rating: number; // 별점

  @Column()
  comment: string; // 리뷰 내용

  @ManyToOne(() => MoverProfile, (mover) => mover.reviews)
  @JoinColumn({ name: 'moverId' }) // FK 컬럼 이름 지정
  mover: MoverProfile;
}

/**
 * PK 설정을 estimateOfferId, customerId에 두 곳에 설정하여 중복을 방지
 * 예를 들어 한 명의 고객이 한 개의 제안 견적서를 여러번 리뷰하는 경우를 방지 하기 위해
 * DB 무결성 유지를 위해
 */
