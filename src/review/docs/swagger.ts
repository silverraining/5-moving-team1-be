import { applyDecorators } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiBody,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiResponse,
} from '@nestjs/swagger';
import {
  CODE_200_SUCCESS,
  CODE_201_CREATED,
  CODE_400_BAD_REQUEST,
  CODE_401_RESPONSES,
  CODE_403_FORBIDDEN,
  CODE_404_NOT_FOUND,
  CODE_409_CONFLICT,
  CODE_500_INTERNAL_SERVER_ERROR,
} from '@/common/docs/response.swagger';
import {
  CustomerReviewListSchema,
  AvailableReviewListSchema,
  MoverReviewListSchema,
  MessageSchema,
} from '@/common/docs/schema.swagger';
import { CreateReviewFullExample } from '@/common/docs/body.swagger';
import {
  ratingValidationError,
  contentValidationError,
  pageValidationError,
  takeValidationError,
  completedOfferNotFoundError,
  reviewAlreadyExistsError,
  moverProfileNotFoundError,
  customerProfileNotFoundError,
  forbiddenReviewError,
} from '@/common/docs/validation.swagger';
import { pageQuery, takeQuery } from '@/common/docs/query.swagger';
import { CreateReviewDto } from '../dto/create-review.dto';

/**
 * @description [고객] 리뷰 작성 API
 */
export const ApiCreateReview = () =>
  applyDecorators(
    ApiBearerAuth(),
    ApiOperation({
      summary: '[고객] 리뷰 작성',
      description: `
- [고객]이 이사를 완료한 견적 제안(completedOffer)에 대해 리뷰를 작성하는 API입니다.
- 평점(rating)과 내용(content)은 필수 항목입니다.
- 한 번 이사에 대해 리뷰는 한 번만 작성할 수 있습니다.`,
    }),
    ApiParam({
      name: 'completedOfferId',
      required: true,
      description: '리뷰를 작성할, 완료된 견적 제안의 ID',
      example: 'b5a819f9-5466-4cba-acf1-ceba8e248b90',
    }),
    ApiBody({
      type: CreateReviewDto,
      examples: {
        fullExample: CreateReviewFullExample,
      },
    }),
    ApiResponse(
      CODE_201_CREATED({
        description: '리뷰 작성 성공한 경우',
        schema: MessageSchema('리뷰가 성공적으로 작성되었습니다.'),
      }),
    ),
    ApiResponse(
      CODE_400_BAD_REQUEST([ratingValidationError, contentValidationError]),
    ),
    ApiResponse(CODE_401_RESPONSES),
    ApiResponse(CODE_403_FORBIDDEN([forbiddenReviewError])),
    ApiResponse(
      CODE_404_NOT_FOUND([
        customerProfileNotFoundError,
        completedOfferNotFoundError,
      ]),
    ),
    ApiResponse(CODE_409_CONFLICT([reviewAlreadyExistsError])),
    ApiResponse(
      CODE_500_INTERNAL_SERVER_ERROR({
        description: '리뷰 저장 중 서버 내부 오류 발생',
        message: '리뷰 작성 중 오류가 발생했습니다.',
      }),
    ),
  );

/**
 * @description [고객] 리뷰 작성 가능한 목록 조회 API
 */
export const ApiFindAllAvailableReviews = () =>
  applyDecorators(
    ApiBearerAuth(),
    ApiOperation({
      summary: '[고객] 리뷰 작성 가능한 목록 조회',
      description: `
- [고객]이 이사를 완료했지만 아직 리뷰를 작성하지 않은 이사 목록을 조회합니다.
- 페이지네이션으로 결과를 반환합니다.`,
    }),
    ApiQuery(pageQuery),
    ApiQuery(takeQuery),
    ApiResponse(
      CODE_200_SUCCESS({
        description: '리뷰 작성 가능한 목록 조회 성공',
        schema: AvailableReviewListSchema,
      }),
    ),
    ApiResponse(
      CODE_400_BAD_REQUEST([pageValidationError, takeValidationError]),
    ),
    ApiResponse(CODE_401_RESPONSES),
    ApiResponse(CODE_404_NOT_FOUND([customerProfileNotFoundError])),
  );

/**
 * @description [고객] 내가 작성한 리뷰 목록 조회 API
 */
export const ApiFindMyReviewsAsCustomer = () =>
  applyDecorators(
    ApiBearerAuth(),
    ApiOperation({
      summary: '[고객] 내가 작성한 리뷰 목록 조회',
      description: `
- 현재 로그인한 [고객]이 작성한 모든 리뷰 목록을 조회하는 API입니다.
- 페이지네이션으로 결과를 반환합니다.`,
    }),
    ApiQuery(pageQuery),
    ApiQuery(takeQuery),
    ApiResponse(
      CODE_200_SUCCESS({
        description: '고객이 작성한 리뷰 목록 조회 성공한 경우',
        schema: CustomerReviewListSchema,
      }),
    ),
    ApiResponse(
      CODE_400_BAD_REQUEST([pageValidationError, takeValidationError]),
    ),
    ApiResponse(CODE_401_RESPONSES),
    ApiResponse(CODE_404_NOT_FOUND([customerProfileNotFoundError])),
  );

/**
 * @description [기사] 기사 본인이 받은 리뷰 목록 조회 API
 */
export const ApiFindReviewsAsMover = () =>
  applyDecorators(
    ApiBearerAuth(),
    ApiOperation({
      summary: '[기사] 내게 달린 리뷰 목록 조회',
      description: `
- 로그인한 [기사]에게 작성된 모든 리뷰 목록과 평점 통계를 조회하는 API입니다.
- 페이지네이션으로 결과를 반환합니다.`,
    }),
    // NOTE: 현재 컨트롤러는 param id를 사용하지 않고 토큰의 정보(userInfo.sub)를 사용하므로 ApiParam은 제거합니다.
    ApiQuery(pageQuery),
    ApiQuery(takeQuery),
    ApiResponse(
      CODE_200_SUCCESS({
        description: '기사 본인이 받은 리뷰 목록 및 통계 조회 성공',
        schema: MoverReviewListSchema,
      }),
    ),
    ApiResponse(
      CODE_400_BAD_REQUEST([pageValidationError, takeValidationError]),
    ),
    ApiResponse(CODE_401_RESPONSES),
    ApiResponse(CODE_404_NOT_FOUND([moverProfileNotFoundError])),
  );

/**
 * @description [기사] 특정 기사에 대한 리뷰 목록 조회 API
 */
export const ApiFindReviewsByMoverId = () =>
  applyDecorators(
    ApiBearerAuth(),
    ApiOperation({
      summary: '[기사] 특정 기사에게 달린 리뷰 목록 조회',
      description: `
- 로그인한 [기사]에게 작성된 모든 리뷰 목록과 평점 통계를 조회하는 API입니다.
- 페이지네이션으로 결과를 반환합니다.`,
    }),
    // NOTE: 현재 컨트롤러는 param id를 사용하지 않고 토큰의 정보(userInfo.sub)를 사용하므로 ApiParam은 제거합니다.
    ApiQuery(pageQuery),
    ApiQuery(takeQuery),
    ApiResponse(
      CODE_200_SUCCESS({
        description: '내게 달린 리뷰 목록 및 통계 조회 성공',
        schema: MoverReviewListSchema,
      }),
    ),
    ApiResponse(
      CODE_400_BAD_REQUEST([pageValidationError, takeValidationError]),
    ),
    ApiResponse(CODE_401_RESPONSES),
    ApiResponse(CODE_404_NOT_FOUND([moverProfileNotFoundError])),
  );
