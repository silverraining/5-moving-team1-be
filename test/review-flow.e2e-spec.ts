import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '@/app.module';
import {
  createRandomServiceRegion,
  createRandomServiceType,
  getRandomAddress,
  generateRandomName,
  generateTestEmail,
} from './utils/test-helpers';
import { DataSource } from 'typeorm';
import { TEST_CONSTANTS } from './config/test.constants';
import {
  EstimateRequest,
  RequestStatus,
} from '@/estimate-request/entities/estimate-request.entity';
import {
  EstimateOffer,
  OfferStatus,
} from '@/estimate-offer/entities/estimate-offer.entity';
import { Role } from '@/user/entities/user.entity';

describe('Review Flow (e2e)', () => {
  let app: INestApplication;
  let customerToken: string;
  let moverToken: string;
  let moverToken2: string;
  let moverToken3: string;
  let estimateRequestId: string;
  let estimateOfferId: string;
  let dataSource: DataSource;
  let customerId: string;
  let moverId: string;
  let moverId2: string;
  let moverId3: string;
  let customerEmail: string;
  let moverEmail: string;
  let isReviewCreated = false;

  // 테스트용 동적 값 생성 함수
  const generateTestPhone = (index: number = 0) =>
    `${TEST_CONSTANTS.PHONE_PREFIX}${String(index).padStart(3, '0')}`;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
    dataSource = moduleFixture.get<DataSource>(DataSource);
  }, 10000); // Increase timeout for module initialization

  afterAll(async () => {
    if (dataSource && dataSource.isInitialized && isReviewCreated) {
      // 테스트 데이터 삭제 여부 (시드 데이터 생성시에는 주석 !)
      /*
      // 5-1. 리뷰 데이터 삭제
      await dataSource.getRepository('review').delete({ estimateOfferId });

      // 5-2. 견적 제안 데이터 삭제
      await dataSource
        .getRepository(EstimateOffer)
        .delete({ estimateRequestId });

      // 5-3. 견적 요청 데이터 삭제
      await dataSource
        .getRepository(EstimateRequest)
        .delete({ id: estimateRequestId });

      // 5-4. 기사 프로필 삭제
      await dataSource.query('DELETE FROM mover_profile WHERE "user_id" = $1', [
        moverId,
      ]);

      // 5-5. 고객 프로필 삭제
      await dataSource.query(
        'DELETE FROM customer_profile WHERE "user_id" = $1',
        [customerId],
      );

      // 5-6. 사용자 계정 삭제
      await dataSource.query('DELETE FROM "user" WHERE id IN ($1, $2)', [
        customerId,
        moverId,
      ]);
      */
    }

    await app.close();
  }, 10000); // Increase timeout for cleanup

  describe('1. 테스트 환경 설정', () => {
    it('테스트 계정 생성 및 프로필 설정', async () => {
      // 1-1. 고객 계정 생성
      customerEmail = generateTestEmail('customer');
      const customerSignupResponse = await request(app.getHttpServer())
        .post('/auth/register')
        .send({
          email: customerEmail,
          password: TEST_CONSTANTS.defaultPassword,
          name: generateRandomName(),
          phone: generateTestPhone(),
          role: Role.CUSTOMER,
          provider: 'LOCAL',
        })
        .expect(201);

      customerId = customerSignupResponse.body.id;

      // 1-2. 고객 로그인
      const customerLoginRes = await request(app.getHttpServer())
        .post('/auth/login')
        .send({
          email: customerEmail,
          password: TEST_CONSTANTS.defaultPassword,
          role: Role.CUSTOMER,
          provider: 'LOCAL',
        })
        .expect(201);

      customerToken = customerLoginRes.body.accessToken;

      // 1-3. 고객 프로필 생성
      await request(app.getHttpServer())
        .post('/customer')
        .set('Authorization', `Bearer ${customerToken}`)
        .send({
          serviceType: createRandomServiceType(),
          serviceRegion: createRandomServiceRegion(),
        })
        .expect(201);

      // 1-4. 첫 번째 기사 계정 생성
      moverEmail = generateTestEmail('mover');
      const moverName = generateRandomName('기사');
      const moverSignupResponse = await request(app.getHttpServer())
        .post('/auth/register')
        .send({
          email: moverEmail,
          password: TEST_CONSTANTS.defaultPassword,
          name: moverName,
          phone: generateTestPhone(1),
          role: Role.MOVER,
          provider: 'LOCAL',
        })
        .expect(201);

      moverId = moverSignupResponse.body.id;

      // 1-5. 첫 번째 기사 로그인
      const moverLoginResponse = await request(app.getHttpServer())
        .post('/auth/login')
        .send({
          email: moverEmail,
          password: TEST_CONSTANTS.defaultPassword,
          role: Role.MOVER,
          provider: 'LOCAL',
        })
        .expect(201);

      moverToken = moverLoginResponse.body.accessToken;

      // 1-6. 첫 번째 기사 프로필 생성
      await request(app.getHttpServer())
        .post('/mover')
        .set('Authorization', `Bearer ${moverToken}`)
        .send({
          nickname: moverName,
          experience: 5,
          intro: TEST_CONSTANTS.DEFAULT_VALUES.moverIntro,
          description: TEST_CONSTANTS.DEFAULT_VALUES.moverDescription,
          serviceType: createRandomServiceType(),
          serviceRegion: createRandomServiceRegion(),
        })
        .expect(201);

      // 1-7. 두 번째 기사 계정 생성
      const moverEmail2 = generateTestEmail('mover');
      const moverName2 = generateRandomName('기사');
      const moverSignupResponse2 = await request(app.getHttpServer())
        .post('/auth/register')
        .send({
          email: moverEmail2,
          password: TEST_CONSTANTS.defaultPassword,
          name: moverName2,
          phone: generateTestPhone(2),
          role: Role.MOVER,
          provider: 'LOCAL',
        })
        .expect(201);

      moverId2 = moverSignupResponse2.body.id;

      // 1-8. 두 번째 기사 로그인
      const moverLoginResponse2 = await request(app.getHttpServer())
        .post('/auth/login')
        .send({
          email: moverEmail2,
          password: TEST_CONSTANTS.defaultPassword,
          role: Role.MOVER,
          provider: 'LOCAL',
        })
        .expect(201);

      moverToken2 = moverLoginResponse2.body.accessToken;

      // 1-9. 두 번째 기사 프로필 생성
      await request(app.getHttpServer())
        .post('/mover')
        .set('Authorization', `Bearer ${moverToken2}`)
        .send({
          nickname: moverName2,
          experience: 3,
          intro: TEST_CONSTANTS.DEFAULT_VALUES.moverIntro,
          description: TEST_CONSTANTS.DEFAULT_VALUES.moverDescription,
          serviceType: createRandomServiceType(),
          serviceRegion: createRandomServiceRegion(),
        })
        .expect(201);

      // 1-10. 세 번째 기사 계정 생성
      const moverEmail3 = generateTestEmail('mover');
      const moverName3 = generateRandomName('기사');
      const moverSignupResponse3 = await request(app.getHttpServer())
        .post('/auth/register')
        .send({
          email: moverEmail3,
          password: TEST_CONSTANTS.defaultPassword,
          name: moverName3,
          phone: generateTestPhone(3),
          role: Role.MOVER,
          provider: 'LOCAL',
        })
        .expect(201);

      moverId3 = moverSignupResponse3.body.id;

      // 1-11. 세 번째 기사 로그인
      const moverLoginResponse3 = await request(app.getHttpServer())
        .post('/auth/login')
        .send({
          email: moverEmail3,
          password: TEST_CONSTANTS.defaultPassword,
          role: Role.MOVER,
          provider: 'LOCAL',
        })
        .expect(201);

      moverToken3 = moverLoginResponse3.body.accessToken;

      // 1-12. 세 번째 기사 프로필 생성
      await request(app.getHttpServer())
        .post('/mover')
        .set('Authorization', `Bearer ${moverToken3}`)
        .send({
          nickname: moverName3,
          experience: 7,
          intro: TEST_CONSTANTS.DEFAULT_VALUES.moverIntro,
          description: TEST_CONSTANTS.DEFAULT_VALUES.moverDescription,
          serviceType: createRandomServiceType(),
          serviceRegion: createRandomServiceRegion(),
        })
        .expect(201);
    }, 30000);
  });

  describe('2. 견적 요청 단계', () => {
    it('견적 요청 생성 및 기사 견적 제안', async () => {
      // 2-1. 과거 날짜로 견적 요청 생성
      const pastDate = new Date();
      pastDate.setDate(pastDate.getDate() - 2); // 2일 전 날짜

      const fromAddress = getRandomAddress();
      const toAddress = getRandomAddress();

      // 2-2. 지정 견적 요청 생성
      const targetMoverIds = [moverId]; // 첫 번째 기사를 지정 기사로 설정

      const createRequestResponse = await request(app.getHttpServer())
        .post('/estimate-request')
        .set('Authorization', `Bearer ${customerToken}`)
        .send({
          moveType: 'HOME',
          moveDate: pastDate.toISOString().split('T')[0],
          fromAddress: {
            sido: fromAddress.sido,
            sigungu: fromAddress.sigungu,
            detail: fromAddress.roadAddress,
          },
          toAddress: {
            sido: toAddress.sido,
            sigungu: toAddress.sigungu,
            detail: toAddress.roadAddress,
          },
          targetMoverIds,
        })
        .expect(201);

      estimateRequestId = createRequestResponse.body.id;

      // 2-3. 지정된 기사가 견적 제안
      const price1 = Math.floor(Math.random() * 100000) + 200000;
      const offerData1 = {
        price: price1,
        comment: `안녕하세요! ${price1.toLocaleString()}원에 빠르고 안전한 이사를 도와드리겠습니다. 포장자재 무료, 보험완비입니다.`,
      };

      const createOfferResponse = await request(app.getHttpServer())
        .post(`/estimate-offer/${estimateRequestId}`)
        .set('Authorization', `Bearer ${moverToken}`)
        .send(offerData1)
        .expect(201);

      estimateOfferId = createOfferResponse.body.id; // 이 견적을 나중에 확정할 예정

      // 2-4. 다른 기사들도 견적 제안
      const price2 = Math.floor(Math.random() * 100000) + 180000; // 더 낮은 가격
      const offerData2 = {
        price: price2,
        comment: `${price2.toLocaleString()}원에 신속하고 정확한 이사를 약속드립니다.`,
      };

      await request(app.getHttpServer())
        .post(`/estimate-offer/${estimateRequestId}`)
        .set('Authorization', `Bearer ${moverToken2}`)
        .send(offerData2)
        .expect(201);

      const price3 = Math.floor(Math.random() * 100000) + 220000; // 더 높은 가격
      const offerData3 = {
        price: price3,
        comment: `${price3.toLocaleString()}원에 프리미엄 이사 서비스를 제공해드립니다.`,
      };

      await request(app.getHttpServer())
        .post(`/estimate-offer/${estimateRequestId}`)
        .set('Authorization', `Bearer ${moverToken3}`)
        .send(offerData3)
        .expect(201);
    });
  });

  describe('3. 견적 확정 단계', () => {
    it('견적 확정 및 완료 처리', async () => {
      // 3-1. 고객 토큰 갱신
      const refreshCustomerLoginRes = await request(app.getHttpServer())
        .post('/auth/login')
        .send({
          email: customerEmail,
          password: TEST_CONSTANTS.defaultPassword,
          role: Role.CUSTOMER,
          provider: 'LOCAL',
        })
        .expect(201);

      customerToken = refreshCustomerLoginRes.body.accessToken;

      // 3-2. 견적 제안 확정
      const confirmResponse = await request(app.getHttpServer())
        .patch(`/estimate-offer/${estimateOfferId}/confirmed`)
        .set('Authorization', `Bearer ${customerToken}`)
        .expect(200);

      // 3-3. 견적 요청과 제안을 완료 상태로 변경
      await request(app.getHttpServer())
        .post('/review/dev/complete-estimate')
        .set('Authorization', `Bearer ${customerToken}`)
        .send({
          estimateRequestId,
          estimateOfferId,
        })
        .expect(201);

      // 3-4. 상태 변경 확인
      const checkStatusResponse = await request(app.getHttpServer())
        .get('/estimate-request/history')
        .set('Authorization', `Bearer ${customerToken}`)
        .query({ take: 1 })
        .expect(200);

      const targetRequest = checkStatusResponse.body.items.find(
        (req) => req.requestId === estimateRequestId,
      );

      expect(targetRequest?.requestStatus).toBe('COMPLETED');
    });
  });

  describe('4. 리뷰 작성 단계', () => {
    it('리뷰 작성 및 확인', async () => {
      // 4-1. 작성 가능한 리뷰 목록 조회
      const availableReviewsResponse = await request(app.getHttpServer())
        .get('/review/available')
        .query({ page: 1, take: 10 })
        .set('Authorization', `Bearer ${customerToken}`)
        .expect(200);

      console.log(
        'Available reviews response:',
        JSON.stringify(availableReviewsResponse.body, null, 2),
      );
      console.log('Looking for estimateOfferId:', estimateOfferId);

      // 4-2. 현재 견적이 작성 가능한 리뷰 목록에 있는지 확인
      const reviewableOffer =
        availableReviewsResponse.body.reviewableOffers.find(
          (offer: { reviewableOfferId: string }) =>
            offer.reviewableOfferId === estimateOfferId,
        );

      expect(reviewableOffer).toBeTruthy();

      // 4-3. 리뷰 작성
      const reviewData = {
        rating: 5,
        comment:
          '매우 만족스러운 이사였습니다. 기사님이 친절하고 꼼꼼하게 작업해주셨어요.',
      };

      const createReviewResponse = await request(app.getHttpServer())
        .post(`/review/${reviewableOffer.reviewableOfferId}`)
        .set('Authorization', `Bearer ${customerToken}`)
        .send(reviewData)
        .expect(201);

      expect(createReviewResponse.body).toHaveProperty('message');
      expect(createReviewResponse.body.message).toBe(
        '리뷰가 성공적으로 작성되었습니다.',
      );

      // 4-4. 작성된 리뷰 조회 및 검증
      const getReviewResponse = await request(app.getHttpServer())
        .get('/review/customer/me')
        .query({ page: 1, take: 10 })
        .set('Authorization', `Bearer ${customerToken}`)
        .expect(200);

      const latestReview = getReviewResponse.body.reviews[0];

      expect(latestReview).toBeTruthy();
      expect(latestReview.rating).toBe(5);
      expect(latestReview.comment).toBe(reviewData.comment);

      isReviewCreated = true;
    });
  });
});
