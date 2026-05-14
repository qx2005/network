import { Controller, Get, UseGuards } from '@nestjs/common';
import { AuditService } from './audit.service';
import { RbacGuard } from '../common/rbac.guard';
import { Roles } from '../common/roles.decorator';

@Controller('audit')
@UseGuards(RbacGuard)
export class AuditController {
  constructor(private readonly audit: AuditService) {}

  @Get('logs')
  @Roles('viewer')
  logs() {
    return this.audit.list(200);
  }
}
