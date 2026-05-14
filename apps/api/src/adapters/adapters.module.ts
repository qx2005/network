import { Global, Module } from '@nestjs/common';
import { MockNorthboundAdapter } from './mock-northbound.adapter';
import { NORTHBOUND_ADAPTER } from './northbound-5gc.adapter';

/**
 * Binds northbound integration token for feature modules.
 * 将北向适配器 token 绑定为可注入依赖，供各业务模块导入。
 */
@Global()
@Module({
  providers: [
    { provide: NORTHBOUND_ADAPTER, useClass: MockNorthboundAdapter },
  ],
  exports: [NORTHBOUND_ADAPTER],
})
export class AdaptersModule {}
