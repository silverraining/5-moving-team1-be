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
import { TEST_CONSTANTS } from './config/test.constants';
//회원가입 + 로그인 + 프로필 생성
describe('신규 계정 견적 흐름 (회원가입 → 프로필 생성 → 견적)', () => {
  let app: INestApplication;
  let customerToken: string;
  let moverTokens: string[] = [];
  let customerEmail: string;
  const NUM_MOVERS = 3;

  // 테스트용 동적 값 생성 함수
  const generateTestPhone = (index: number = 0) =>
    `${TEST_CONSTANTS.PHONE_PREFIX}${String(index).padStart(3, '0')}`;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  }, 30000);

  afterAll(async () => {
    await app.close();
  });

  it('고객 회원가입 및 프로필 생성', async () => {
    customerEmail = generateTestEmail('customer');

    await request(app.getHttpServer())
      .post('/auth/register')
      .send({
        email: customerEmail,
        password: TEST_CONSTANTS.defaultPassword,
        name: generateRandomName(),
        phone: generateTestPhone(),
        role: 'CUSTOMER',
        provider: 'LOCAL',
      })
      .expect(201);

    const loginRes = await request(app.getHttpServer())
      .post('/auth/login')
      .send({
        email: customerEmail,
        password: TEST_CONSTANTS.defaultPassword,
        role: 'CUSTOMER',
        provider: 'LOCAL',
      })
      .expect(201);

    customerToken = loginRes.body.accessToken;

    await request(app.getHttpServer())
      .post('/customer')
      .set('Authorization', `Bearer ${customerToken}`)
      .send({
        serviceType: createRandomServiceType(),
        serviceRegion: createRandomServiceRegion(),
      })
      .expect(201);
  });

  it('기사들 회원가입 및 프로필 생성', async () => {
    for (let i = 0; i < NUM_MOVERS; i++) {
      const email = generateTestEmail('mover');
      const moverName = generateRandomName('기사');

      await request(app.getHttpServer())
        .post('/auth/register')
        .send({
          email,
          password: TEST_CONSTANTS.defaultPassword,
          name: moverName,
          phone: generateTestPhone(i),
          role: 'MOVER',
          provider: 'LOCAL',
        })
        .expect(201);

      const loginRes = await request(app.getHttpServer())
        .post('/auth/login')
        .send({
          email,
          password: TEST_CONSTANTS.defaultPassword,
          role: 'MOVER',
          provider: 'LOCAL',
        })
        .expect(201);

      const token = loginRes.body.accessToken;
      moverTokens.push(token);

      await request(app.getHttpServer())
        .post('/mover')
        .set('Authorization', `Bearer ${token}`)
        .send({
          nickname: moverName,
          experience: 5 + i,
          intro: TEST_CONSTANTS.DEFAULT_VALUES.moverIntro,
          description: TEST_CONSTANTS.DEFAULT_VALUES.moverDescription,
          serviceType: createRandomServiceType(),
          serviceRegion: createRandomServiceRegion(),
        })
        .expect(201);
    }
  });
  describe('견적 요청 및 제안 테스트', () => {
    /**
     * 견적 요청을 생성하는 함수. 랜덤 주소를 사용하여 견적 요청을 생성합니다.
     * @returns {string | null} 견적 요청 ID 또는 실패 시 null 반환
     */
    const createEstimateRequest = async (): Promise<string | null> => {
      try {
        // 랜덤 주소 데이터 가져오기
        const fromAddress = getRandomAddress();
        const toAddress = getRandomAddress();

        const response = await request(app.getHttpServer())
          .post('/estimate-request')
          .set('Authorization', `Bearer ${customerToken}`)
          .send({
            moveType: 'HOME',
            moveDate: new Date(Date.now() + 24 * 60 * 60 * 1000)
              .toISOString()
              .split('T')[0],
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
          });

        console.log('견적 요청 생성 응답:', {
          status: response.status,
          body: response.body,
        });

        if (response.status === 201) {
          return response.body.id;
        }
        console.error('견적 요청 생성 실패:', response.body);
        return null;
      } catch (error) {
        console.error(
          '견적 요청 생성 중 에러 발생:',
          error.response?.body || error.message,
        );
        return null;
      }
    };
    let estimateRequestId: string;
    /**
     * 진행 중인 견적 요청이 없으면 새로운 견적 요청을 생성하고,
     * 있으면 해당 요청 ID를 사용합니다.
     */
    it('고객의 PENDING 상태 견적 요청을 확인하고 없으면 생성해야 한다', async () => {
      // 진행 중인 견적 요청 조회
      const activeResponse = await request(app.getHttpServer())
        .get('/estimate-request/active')
        .set('Authorization', `Bearer ${customerToken}`)
        .expect(200);

      const activeRequests = activeResponse.body;
      console.log(
        '활성 견적 요청 목록:',
        JSON.stringify(activeRequests, null, 2),
      );

      if (Array.isArray(activeRequests) && activeRequests.length > 0) {
        // 진행 중인 견적 요청이 있는 경우
        estimateRequestId = activeRequests[0].estimateRequestId;
        console.log(
          `이미 진행 중인 견적 요청이 있습니다. ID: ${estimateRequestId}`,
        );
      } else {
        // 진행 중인 견적 요청이 없으면 새로 생성
        estimateRequestId = await createEstimateRequest();
        if (!estimateRequestId) {
          throw new Error('견적 요청 생성 실패');
        }
      }

      expect(estimateRequestId).toBeDefined();
      console.log('현재 진행 중인 견적 요청 ID:', estimateRequestId);
    });

    /**
     * 각 기사들이 견적 제안을 생성하는 테스트입니다.
     */
    it('[MOVER] 견적 제안 생성 테스트', async () => {
      expect(estimateRequestId).toBeDefined();
      console.log(`견적 요청 ID: ${estimateRequestId}에 대한 제안 생성 시작`);

      // 견적 요청이 존재하는지 확인
      const checkRequestResponse = await request(app.getHttpServer())
        .get(`/estimate-request/active`)
        .set('Authorization', `Bearer ${customerToken}`)
        .expect(200);
      console.log('활성 견적 요청 목록:', checkRequestResponse.body);

      // 견적 요청이 있는지 확인
      const activeRequest = checkRequestResponse.body.find(
        (req) => req.estimateRequestId === estimateRequestId,
      );
      expect(activeRequest).toBeDefined();

      // 각 기사별로 순차적으로 로그인하고 견적 제안 생성
      const newOffers = [];
      for (const moverToken of moverTokens) {
        // 2. 기사 프로필 조회
        console.log('[기사] 프로필 조회');
        const moverProfileResponse = await request(app.getHttpServer())
          .get('/mover/me')
          .set('Authorization', `Bearer ${moverToken}`)
          .expect(200);

        const moverId = moverProfileResponse.body.id;
        console.log(`[기사] 프로필 ID: ${moverId}`);

        // 3. 견적 제안 생성
        try {
          // 랜덤 가격 생성 (20만원 ~ 30만원 사이)
          const price = Math.floor(Math.random() * 100000) + 200000;
          const offerData = {
            price,
            comment: `안녕하세요! ${price.toLocaleString()}원에 빠르고 안전한 이사를 도와드릴 기사입니다. 포장자재 무료, 보험완비, 전문팀 구성으로 진행합니다.`,
          };

          const createOfferResponse = await request(app.getHttpServer())
            .post(`/estimate-offer/${estimateRequestId}`)
            .set('Authorization', `Bearer ${moverToken}`)
            .send(offerData)
            .expect(201);
          console.log(
            `[기사] 견적 제안 생성 성공 (가격: ${price.toLocaleString()}원)`,
          );
          newOffers.push(createOfferResponse.body);

          // 4. 생성된 견적 제안 확인
          console.log('[기사] 견적 제안 조회 시도');
          const offersResponse = await request(app.getHttpServer())
            .get(`/estimate-offer/offers`)
            .set('Authorization', `Bearer ${moverToken}`)
            .expect(200);

          // 견적 제안이 실제로 생성되었는지 확인
          const hasOffer = offersResponse.body.some(
            (offer) => offer.estimateRequestId === estimateRequestId,
          );
          expect(hasOffer).toBe(true);
          console.log('[기사] 견적 제안 확인 완료');
        } catch (error) {
          console.error(
            '[기사] 견적 제안 생성 실패:',
            error.response?.body,
            '\n상세 에러:',
            error.response?.text,
          );
        }
      }

      // 견적 제안이 하나 이상 생성되었는지 확인
      expect(newOffers.length).toBeGreaterThan(0);
      console.log(`\n총 ${newOffers.length}개의 견적 제안이 생성되었습니다.`);

      // 5. 고객 입장에서 견적 제안 목록 조회
      console.log('\n[고객] 받은 견적 제안 목록 조회');
      const customerOffersResponse = await request(app.getHttpServer())
        .get(`/estimate-offer/${estimateRequestId}/pending`)
        .set('Authorization', `Bearer ${customerToken}`)
        .expect(200);

      console.log('고객이 받은 견적 제안 목록:', customerOffersResponse.body);
      expect(customerOffersResponse.body.items.length).toBe(newOffers.length);
    });
  });
});
