import { Module } from '@nestjs/common';
import { MecController } from './mec.controller';
import { MecService } from './mec.service';

@Module({
  controllers: [MecController],
  providers: [MecService],
})
export class MecModule {}
