import { Module } from '@nestjs/common';
import { AuditModule } from './audit/audit.module';
import { CoreModule } from './core/core.module';
import { AdaptersModule } from './adapters/adapters.module';
import { SlicesModule } from './slices/slices.module';
import { ProvisioningModule } from './provisioning/provisioning.module';
import { RedcapModule } from './redcap/redcap.module';
import { MecModule } from './mec/mec.module';
import { FiveGlanModule } from './five-glan/five-glan.module';
import { SystemModule } from './system/system.module';

@Module({
  imports: [
    AdaptersModule,
    CoreModule,
    AuditModule,
    ProvisioningModule,
    SlicesModule,
    RedcapModule,
    MecModule,
    FiveGlanModule,
    SystemModule,
  ],
})
export class AppModule {}
