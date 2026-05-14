import { Injectable, NotFoundException } from '@nestjs/common';
import { v4 as uuidv4 } from 'uuid';
import { AuditService } from '../audit/audit.service';
import type { CommitResult, FiveGLanVn } from '../domain/types';
import { buildFiveGLanVnCommitReport } from '../domain/provision-report.builder';

@Injectable()
export class FiveGlanService {
  private vns: FiveGLanVn[] = [
    {
      id: 'vn-line1',
      displayName: '灌装线 1 二层专网',
      technicalId: '5glan-vn-0001',
      linkedSliceId: 'slice-vision-embb',
      ethernetPduAllowed: true,
      broadcastPolicy: 'LIMITED',
      multicastPolicy: 'ALLOW',
      memberIds: ['dev-1', 'dev-2'],
      status: 'active',
    },
  ];

  constructor(private readonly audit: AuditService) {}

  list(): FiveGLanVn[] {
    return [...this.vns];
  }

  get(id: string): FiveGLanVn {
    const v = this.vns.find((x) => x.id === id);
    if (!v) throw new NotFoundException(`未找到虚拟网络：${id}`);
    return { ...v };
  }

  create(body: Partial<FiveGLanVn>, actor: string): CommitResult<FiveGLanVn> {
    const id = `vn-${uuidv4().slice(0, 8)}`;
    const row: FiveGLanVn = {
      id,
      displayName: body.displayName ?? '新虚拟网络',
      technicalId: body.technicalId ?? `5glan-vn-${uuidv4().slice(0, 4)}`,
      linkedSliceId: body.linkedSliceId ?? 'slice-vision-embb',
      ethernetPduAllowed: body.ethernetPduAllowed ?? true,
      broadcastPolicy: body.broadcastPolicy ?? 'LIMITED',
      multicastPolicy: body.multicastPolicy ?? 'ALLOW',
      memberIds: body.memberIds ?? [],
      status: 'active',
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
}
