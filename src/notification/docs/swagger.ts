import { applyDecorators } from '@nestjs/common';
import { Notification } from '../entities/notification.entity';
import {
  ApiBearerAuth,
  ApiBody,
  ApiOperation,
  ApiResponse,
} from '@nestjs/swagger';
import { CreateNotificationDto } from '../dto/create-notification.dto';

export const ApiCreateNotification = () =>
  applyDecorators(
    ApiBearerAuth(),
    ApiOperation({ summary: '알림 생성' }),
    ApiBody({ type: CreateNotificationDto }),
    ApiResponse({
      status: 201,
      description: '생성된 알림 반환',
      type: Notification,
    }),
  );

export const ApiGetAllNotifications = () =>
  applyDecorators(
    ApiBearerAuth(),
    ApiOperation({ summary: '알림 전체 조회 (findAll)' }),
    ApiResponse({
      status: 200,
      description: '알림 배열 반환',
      type: [Notification],
    }),
  );

export const ApiGetNotifications = () =>
  applyDecorators(
    ApiBearerAuth(),
    ApiOperation({ summary: '알림 조회' }),
    ApiResponse({
      status: 200,
      description: '알림 배열 반환',
      type: [Notification],
    }),
  );
