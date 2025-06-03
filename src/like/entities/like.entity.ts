import { BaseTable } from 'src/common/entity/base-table.entity';
import { Entity, JoinColumn, ManyToOne, PrimaryColumn } from 'typeorm';
import { CustomerProfile } from 'src/customer-profile/entities/customer-profile.entity';
import { MoverProfile } from 'src/mover-profile/entities/mover-profile.entity';

@Entity()
export class Like extends BaseTable {
  // MoverProfile : Like <-> 1:N 관계
  @PrimaryColumn({
    name: 'moverId',
    type: 'uuid',
  }) // PK 설정
  @JoinColumn({ name: 'moverId' }) // FK 설정
  @ManyToOne(() => MoverProfile, (mover) => mover.likedCustomers)
  mover: MoverProfile;

  // CustomerProfile : Like <-> 1:N 관계
  @PrimaryColumn({
    name: 'customerId',
    type: 'uuid',
  }) // PK 설정
  @JoinColumn({ name: 'customerId' }) // FK 설정
  @ManyToOne(() => CustomerProfile, (customer) => customer.likedMovers)
  customer: CustomerProfile;
}

/**
 * PK 설정을 moverId, customerId에 두 곳에 설정하여 중복을 방지
 * 예를 들어 한 명의 고객이 한 명의 기사를 여러번 찜하는 경우를 방지 하기 위해
 * DB 무결성 유지를 위해
 */
