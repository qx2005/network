/**
 * Batch provision all topology palette modules via frozen Playbook payloads.
 * 专网概览拓扑：一键按《5G-A数据》Playbook 批量写入切片、RedCap、MEC 节点/规则与 5G LAN VN。
 */

import { apiGet, apiSend } from '../api/client'
import type {
  FiveGLanVn,
  MecNode,
  MecOffloadRule,
  NetworkSlice,
  ProvisioningJob,
  RedCapDevice,
} from '../domain/types'
import {
  buildMecNodeBodyFromDeviceName,
  buildMecRuleBodyFromDeviceName,
  buildRedcapBodyFromDeviceName,
  buildSliceBodyFromDeviceName,
  buildVnBodyFromDeviceName,
  mecNodePlaybookRowsFromBody,
  mecRulePlaybookRowsFromBody,
  redcapPlaybookRowsFromBody,
  scriptSliceGenerateFromDevice,
  slicePlaybookRowsFromBody,
  vnPlaybookRowsFromBody,
  type PlaybookFieldRow,
} from './demoPlaybook'

/** Module library labels aligned with DeviceTopologyPanel HARDWARE_PALETTE. */
export const TOPOLOGY_MODULE_DEVICE_LABELS = [
  '环形模块',
  '四轴机械臂模块',
  '注水机',
  '旋转供料模块',
  '物料推送模块',
  '定位推送模块',
  '工业相机模块',
  '气动伸缩夹爪模块',
  '升降机模块',
  '边缘计算单元模块',
] as const

export type TopologyModuleDeviceLabel = (typeof TOPOLOGY_MODULE_DEVICE_LABELS)[number]

export type TopologyBatchProvisionResult = {
  configured: number
  skipped: number
  failed: { label: string; error: string }[]
}

async function ensureSliceProvisioned(sliceBody: ReturnType<typeof buildSliceBodyFromDeviceName>) {
  const slices = await apiGet<NetworkSlice[]>('/api/slices')
  let slice = slices.find((s) => s.id === sliceBody.id)
  if (!slice) {
    slice = await apiSend<NetworkSlice>(
      '/api/slices',
      {
        method: 'POST',
        body: JSON.stringify(sliceBody),
      },
      { demoPlaybook: true },
    )
  }
  if (slice.status !== 'provisioned') {
    await apiSend<ProvisioningJob>(
      `/api/slices/${slice.id}/provision`,
      { method: 'POST' },
      { demoPlaybook: true },
    )
  }
}

async function ensureRedcapTerminal(redcapBody: ReturnType<typeof buildRedcapBodyFromDeviceName>) {
  const devices = await apiGet<RedCapDevice[]>('/api/redcap/devices')
  if (devices.some((d) => d.supi === redcapBody.supi)) return
  await apiSend<RedCapDevice>(
    '/api/redcap/devices',
    {
      method: 'POST',
      body: JSON.stringify(redcapBody),
    },
    { demoPlaybook: true },
  )
}

async function ensureMecNode(nodeBody: ReturnType<typeof buildMecNodeBodyFromDeviceName>) {
  const nodes = await apiGet<MecNode[]>('/api/mec/nodes')
  if (nodes.some((n) => n.nodeName === nodeBody.nodeName)) return
  await apiSend<MecNode>(
    '/api/mec/nodes',
    {
      method: 'POST',
      body: JSON.stringify(nodeBody),
    },
    { demoPlaybook: true },
  )
}

async function ensureMecRule(ruleBody: ReturnType<typeof buildMecRuleBodyFromDeviceName>) {
  const rules = await apiGet<MecOffloadRule[]>('/api/mec/rules')
  if (rules.some((r) => r.name === ruleBody.name)) return
  await apiSend(
    '/api/mec/rules',
    {
      method: 'POST',
      body: JSON.stringify(ruleBody),
    },
    { demoPlaybook: true },
  )
}

async function ensureVnGroup(vnBody: ReturnType<typeof buildVnBodyFromDeviceName>) {
  const vns = await apiGet<FiveGLanVn[]>('/api/five-glan/vn')
  if (vns.some((v) => v.id === vnBody.id)) return
  await apiSend(
    '/api/five-glan/vn',
    {
      method: 'POST',
      body: JSON.stringify(vnBody),
    },
    { demoPlaybook: true },
  )
}

function isTopologyModuleFullyReady(
  deviceLabel: string,
  slices: NetworkSlice[],
  devices: RedCapDevice[],
  nodes: MecNode[],
  rules: MecOffloadRule[],
  vns: FiveGLanVn[],
): boolean {
  const sliceBody = buildSliceBodyFromDeviceName(deviceLabel)
  const redcapBody = buildRedcapBodyFromDeviceName(deviceLabel)
  const nodeBody = buildMecNodeBodyFromDeviceName(deviceLabel)
  const ruleBody = buildMecRuleBodyFromDeviceName(deviceLabel)
  const vnBody = buildVnBodyFromDeviceName(deviceLabel)
  return (
    slices.some((s) => s.id === sliceBody.id && s.status === 'provisioned') &&
    devices.some((d) => d.supi === redcapBody.supi) &&
    nodes.some((n) => n.nodeName === nodeBody.nodeName) &&
    rules.some((r) => r.name === ruleBody.name) &&
    vns.some((v) => v.id === vnBody.id)
  )
}

