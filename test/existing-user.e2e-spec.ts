import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '@/app.module';
import { getRandomAddress } from './utils/test-helpers';
import { DataSource } from 'typeorm';
import { TEST_CONFIG } from './config/test.config';

describe('Estimate Offer Flow (e2e)', () => {
  let app: INestApplication;
  let customerToken: string;
  let moverTokens: string[] = [];
  let estimateRequestId: string;
  let dataSource: DataSource;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();

    // 고객 로그인
    try {
      const loginRes = await request(app.getHttpServer())
        .post('/auth/login')
        .send({
          email: TEST_CONFIG.customer.email,
          password: TEST_CONFIG.customer.password,
          role: 'CUSTOMER',
          provider: 'LOCAL',
        })
        .expect(201);

      console.log('고객 로그인 성공:', loginRes.body);
      customerToken = loginRes.body.accessToken;
    } catch (error) {
      console.error('고객 로그인 실패:', {
        email: TEST_CONFIG.customer.email,
        errorMessage: error.response?.body?.message || error.message,
        statusCode: error.response?.status,
        error: error.response?.body,
      });
      throw error;
    }

    // 기사 로그인
    for (const mover of TEST_CONFIG.movers) {
      try {
        const moverLoginResponse = await request(app.getHttpServer())
          .post('/auth/login')
          .send({
            email: mover.email,
            password: TEST_CONFIG.defaultPassword,
            role: 'MOVER',
            provider: 'LOCAL',
          });

        console.log(
          `기사 로그인 성공 (${mover.email}):`,
          moverLoginResponse.body,
        );
        moverTokens.push(moverLoginResponse.body.accessToken);
      } catch (error) {
        console.error(`기사 로그인 실패 (${mover.email}):`, {
          errorMessage: error.response?.body?.message || error.message,
          statusCode: error.response?.status,
          error: error.response?.body,
        });
        throw error;
      }
    }

    // PENDING 상태 견적 요청을 확인하거나 없으면 생성
    const activeResponse = await request(app.getHttpServer())
      .get('/estimate-request/active')
      .set('Authorization', `Bearer ${customerToken}`)
      .expect(200);

    const activeRequests = activeResponse.body;
    console.log(
      '활성 견적 요청 목록:',
      JSON.stringify(activeRequests, null, 2),
    );

    // 활성 견적 요청이 있으면 해당 요청 ID 사용
    if (activeRequests.length > 0) {
      estimateRequestId = activeRequests[0].requestId;
      console.log(
        '기존 PENDING 상태의 견적 요청을 사용합니다:',
        estimateRequestId,
      );
    } else {
      // 견적 요청이 없으면 새로운 견적 요청을 생성
      console.log(
        'PENDING 상태 견적 요청이 없으므로 새로운 요청을 생성합니다.',
      );

      const fromAddress = getRandomAddress();
      const toAddress = getRandomAddress();

      const createRequestResponse = await request(app.getHttpServer())
        .post('/estimate-request')
        .set('Authorization', `Bearer ${customerToken}`)
        .send({
          moveType: 'HOME',
          moveDate: new Date(Date.now() + 24 * 60 * 60 * 1000)
            .toISOString()
            .split('T')[0],
          fromAddress: {
            sido: fromAddress.sido,
            sidoEnglish: fromAddress.sidoEnglish,
            sigungu: fromAddress.sigungu,
            roadAddress: fromAddress.roadAddress,
            fullAddress: fromAddress.fullAddress,
          },
          toAddress: {
            sido: toAddress.sido,
            sidoEnglish: toAddress.sidoEnglish,
            sigungu: toAddress.sigungu,
            roadAddress: toAddress.roadAddress,
            fullAddress: toAddress.fullAddress,
          },
        });

      console.log('새로운 견적 요청 생성 응답:', {
        status: createRequestResponse.status,
        body: createRequestResponse.body,
      });

      if (createRequestResponse.status === 201) {
        estimateRequestId = createRequestResponse.body.id;
      } else {
        throw new Error('새로운 견적 요청 생성에 실패했습니다.');
      }
    }

    expect(estimateRequestId).toBeDefined();
    console.log('현재 진행 중인 견적 요청 ID:', estimateRequestId);
  }, 30000);
  /**
   * 테스트 후 애플리케이션을 종료합니다.
   */
  afterAll(async () => {
    await app.close();
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
      (req) => req.requestId === estimateRequestId,
    );
    expect(activeRequest).toBeDefined();

    // 각 기사별로 순차적으로 견적 제안 생성
    const newOffers = [];
    for (const mover of TEST_CONFIG.movers) {
      console.log(`\n[기사 ${mover.email}] 견적 제안 생성 시도`);

      // 1. 기사 로그인
      const moverLoginResponse = await request(app.getHttpServer())
        .post('/auth/login')
        .send({
          email: mover.email,
          password: TEST_CONFIG.defaultPassword,
          role: 'MOVER',
          provider: 'LOCAL',
        });
      const moverToken = moverLoginResponse.body.accessToken;
      console.log(`[기사 ${mover.email}] 로그인 성공`);

      // 2. 기사 프로필 조회
      console.log(`[기사 ${mover.email}] 프로필 조회`);
      const moverProfileResponse = await request(app.getHttpServer())
        .get('/mover/me')
        .set('Authorization', `Bearer ${moverToken}`)
        .expect(200);

      const moverId = moverProfileResponse.body.id;
      console.log(`[기사 ${mover.email}] 프로필 ID: ${moverId}`);

      try {
        // 3. 견적 제안 생성
        // 랜덤 가격 생성 (20만원 ~ 30만원 사이)
        const price = Math.floor(Math.random() * 100000) + 200000;
        const offerData = {
          price,
          comment: `안녕하세요! ${price.toLocaleString()}원에 빠르고 안전한 이사를 도와드릴 기사입니다. 포장자재 무료, 보험완비, 전문팀 구성으로 진행합니다.`,
        };

        console.log(`[기사] 견적 제안 생성 시도:`, {
          estimateRequestId,
          offerData,
        });

        const createOfferResponse = await request(app.getHttpServer())
          .post(`/estimate-offer/${estimateRequestId}`)
          .set('Authorization', `Bearer ${moverToken}`)
          .send(offerData);

        console.log(`[기사] 견적 제안 응답:`, {
          status: createOfferResponse.status,
          body: createOfferResponse.body,
        });

        if (createOfferResponse.status === 201) {
          newOffers.push(createOfferResponse.body);
        } else {
          console.log(
            `[기사 ${mover.email}] 견적 제안 생성 실패:`,
            createOfferResponse.body,
          );
        }

        // 4. 생성된 견적 제안 확인
        console.log(`[기사 ${mover.email}] 견적 제안 조회 시도`);
        const offersResponse = await request(app.getHttpServer())
          .get(`/estimate-offer/offers`)
          .set('Authorization', `Bearer ${moverToken}`)
          .expect(200);

        // 견적 제안이 실제로 생성되었는지 확인
        const hasOffer = offersResponse.body.some(
          (offer) => offer.estimateRequestId === estimateRequestId,
        );
        expect(hasOffer).toBe(true);
        console.log(`[기사 ${mover.email}] 견적 제안 확인 완료`);
      } catch (error) {
        console.error(
          `[기사 ${mover.email}] 견적 제안 생성 실패:`,
          error.message,
          '\n상세 에러:',
          error.response?.text || error.response?.body || error,
        );
        // 에러가 발생해도 다음 기사의 견적 제안 생성을 계속 진행
        continue;
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
    expect(customerOffersResponse.body.items.length).toBeGreaterThan(0);
  });

  // /**
  //  * 고객이 가장 저렴한 견적을 선택하여 확정하는 테스트입니다.
  //  */
  // it('[CUSTOMER] 견적 제안 확정 테스트', async () => {
  //   // 견적 요청의 모든 제안 조회
  //   const offersResponse = await request(app.getHttpServer())
  //     .get(`/estimate-offer/${estimateRequestId}/pending`)
  //     .set('Authorization', `Bearer ${customerToken}`);
  //   console.log(offersResponse);
  //   const offers = offersResponse.body.items;
  //   console.log('모든 견적 제안 목록:', offers);
  //   console.log(`조회된 견적 제안 수: ${offers.length}`);
  //   if (offers.length === 0) {
  //     console.log('No offers found.');
  //     return; // Or handle the error as necessary
  //   }
  //   console.log('mover object for first offer:', offers[0]?.mover);

  //   console.log(
  //     '모든 견적 제안 목록:',
  //     offers.map((offer) => ({
  //       id: offer.id,
  //       price: offer.price,
  //       mover: offer.mover ? offer.mover.nickname : 'No mover',
  //     })),
  //   );

  //   if (offers.length === 0) {
  //     console.log('견적 제안이 없어 확정 테스트를 진행할 수 없습니다.');
  //     return;
  //   }

  //   // 가장 저렴한 견적 제안 선택
  //   const cheapestOffer = offers.reduce((min, offer) => {
  //     console.log(
  //       `비교: 현재 최소 가격 ${min.price} vs 새 가격 ${offer.price}`,
  //     );
  //     return +offer.price < +min.price ? offer : min;
  //   }, offers[0]);

  //   console.log('선택된 견적 제안:', {
  //     id: cheapestOffer.id,
  //     price: cheapestOffer.price,
  //     mover: cheapestOffer.mover.nickname,
  //   });

  //   console.log(
  //     `가장 저렴한 견적 제안을 선택합니다. (가격: ${cheapestOffer.price.toLocaleString()}원, 기사: ${cheapestOffer.mover.nickname})`,
  //   );

  //   try {
  //     // 선택한 견적 제안 확정
  //     await request(app.getHttpServer())
  //       .patch(`/estimate-offer/${cheapestOffer.offerId}/confirmed`)
  //       .set('Authorization', `Bearer ${customerToken}`)
  //       .expect(200);

  //     console.log('견적 제안이 성공적으로 확정되었습니다.');
  //   } catch (error) {
  //     console.error(
  //       '견적 제안 확정 중 에러 발생:',
  //       error.response?.body || error.message,
  //     );
  //     console.error('에러 응답 전체:', {
  //       status: error?.status,
  //       body: error.response?.body,
  //       headers: error.response?.headers,
  //     });
  //     throw error;
  //   }
  // });
});
