import { Module } from '@nestjs/common';
import { CustomerProfileService } from './customer-profile.service';
import { CustomerProfileController } from './customer-profile.controller';

@Module({
  controllers: [CustomerProfileController],
  providers: [CustomerProfileService],
})
export class CustomerProfileModule {}
