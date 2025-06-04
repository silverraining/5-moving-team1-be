import {
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiBody,
} from '@nestjs/swagger';
import { applyDecorators } from '@nestjs/common';

import { CreateEstimateRequestDto } from '@/estimate-request/dto/create-estimate-request.dto';
import { EstimateRequestResponseDto } from '@/estimate-request/dto/estimate-request-response.dto';
import {
  CODE_400_BAD_REQUEST,
  CODE_401_RESPONSES,
} from '@/common/docs/response.swagger';
import { CreateEstimateRequestResponseDto } from '../dto/create-estimate-request.response.dto';

export function ApiCreateEstimateRequest() {
  return applyDecorators(
    ApiOperation({
      summary: '견적 요청 생성',
      description: '고객이 새로운 견적 요청을 생성합니다.',
    }),
    ApiBearerAuth(),
    ApiBody({
      type: CreateEstimateRequestDto,
      examples: {
        basic: {
          summary: '기본 예시',
          value: {
            moveType: 'HOME',
            moveDate: '2025-07-15',
            fromAddress: {
              sido: '경기',
              sidoEnglish: 'Gyeonggi',
              sigungu: '성남시 분당구',
              roadAddress: '불정로 6',
              fullAddress: '경기 성남시 분당구 불정로 6',
            },
            toAddress: {
              sido: '서울',
              sidoEnglish: 'Seoul',
              sigungu: '강남구',
              roadAddress: '테헤란로 212',
              fullAddress: '서울 강남구 테헤란로 212',
            },
            targetMoverIds: ['a1b2c3d4-e5f6-7890-1234-56789abcdeff'],
          },
        },
      },
    }),
    ApiResponse({
      status: 201,
      description: '견적 요청 생성 성공',
      type: CreateEstimateRequestResponseDto,
    }),
    ApiResponse(
      CODE_400_BAD_REQUEST([
        {
          key: 'ActiveEstimateExists',
          summary: '진행 중인 요청 중복',
          value: {
            statusCode: 400,
            message: '진행 중인 견적 요청이 이미 존재합니다.',
            error: 'Bad Request',
          },
        },
      ]),
    ),
    ApiResponse(CODE_401_RESPONSES),
  );
}

export function ApiGetMyEstimateHistory() {
  return applyDecorators(
    ApiOperation({
      summary: '받았던 견적 목록 조회',
      description:
        '고객이 생성한 견적 요청 중 완료(COMPLETE), 취소(CANCELED), 만료(EXPIRED)된 요청 목록에 대해 받았던 견적서 목록을 조회합니다.',
    }),
    ApiBearerAuth(),
    ApiResponse({
      status: 200,
      description: '받았던 견적 목록 조회 성공',
      type: EstimateRequestResponseDto,
      isArray: true,
    }),
    ApiResponse(CODE_401_RESPONSES),
  );
}
