import { IsEnum, IsString, IsUUID } from 'class-validator';
import { NotificationType } from '../entities/notification.entity';
import { ApiProperty } from '@nestjs/swagger';

export class CreateNotificationDto {
  @ApiProperty({
    example: 'NEW_ESTIMATE_REQUEST',
    enum: NotificationType,
    description: '알림 유형',
  })
  @IsEnum(NotificationType)
  type: NotificationType;

  @ApiProperty({
    example: '견적 요청이 도착했습니다.',
    description: '알림 메시지',
  })
  @IsString()
  message: string;

  @ApiProperty({
    example: 'estimate-request-123',
    description: '타겟 리소스의 ID (예: 견적 요청 ID, 리뷰 ID 등)',
  })
  @IsString()
  targetId: string;

  @ApiProperty({
    example: '3fa85f64-5717-4562-b3fc-2c963f66afa6',
    description: '알림을 받을 사용자 ID',
  })
  @IsUUID()
  userId: string;
}
