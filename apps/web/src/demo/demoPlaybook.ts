/**
 * Frozen payloads mirroring 5G-A数据.md (repo root) for Agent auto-configuration.
 * 与仓库根目录《5G-A数据.md》一致的方案参数快照，供 Agent 自动写入使用。
 */

/** Align with apps/api redcap.constants REDCAP_PROFILE_DISABLE. */
export const PLAYBOOK_POWER_PROFILE_DISABLE = '__redcap_edrx_disable__'

/** §3.1 + §4: uRLLC slice technical id for VN linkage. */
export const PLAYBOOK_SLICE_ID_ROBOT_URLLC = 'slice-robot-urllc'

export const PLAYBOOK_SLICE_BODY = {
  id: PLAYBOOK_SLICE_ID_ROBOT_URLLC,
  displayName: '机械臂协同 uRLLC 切片',
  description:
    '用于产线末端装箱与码垛机械臂的高精度同步控制，要求极低时延与高可靠性，防止动作脱节打碎酒瓶。',
  sst: 2,
  sd: '020666',
  dnn: 'dnn-robot.private',
  ladnAllowed: true,
  ulGbrMbps: 20,
  dlGbrMbps: 20,
  ulMbrMbps: 50,
  dlMbrMbps: 50,
  ambrMbps: 200,
  fiveQi: 82,
  arpLevel: 'high' as const,
  memberGroupIds: ['grp-robot-arms'],
}

export const PLAYBOOK_REDCAP_DEVICE_BODY = {
  alias: '1号线-高速机械臂A',
  supi: 'imsi-460001234560001',
  imeisv: '867400012345671',
  sliceId: 'slice-vision-embb',
  ipAddress: '10.45.1.55',
  rrcState: 'RRC_CONNECTED',
  signalQuality: 'RSRP -65 dBm',
  trafficMb: 12054,
  powerProfileId: PLAYBOOK_POWER_PROFILE_DISABLE,
}

export const PLAYBOOK_MEC_NODE_BODY = {
  nodeName: '机械臂控制边缘节点',
  n6LocalEndpoint: '10.10.2.10:2152',
  dnnIds: ['dnn-robot.private'],
  capabilityTags: ['N6_BREAKOUT', 'uRLLC_Optimized'],
  healthProbe: 'http://10.10.2.10:8080/health',
}

export const PLAYBOOK_MEC_RULE_BODY = {
  priority: 20,
  name: '机械臂协同指令本地极速卸载',
  enabled: true,
  match: {
    destIpCidrs: ['10.45.2.0/24'],
    srcIpCidrs: [] as string[],
    protocol: 'TCP' as const,
    portRanges: ['102', '4840'],
    vnId: 'vn-robot-lan',
  },
  action: {
    actionType: 'LOCAL_BREAKOUT' as const,
    nextHop: '10.10.2.10',
    bypassPublicNetwork: true,
  },
}

export const PLAYBOOK_VN_BODY = {
  id: 'vn-robot-lan',
  displayName: '装箱码垛机械臂 PROFINET 专网',
  technicalId: 'vn-robot-lan',
  linkedSliceId: 'slice-robot-urllc',
  ethernetPduAllowed: true,
  broadcastPolicy: 'ALLOW' as const,
  multicastPolicy: 'ALLOW' as const,
  memberIds: ['imsi-460001234560002'],
}

export type PlaybookFieldRow = { label: string; value: string }

function joinVals(v: unknown): string {
  if (v === undefined || v === null) return ''
  if (Array.isArray(v)) return v.join(', ')
  if (typeof v === 'object') return JSON.stringify(v)
  return String(v)
}

/** Deterministic label + slug from operator device name input. */
function deviceLabelAndTag(deviceName: string, fallbackLabel: string): { label: string; tag: string } {
  const trimmed = deviceName.trim()
  const label = trimmed.length > 0 ? trimmed : fallbackLabel
  const tag =
    trimmed
      .replace(/\s+/g, '-')
      .replace(/[^a-zA-Z0-9\u4e00-\u9fff_-]/g, '')
      .slice(0, 24) || 'device'
  return { label, tag }
}

function fingerprint(s: string): number {
  let h = 0
  for (let i = 0; i < s.length; i++) {
    h = (h * 31 + s.charCodeAt(i)) >>> 0
  }
  return h
}

