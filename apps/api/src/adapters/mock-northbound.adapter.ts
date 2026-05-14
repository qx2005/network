import { Injectable } from '@nestjs/common';
import type {
  Northbound5GcAdapter,
  NorthboundProvisionResult,
  ProvisionSlicePayload,
} from './northbound-5gc.adapter';
import {
  buildSliceSuccessReport,
  buildSliceValidationFailureReport,
  buildRollbackReport,
} from '../domain/provision-report.builder';
import { getSlicePayloadSemanticIssues } from '../domain/slice-semantics';

/**
 * Synthetic northbound adapter (no live NE calls).
 * 北向适配占位实现，不落真实网元。
 */
@Injectable()
export class MockNorthboundAdapter implements Northbound5GcAdapter {
  async provisionSlice(
    payload: ProvisionSlicePayload,
  ): Promise<NorthboundProvisionResult> {
    await this.delay(120);
    const issues = getSlicePayloadSemanticIssues(payload);
    if (issues.length > 0) {
      return {
        ok: false,
        detail: issues[0],
        report: buildSliceValidationFailureReport(payload, issues),
      };
    }
    return {
      ok: true,
      detail: '切片策略已被核心网侧接受',
      report: buildSliceSuccessReport(payload),
    };
  }

  async rollbackSlice(sliceId: string): Promise<NorthboundProvisionResult> {
    await this.delay(80);
    return {
      ok: true,
      detail: '切片回滚已被核心网侧接受',
      report: buildRollbackReport(sliceId),
    };
  }

  private delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}
