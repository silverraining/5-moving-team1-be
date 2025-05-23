import {
  ServiceRegionMap,
  ServiceTypeMap,
} from 'src/common/const/service.const';
import { BaseTable } from 'src/common/entity/base-table.entity';
import { EstimateRequest } from 'src/estimate-request/entities/estimate-request.entity';
import { Like } from 'src/like/entities/like.entity';
import { Review } from 'src/review/entities/review.entity';
import { User } from 'src/user/entities/user.entity';
import {
  Column,
  Entity,
  Index,
  JoinColumn,
  OneToMany,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity()
export class CustomerProfile extends BaseTable {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ nullable: true })
  imageUrl?: string;

  @Column({ type: 'json' })
  serviceType: ServiceTypeMap;

  @Column({ type: 'json' })
  serviceRegion: ServiceRegionMap;

  // User : CustomerProfile <-> 1:1 관계
  @OneToOne(() => User, (user) => user.customerProfile)
  @JoinColumn() /// FK userId 생성
  @Index('IDX_CUSTOMER_USER_ID')
  user: User;

  // CustomerProfile : Like <-> 1:N 관계
  @OneToMany(() => Like, (like) => like.customer)
  likedMovers: Like[]; /// 고객이 찜한 기사 목록

  // customer : estimateRequest <-> 1:N 관계
  @OneToMany(() => EstimateRequest, (estimate) => estimate.customer)
  estimateRequests: EstimateRequest[]; // 고객 프로필에 대한 견적 요청 목록

  // customer : review <-> 1:N 관계
  @OneToMany(() => Review, (review) => review.customer)
  reviews: Review[]; // 고객이 작성한 리뷰 목록
}
