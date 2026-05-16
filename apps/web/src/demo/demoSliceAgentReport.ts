/**
 * Provision-style receipt after Agent flow creates a slice draft.
 * Mirrors backend buildSliceSuccessReport shape for TruthFeedbackModal.
 * Agent 流程回执：与「切片下发」展示结构一致，供自动配置成功后反馈。
 */

import type { NetworkSlice, ProvisionReport, SimulatedNeStep } from '../domain/types'

function snssaiOf(sst: number, sd?: string | null): string {
  return sd ? `${sst}-${sd}` : `${sst}`
}

export function buildDemoAgentSliceProvisionReport(slice: NetworkSlice): ProvisionReport {
  const correlationId = crypto.randomUUID()
  const completedAt = new Date().toISOString()
  const ns = snssaiOf(slice.sst, slice.sd)
  const qosSummary = `5QI=${slice.fiveQi} GBR↑${slice.ulGbrMbps}/↓${slice.dlGbrMbps}Mbps MBR↑${slice.ulMbrMbps}/↓${slice.dlMbrMbps}Mbps AMBR=${slice.ambrMbps}Mbps`

  const steps: SimulatedNeStep[] = [
    {
      ne: 'NSSF',
      operation: '网络切片选择',
      status: 'APPLIED',
      detail: `S-NSSAI ${ns} 已与租户策略对齐并完成登记。`,
    },
    {
      ne: 'PCF',
      operation: '策略控制',
      status: 'APPLIED',
      detail: `会话策略已绑定 DNN「${slice.dnn}」，${qosSummary}。`,
    },
    {
      ne: 'SMF',
      operation: '会话管理',
      status: 'APPLIED',
      detail: `PDU 会话模板已刷新（实例 ${slice.id}）。`,
    },
    {
      ne: 'UPF',
      operation: '用户面',
      status: 'APPLIED',
      detail: 'N6 分流与 QoS 门控参数已预置。',
    },
    {
      ne: 'AMF',
      operation: '接入与移动性',
      status: 'APPLIED',
      detail: '允许 NSSAI 与注册配置文件已更新。',
    },
  ]

  return {
    correlationId,
    completedAt,
    overallStatus: 'SUCCESS',
    summary: `切片策略已确认：S-NSSAI ${ns}，DNN「${slice.dnn}」。参数由 Agent 依据《5G-A数据》对齐。`,
    configEcho: {
      sliceId: slice.id,
      displayName: slice.displayName,
      snssai: ns,
      dnn: slice.dnn,
      qosSummary,
    },
    steps,
  }
}
