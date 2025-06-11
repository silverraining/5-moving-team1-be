import { applyDecorators } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiParam,
  ApiResponse,
} from '@nestjs/swagger';
import {
  CODE_400_BAD_REQUEST,
  CODE_401_RESPONSES,
} from '@/common/docs/response.swagger';
import { EstimateOfferResponseDto } from '../dto/estimate-offer-response.dto';

export function ApiGetPendingEstimateOffers() {
  return applyDecorators(
    ApiOperation({
      summary: '대기 중인 견적 요청에 대한 오퍼 목록 조회',
      description:
        '로그인한 고객 본인의 견적 요청중 현재 상태가 PENDING인 견적 요청 ID에 대해 기사님들이 보낸 견적 목록을 조회합니다.',
    }),
    ApiBearerAuth(),
    ApiParam({
      name: 'requestId',
      required: true,
      description: '견적 요청 ID (UUID)',
      example: '9ed4f4a0-0391-4a4f-af22-039aed8ccc9b',
      type: String,
    }),
    ApiResponse({
      status: 200,
      description: '대기 중인 견적 목록 조회 성공',
      type: EstimateOfferResponseDto,
      isArray: true,
    }),
    ApiResponse({
      status: 400,
      description: '잘못된 요청',
    }),
    ApiResponse({
      status: 403,
      description: '권한 없음. 본인의 요청이 아닐 경우',
    }),
  );
}

export function ApiGetEstimateOfferDetail() {
  return applyDecorators(
    ApiOperation({
      summary: '견적 상세 조회',
      description: '특정 견적 요청에 대한 기사별 견적서를 상세 조회합니다.',
    }),
    ApiBearerAuth(),
    ApiParam({
      name: 'requestId',
      description: '견적 요청 ID (UUID)',
      example: '9ed4f4a0-0391-4a4f-af22-039aed8ccc9b',
      type: String,
    }),
    ApiParam({
      name: 'moverId',
      description: '기사 ID (UUID)',
      example: '9ec9e7ba-d922-48b4-a821-17842bc02944',
      type: String,
    }),
    ApiResponse({
      status: 200,
      description: '견적 상세 조회 성공',
      type: EstimateOfferResponseDto,
    }),
    ApiResponse(CODE_400_BAD_REQUEST([])),
    ApiResponse(CODE_401_RESPONSES),
    ApiResponse({
      status: 403,
      description: '권한 없음. 본인의 요청이 아닐 경우',
    }),
  );
}
