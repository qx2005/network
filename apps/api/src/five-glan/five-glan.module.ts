import { Module } from '@nestjs/common';
import { FiveGlanController } from './five-glan.controller';
import { FiveGlanService } from './five-glan.service';

@Module({
  controllers: [FiveGlanController],
  providers: [FiveGlanService],
})
export class FiveGlanModule {}
