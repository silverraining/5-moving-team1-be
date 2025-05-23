import { ServiceType } from 'src/common/const/service.const';
import { BaseTable } from 'src/common/entity/base-table.entity';
import { CustomerProfile } from 'src/customer-profile/entities/customer-profile.entity';
import { EstimateOffer } from 'src/estimate-offer/entities/estimate-offer.entity';
import {
  Column,
  Entity,
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

  @Column({ type: 'enum', enum: RequestStatus, default: RequestStatus.PENDING })
  status: RequestStatus; // 견적 요청 상태

  @Column()
  moveDate: Date;

  @Column({ type: 'json' })
  fromAddress: Address; // 출발지 주소

  @Column({ type: 'json' })
  toAddress: Address; // 도착지 주소

  @Column()
  confirmedOfferId: string; // 확정된 제안 견적 id

  // customer : estimateRequest <-> 1:N 관계
  @ManyToOne(() => CustomerProfile, (customer) => customer.estimateRequests)
  @JoinColumn({ name: 'customerId' }) /// FK customerId 생성
  customer: CustomerProfile; // 고객 프로필

  // EstimateRequest : EstimateOffer <-> 1:N 관계
  @OneToMany(() => EstimateOffer, (offer) => offer.estimateRequest)
  estimateOffers: EstimateOffer[]; // 견적 제안 목록 (3개 제한)
}
