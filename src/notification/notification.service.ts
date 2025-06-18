import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateNotificationDto } from './dto/create-notification.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Notification } from './entities/notification.entity';
import { User } from '@/user/entities/user.entity';
import { Observable, Subject } from 'rxjs';
import { MoverProfile } from '@/mover-profile/entities/mover-profile.entity';
import { CustomerProfile } from '@/customer-profile/entities/customer-profile.entity';

@Injectable()
export class NotificationService {
  private clients = new Map<
    string,
    Subject<{ data: Notification[] } | { data: string }>
  >();

  constructor(
    @InjectRepository(Notification)
    private notificationRepo: Repository<Notification>,
    @InjectRepository(User)
    private userRepo: Repository<User>,
    @InjectRepository(MoverProfile)
    private moverProfileRepo: Repository<MoverProfile>,
    @InjectRepository(CustomerProfile)
    private customerProfileRepo: Repository<CustomerProfile>,
  ) {}

  // 알림 생성
  async create(createDto: CreateNotificationDto): Promise<{ message: string }> {
    // 유저 존재 여부 확인
    let targetUserId = createDto.userId;
    let user = await this.userRepo.findOneBy({ id: createDto.userId });
    const customerProfile = await this.moverProfileRepo.findOneBy({
      id: createDto.userId,
    });
    const moverProfile = await this.customerProfileRepo.findOneBy({
      id: createDto.userId,
    });
    // user가 없을 경우 다른 프로필에서 찾아보기
    if (!user) {
      const customerProfile = await this.customerProfileRepo.findOne({
        where: { id: targetUserId },
        relations: ['user'],
      });

      if (customerProfile) {
        targetUserId = customerProfile.user.id;
        user = customerProfile.user;
      }
    }

    if (!user) {
      const moverProfile = await this.moverProfileRepo.findOne({
        where: { id: targetUserId },
        relations: ['user'],
      });

      if (moverProfile) {
        targetUserId = moverProfile.user.id;
        user = moverProfile.user;
      }
    }

    //세가지의 table에 존재하지 않는 id값 일때
    if (!user && !customerProfile && !moverProfile) {
      throw new NotFoundException(
        `해당 ID(${createDto.userId})를 가진 유저를 찾을 수 없습니다.`,
      );
    }

    // 알림 생성
    const notification = this.notificationRepo.create({
      type: createDto.type,
      message: createDto.message,
      targetId: targetUserId,
      isRead: false,
      user,
    });

    // 저장
    await this.notificationRepo.save(notification);
    //현재 까지 생성 되어 있는 알림 조회
    const notifications = await this.notificationRepo.find({
      where: { user: { id: targetUserId }, isRead: false },
      order: { createdAt: 'DESC' }, // 최신순 정렬 (선택)
    });
    // 알림 리스트 반환
    this.sendNotification(targetUserId, notifications);

    return { message: '알림생성 성공' };
  }
  //초기 데이터용 알림 api
  async findAll(userId): Promise<Notification[]> {
    const notifications = this.notificationRepo.find({
      where: { user: { id: userId }, isRead: false },
      order: { createdAt: 'DESC' },
    });
    return notifications;
  }

  //userId 값을 가지고 해당 유저에게 data를 보내줌
  getNotificationStream(
    userId: string,
  ): Observable<{ data: Notification[] } | { data: string }> {
    if (!this.clients.has(userId)) {
      this.clients.set(
        userId,
        new Subject<{ data: Notification[] } | { data: string }>(),
      );
    }
    return this.clients.get(userId).asObservable();
  }

  // 알림 보내기 (payload는 Notification 배열 혹은 string)
  sendNotification(userId: string, payload: Notification[] | []) {
    const subject = this.clients.get(userId);
    if (!subject) {
      console.log(
        `No active subscriber for user ${userId}, skipping notification`,
      );
      return;
    }
    subject.next({ data: payload });
  }
}
