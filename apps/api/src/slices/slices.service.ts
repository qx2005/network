import {
  BadRequestException,
  ConflictException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { v4 as uuidv4 } from 'uuid';
import { AuditService } from '../audit/audit.service';
import type { NetworkSlice, ProvisioningJob } from '../domain/types';
import { getSlicePayloadSemanticIssues } from '../domain/slice-semantics';
import {
  NORTHBOUND_ADAPTER,
  type Northbound5GcAdapter,
} from '../adapters/northbound-5gc.adapter';
import { ProvisioningService } from '../provisioning/provisioning.service';

function nowIso(): string {
  return new Date().toISOString();
}

function buildSnssai(sst: number, sd?: string | null): string {
  return sd ? `${sst}-${sd}` : `${sst}`;
}

@Injectable()
export class SlicesService {
  /**
   * Demo seed: empty; slices are created via console or Agent playbook.
   * 演示种子：默认无切片，由控制台或 Agent 剧本创建。
   */
  private slices: NetworkSlice[] = [];

  constructor(
    private readonly audit: AuditService,
    private readonly provisioning: ProvisioningService,
    @Inject(NORTHBOUND_ADAPTER) private readonly northbound: Northbound5GcAdapter,
  ) {}

  findAll(): NetworkSlice[] {
    return [...this.slices];
  }

  findOne(id: string): NetworkSlice {
    const s = this.slices.find((x) => x.id === id);
    if (!s) throw new NotFoundException(`未找到切片：${id}`);
    return { ...s };
  }

  create(
    body: Partial<NetworkSlice> & { id?: string },
    actor: string,
    demoPlaybook = false,
  ): NetworkSlice {
    const requestedId =
      demoPlaybook &&
      typeof body.id === 'string' &&
      body.id.trim().length > 0
        ? body.id.trim()
        : undefined;
    const id = requestedId ?? `slice-${uuidv4().slice(0, 8)}`;
    if (this.slices.some((s) => s.id === id)) {
      throw new ConflictException(`切片 ID 已存在：${id}`);
    }
    const row: NetworkSlice = {
      id,
      displayName: body.displayName ?? '新切片',
      description: body.description,
      sst: body.sst ?? 1,
      sd: body.sd ?? null,
      dnn: body.dnn ?? 'dnn-default.private',
      ladnAllowed: body.ladnAllowed ?? false,
      /** Industrial vision-friendly default: big uplink GBR. */
      /** 工业视觉友好缺省：上行 GBR 大于下行。 */
      ulGbrMbps: body.ulGbrMbps ?? 100,
      dlGbrMbps: body.dlGbrMbps ?? 20,
      ulMbrMbps: body.ulMbrMbps ?? 150,
      dlMbrMbps: body.dlMbrMbps ?? 50,
      ambrMbps: body.ambrMbps ?? 500,
      fiveQi: body.fiveQi ?? 9,
      arpLevel: body.arpLevel ?? 'medium',
      memberGroupIds: body.memberGroupIds ?? [],
      status: demoPlaybook ? 'provisioned' : 'draft',
      version: demoPlaybook ? 2 : 1,
      updatedAt: nowIso(),
      provenance: demoPlaybook ? 'demo-playbook' : undefined,
    };
    this.slices.unshift(row);
    this.audit.append({
      actor,
      action: 'slice.create',
      resourceType: 'NetworkSlice',
      resourceId: id,
      diff: { displayName: row.displayName, snssai: buildSnssai(row.sst, row.sd) },
      result: 'success',
      traceId: uuidv4(),
    });
    return row;
  }

  update(id: string, body: Partial<NetworkSlice>, actor: string): NetworkSlice {
    const idx = this.slices.findIndex((x) => x.id === id);
    if (idx < 0) throw new NotFoundException(`未找到切片：${id}`);
    const prev = { ...this.slices[idx] };
    const next: NetworkSlice = {
      ...prev,
      ...body,
      id: prev.id,
      version: prev.version + 1,
      updatedAt: nowIso(),
    };
    const issues = getSlicePayloadSemanticIssues(next);
    if (issues.length > 0) {
      throw new BadRequestException(issues.join('; '));
    }
    this.slices[idx] = next;
    this.audit.append({
      actor,
      action: 'slice.update',
      resourceType: 'NetworkSlice',
      resourceId: id,
      diff: { before: prev, after: next },
      result: 'success',
      traceId: uuidv4(),
    });
    return next;
  }

  remove(id: string, actor: string): void {
    const idx = this.slices.findIndex((x) => x.id === id);
    if (idx < 0) throw new NotFoundException(`未找到切片：${id}`);
    const row = this.slices[idx];
    if (row.status === 'provisioned') {
      throw new BadRequestException('已下发的切片须先回滚后再删除');
    }
    this.slices.splice(idx, 1);
    this.audit.append({
      actor,
      action: 'slice.delete',
      resourceType: 'NetworkSlice',
      resourceId: id,
      result: 'success',
      traceId: uuidv4(),
    });
  }

  async provision(id: string, actor: string): Promise<ProvisioningJob> {
    const check = this.validate(id);
    if (!check.ok) {
      throw new BadRequestException({
        message: '切片未通过校验，未进入下发队列',
        issues: check.issues,
      });
    }
    const slice = this.findOne(id);
    return this.provisioning.runSliceProvisionToCompletion(slice, actor, {
      markSlice: (sliceId, status, _detail) => {
        const i = this.slices.findIndex((s) => s.id === sliceId);
        if (i < 0) return;
        this.slices[i] = {
          ...this.slices[i],
          status,
          version: this.slices[i].version + 1,
          updatedAt: nowIso(),
        };
      },
    });
  }

  async rollback(id: string, actor: string) {
    const slice = this.findOne(id);
    const res = await this.northbound.rollbackSlice(slice.id);
    const idx = this.slices.findIndex((x) => x.id === id);
    if (idx >= 0) {
      this.slices[idx] = {
        ...this.slices[idx],
        status: res.ok ? 'draft' : 'error',
        version: this.slices[idx].version + 1,
        updatedAt: nowIso(),
      };
    }
    this.audit.append({
      actor,
      action: 'slice.rollback',
      resourceType: 'NetworkSlice',
      resourceId: id,
      diff: {
        northbound: res,
        correlationId: res.report?.correlationId,
      },
      result: res.ok ? 'success' : 'failure',
      traceId: uuidv4(),
    });
    return res;
  }

  validate(id: string): { ok: boolean; issues: string[] } {
    const s = this.findOne(id);
    const issues: string[] = [...getSlicePayloadSemanticIssues(s)];
    const dup = this.slices.some(
      (x) =>
        x.id !== s.id &&
        x.sst === s.sst &&
        (x.sd ?? '') === (s.sd ?? '') &&
        x.dnn === s.dnn,
    );
    if (dup) issues.push('租户内已存在相同的 S-NSSAI 与 DNN 组合');
    return { ok: issues.length === 0, issues };
  }
}
