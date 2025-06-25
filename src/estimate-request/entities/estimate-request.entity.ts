import { ServiceType } from '@/common/const/service.const';
import { BaseTable } from 'src/common/entity/base-table.entity';
import { CustomerProfile } from 'src/customer-profile/entities/customer-profile.entity';
import { EstimateOffer } from 'src/estimate-offer/entities/estimate-offer.entity';
import {
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';

export type Address = {
  sido: string; // 시도
  sidoEnglish: string; // 시도 영어 (filter에 사용)
  sigungu: string; // 시군구
  roadAddress: string; // 도로명 주소
  fullAddress: string; // 전체 주소
};

export enum RequestStatus {
  PENDING = 'PENDING', // 견적 제안 대기 중
  CONFIRMED = 'CONFIRMED', // 고객이 기사님 1명 확정
  COMPLETED = 'COMPLETED', // 이사 완료
  CANCELED = 'CANCELED', // 고객이 요청 취소
  EXPIRED = 'EXPIRED', // 이사일 지나도록 확정 없음
}

@Entity()
export class EstimateRequest extends BaseTable {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'enum', enum: ServiceType })
  moveType: ServiceType;

  @Index('IDX_ESTIMATE_REQUEST_STATUS') // 인덱스 생성
  @Column({ type: 'enum', enum: RequestStatus, default: RequestStatus.PENDING })
  status: RequestStatus; // 견적 요청 상태

  @Column()
  moveDate: Date;

  @Column({ type: 'json' })
  fromAddress: Address; // 출발지 주소

  @Column({ type: 'json' })
  toAddress: Address; // 도착지 주소

  @Column({ type: 'uuid', array: true, nullable: true })
  targetMoverIds?: string[]; // 지정 견적 요청을 보낸 기사 id 목록 (견적 요청 시점에 기사가 없을 수 있음 )

  @Index('IDX_ESTIMATE_REQUEST_CONFIRMED_OFFER_ID') // 인덱스 생성
  @Column({ type: 'uuid', nullable: true })
  confirmedOfferId?: string; // 확정된 제안 견적 id

  // customer : estimateRequest <-> 1:N 관계
  @ManyToOne(() => CustomerProfile, (customer) => customer.estimateRequests)
  @JoinColumn({ name: 'customerId' }) /// FK customerId 생성
  customer: CustomerProfile; // 고객 프로필

  // EstimateRequest : EstimateOffer <-> 1:N 관계
  @OneToMany(() => EstimateOffer, (offer) => offer.estimateRequest)
  estimateOffers: EstimateOffer[]; // 견적 제안 목록 (최대 8개)
}
