import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { v4 as uuidv4 } from 'uuid';
import { AuditService } from '../audit/audit.service';
import type { CommitResult, FiveGLanVn } from '../domain/types';
import { buildFiveGLanVnCommitReport } from '../domain/provision-report.builder';

@Injectable()
export class FiveGlanService {
  /** Demo seed: empty; VNs are created via console or Agent playbook. */
  /** 演示种子：默认无 VN，由控制台或 Agent 剧本创建。 */
  private vns: FiveGLanVn[] = [];

  constructor(private readonly audit: AuditService) {}

  list(): FiveGLanVn[] {
    return [...this.vns];
  }

  get(id: string): FiveGLanVn {
    const v = this.vns.find((x) => x.id === id);
    if (!v) throw new NotFoundException(`未找到虚拟网络：${id}`);
    return { ...v };
  }

  create(
    body: Partial<FiveGLanVn> & { id?: string },
    actor: string,
    demoPlaybook = false,
  ): CommitResult<FiveGLanVn> {
    const requestedId =
      demoPlaybook &&
      typeof body.id === 'string' &&
      body.id.trim().length > 0
        ? body.id.trim()
        : undefined;
    const id = requestedId ?? `vn-${uuidv4().slice(0, 8)}`;
    if (this.vns.some((v) => v.id === id)) {
      throw new ConflictException(`VN 组 ID 已存在：${id}`);
    }
    const linkedSliceId = body.linkedSliceId?.trim();
    if (!linkedSliceId) {
      throw new BadRequestException('须指定关联切片 ID');
    }
    const row: FiveGLanVn = {
      id,
      displayName: body.displayName ?? '新虚拟网络',
      technicalId: body.technicalId ?? `5glan-vn-${uuidv4().slice(0, 4)}`,
      linkedSliceId,
      ethernetPduAllowed: body.ethernetPduAllowed ?? true,
      broadcastPolicy: body.broadcastPolicy ?? 'LIMITED',
      multicastPolicy: body.multicastPolicy ?? 'ALLOW',
      memberIds: body.memberIds ?? [],
      status: 'active',
      provenance: demoPlaybook ? 'demo-playbook' : undefined,
    };
    this.vns.unshift(row);
    const report = buildFiveGLanVnCommitReport(row);
    this.audit.append({
      actor,
      action: 'fiveglan.vn.create',
      resourceType: 'FiveGLanVn',
      resourceId: id,
      result: 'success',
      traceId: uuidv4(),
      diff: { correlationId: report.correlationId },
    });
    return { data: row, report };
  }

  update(
    id: string,
    body: Partial<FiveGLanVn>,
    actor: string,
  ): CommitResult<FiveGLanVn> {
    const idx = this.vns.findIndex((x) => x.id === id);
    if (idx < 0) throw new NotFoundException(`未找到虚拟网络：${id}`);
    const prev = this.vns[idx];
    const next: FiveGLanVn = { ...prev, ...body, id: prev.id };
    this.vns[idx] = next;
    const report = buildFiveGLanVnCommitReport(next);
    this.audit.append({
      actor,
      action: 'fiveglan.vn.update',
      resourceType: 'FiveGLanVn',
      resourceId: id,
      diff: { before: prev, after: next, correlationId: report.correlationId },
      result: 'success',
      traceId: uuidv4(),
    });
    return { data: next, report };
  }

  removeVn(id: string, actor: string): void {
    const idx = this.vns.findIndex((x) => x.id === id);
    if (idx < 0) throw new NotFoundException(`未找到虚拟网络：${id}`);
    this.vns.splice(idx, 1);
    this.audit.append({
      actor,
      action: 'fiveglan.vn.delete',
      resourceType: 'FiveGLanVn',
      resourceId: id,
      result: 'success',
      traceId: uuidv4(),
    });
  }
}
