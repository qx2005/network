import { Controller, Get, Param, UseGuards } from '@nestjs/common';
import { ProvisioningService } from './provisioning.service';
import { RbacGuard } from '../common/rbac.guard';
import { Roles } from '../common/roles.decorator';

@Controller('provisioning')
@UseGuards(RbacGuard)
export class ProvisioningController {
  constructor(private readonly provisioning: ProvisioningService) {}

  @Get('jobs')
  @Roles('viewer')
  listJobs() {
    return this.provisioning.listJobs();
  }

  @Get('jobs/:id')
  @Roles('viewer')
  getJob(@Param('id') id: string) {
    return this.provisioning.getJob(id);
  }
}