export function slicePlaybookRowsFromBody(b: typeof PLAYBOOK_SLICE_BODY): PlaybookFieldRow[] {
  return [
    { label: '切片技术 ID', value: b.id },
    { label: '切片显示名', value: b.displayName },
    { label: '描述', value: b.description },
    { label: 'SST', value: String(b.sst) },
    { label: 'SD', value: b.sd },
    { label: '默认 DNN', value: b.dnn },
    { label: '允许 LADN', value: b.ladnAllowed ? '开启' : '关闭' },
    { label: '上行/下行 GBR (Mbps)', value: `${b.ulGbrMbps} / ${b.dlGbrMbps}` },
    { label: '上行/下行 MBR (Mbps)', value: `${b.ulMbrMbps} / ${b.dlMbrMbps}` },
    { label: 'AMBR (Mbps)', value: String(b.ambrMbps) },
    { label: '5QI', value: String(b.fiveQi) },
    { label: 'ARP / 抢占档位', value: b.arpLevel },
    { label: '成员分组 ID', value: joinVals(b.memberGroupIds) },
  ]
}

export function slicePlaybookRows(): PlaybookFieldRow[] {
  return slicePlaybookRowsFromBody(PLAYBOOK_SLICE_BODY)
}

/** Derive playbook slice payload from operator-entered device name (deterministic, no AI). */
/** 由用户输入的设备名推导切片载荷（确定性规则，非大模型）。 */
export function buildSliceBodyFromDeviceName(deviceName: string): typeof PLAYBOOK_SLICE_BODY {
  const { label, tag } = deviceLabelAndTag(deviceName, PLAYBOOK_SLICE_BODY.displayName)
  return {
    ...PLAYBOOK_SLICE_BODY,
    displayName: `${label} · uRLLC 协同切片`,
    description: `面向「${label}」产线场景的极低时延与高可靠网络切片（Agent 根据设备名生成的草案）。`,
    memberGroupIds: [`grp-${tag}`],
  }
}

/** Log lines for the “generate from device name” step (slice Agent). */
export function scriptSliceGenerateFromDevice(deviceName: string): string[] {
  const label = deviceName.trim()
  return [
    `[Agent] 解析设备名「${label}」…`,
    '[Agent] 匹配工业 uRLLC 策略模板（5QI=82，对称 GBR 20 Mbps）…',
    '[Agent] 生成切片显示名、成员分组与 QoS 草案…',
  ]
}

export function redcapPlaybookRowsFromBody(b: typeof PLAYBOOK_REDCAP_DEVICE_BODY): PlaybookFieldRow[] {
  return [
    { label: '别名', value: b.alias },
    { label: 'SUPI', value: b.supi },
    { label: 'IMEISV', value: b.imeisv ?? '' },
    { label: '切片 ID', value: b.sliceId },
    { label: 'VN ID', value: '（留空）' },
    { label: 'IP', value: b.ipAddress ?? '' },
    { label: 'RRC', value: b.rrcState },
    { label: '信号质量', value: b.signalQuality },
    { label: '流量累计 (MB)', value: String(b.trafficMb) },
    { label: '省电模板', value: '禁用' },
  ]
}

export function redcapPlaybookRows(): PlaybookFieldRow[] {
  return redcapPlaybookRowsFromBody(PLAYBOOK_REDCAP_DEVICE_BODY)
}

export function buildRedcapBodyFromDeviceName(deviceName: string): typeof PLAYBOOK_REDCAP_DEVICE_BODY {
  const { label, tag } = deviceLabelAndTag(deviceName, PLAYBOOK_REDCAP_DEVICE_BODY.alias)
  const h = fingerprint(tag)
  const supiSuffix = String((h % 900) + 100).padStart(3, '0')
  const imeiSuffix = String((fingerprint(tag + 'i') % 900) + 100).padStart(3, '0')
  const ipThird = 1 + (h % 80)
  const ipFourth = 20 + (fingerprint(tag + 'p') % 180)
  return {
    ...PLAYBOOK_REDCAP_DEVICE_BODY,
    alias: `${label}-RedCap`,
    supi: `imsi-460001234560${supiSuffix}`,
    imeisv: `867400012345${imeiSuffix}`,
    ipAddress: `10.45.${ipThird}.${ipFourth}`,
    trafficMb: 5000 + (h % 15000),
    signalQuality: h % 2 === 0 ? 'RSRP -65 dBm' : 'RSRP -71 dBm',
  }
}

