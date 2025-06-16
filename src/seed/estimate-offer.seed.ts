import { DataSource } from 'typeorm';
import {
  EstimateOffer,
  OfferStatus,
} from 'src/estimate-offer/entities/estimate-offer.entity';
import { EstimateRequest } from 'src/estimate-request/entities/estimate-request.entity';
import { MoverProfile } from 'src/mover-profile/entities/mover-profile.entity';

const MOVERS = [
  { id: 'e5169339-00fb-4da3-a6b3-2fb218f2ee17', price: 150000 },
  { id: 'b17632c0-1c4c-4bd5-b739-887d2e6d2894', price: 160000 },
  { id: '9e2bf623-15ce-4648-9378-26cb73239625', price: 145000 },
  { id: '89127260-7cc3-4706-b457-adb90a45cddf', price: 155000 },
  { id: '690f46ff-1c28-431d-8767-4fdc400b3cc9', price: 170000 },
];

export const seedEstimateOffers = async (dataSource: DataSource) => {
  const estimateRequestRepo = dataSource.getRepository(EstimateRequest);
  const moverRepo = dataSource.getRepository(MoverProfile);
  const offerRepo = dataSource.getRepository(EstimateOffer);

  const request = await estimateRequestRepo.findOneByOrFail({
    id: '76ae6e9e-ea6f-4434-82c6-99a76c96db73', // 예시로 사용할 견적 요청 ID
  });

  const now = new Date();
  let successCount = 0;

  for (const { id: moverId, price } of MOVERS) {
    try {
      const mover = await moverRepo.findOneOrFail({ where: { id: moverId } });

      const offer = offerRepo.create({
        estimateRequestId: request.id,
        moverId: mover.id,
        estimateRequest: request,
        mover: mover,
        price: price,
        comment: `${mover.nickname}의 견적 제안입니다.`,
        status: OfferStatus.PENDING,
        isTargeted: false,
        isConfirmed: false,
        confirmedAt: new Date(),
      });

      await offerRepo.save(offer);
      console.log(`✅ 견적 제안 생성됨: ${mover.nickname} → ${request.id}`);
      successCount++;
    } catch (err) {
      console.error(`❌ ${moverId} 처리 중 오류:`, err.message);
    }
  }

  console.log(`🎉 총 ${successCount}건의 estimate-offer 생성 완료`);
};
