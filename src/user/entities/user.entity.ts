import { Exclude } from 'class-transformer';
import { BaseTable } from 'src/common/entity/base-table.entity';
import { CustomerProfile } from 'src/customer-profile/entities/customer-profile.entity';
import { MoverProfile } from 'src/mover-profile/entities/mover-profile.entity';
import { Notification } from 'src/notification/entities/notification.entity';
import {
  Column,
  Entity,
  OneToMany,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';

export enum Role {
  CUSTOMER = 'CUSTOMER',
  MOVER = 'MOVER',
}

export enum Provider {
  LOCAL = 'LOCAL',
  GOOGLE = 'GOOGLE',
  KAKAO = 'KAKAO',
  NAVER = 'NAVER',
}

@Entity()
export class User extends BaseTable {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'enum', enum: Role })
  role: Role;

  @Column()
  name: string;

  @Column({ unique: true })
  phone: string;

  @Column({ unique: true })
  email: string;

  @Exclude()
  @Column({ nullable: true })
  password?: string;

  @Column({ type: 'enum', enum: Provider, default: Provider.LOCAL })
  provider: Provider;

  @Column({ nullable: true })
  snsId?: string;

  @Column({ type: 'text', nullable: true })
  refreshToken?: string;

  // User : Notification <-> 1:N 관계
  @OneToMany(() => Notification, (notification) => notification.user)
  notifications: Notification[];

  /// User : MoverProfile <-> 1:1 관계
  @OneToOne(() => MoverProfile, (moverProfile) => moverProfile.user, {
    nullable: true, /// moverProfile 있을 수도 있고 없을 수도 있음
    cascade: true,
  })
  moverProfile?: MoverProfile;

  /// User : CustomerProfile <-> 1:1 관계
  @OneToOne(() => CustomerProfile, (customerProfile) => customerProfile.user, {
    nullable: true, /// customerProfile 있을 수도 있고 없을 수도 있음
    cascade: true,
  })
  customerProfile?: CustomerProfile;
}
