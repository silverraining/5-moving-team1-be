import { Module } from '@nestjs/common';
import { CustomerProfileService } from './customer-profile.service';
import { CustomerProfileController } from './customer-profile.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CommonModule } from '@/common/common.module';
import { CustomerProfile } from './entities/customer-profile.entity';
import { UserModule } from '@/user/user.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([CustomerProfile]),
    UserModule,
    CommonModule,
  ],
  controllers: [CustomerProfileController],
  providers: [CustomerProfileService],
  exports: [CustomerProfileService, TypeOrmModule],
})
export class CustomerProfileModule {}
