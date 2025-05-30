import { Module } from '@nestjs/common';
import { MoverProfileService } from './mover-profile.service';
import { MoverProfileController } from './mover-profile.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MoverProfile } from './entities/mover-profile.entity';
import { MoverProfileView } from './view/mover-profile.view';
import { CommonModule } from 'src/common/common.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([MoverProfile, MoverProfileView]),
    CommonModule,
  ],
  controllers: [MoverProfileController],
  providers: [MoverProfileService],
})
export class MoverProfileModule {}
