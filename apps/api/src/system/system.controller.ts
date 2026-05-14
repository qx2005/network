import { Controller, Get, UseGuards } from '@nestjs/common';
import { RbacGuard } from '../common/rbac.guard';
import { Roles } from '../common/roles.decorator';

/**
 * System metadata: RBAC matrix stub for UI help.
 * 系统元数据：RBAC 矩阵占位，供前端展示权限说明。
 */
@Controller('system')
@UseGuards(RbacGuard)
export class SystemController {
  @Get('rbac-matrix')
  @Roles('viewer')
  rbacMatrix() {
    return {
      roles: ['viewer', 'operator', 'admin'],
      matrix: [
        {
          resource: 'NetworkSlice',
          viewer: ['read', 'delete_draft'],
          operator: ['read', 'create', 'update', 'provision', 'delete_draft'],
          admin: ['read', 'create', 'update', 'provision', 'delete_draft'],
        },
        {
          resource: 'RedCapDevice',
          viewer: ['read'],
          operator: ['read', 'apply_power_profile'],
          admin: ['read', 'apply_power_profile', 'force_detach'],
        },
        {
          resource: 'MecOffloadRule',
          viewer: ['read'],
          operator: ['read', 'create', 'update'],
          admin: ['read', 'create', 'update', 'delete'],
        },
        {
          resource: 'FiveGLanVn',
          viewer: ['read'],
          operator: ['read', 'create', 'update'],
          admin: ['read', 'create', 'update', 'delete'],
        },
        {
          resource: 'AuditLog',
          viewer: ['read_own_scope'],
          operator: ['read'],
          admin: ['read', 'export'],
        },
      ],
      headers: {
        role: 'x-user-role',
        userId: 'x-user-id',
      },
    };
  }
}
