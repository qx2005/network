import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { v4 as uuidv4 } from 'uuid';
import { AuditService } from '../audit/audit.service';
import type { NetworkSlice, ProvisioningJob } from '../domain/types';
import { networkSliceToProvisionPayload } from '../domain/slice-semantics';
import { buildSliceValidationFailureReport } from '../domain/provision-report.builder';
import {
  NORTHBOUND_ADAPTER,
  type Northbound5GcAdapter,
} from '../adapters/northbound-5gc.adapter';

function nowIso(): string {
  return new Date().toISOString();
}

export interface SliceProvisionHooks {
  /** Apply provision outcome to domain store (implemented by SlicesService). */
  markSlice: (
    sliceId: string,
    status: 'provisioned' | 'error',
    detail?: string,
  ) => void;
}

/**
 * Provisioning queue (in-memory) + async slice push via northbound adapter.
 * 下发队列（内存）与北向编排调用。
 */
@Injectable()
export class ProvisioningService {
  private jobs: ProvisioningJob[] = [];

  constructor(
    private readonly audit: AuditService,
    @Inject(NORTHBOUND_ADAPTER) private readonly northbound: Northbound5GcAdapter,
  ) {}

  listJobs(limit = 50): ProvisioningJob[] {
    return this.jobs.slice(0, limit);
  }

  getJob(id: string): ProvisioningJob {
    const j = this.jobs.find((x) => x.id === id);
    if (!j) throw new NotFoundException(`未找到下发任务：${id}`);
    return { ...j };
  }

  /**
   * Run slice provisioning to completion and return the terminal job (same process).
   * Avoids clients polling GET /provisioning/jobs/:id (broken behind some proxies).
   * 在同请求内跑完下发并返回终态任务，避免前端轮询任务详情（部分代理下会 404）。
   */
  async runSliceProvisionToCompletion(
    slice: NetworkSlice,
    actor: string,
    hooks: SliceProvisionHooks,
  ): Promise<ProvisioningJob> {
    const job: ProvisioningJob = {
      id: uuidv4(),
      type: 'slice.provision',
      resourceType: 'NetworkSlice',
      resourceId: slice.id,
      status: 'pending',
      createdAt: nowIso(),
    };
    this.jobs.unshift(job);

    await this.runSliceProvisionJob(job, slice, actor, hooks);

    return this.getJob(job.id);
  }

  private async runSliceProvisionJob(
    job: ProvisioningJob,
    slice: NetworkSlice,
    actor: string,
    hooks: SliceProvisionHooks,
  ): Promise<void> {
    job.status = 'processing';
    const traceId = uuidv4();
    const payload = networkSliceToProvisionPayload(slice);
    try {
      const res = await this.northbound.provisionSlice(payload);
      job.report = res.report;
      if (res.ok) {
        hooks.markSlice(slice.id, 'provisioned', res.detail);
        job.status = 'success';
        job.message = res.detail;
      } else {
        hooks.markSlice(slice.id, 'error', res.detail);
        job.status = 'failed';
        job.message = res.detail;
      }
    } catch (e) {
      const msg = e instanceof Error ? e.message : '未知错误';
      hooks.markSlice(slice.id, 'error', msg);
      job.status = 'failed';
      job.message = msg;
      job.report = buildSliceValidationFailureReport(payload, [msg]);
    } finally {
      job.finishedAt = nowIso();
      this.audit.append({
        actor,
        action: 'provisioning.slice',
        resourceType: 'ProvisioningJob',
        resourceId: job.id,
        diff: {
          sliceId: slice.id,
          jobStatus: job.status,
          message: job.message,
          correlationId: job.report?.correlationId,
        },
        result: job.status === 'success' ? 'success' : 'failure',
        traceId,
      });
    }
  }
}
