/**
 * Shared domain types for the configuration platform API.
 * 专网配置平台 API 共享领域类型（与 product-spec 对齐的简化模型）。
 */

export type ProvisionStatus = 'draft' | 'provisioned' | 'error';

export type ArpLevel = 'low' | 'medium' | 'high';

export type ConfigProvenance = 'demo-playbook';

export interface NetworkSlice {
  id: string;
  displayName: string;
  description?: string;
  sst: number;
  sd?: string | null;
  dnn: string;
  ladnAllowed: boolean;
  ulGbrMbps: number;
  dlGbrMbps: number;
  ulMbrMbps: number;
  dlMbrMbps: number;
  ambrMbps: number;
  fiveQi: number;
  arpLevel: ArpLevel;
  memberGroupIds: string[];
  status: ProvisionStatus;
  version: number;
  updatedAt: string;
  /** Set when created via console demo Agent (x-demo-playbook). */
  provenance?: ConfigProvenance;
}

export interface RedCapDevice {
  id: string;
  alias: string;
  supi: string;
  imeisv?: string;
  sliceId: string;
  vnId?: string;
  ipAddress?: string;
  rrcState: string;
  signalQuality: string;
  trafficMb: number;
  edrxState: string;
  powerProfileId?: string;
  lastSeenAt: string;
  provenance?: ConfigProvenance;
}

export interface PowerProfile {
  id: string;
  templateName: string;
  deviceTypeTag?: string;
  /**
   * When false, eDRX / PTW are not used (e.g. PSM + sparse RA / TAU only).
   * Omit or true: classic eDRX template.
   * false：不使用 eDRX（如纯 PSM + 周期上报/TAU）；省略或 true 表示启用 eDRX 模板。
   */
  edrxEnabled?: boolean;
  edrxCycleSeconds: number;
  ptwSeconds: number;
  drxMs: number;
  psmEnabled: boolean;
  heartbeatRecommendedSeconds: number;
}

export interface MecNode {
  id: string;
  nodeName: string;
  n6LocalEndpoint: string;
  dnnIds: string[];
  capabilityTags: string[];
  healthProbe?: string;
  provenance?: ConfigProvenance;
}

export type OffloadActionType = 'LOCAL_BREAKOUT' | 'NEXT_HOP' | 'MIRROR';

export interface MecOffloadRule {
  id: string;
  priority: number;
  name: string;
  enabled: boolean;
  match: {
    destIpCidrs: string[];
    srcIpCidrs: string[];
    protocol: 'TCP' | 'UDP' | 'ANY';
    portRanges: string[];
    terminalGroupId?: string;
    vnId?: string;
  };
  action: {
    actionType: OffloadActionType;
    nextHop?: string;
    bypassPublicNetwork: boolean;
    mirrorTarget?: string;
  };
  hitCount: number;
  provenance?: ConfigProvenance;
}

export type BroadcastPolicy = 'ALLOW' | 'LIMITED' | 'DENY';

export interface FiveGLanVn {
  id: string;
  displayName: string;
  technicalId: string;
  linkedSliceId: string;
  ethernetPduAllowed: boolean;
  broadcastPolicy: BroadcastPolicy;
  multicastPolicy: BroadcastPolicy;
  memberIds: string[];
  status: 'active' | 'provisioning' | 'error';
  provenance?: ConfigProvenance;
}

export type JobStatus = 'pending' | 'processing' | 'success' | 'failed';

/**
 * Northbound / NE acknowledgement step (synthetic until vendor I/O lands).
 * 北向与网元回执步骤（在对接真实 I/O 前为合成回执）。
 */
export type SimulatedNeStatus = 'APPLIED' | 'SKIPPED' | 'FAILED';

export interface SimulatedNeStep {
  ne: string;
  operation: string;
  status: SimulatedNeStatus;
  /** Step detail (Chinese for console; keep vendor I/O logs separate if needed). */
  detail: string;
}

export type ProvisionOverallStatus = 'SUCCESS' | 'FAILED';

/**
 * Structured provisioning outcome (audit-friendly).
 * 结构化下发结果，便于审计与前端展示。
 */
export interface ProvisionReport {
  correlationId: string;
  completedAt: string;
  overallStatus: ProvisionOverallStatus;
  /** One-line summary for UI and audit exports. */
  summary: string;
  configEcho?: Record<string, unknown>;
  steps: SimulatedNeStep[];
}

/** Alias: same payload as ProvisionReport (legacy name). */
export type TruthFeedback = ProvisionReport;

/** Payload passed to northbound for slice provisioning (5G-A–aligned fields). */
export interface ProvisionSlicePayload {
  sliceId: string;
  displayName?: string;
  dnn: string;
  sst: number;
  sd?: string | null;
  fiveQi: number;
  ulGbrMbps: number;
  dlGbrMbps: number;
  ulMbrMbps: number;
  dlMbrMbps: number;
  ambrMbps: number;
  memberGroupIds: string[];
}

export interface ProvisioningJob {
  id: string;
  type: string;
  resourceType: string;
  resourceId: string;
  status: JobStatus;
  message?: string;
  createdAt: string;
  finishedAt?: string;
  /** Present when job reaches terminal state (success / failed). */
  report?: ProvisionReport;
}

/** API wrapper for synchronous config commits with provisioning report. */
export interface CommitResult<T> {
  data: T;
  report: ProvisionReport;
}

export interface AuditLogEntry {
  id: string;
  actor: string;
  action: string;
  resourceType: string;
  resourceId: string;
  diff?: Record<string, unknown>;
  result: 'success' | 'failure';
  traceId: string;
  timestamp: string;
}

export type UserRole = 'viewer' | 'operator' | 'admin';
