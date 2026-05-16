import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  UseGuards,
  Headers,
} from '@nestjs/common';
import { MecService } from './mec.service';
import { RbacGuard } from '../common/rbac.guard';
import { Roles } from '../common/roles.decorator';

@Controller('mec')
@UseGuards(RbacGuard)
export class MecController {
  constructor(private readonly mec: MecService) {}

  @Get('nodes')
  @Roles('viewer')
  nodes() {
    return this.mec.listNodes();
  }

  @Post('nodes')
  @Roles('operator', 'admin')
  createNode(
    @Body() body: Record<string, unknown>,
    @Headers('x-user-id') userId?: string,
  ) {
    return this.mec.createNode(body as never, userId ?? 'system');
  }

  @Get('rules')
  @Roles('viewer')
  rules() {
    return this.mec.listRules();
  }

  @Post('rules')
  @Roles('operator', 'admin')
  createRule(
    @Body() body: Record<string, unknown>,
    @Headers('x-user-id') userId?: string,
  ) {
    return this.mec.createRule(body as never, userId ?? 'system');
  }

  @Patch('rules/:id')
  @Roles('operator', 'admin')
  patchRule(
    @Param('id') id: string,
    @Body() body: Record<string, unknown>,
    @Headers('x-user-id') userId?: string,
  ) {
    return this.mec.updateRule(id, body as never, userId ?? 'system');
  }

  @Delete('rules/:id')
  @Roles('admin')
  deleteRule(@Param('id') id: string, @Headers('x-user-id') userId?: string) {
    this.mec.removeRule(id, userId ?? 'system');
    return { ok: true };
  }
}
