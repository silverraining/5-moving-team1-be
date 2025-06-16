import {
  ServiceRegionMap,
  ServiceTypeMap,
} from 'src/common/const/service.const';
import { BaseTable } from 'src/common/entity/base-table.entity';
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
import { Like } from 'src/like/entities/like.entity';
import { EstimateOffer } from 'src/estimate-offer/entities/estimate-offer.entity';
import { Review } from 'src/review/entities/review.entity';
import { MOVER_PROFILE_TABLE } from '@/common/const/query-builder.const';

@Entity(MOVER_PROFILE_TABLE)
export class MoverProfile extends BaseTable {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  nickname: string;

  @Column({ nullable: true })
  imageUrl?: string;

  @Column()
  experience: number;

  @Column()
  intro: string; /// 한 줄 소개

  @Column()
  description: string; /// 상세 설명

  @Column({ type: 'json' })
  serviceType: ServiceTypeMap; /// 서비스 종류

  @Column({ type: 'json' })
  serviceRegion: ServiceRegionMap; /// 서비스 지역

  /// User : MoverProfile <-> 1:1 관계
  @OneToOne(() => User, (user) => user.moverProfile)
  @JoinColumn() /// FK userId 생성
  @Index('IDX_MOVER_USER_ID')
  user: User;

  /// MoverProfile : Like <-> 1:N 관계
  @OneToMany(() => Like, (like) => like.mover)
  likedCustomers: Like[]; /// 기사를 찜한 고객 목록

  // MoverProfile : EstimateOffer <-> 1:N 관계
  @OneToMany(() => EstimateOffer, (offer) => offer.mover)
  estimateOffers: EstimateOffer[];

  // moverProfile : Review <-> 1:N 관계
  @OneToMany(() => Review, (review) => review.mover)
  reviews: Review[];
}
