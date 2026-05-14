import type { NetworkSlice, ProvisionReport } from '../domain/types'

function randomId(): string {
  return `show-${crypto.randomUUID?.() ?? String(Date.now())}`
}

/**
 * Build a realistic-looking provision report for UI demos (no live NE).
 * 生成用于界面展示的合成回执（无真实网元）。
 */
export function buildShowcaseSliceProvisionReport(
  sliceId: string,
  values: Partial<NetworkSlice>,
): ProvisionReport {
  const sst = values.sst ?? 1
  const sd = values.sd
  const ns = sd ? `${sst}-${sd}` : `${sst}`
  const dnn = values.dnn ?? '—'
  const qos = `5QI=${values.fiveQi ?? 9} GBR↑${values.ulGbrMbps ?? 0}/↓${values.dlGbrMbps ?? 0}Mbps`

  return {
    correlationId: randomId(),
    completedAt: new Date().toISOString(),
    overallStatus: 'SUCCESS',
    summary: `【展示】切片策略已确认：S-NSSAI ${ns}，DNN「${dnn}」。`,
    configEcho: {
      sliceId,
      displayName: values.displayName,
      snssai: ns,
      dnn,
      qosSummary: qos,
    },
    steps: [
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
        detail: `会话策略已绑定 DNN「${dnn}」，${qos}。`,
      },
      {
        ne: 'SMF',
        operation: '会话管理',
        status: 'APPLIED',
        detail: `PDU 会话模板已刷新（实例 ${sliceId}）。`,
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
    ],
  }
}
