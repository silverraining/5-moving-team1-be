import { BaseTable } from 'src/common/entity/base-table.entity';
import { User } from 'src/user/entities/user.entity';
import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';

export enum NotificationType {
  NEW_ESTIMATE_REQUEST = 'NEW_ESTIMATE_REQUEST',
  ESTIMATE_CONFIRMED = 'ESTIMATE_CONFIRMED',
  MOVE_DAY_REMINDER = 'MOVE_DAY_REMINDER',
}

@Entity()
export class Notification extends BaseTable {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'enum', enum: NotificationType })
  type: NotificationType;

  @Column()
  message: string;

  @Column()
  targetId: string;

  @Column({ default: false })
  isRead: boolean;

  // User : Notification <-> 1:N 관계
  @ManyToOne(() => User, (user) => user.notifications, {
    cascade: true, /// 저장/업데이트 시	관련 엔티티도 자동 저장/업데이트
    onDelete: 'CASCADE', /// user가 삭제되면 notification도 삭제
  })
  @JoinColumn() /// FK userId 생성
  user: User;
}
