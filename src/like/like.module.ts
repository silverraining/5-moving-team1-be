import { Module } from '@nestjs/common';
import { LikeService } from './like.service';
import { LikeController } from './like.controller';
import { CustomerProfile } from '@/customer-profile/entities/customer-profile.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Like } from './entities/like.entity';
import { MoverProfile } from '@/mover-profile/entities/mover-profile.entity';
import { MoverProfileModule } from '@/mover-profile/mover-profile.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Like, MoverProfile, CustomerProfile]),
    MoverProfileModule,
  ],
  controllers: [LikeController],
  providers: [LikeService],
})
export class LikeModule {}
