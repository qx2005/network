import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  UseGuards,
  Headers,
} from '@nestjs/common';
import { RedcapService } from './redcap.service';
import { RbacGuard } from '../common/rbac.guard';
import { Roles } from '../common/roles.decorator';

@Controller('redcap')
@UseGuards(RbacGuard)
export class RedcapController {
  constructor(private readonly redcap: RedcapService) {}

  @Get('devices')
  @Roles('viewer')
  devices() {
    return this.redcap.listDevices();
  }

  @Get('devices/:id')
  @Roles('viewer')
  device(@Param('id') id: string) {
    return this.redcap.getDevice(id);
  }

  @Patch('devices/:id/profile')
  @Roles('operator', 'admin')
  applyProfile(
    @Param('id') id: string,
    @Body() body: { profileId: string },
    @Headers('x-user-id') userId?: string,
  ) {
    return this.redcap.applyProfile(id, body.profileId, userId ?? 'system');
  }

  @Get('power-profiles')
  @Roles('viewer')
  profiles() {
    return this.redcap.listProfiles();
  }

  @Post('power-profiles')
  @Roles('operator', 'admin')
  createProfile(
    @Body() body: Record<string, unknown>,
    @Headers('x-user-id') userId?: string,
  ) {
    return this.redcap.createProfile(body as never, userId ?? 'system');
  }
}
