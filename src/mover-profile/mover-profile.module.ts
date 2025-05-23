import { Module } from '@nestjs/common';
import { MoverProfileService } from './mover-profile.service';
import { MoverProfileController } from './mover-profile.controller';

@Module({
  controllers: [MoverProfileController],
  providers: [MoverProfileService],
})
export class MoverProfileModule {}
