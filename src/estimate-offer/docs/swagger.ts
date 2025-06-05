import { applyDecorators } from '@nestjs/common';
import { ApiOperation, ApiParam, ApiResponse } from '@nestjs/swagger';
import { EstimateOfferResponseDto } from '../dto/estimate-offer-response.dto';

export function ApiGetEstimateOffers() {
  return applyDecorators(
    // ApiBearerAuth('access-token'),
    ApiOperation({
      summary: '견적 요청에 대한 오퍼 목록 조회',
      description:
        '특정 견적 요청 ID에 해당하는 모든 이사 제안 목록을 조회합니다. 로그인한 고객 본인의 요청에 한해서만 조회 가능합니다.',
    }),
    ApiParam({
      name: 'requestId',
      required: true,
      description: '견적 요청 ID (UUID)',
      example: '1c340ecf-e7f8-4431-bad2-dc19ea9ff3e7',
      type: String,
    }),
    ApiResponse({
      status: 200,
      description: '견적 제안 목록 조회 성공',
      type: EstimateOfferResponseDto,
      isArray: true,
    }),
    ApiResponse({
      status: 400,
      description: '잘못된 요청. 견적 요청 ID가 유효하지 않음',
    }),
    ApiResponse({
      status: 403,
      description: '권한 없음. 본인의 요청이 아닐 경우',
    }),
  );
}
