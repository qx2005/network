/**
 * Northbound 5GC / OSS integration boundary.
 * Replace the bundled placeholder adapter with vendor-specific HTTP/gRPC clients.
 * 北向 5GC / OSS 集成边界：生产环境替换为厂商北向客户端。
 */

import type { ProvisionReport, ProvisionSlicePayload } from '../domain/types';

export const NORTHBOUND_ADAPTER = 'NORTHBOUND_ADAPTER';

export type { ProvisionSlicePayload };

export interface NorthboundProvisionResult {
  ok: boolean;
  detail?: string;
  report?: ProvisionReport;
}

export interface Northbound5GcAdapter {
  /** Push slice policy to core / OSS; returns acknowledgement report. */
  provisionSlice(
    payload: ProvisionSlicePayload,
  ): Promise<NorthboundProvisionResult>;

  /** Roll back slice version on core. */
  rollbackSlice(sliceId: string): Promise<NorthboundProvisionResult>;
}
