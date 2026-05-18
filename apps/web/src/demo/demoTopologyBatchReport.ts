/**
 * Provision receipt for topology batch Agent (TruthFeedbackModal).
 * 拓扑批量 Agent 配置回执：与切片下发回执同构，供专网概览展示。
 */

import type { ProvisionReport, SimulatedNeStep } from '../domain/types'
import type { TopologyBatchProvisionResult } from './topologyBatchPlaybook'

export function buildTopologyBatchProvisionReport(
  moduleLabels: string[],
  result: TopologyBatchProvisionResult,
): ProvisionReport {
  const correlationId = crypto.randomUUID()
  const completedAt = new Date().toISOString()
  const ok = result.failed.length === 0
  const selectedCount = moduleLabels.length

  const failDetail =
    result.failed.length > 0
      ? result.failed.map((f) => `${f.label}：${f.error}`).join('；')
      : ''

  const steps: SimulatedNeStep[] = [
    {
      ne: '编排器',
      operation: '拓扑批量 Playbook',
      status: ok ? 'APPLIED' : 'FAILED',
      detail: ok
        ? `已编排 ${selectedCount} 个产线模块（新配置 ${result.configured}，已就绪跳过 ${result.skipped}）。`
        : `部分模块未通过：${failDetail}`,
    },
    {
      ne: 'NSSF',
      operation: '网络切片选择',
      status: ok ? 'APPLIED' : 'SKIPPED',
      detail: ok
        ? `各模块 S-NSSAI / DNN 已与《5G-A数据》切片段落对齐并完成登记。`
        : '因前置编排失败，切片登记步骤未执行。',
    },
    {
      ne: 'AMF',
      operation: 'RedCap 接入',
      status: ok ? 'APPLIED' : 'SKIPPED',
      detail: ok
        ? `终端 SUPI / 切片绑定已写入（${selectedCount} 条 Playbook 终端）。`
        : '终端接入步骤未执行。',
    },
    {
      ne: 'UPF',
      operation: 'MEC 边缘节点',
      status: ok ? 'APPLIED' : 'SKIPPED',
      detail: ok
        ? 'N6 本地点、DNN 列表与健康探测已注册至边缘编排。'
        : 'MEC 节点注册未执行。',
    },
    {
      ne: 'NEF',
      operation: '5G LAN VN',
      status: ok ? 'APPLIED' : 'SKIPPED',
      detail: ok
        ? '各模块 VN 组、以太网 PDU 与成员终端 ID 已应用。'
        : 'VN 组配置未执行。',
    },
    {
      ne: 'UPF',
      operation: 'MEC 分流规则',
      status: ok ? 'APPLIED' : 'SKIPPED',
      detail: ok
        ? '本地分流 / 下一跳与 VN 匹配条件已安装并启用。'
        : '分流规则未提交。',
    },
    {
      ne: 'PCF',
      operation: '策略与会话',
      status: ok ? 'APPLIED' : 'SKIPPED',
      detail: ok
        ? 'QoS、ARP 与成员分组策略已与切片实例一致。'
        : '策略同步未执行。',
    },
  ]

  const summary = ok
    ? `专网拓扑批量下发成功：${selectedCount} 个模块（新配置 ${result.configured}，跳过 ${result.skipped}）。参数由 Agent 依据《5G-A数据》对齐。`
    : `专网拓扑批量下发未完全成功：${result.failed.length} 个模块失败，${result.configured} 个已新配置，${result.skipped} 个已跳过。`

  return {
    correlationId,
    completedAt,
    overallStatus: ok ? 'SUCCESS' : 'FAILED',
    summary,
    configEcho: {
      mode: 'topology-batch-agent',
      modulesSelected: moduleLabels,
      configured: result.configured,
      skipped: result.skipped,
      failed: result.failed,
      resourceDomains: [
        'NetworkSlice',
        'RedCapDevice',
        'MecNode',
        'FiveGLanVn',
        'MecOffloadRule',
      ],
    },
    steps,
  }
}
