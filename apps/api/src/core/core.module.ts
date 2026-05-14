import { Global, Module } from '@nestjs/common';
import { RbacGuard } from '../common/rbac.guard';

@Global()
@Module({
  providers: [RbacGuard],
  exports: [RbacGuard],
})
export class CoreModule {}