export function scriptRedcapGenerateFromDevice(deviceName: string): string[] {
  const label = deviceName.trim()
  return [
    `[Agent] 解析现场设备「${label}」…`,
    '[Agent] 推导 RedCap 终端别名、SUPI、IP 与流量画像草案…',
    '[Agent] 对齐 slice-vision-embb 与省电模板（禁用 eDRX）…',
  ]
}

export function mecNodePlaybookRowsFromBody(b: typeof PLAYBOOK_MEC_NODE_BODY): PlaybookFieldRow[] {
  return [
    { label: '节点名', value: b.nodeName },
    { label: 'N6 本地端点', value: b.n6LocalEndpoint },
    { label: 'DNN 列表', value: joinVals(b.dnnIds) },
    { label: '能力标签', value: joinVals(b.capabilityTags) },
    { label: '健康探测 URL', value: b.healthProbe ?? '' },
  ]
}

export function mecNodePlaybookRows(): PlaybookFieldRow[] {
  return mecNodePlaybookRowsFromBody(PLAYBOOK_MEC_NODE_BODY)
}

export function buildMecNodeBodyFromDeviceName(deviceName: string): typeof PLAYBOOK_MEC_NODE_BODY {
  const { label, tag } = deviceLabelAndTag(deviceName, PLAYBOOK_MEC_NODE_BODY.nodeName)
  const h = fingerprint(tag)
  const octet = 8 + (h % 120)
  const port = 2152 + (h % 8)
  return {
    ...PLAYBOOK_MEC_NODE_BODY,
    nodeName: `${label} · 边缘节点`,
    n6LocalEndpoint: `10.10.2.${octet}:${port}`,
    healthProbe: `http://10.10.2.${octet}:8080/health`,
  }
}

export function scriptMecNodeGenerateFromDevice(deviceName: string): string[] {
  const label = deviceName.trim()
  return [
    `[Agent] 定位边缘站点设备「${label}」…`,
    '[Agent] 分配 N6 本地点与健康探测路径…',
    '[Agent] 同步 DNN 与 UPF 分流能力标签…',
  ]
}

export function mecRulePlaybookRowsFromBody(b: typeof PLAYBOOK_MEC_RULE_BODY): PlaybookFieldRow[] {
  return [
    { label: '规则名', value: b.name },
    { label: '优先级', value: String(b.priority) },
    { label: '目的网段', value: joinVals(b.match.destIpCidrs) },
    { label: '源网段', value: '（留空）' },
    { label: '协议', value: b.match.protocol },
    { label: '端口范围', value: joinVals(b.match.portRanges) },
    { label: 'VN ID', value: b.match.vnId ?? '' },
    { label: '动作类型', value: '本地分流' },
    { label: '下一跳', value: b.action.nextHop ?? '' },
    { label: '绕过公网', value: b.action.bypassPublicNetwork ? '开启' : '关闭' },
  ]
}

export function mecRulePlaybookRows(): PlaybookFieldRow[] {
  return mecRulePlaybookRowsFromBody(PLAYBOOK_MEC_RULE_BODY)
}

export function buildMecRuleBodyFromDeviceName(deviceName: string): typeof PLAYBOOK_MEC_RULE_BODY {
  const { label, tag } = deviceLabelAndTag(deviceName, PLAYBOOK_MEC_RULE_BODY.name)
  const h = fingerprint(tag)
  return {
    ...PLAYBOOK_MEC_RULE_BODY,
    name: `${label} · 协同卸载`,
    priority: 12 + (h % 48),
  }
}

export function scriptMecRuleGenerateFromDevice(deviceName: string): string[] {
  const label = deviceName.trim()
  return [
    `[Agent] 关联业务设备「${label}」…`,
    '[Agent] 继承 TCP 分流匹配与 vn-robot-lan 绑定…',
    '[Agent] 生成规则名与优先级草案…',
  ]
}