/**
 * Provision one palette module (full Playbook chain) for topology + dashboard readiness.
 * 为单个拓扑模块写入切片、终端、MEC 与 VN（与分菜单 Agent 配置一致）。
 */
export async function provisionTopologyModule(deviceLabel: string): Promise<void> {
  const sliceBody = buildSliceBodyFromDeviceName(deviceLabel)
  await ensureSliceProvisioned(sliceBody)
  const redcapBody = buildRedcapBodyFromDeviceName(deviceLabel)
  await ensureRedcapTerminal(redcapBody)
  const nodeBody = buildMecNodeBodyFromDeviceName(deviceLabel)
  await ensureMecNode(nodeBody)
  const vnBody = buildVnBodyFromDeviceName(deviceLabel)
  await ensureVnGroup(vnBody)
  const ruleBody = buildMecRuleBodyFromDeviceName(deviceLabel)
  await ensureMecRule(ruleBody)
}

/** Read-only field rows for one topology module (full Playbook chain). */
export function buildTopologyModuleFieldRows(deviceLabel: string): PlaybookFieldRow[] {
  return [
    { label: '网络切片', value: '—' },
    ...slicePlaybookRowsFromBody(buildSliceBodyFromDeviceName(deviceLabel)),
    { label: 'RedCap 终端', value: '—' },
    ...redcapPlaybookRowsFromBody(buildRedcapBodyFromDeviceName(deviceLabel)),
    { label: 'MEC 注册节点', value: '—' },
    ...mecNodePlaybookRowsFromBody(buildMecNodeBodyFromDeviceName(deviceLabel)),
    { label: '5G LAN VN', value: '—' },
    ...vnPlaybookRowsFromBody(buildVnBodyFromDeviceName(deviceLabel)),
    { label: 'MEC 分流规则', value: '—' },
    ...mecRulePlaybookRowsFromBody(buildMecRuleBodyFromDeviceName(deviceLabel)),
  ]
}

/** Merge field rows for Agent drawer preview (multi-module). */
export function buildTopologyBatchFieldRows(deviceLabels: string[]): PlaybookFieldRow[] {
  return deviceLabels.flatMap((label) => [
    { label: `模块：${label}`, value: '《5G-A数据》切片 + 终端 + MEC + VN' },
    ...buildTopologyModuleFieldRows(label),
  ])
}

/** Scripted log lines for step「生成配置参数」. */
export function scriptTopologyGenerateForDevices(deviceLabels: string[]): string[] {
  const lines = [
    `[Agent] 拓扑批量编排：已选 ${deviceLabels.length} 个模块`,
    '[Agent] 将按《5G-A数据》生成切片、RedCap、MEC 节点/规则与 5G LAN VN 参数…',
  ]
  for (const label of deviceLabels) {
    lines.push(`[Agent] ── ${label} ──`)
    lines.push(...scriptSliceGenerateFromDevice(label))
  }
  return lines
}

export function scriptTopologyPreForBatch(deviceLabels: string[]): string[] {
  return [
    '[Agent] 加载拓扑批量 Playbook 快照…',
    `[Agent] 待写入模块：${deviceLabels.join('、')}`,
    '[Agent] 校验切片依赖 → RedCap → MEC 节点 → VN → 分流规则（串行）…',
  ]
}

export function scriptTopologyPostForBatch(result: TopologyBatchProvisionResult): string[] {
  const lines = [
    `[Agent] 批量下发完成：新配置 ${result.configured}，已就绪跳过 ${result.skipped}`,
  ]
  if (result.failed.length > 0) {
    for (const f of result.failed) {
      lines.push(`[Agent] 失败 · ${f.label}：${f.error}`)
    }
  } else {
    lines.push('[Agent] 专网概览 KPI 与拓扑节点状态将同步刷新')
  }
  return lines
}

/**
 * Run Playbook for selected module labels (serial, deterministic).
 * 按所选模块顺序串行执行 Playbook。
 */
export async function runTopologyBatchProvisionForLabels(
  deviceLabels: readonly string[],
): Promise<TopologyBatchProvisionResult> {
  const result: TopologyBatchProvisionResult = {
    configured: 0,
    skipped: 0,
    failed: [],
  }

  for (const label of deviceLabels) {
    try {
      const [slices, devices, nodes, rules, vns] = await Promise.all([
        apiGet<NetworkSlice[]>('/api/slices'),
        apiGet<RedCapDevice[]>('/api/redcap/devices'),
        apiGet<MecNode[]>('/api/mec/nodes'),
        apiGet<MecOffloadRule[]>('/api/mec/rules'),
        apiGet<FiveGLanVn[]>('/api/five-glan/vn'),
      ])
      if (isTopologyModuleFullyReady(label, slices, devices, nodes, rules, vns)) {
        result.skipped += 1
        continue
      }
      await provisionTopologyModule(label)
      result.configured += 1
    } catch (e) {
      result.failed.push({
        label,
        error: e instanceof Error ? e.message : String(e),
      })
    }
  }

  return result
}

/**
 * Run Playbook for every module in the topology library (serial, deterministic).
 * 按模块库顺序串行执行，便于演示与依赖校验。
 */
export async function runTopologyBatchProvisionAll(): Promise<TopologyBatchProvisionResult> {
  return runTopologyBatchProvisionForLabels(TOPOLOGY_MODULE_DEVICE_LABELS)
}
