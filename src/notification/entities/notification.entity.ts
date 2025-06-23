import { User } from 'src/user/entities/user.entity';
import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';

export enum NotificationType {
  NEW_ESTIMATE_REQUEST = 'NEW_ESTIMATE_REQUEST',
  ESTIMATE_CONFIRMED = 'ESTIMATE_CONFIRMED',
  MOVE_DAY_REMINDER = 'MOVE_DAY_REMINDER',
  NEW_OFFER = 'NEW_OFFER',
  CREATE_REVIEW = 'CREATE_REVIEW',
  WRITE_REVIEW = 'WRITE_REVIEW',
}

@Entity()
export class Notification {
  /**
   * id : string
   * type : 알림타입
   * message : 알림 내용
   * targetId : 대상 id
   * isRead : 읽음 상태
   * createAt : 생성 일자
   */
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

  @CreateDateColumn()
  createdAt: Date;

  // User : Notification <-> 1:N 관계
  @ManyToOne(() => User, (user) => user.notifications, {
    cascade: true, /// 저장/업데이트 시	관련 엔티티도 자동 저장/업데이트
    onDelete: 'CASCADE', /// user가 삭제되면 notification도 삭제
  })
  @JoinColumn() /// FK userId 생성
  user: User;
}
