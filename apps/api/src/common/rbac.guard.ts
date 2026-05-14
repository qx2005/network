import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ROLE_HEADER, type RoleHeader } from './roles';

export const ROLES_KEY = 'roles';

/**
 * Minimal RBAC guard: reads `x-user-role` header, defaults to `operator` in dev.
 * 最小 RBAC：读取 x-user-role，开发环境默认 operator。
 */
@Injectable()
export class RbacGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const required =
      this.reflector.getAllAndOverride<RoleHeader[]>(ROLES_KEY, [
        context.getHandler(),
        context.getClass(),
      ]) ?? [];
    if (required.length === 0) return true;
    const req = context.switchToHttp().getRequest();
    const raw = (req.headers[ROLE_HEADER] as string | undefined)?.toLowerCase();
    const role: RoleHeader =
      raw === 'viewer' || raw === 'admin' ? raw : 'operator';
    const rank: Record<RoleHeader, number> = {
      viewer: 1,
      operator: 2,
      admin: 3,
    };
    const ok = required.some((r) => rank[role] >= rank[r]);
    if (!ok) {
      throw new ForbiddenException(
        `Insufficient role: need one of [${required.join(', ')}], got ${role}`,
      );
    }
    return true;
  }
}
