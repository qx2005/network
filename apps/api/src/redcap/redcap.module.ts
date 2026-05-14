import { Module } from '@nestjs/common';
import { RedcapController } from './redcap.controller';
import { RedcapService } from './redcap.service';

@Module({
  controllers: [RedcapController],
  providers: [RedcapService],
  exports: [RedcapService],
})
export class RedcapModule {}
