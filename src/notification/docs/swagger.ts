import { applyDecorators } from '@nestjs/common';
import { Notification } from '../entities/notification.entity';
import { ApiBearerAuth, ApiOperation, ApiResponse } from '@nestjs/swagger';

export const ApiCreateNotification = () =>
  applyDecorators(
    ApiBearerAuth(),
    ApiOperation({ summary: '알림 생성' }),
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
