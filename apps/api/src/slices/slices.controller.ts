import {
  Body,
  Controller,
  Delete,
  Get,
  Headers,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { SlicesService } from './slices.service';
import { RbacGuard } from '../common/rbac.guard';
import { Roles } from '../common/roles.decorator';

@Controller('slices')
@UseGuards(RbacGuard)
export class SlicesController {
  constructor(private readonly slices: SlicesService) {}

  @Get()
  @Roles('viewer')
  list() {
    return this.slices.findAll();
  }

  @Get(':id')
  @Roles('viewer')
  get(@Param('id') id: string) {
    return this.slices.findOne(id);
  }

  @Get(':id/validate')
  @Roles('viewer')
  validate(@Param('id') id: string) {
    return this.slices.validate(id);
  }

  @Post()
  @Roles('operator', 'admin')
  create(
    @Body() body: Record<string, unknown>,
    @Headers('x-user-id') userId?: string,
  ) {
    return this.slices.create(body as never, userId ?? 'system');
  }

  @Patch(':id')
  @Roles('operator', 'admin')
  patch(
    @Param('id') id: string,
    @Body() body: Record<string, unknown>,
    @Headers('x-user-id') userId?: string,
  ) {
    return this.slices.update(id, body as never, userId ?? 'system');
  }

  /** Draft cleanup: allow any authenticated console role (viewer+); provisioned rows blocked in service. */
  @Delete(':id')
  @Roles('viewer', 'operator', 'admin')
  remove(@Param('id') id: string, @Headers('x-user-id') userId?: string) {
    this.slices.remove(id, userId ?? 'system');
    return { ok: true };
  }

  @Post(':id/provision')
  @Roles('operator', 'admin')
  provision(@Param('id') id: string, @Headers('x-user-id') userId?: string) {
    return this.slices.provision(id, userId ?? 'system');
  }

  @Post(':id/rollback')
  @Roles('operator', 'admin')
  rollback(@Param('id') id: string, @Headers('x-user-id') userId?: string) {
    return this.slices.rollback(id, userId ?? 'system');
  }
}
