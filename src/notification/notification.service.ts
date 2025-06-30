import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateNotificationDto } from './dto/create-notification.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { Notification } from './entities/notification.entity';
import { User } from '@/user/entities/user.entity';
import { Observable, Subject } from 'rxjs';
import { MoverProfile } from '@/mover-profile/entities/mover-profile.entity';
import { CustomerProfile } from '@/customer-profile/entities/customer-profile.entity';
import { UpdateNotificationDto } from './dto/update-notification.dto';

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
    let user = await this.userRepo.findOneBy({ id: createDto.userId });

    if (!user) {
      const customerProfile = await this.customerProfileRepo.findOne({
        where: { id: createDto.userId },
        relations: ['user'],
      });
      if (customerProfile) user = customerProfile.user;
    }

    if (!user) {
      const moverProfile = await this.moverProfileRepo.findOne({
        where: { id: createDto.userId },
        relations: ['user'],
      });
      if (moverProfile) user = moverProfile.user;
    }

    if (!user) {
      throw new NotFoundException(
        `해당 ID(${createDto.userId})를 가진 유저를 찾을 수 없습니다.`,
      );
    }

    // 알림 생성
    const notification = this.notificationRepo.create({
      type: createDto.type,
      message: createDto.message,
      targetId: user.id,
      isRead: false,
      user,
    });

    // 저장
    await this.notificationRepo.save(notification);
    //현재 까지 생성 되어 있는 알림 조회
    const notifications = await this.notificationRepo.find({
      where: { user: { id: user.id }, isRead: false },
      order: { createdAt: 'DESC' }, // 최신순 정렬
      select: {
        id: true,
        type: true,
        message: true,
        targetId: true,
        isRead: true,
        createdAt: true,
      },
    });
    // 알림 리스트 반환
    this.sendNotification(user.id, notifications);

    return { message: '알림생성 성공' };
  }

  //초기 데이터용 알림 api
  async findAll(userId): Promise<Notification[]> {
    const notifications = this.notificationRepo.find({
      where: { user: { id: userId }, isRead: false },
      order: { createdAt: 'DESC' },
      select: {
        id: true,
        type: true,
        message: true,
        targetId: true,
        isRead: true,
        createdAt: true,
      },
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

  async markAsRead(
    dto: UpdateNotificationDto,
    userId: string,
  ): Promise<{ message: string }> {
    if (dto.id && dto.ids && dto.ids.length > 0) {
      throw new BadRequestException('id 또는 ids 중 하나만 입력해야 합니다.');
    }

    if (dto.id) {
      await this.markSingleAsRead(dto.id, userId);
    } else if (dto.ids?.length > 0) {
      await this.markMultipleAsRead(
        dto.ids.map((id) => id),
        userId,
      );
    } else {
      throw new BadRequestException('id 또는 ids를 입력해야 합니다.');
    }

    const notifications = await this.notificationRepo.find({
      where: { user: { id: userId }, isRead: false },
      order: { createdAt: 'DESC' },
      select: {
        id: true,
        type: true,
        message: true,
        targetId: true,
        isRead: true,
        createdAt: true,
      },
    });

    return { message: '읽음 처리 완료' };
  }

  async markSingleAsRead(id: string, userId: string) {
    const notification = await this.notificationRepo.findOne({
      where: { id, user: { id: userId } },
    });

    if (!notification) {
      throw new NotFoundException('해당 알림을 찾을 수 없습니다.');
    }

    if (!notification.isRead) {
      notification.isRead = true;
      await this.notificationRepo.save(notification);
    }
  }

  async markMultipleAsRead(ids: string[], userId: string) {
    await this.notificationRepo.update(
      { id: In(ids), user: { id: userId }, isRead: false },
      { isRead: true },
    );
  }

  // 알림 보내기 (payload는 Notification 배열 혹은 string)
  sendNotification(userId: string, payload: Notification[]) {
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
