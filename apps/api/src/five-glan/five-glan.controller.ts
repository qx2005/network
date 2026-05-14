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
import { FiveGlanService } from './five-glan.service';
import { RbacGuard } from '../common/rbac.guard';
import { Roles } from '../common/roles.decorator';

@Controller('five-glan')
@UseGuards(RbacGuard)
export class FiveGlanController {
  constructor(private readonly vn: FiveGlanService) {}

  @Get('vn')
  @Roles('viewer')
  list() {
    return this.vn.list();
  }

  @Get('vn/:id')
  @Roles('viewer')
  get(@Param('id') id: string) {
    return this.vn.get(id);
  }

  @Post('vn')
  @Roles('operator', 'admin')
  create(
    @Body() body: Record<string, unknown>,
    @Headers('x-user-id') userId?: string,
  ) {
    return this.vn.create(body as never, userId ?? 'system');
  }

  @Patch('vn/:id')
  @Roles('operator', 'admin')
  patch(
    @Param('id') id: string,
    @Body() body: Record<string, unknown>,
    @Headers('x-user-id') userId?: string,
  ) {
    return this.vn.update(id, body as never, userId ?? 'system');
  }
}
