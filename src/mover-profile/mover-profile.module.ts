import { Module } from '@nestjs/common';
import { MoverProfileService } from './mover-profile.service';
import { MoverProfileController } from './mover-profile.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MoverProfile } from './entities/mover-profile.entity';

@Module({
  imports: [TypeOrmModule.forFeature([MoverProfile])],
  controllers: [MoverProfileController],
  providers: [MoverProfileService],
})
export class MoverProfileModule {}
