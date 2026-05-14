import {
  BadRequestException,
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
  private slices: NetworkSlice[] = [
    {
      id: 'slice-vision-embb',
      displayName: '机器视觉 eMBB 切片',
      description: '产线 AOI / 视觉检测的高带宽专网承载',
      sst: 1,
      sd: '010203',
      dnn: 'dnn-vision.private',
      ladnAllowed: true,
      ulGbrMbps: 50,
      dlGbrMbps: 200,
      ulMbrMbps: 100,
      dlMbrMbps: 500,
      ambrMbps: 800,
      fiveQi: 9,
      arpLevel: 'medium',
      memberGroupIds: ['grp-sensors-east'],
      status: 'provisioned',
      version: 2,
      updatedAt: nowIso(),
    },
    {
      id: 'slice-plc-urllc',
      displayName: '产线 PLC 协同 uRLLC',
      description: '灌装线 PLC 同步控制的超低时延承载',
      sst: 2,
      sd: '000001',
      dnn: 'dnn-plc.private',
      ladnAllowed: false,
      ulGbrMbps: 5,
      dlGbrMbps: 5,
      ulMbrMbps: 20,
      dlMbrMbps: 20,
      ambrMbps: 50,
      fiveQi: 82,
      arpLevel: 'high',
      memberGroupIds: ['grp-plc-line1'],
      status: 'draft',
      version: 1,
      updatedAt: nowIso(),
    },
  ];

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

  create(body: Partial<NetworkSlice>, actor: string): NetworkSlice {
    const id = `slice-${uuidv4().slice(0, 8)}`;
    const row: NetworkSlice = {
      id,
      displayName: body.displayName ?? '新切片',
      description: body.description,
      sst: body.sst ?? 1,
      sd: body.sd ?? null,
      dnn: body.dnn ?? 'dnn-default.private',
      ladnAllowed: body.ladnAllowed ?? false,
      ulGbrMbps: body.ulGbrMbps ?? 10,
      dlGbrMbps: body.dlGbrMbps ?? 50,
      ulMbrMbps: body.ulMbrMbps ?? 20,
      dlMbrMbps: body.dlMbrMbps ?? 100,
      ambrMbps: body.ambrMbps ?? 200,
      fiveQi: body.fiveQi ?? 9,
      arpLevel: body.arpLevel ?? 'medium',
      memberGroupIds: body.memberGroupIds ?? [],
      status: 'draft',
      version: 1,
      updatedAt: nowIso(),
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
      throw new BadRequestException(
        '已下发的切片须先回滚后再删除',
      );
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
