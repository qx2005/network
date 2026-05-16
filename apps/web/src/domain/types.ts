/** Frontend mirrors of API models (subset). 与后端模型对齐的前端类型子集。 */

export type ConfigProvenance = 'demo-playbook'

export type ProvisionStatus = 'draft' | 'provisioned' | 'error'

export type ArpLevel = 'low' | 'medium' | 'high'

export interface NetworkSlice {
  id: string
  displayName: string
  description?: string
  sst: number
  sd?: string | null
  dnn: string
  ladnAllowed: boolean
  ulGbrMbps: number
  dlGbrMbps: number
  ulMbrMbps: number
  dlMbrMbps: number
  ambrMbps: number
  fiveQi: number
  arpLevel: ArpLevel
  memberGroupIds: string[]
  status: ProvisionStatus
  version: number
  updatedAt: string
  provenance?: ConfigProvenance
}

export interface RedCapDevice {
  id: string
  alias: string
  supi: string
  imeisv?: string
  sliceId: string
  vnId?: string
  ipAddress?: string
  rrcState: string
  signalQuality: string
  trafficMb: number
  edrxState: string
  powerProfileId?: string
  lastSeenAt: string
  provenance?: ConfigProvenance
}

export interface PowerProfile {
  id: string
  templateName: string
  deviceTypeTag?: string
  edrxCycleSeconds: number
  ptwSeconds: number
  drxMs: number
  psmEnabled: boolean
  heartbeatRecommendedSeconds: number
}

export interface MecNode {
  id: string
  nodeName: string
  n6LocalEndpoint: string
  dnnIds: string[]
  capabilityTags: string[]
  healthProbe?: string
  provenance?: ConfigProvenance
}

export interface MecOffloadRule {
  id: string
  priority: number
  name: string
  enabled: boolean
  match: {
    destIpCidrs: string[]
    srcIpCidrs: string[]
    protocol: string
    portRanges: string[]
    terminalGroupId?: string
    vnId?: string
  }
  action: {
    actionType: string
    nextHop?: string
    bypassPublicNetwork: boolean
    mirrorTarget?: string
  }
  hitCount: number
  provenance?: ConfigProvenance
}

export interface FiveGLanVn {
  id: string
  displayName: string
  technicalId: string
  linkedSliceId: string
  ethernetPduAllowed: boolean
  broadcastPolicy: string
  multicastPolicy: string
  memberIds: string[]
  status: string
  provenance?: ConfigProvenance
}

export interface ProvisioningJob {
  id: string
  type: string
  resourceType: string
  resourceId: string
  status: string
  message?: string
  createdAt: string
  finishedAt?: string
  report?: ProvisionReport
}

export type SimulatedNeStatus = 'APPLIED' | 'SKIPPED' | 'FAILED'

export interface SimulatedNeStep {
  ne: string
  operation: string
  status: SimulatedNeStatus
  detail: string
}

export type ProvisionOverallStatus = 'SUCCESS' | 'FAILED'

export interface ProvisionReport {
  correlationId: string
  completedAt: string
  overallStatus: ProvisionOverallStatus
  summary: string
  configEcho?: Record<string, unknown>
  steps: SimulatedNeStep[]
}

export interface CommitResult<T> {
  data: T
  report: ProvisionReport
}

export interface AuditLogEntry {
  id: string
  actor: string
  action: string
  resourceType: string
  resourceId: string
  diff?: Record<string, unknown>
  result: string
  traceId: string
  timestamp: string
}
