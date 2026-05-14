import { SetMetadata } from '@nestjs/common';
import type { RoleHeader } from './roles';
import { ROLES_KEY } from './rbac.guard';

export const Roles = (...roles: RoleHeader[]) => SetMetadata(ROLES_KEY, roles);
