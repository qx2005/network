import { Module } from '@nestjs/common';
import { SlicesController } from './slices.controller';
import { SlicesService } from './slices.service';
import { ProvisioningModule } from '../provisioning/provisioning.module';

@Module({
  imports: [ProvisioningModule],
  controllers: [SlicesController],
  providers: [SlicesService],
  exports: [SlicesService],
})
export class SlicesModule {}
