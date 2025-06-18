import { Body, Controller, Get, Post, Req, Sse } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { NotificationService } from './notification.service';
import {
  ApiCreateNotification,
  ApiGetAllNotifications,
  ApiGetNotifications,
} from './docs/swagger';
import { CreateNotificationDto } from './dto/create-notification.dto';
import { Notification } from './entities/notification.entity';
import { interval, map, merge, Observable } from 'rxjs';

@ApiTags('notifications')
@Controller('notifications')
export class NotificationController {
  constructor(private readonly notificationService: NotificationService) {}

  @Post()
  @ApiCreateNotification()
  async create(
    @Body() createDto: CreateNotificationDto,
  ): Promise<{ message: string }> {
    return this.notificationService.create(createDto);
  }
  @Get()
  @ApiGetAllNotifications()
  async findAll(@Req() req): Promise<Notification[]> {
    return this.notificationService.findAll(req.user.sub);
  }
  //실시간 알림 통신부분
  @Sse('stream')
  @ApiGetNotifications()
  stream(@Req() req): Observable<{ data: Notification[] } | { data: string }> {
    const notifications = this.notificationService.getNotificationStream(
      req.user.sub,
    );
    //data통신이 없으면 api연결이 종료 되기 때문에 연결을 유지시켜주는 역할
    const heartbeat = interval(4000).pipe(map(() => ({ data: '' })));

    return merge(notifications, heartbeat);
  }
}