export function vnPlaybookRowsFromBody(b: typeof PLAYBOOK_VN_BODY): PlaybookFieldRow[] {
  return [
    { label: 'VN 组 ID / 技术 ID', value: `${b.id} / ${b.technicalId}` },
    { label: '显示名', value: b.displayName },
    { label: '关联切片 ID', value: b.linkedSliceId },
    { label: '成员终端 ID', value: joinVals(b.memberIds) },
    { label: '允许以太网 PDU', value: b.ethernetPduAllowed ? '开启' : '关闭' },
    { label: '广播策略', value: b.broadcastPolicy },
    { label: '组播策略', value: b.multicastPolicy },
  ]
}

export function vnPlaybookRows(): PlaybookFieldRow[] {
  return vnPlaybookRowsFromBody(PLAYBOOK_VN_BODY)
}

export function buildVnBodyFromDeviceName(deviceName: string): typeof PLAYBOOK_VN_BODY {
  const { label } = deviceLabelAndTag(deviceName, PLAYBOOK_VN_BODY.displayName)
  return {
    ...PLAYBOOK_VN_BODY,
    displayName: `${label} · PROFINET 专网`,
  }
}

export function scriptVnGenerateFromDevice(deviceName: string): string[] {
  const label = deviceName.trim()
  return [
    `[Agent] 解析工业侧设备「${label}」…`,
    '[Agent] 生成 VN 显示名并保持与 slice-robot-urllc 绑定…',
    '[Agent] 校验以太网 PDU / 广播 / 组播策略模板…',
  ]
}

/** Required slice id for RedCap playbook (5G-A数据.md). */
export const PLAYBOOK_REQUIRED_SLICE_VISION_EMBB = 'slice-vision-embb'

/** Required slice id for VN playbook. */
export const PLAYBOOK_REQUIRED_SLICE_ROBOT = PLAYBOOK_SLICE_ID_ROBOT_URLLC

/** Scripted execution log lines per domain (Chinese + API path hints). */
/** 各域脚本化执行日志行（中文 + API 路径提示）。 */

export const SCRIPT_SLICE_PRE = [
  '[Agent] 加载《5G-A数据》「新建切片」参数块…',
  '[Agent] 映射 QoS：GBR 20/20 Mbps，MBR 50/50 Mbps，5QI=82，ARP=高',
  '[Agent] 即将请求 POST /api/slices（编排通道）',
]

export const SCRIPT_SLICE_POST = [
  '[Agent] 切片草稿已创建，技术 ID 与文档 VN 关联一致（slice-robot-urllc）',
  '[Agent] 可在列表中点击「编辑」后继续「下发」流程',
]

export const SCRIPT_REDCAP_PRE = [
  '[Agent] 加载《5G-A数据》「连接新终端」参数块…',
  '[Agent] 校验依赖：终端绑定切片 ID slice-vision-embb 须已存在',
  '[Agent] 即将请求 POST /api/redcap/devices',
]

export const SCRIPT_REDCAP_POST = [
  '[Agent] RedCap 终端已写入（省电模板：禁用）',
]

export const SCRIPT_MEC_NODE_PRE = [
  '[Agent] 加载《5G-A数据》「注册节点」参数块…',
  '[Agent] 即将请求 POST /api/mec/nodes',
]

export const SCRIPT_MEC_NODE_POST = ['[Agent] MEC 节点注册完成']

export const SCRIPT_MEC_RULE_PRE = [
  '[Agent] 加载《5G-A数据》「新建规则」参数块…',
  '[Agent] 匹配：TCP 目的 10.45.2.0/24 端口 102, 4840，VN vn-robot-lan',
  '[Agent] 即将请求 POST /api/mec/rules',
]

export const SCRIPT_MEC_RULE_POST = ['[Agent] 分流规则已提交并生成回执']

export const SCRIPT_VN_PRE = [
  '[Agent] 加载《5G-A数据》「新建 VN 组」参数块…',
  '[Agent] 校验依赖：关联切片 slice-robot-urllc 须已存在',
  '[Agent] 即将请求 POST /api/five-glan/vn',
]

export const SCRIPT_VN_POST = [
  '[Agent] VN 组 vn-robot-lan 已创建（以太网 PDU / 广播 / 组播均允许）',
]
