/**
 * Frozen payloads mirroring 5G-A数据.md (repo root) for Agent auto-configuration.
 * 与仓库根目录《5G-A数据.md》一致的方案参数快照，供 Agent 自动写入使用。
 */

/** Align with apps/api redcap.constants REDCAP_PROFILE_DISABLE. */
export const PLAYBOOK_POWER_PROFILE_DISABLE = '__redcap_edrx_disable__'

/** §3.1 + §4: uRLLC slice technical id for VN linkage. */
export const PLAYBOOK_SLICE_ID_ROBOT_URLLC = 'slice-robot-urllc'

/** Ring line uRLLC slice id — matches 《5G-A数据.md》「高速环形线协同 uRLLC 切片」. */
export const PLAYBOOK_SLICE_ID_RINGLINE_URLLC = 'slice-ringline-urllc'

/** High-precision filling / liquid injector uRLLC — matches 《5G-A数据.md》「高精度灌装注水机 uRLLC 切片」. */
export const PLAYBOOK_SLICE_ID_FILLER_URLLC = 'slice-filler-urllc'

/** High-speed rotary feed collaborative uRLLC — matches 《5G-A数据.md》「高速旋转供料协同 uRLLC 切片」. */
export const PLAYBOOK_SLICE_ID_ROTARY_URLLC = 'slice-rotary-urllc'

/** High-speed material push / sort-station uRLLC — matches 《5G-A数据.md》「高速物料推送协同 uRLLC 切片」. */
export const PLAYBOOK_SLICE_ID_PUSHER_URLLC = 'slice-pusher-urllc'

/** Vision positioning + servo push collaborative uRLLC — matches 《5G-A数据.md》「视觉定位与伺服推送协同 uRLLC 切片」. */
export const PLAYBOOK_SLICE_ID_POS_PUSHER_URLLC = 'slice-pos-pusher-urllc'

/** Industrial camera massive uplink eMBB — matches 《5G-A数据.md》「工业相机大上行切片」. */
export const PLAYBOOK_SLICE_ID_VISION_EMBB = 'slice-vision-embb'

/** Pneumatic telescopic gripper collaborative uRLLC — matches 《5G-A数据.md》「气动伸缩夹爪协同 uRLLC 切片」. */
export const PLAYBOOK_SLICE_ID_GRIPPER_URLLC = 'slice-gripper-urllc'

/** Wireless edge compute unit collaborative slice — matches 《5G-A数据.md》「边缘计算单元协同专属切片」. */
export const PLAYBOOK_SLICE_ID_EDGE_COMPUTE = 'slice-edge-compute'

export const PLAYBOOK_SLICE_BODY = {
  id: PLAYBOOK_SLICE_ID_ROBOT_URLLC,
  displayName: '机械臂 uRLLC 切片',
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

/**
 * Frozen payload: high-speed ring line collaborative uRLLC (磁悬浮环形线 / 动子同步).
 * 与《5G-A数据.md》新建切片（高速环形线协同 uRLLC）段落逐项一致。
 */
export const PLAYBOOK_SLICE_BODY_RINGLINE = {
  id: PLAYBOOK_SLICE_ID_RINGLINE_URLLC,
  displayName: '高速环形线协同 uRLLC 切片',
  description:
    '用于车间高速磁悬浮环形传送带的多动子（穿梭车）同步控制与实时位置反馈，要求极低时延与强确定性，确保动子间距精准控制与防撞。',
  sst: 2,
  sd: '020888',
  dnn: 'dnn-ringline.private',
  ladnAllowed: true,
  ulGbrMbps: 30,
  dlGbrMbps: 30,
  ulMbrMbps: 100,
  dlMbrMbps: 100,
  ambrMbps: 300,
  fiveQi: 82,
  arpLevel: 'high' as const,
  memberGroupIds: ['grp-ring-movers'],
}

/**
 * Frozen payload: high-precision filling & liquid injector uRLLC (灌装注水机).
 * 与《5G-A数据.md》「高精度灌装注水机 uRLLC 切片」段落逐项一致。
 */
export const PLAYBOOK_SLICE_BODY_FILLER = {
  id: PLAYBOOK_SLICE_ID_FILLER_URLLC,
  displayName: '高精度灌装注水机 uRLLC 切片',
  description:
    '用于产线高精度饮料/药液注水阀门与 PLC 的微秒级同步控制，以及流量计高频数据回传，确保阀门开闭动作极致精准，杜绝溢流与灌装量偏差。',
  sst: 2,
  sd: '020999',
  dnn: 'dnn-filler.private',
  ladnAllowed: true,
  ulGbrMbps: 10,
  dlGbrMbps: 10,
  ulMbrMbps: 30,
  dlMbrMbps: 30,
  ambrMbps: 100,
  fiveQi: 82,
  arpLevel: 'high' as const,
  memberGroupIds: ['grp-liquid-fillers'],
}

/**
 * Frozen payload: high-speed rotary feed collaborative uRLLC (星轮/离心供料).
 * 与《5G-A数据.md》「高速旋转供料协同 uRLLC 切片」及同场景终端/MEC/VN 段落逐项一致。
 */
export const PLAYBOOK_SLICE_BODY_ROTARY = {
  id: PLAYBOOK_SLICE_ID_ROTARY_URLLC,
  displayName: '高速旋转供料协同 uRLLC 切片',
  description:
    '用于产线前端星轮/离心供料盘的伺服电机高速相位同步，以及光电/视觉检漏的高频状态回传，保障高速上料过程严丝合缝，杜绝卡料与缺件。',
  sst: 2,
  sd: '020777',
  dnn: 'dnn-rotary-feeder.private',
  ladnAllowed: true,
  ulGbrMbps: 15,
  dlGbrMbps: 15,
  ulMbrMbps: 40,
  dlMbrMbps: 40,
  ambrMbps: 150,
  fiveQi: 82,
  arpLevel: 'high' as const,
  memberGroupIds: ['grp-rotary-feeders'],
}

/**
 * Frozen payload: high-speed material push collaborative uRLLC (分拣剔除推杆 / 阀门岛).
 * 与《5G-A数据.md》「高速物料推送协同 uRLLC 切片」及同场景终端/MEC/VN 段落逐项一致。
 */
export const PLAYBOOK_SLICE_BODY_PUSHER = {
  id: PLAYBOOK_SLICE_ID_PUSHER_URLLC,
  displayName: '高速物料推送协同 uRLLC 切片',
  description:
    '用于产线高速分拣与剔除环节的推杆气缸、直线电机与光电传感器的微秒级 I/O 控制，确保剔除或分流动作极致精准，防止错漏或挤压损坏物料。',
  sst: 2,
  sd: '020555',
  dnn: 'dnn-pusher.private',
  ladnAllowed: true,
  ulGbrMbps: 10,
  dlGbrMbps: 10,
  ulMbrMbps: 25,
  dlMbrMbps: 25,
  ambrMbps: 100,
  fiveQi: 82,
  arpLevel: 'high' as const,
  memberGroupIds: ['grp-material-pushers'],
}

/**
 * Frozen payload: vision positioning + servo push uRLLC (GigE Vision / PROFINET 融合).
 * 与《5G-A数据.md》「视觉定位与伺服推送协同 uRLLC 切片」及同场景终端/MEC/VN 段落逐项一致。
 */
export const PLAYBOOK_SLICE_BODY_POS_PUSHER = {
  id: PLAYBOOK_SLICE_ID_POS_PUSHER_URLLC,
  displayName: '视觉定位与伺服推送协同 uRLLC 切片',
  description:
    '用于产线精细装配或剔除环节的“视觉定位+伺服推杆”闭环控制。既需要大上行带宽回传高帧率定位图像，又需要极低时延下发毫秒级伺服插补指令，确保物料被精准推送至微米级指定位置。',
  sst: 2,
  sd: '020444',
  dnn: 'dnn-pos-pusher.private',
  ladnAllowed: true,
  ulGbrMbps: 50,
  dlGbrMbps: 15,
  ulMbrMbps: 150,
  dlMbrMbps: 40,
  ambrMbps: 300,
  fiveQi: 80,
  arpLevel: 'high' as const,
  memberGroupIds: ['grp-pos-pushers'],
}

/**
 * Frozen payload: industrial camera massive uplink eMBB (AI defect / 3D profile).
 * 与《5G-A数据.md》「工业相机大上行切片」及同场景终端/MEC/VN 段落逐项一致。
 */
export const PLAYBOOK_SLICE_BODY_VISION_EMBB = {
  id: PLAYBOOK_SLICE_ID_VISION_EMBB,
  displayName: '工业相机大上行切片',
  description:
    '用于产线高速 AI 表面缺陷检测与 3D 轮廓扫描。工业相机需持续上传高帧率、无压缩的图像，极度消耗上行带宽，要求网络具备极强的上行吞吐能力与低丢包率。',
  sst: 1,
  sd: '010888',
  dnn: 'dnn-vision.private',
  ladnAllowed: true,
  ulGbrMbps: 150,
  dlGbrMbps: 10,
  ulMbrMbps: 300,
  dlMbrMbps: 50,
  ambrMbps: 500,
  fiveQi: 80,
  arpLevel: 'medium' as const,
  memberGroupIds: ['grp-ai-cameras'],
}

/**
 * Frozen payload: pneumatic telescopic gripper uRLLC (valve island / PROFINET IO).
 * 与《5G-A数据.md》「气动伸缩夹爪协同 uRLLC 切片」及同场景终端/MEC/VN 段落逐项一致。
 */
export const PLAYBOOK_SLICE_BODY_GRIPPER = {
  id: PLAYBOOK_SLICE_ID_GRIPPER_URLLC,
  displayName: '气动伸缩夹爪协同 uRLLC 切片',
  description:
    '用于产线机械臂或桁架末端气动伸缩夹爪的微秒级开闭控制。要求网络具备极低时延与高可靠性，确保抓取和释放时机极其精准，防止物料掉落或夹坏精密部件。',
  sst: 2,
  sd: '020333',
  dnn: 'dnn-gripper.private',
  ladnAllowed: true,
  ulGbrMbps: 10,
  dlGbrMbps: 10,
  ulMbrMbps: 25,
  dlMbrMbps: 25,
  ambrMbps: 100,
  fiveQi: 82,
  arpLevel: 'high' as const,
  memberGroupIds: ['grp-pneumatic-grippers'],
}

/**
 * Frozen payload: edge compute unit uRLLC (GPU aggregation / IT+OT).
 * 与《5G-A数据.md》「边缘计算单元协同专属切片」及同场景终端/MEC/VN 段落逐项一致。
 */
export const PLAYBOOK_SLICE_BODY_EDGE_COMPUTE = {
  id: PLAYBOOK_SLICE_ID_EDGE_COMPUTE,
  displayName: '边缘计算单元协同专属切片',
  description:
    '用于车间柔性部署的无线边缘计算单元。作为产线区域的“数字大脑”，需承载海量多源异构数据（视觉、传感器等）的极速汇聚与本地 AI 解析，同时保障微秒级软 PLC 控制指令的实时下发，是典型的“大带宽+低时延”双叠加高负载场景。',
  sst: 2,
  sd: '020111',
  dnn: 'dnn-edge-compute.private',
  ladnAllowed: true,
  ulGbrMbps: 200,
  dlGbrMbps: 200,
  ulMbrMbps: 1000,
  dlMbrMbps: 1000,
  ambrMbps: 2000,
  fiveQi: 80,
  arpLevel: 'high' as const,
  memberGroupIds: ['grp-edge-compute'],
}

export type DemoAgentSliceBody = {
  id: string
  displayName: string
  description: string
  sst: number
  sd: string
  dnn: string
  ladnAllowed: boolean
  ulGbrMbps: number
  dlGbrMbps: number
  ulMbrMbps: number
  dlMbrMbps: number
  ambrMbps: number
  fiveQi: number
  arpLevel: 'high' | 'medium' | 'low'
  memberGroupIds: string[]
}

/**
 * Agent preset: 「环形模块」→ 文档「高速环形线协同 uRLLC」整条链路。
 */
export function isRingModuleAgentSelection(deviceName: string): boolean {
  return deviceName.trim() === '环形模块'
}

/**
 * Agent preset: 「注水机」→ 文档「高精度灌装注水机 uRLLC」整条链路（独立切片 ID，避免与机械臂种子重合）。
 */
export function isWaterInjectorAgentSelection(deviceName: string): boolean {
  return deviceName.trim() === '注水机'
}

/**
 * Agent preset: 「旋转供料模块」→ 文档「高速旋转供料协同 uRLLC」整条链路（与拓扑库选项一致）。
 */
export function isRotaryFeedModuleAgentSelection(deviceName: string): boolean {
  return deviceName.trim() === '旋转供料模块'
}

/**
 * Agent preset: 「物料推送模块」→ 文档「高速物料推送协同 uRLLC」整条链路（与拓扑库选项一致）。
 */
export function isMaterialPushModuleAgentSelection(deviceName: string): boolean {
  return deviceName.trim() === '物料推送模块'
}

/**
 * Agent preset: 「定位推送模块」→ 文档「视觉定位与伺服推送协同 uRLLC」整条链路（与拓扑库选项一致）。
 */
export function isPositioningPushModuleAgentSelection(deviceName: string): boolean {
  return deviceName.trim() === '定位推送模块'
}

/**
 * Agent preset: 「工业相机」/「工业相机模块」→ 文档「工业相机大上行切片」整条链路（与拓扑库选项一致）。
 * 「工业相机」保留兼容旧下拉值；展示名可与「工业相机模块」对齐。
 */
export function isIndustrialCameraAgentSelection(deviceName: string): boolean {
  const t = deviceName.trim()
  return t === '工业相机' || t === '工业相机模块'
}

/**
 * Agent preset: 「气动伸缩夹爪模块」/「气动伸缩夹爪」→ 文档「气动伸缩夹爪协同 uRLLC」整条链路（与拓扑库选项一致）。
 */
export function isPneumaticGripperModuleAgentSelection(deviceName: string): boolean {
  const t = deviceName.trim()
  return t === '气动伸缩夹爪模块' || t === '气动伸缩夹爪'
}

/**
 * Agent preset: 「边缘计算单元模块」/「边缘计算单元」→ 文档「边缘计算单元协同专属切片」整条链路（与拓扑库选项一致）。
 */
export function isEdgeComputeUnitModuleAgentSelection(deviceName: string): boolean {
  const t = deviceName.trim()
  return t === '边缘计算单元模块' || t === '边缘计算单元'
}

/**
 * Agent preset: 「四轴机械臂模块」— 与演示种子 slice-robot-urllc / vn-line1 对齐（同 uRLLC 020666 + dnn-robot）。
 * 列表仅展示显示名与 S-NSSAI，易与派生 slice-agent-* 误认；此处固定技术 ID 避免 VN 前置校验失败。
 */
export function isRobotArmModuleAgentSelection(deviceName: string): boolean {
  return deviceName.trim() === '四轴机械臂模块'
}

function demoPlaybookDerivedSliceIdFromTag(tag: string): string {
  const ascii = tag.replace(/[^a-zA-Z0-9_-]/g, '').toLowerCase()
  if (ascii.length >= 2) {
    const id = `slice-agent-${ascii}`.slice(0, 48)
    if (id.length >= 12) return id
  }
  return `slice-agent-${fingerprint(tag).toString(16).padStart(8, '0')}`
}

function vnAgentBundleIdFromTag(tag: string): string {
  return `vn-agent-${fingerprint(`vn:${tag}`).toString(16).slice(0, 10)}`
}

/** 6-char hex SD for generic Agent slice — isolates S-NSSAI+DNN from demo seed slices. */
function demoPlaybookDerivedSdHexFromTag(tag: string): string {
  const h = fingerprint(`agent-sd:${tag}`) & 0xffffff
  return h.toString(16).padStart(6, '0')
}

/**
 * Slice technical id implied by device preset (Agent orchestration + dependency checks).
 * 设备预设对应的切片技术 ID（编排写入与 RedCap/VN 前置校验一致）。
 */
export function demoAgentSliceIdForDeviceName(deviceName: string): string {
  const n = deviceName.trim()
  if (isRingModuleAgentSelection(n)) return PLAYBOOK_SLICE_ID_RINGLINE_URLLC
  if (isWaterInjectorAgentSelection(n)) return PLAYBOOK_SLICE_ID_FILLER_URLLC
  if (isRotaryFeedModuleAgentSelection(n)) return PLAYBOOK_SLICE_ID_ROTARY_URLLC
  if (isMaterialPushModuleAgentSelection(n)) return PLAYBOOK_SLICE_ID_PUSHER_URLLC
  if (isPositioningPushModuleAgentSelection(n)) return PLAYBOOK_SLICE_ID_POS_PUSHER_URLLC
  if (isIndustrialCameraAgentSelection(n)) return PLAYBOOK_SLICE_ID_VISION_EMBB
  if (isPneumaticGripperModuleAgentSelection(n)) return PLAYBOOK_SLICE_ID_GRIPPER_URLLC
  if (isEdgeComputeUnitModuleAgentSelection(n)) return PLAYBOOK_SLICE_ID_EDGE_COMPUTE
  if (isRobotArmModuleAgentSelection(n)) return PLAYBOOK_SLICE_ID_ROBOT_URLLC
  const { tag } = deviceLabelAndTag(n, PLAYBOOK_SLICE_BODY.displayName)
  return demoPlaybookDerivedSliceIdFromTag(tag)
}

/** VN id for MEC rule match / VN Agent when using generic device-derived bundle. */
export function demoAgentVnIdForDeviceName(deviceName: string): string {
  const n = deviceName.trim()
  if (isRingModuleAgentSelection(n)) return 'vn-ring-lan'
  if (isWaterInjectorAgentSelection(n)) return 'vn-filler-lan'
  if (isRotaryFeedModuleAgentSelection(n)) return 'vn-rotary-lan'
  if (isMaterialPushModuleAgentSelection(n)) return 'vn-pusher-lan'
  if (isPositioningPushModuleAgentSelection(n)) return 'vn-pos-pusher-lan'
  if (isIndustrialCameraAgentSelection(n)) return 'vn-vision-lan'
  if (isPneumaticGripperModuleAgentSelection(n)) return 'vn-gripper-lan'
  if (isEdgeComputeUnitModuleAgentSelection(n)) return 'vn-edge-compute-lan'
  if (isRobotArmModuleAgentSelection(n)) return 'vn-line1'
  const { tag } = deviceLabelAndTag(n, PLAYBOOK_SLICE_BODY.displayName)
  return vnAgentBundleIdFromTag(tag)
}

/** Slice ID that must exist before RedCap / VN Agent posts (depends on device preset). */
export function playbookRequiredLinkedSliceId(deviceName?: string): string {
  const n = deviceName?.trim()
  if (!n) return PLAYBOOK_SLICE_ID_ROBOT_URLLC
  return demoAgentSliceIdForDeviceName(n)
}

export const PLAYBOOK_REDCAP_DEVICE_BODY = {
  alias: '1号线-高速机械臂A',
  supi: 'imsi-460001234560001',
  imeisv: '867400012345671',
  sliceId: 'slice-robot-urllc',
  vnId: 'vn-line1',
  ipAddress: '10.45.1.55',
  rrcState: 'RRC_CONNECTED',
  signalQuality: 'RSRP -65 dBm',
  trafficMb: 12054,
  powerProfileId: PLAYBOOK_POWER_PROFILE_DISABLE,
}

/** 《5G-A数据.md》高速环形线 — 连接新终端. */
export const PLAYBOOK_REDCAP_DEVICE_BODY_RINGLINE = {
  alias: '环形模块',
  supi: 'imsi-460001234560101',
  imeisv: '867400012345881',
  sliceId: PLAYBOOK_SLICE_ID_RINGLINE_URLLC,
  vnId: 'vn-ring-lan',
  ipAddress: '10.46.1.11',
  rrcState: 'RRC_CONNECTED',
  signalQuality: 'RSRP -70 dBm',
  trafficMb: 342,
  powerProfileId: PLAYBOOK_POWER_PROFILE_DISABLE,
}

/** 《5G-A数据.md》灌装注水机 — 连接新终端. */
export const PLAYBOOK_REDCAP_DEVICE_BODY_FILLER = {
  alias: '3号线-高精度注水控制阀#A',
  supi: 'imsi-460001234560201',
  imeisv: '867400012345991',
  sliceId: PLAYBOOK_SLICE_ID_FILLER_URLLC,
  vnId: 'vn-filler-lan',
  ipAddress: '10.47.1.15',
  rrcState: 'RRC_CONNECTED',
  signalQuality: 'RSRP -68 dBm',
  trafficMb: 56,
  powerProfileId: PLAYBOOK_POWER_PROFILE_DISABLE,
}

/** 《5G-A数据.md》高速旋转供料 — 连接新终端. */
export const PLAYBOOK_REDCAP_DEVICE_BODY_ROTARY = {
  alias: '2号线-高速星轮理料盘#01',
  supi: 'imsi-460001234560301',
  imeisv: '867400012345331',
  sliceId: PLAYBOOK_SLICE_ID_ROTARY_URLLC,
  vnId: 'vn-rotary-lan',
  ipAddress: '10.48.1.22',
  rrcState: 'RRC_CONNECTED',
  signalQuality: 'RSRP -62 dBm',
  trafficMb: 128,
  powerProfileId: PLAYBOOK_POWER_PROFILE_DISABLE,
}

/** 《5G-A数据.md》高速物料推送 — 连接新终端. */
export const PLAYBOOK_REDCAP_DEVICE_BODY_PUSHER = {
  alias: '4号线-高速分拣剔除推杆#A',
  supi: 'imsi-460001234560401',
  imeisv: '867400012345441',
  sliceId: PLAYBOOK_SLICE_ID_PUSHER_URLLC,
  vnId: 'vn-pusher-lan',
  ipAddress: '10.49.1.30',
  rrcState: 'RRC_CONNECTED',
  signalQuality: 'RSRP -66 dBm',
  trafficMb: 45,
  powerProfileId: PLAYBOOK_POWER_PROFILE_DISABLE,
}

/** 《5G-A数据.md》视觉定位与伺服推送 — 连接新终端. */
export const PLAYBOOK_REDCAP_DEVICE_BODY_POS_PUSHER = {
  alias: '5号线-高精定位伺服推杆#01',
  supi: 'imsi-460001234560501',
  imeisv: '867400012345551',
  sliceId: PLAYBOOK_SLICE_ID_POS_PUSHER_URLLC,
  vnId: 'vn-pos-pusher-lan',
  ipAddress: '10.50.1.45',
  rrcState: 'RRC_CONNECTED',
  signalQuality: 'RSRP -64 dBm',
  trafficMb: 4850,
  powerProfileId: PLAYBOOK_POWER_PROFILE_DISABLE,
}

/** 《5G-A数据.md》工业相机大上行 — 连接新终端. */
export const PLAYBOOK_REDCAP_DEVICE_BODY_VISION_EMBB = {
  alias: '工业相机',
  supi: 'imsi-460001234560601',
  imeisv: '867400012345661',
  sliceId: PLAYBOOK_SLICE_ID_VISION_EMBB,
  vnId: 'vn-vision-lan',
  ipAddress: '10.51.1.80',
  rrcState: 'RRC_CONNECTED',
  signalQuality: 'RSRP -60 dBm',
  trafficMb: 285_040,
  powerProfileId: PLAYBOOK_POWER_PROFILE_DISABLE,
}

/** 《5G-A数据.md》气动伸缩夹爪 — 连接新终端. */
export const PLAYBOOK_REDCAP_DEVICE_BODY_GRIPPER = {
  alias: '气动伸缩夹爪',
  supi: 'imsi-460001234560701',
  imeisv: '867400012345771',
  sliceId: PLAYBOOK_SLICE_ID_GRIPPER_URLLC,
  vnId: 'vn-gripper-lan',
  ipAddress: '10.52.1.25',
  rrcState: 'RRC_CONNECTED',
  signalQuality: 'RSRP -65 dBm',
  trafficMb: 42,
  powerProfileId: PLAYBOOK_POWER_PROFILE_DISABLE,
}

/** 《5G-A数据.md》边缘计算单元 — 连接新终端（IMEISV 与文档字面量一致）。 */
export const PLAYBOOK_REDCAP_DEVICE_BODY_EDGE_COMPUTE = {
  alias: '边缘计算单元',
  supi: 'imsi-460001234560901',
  imeisv: '867400012345991',
  sliceId: PLAYBOOK_SLICE_ID_EDGE_COMPUTE,
  vnId: 'vn-edge-compute-lan',
  ipAddress: '10.54.1.100',
  rrcState: 'RRC_CONNECTED',
  signalQuality: 'RSRP -58 dBm',
  trafficMb: 1_540_200,
  powerProfileId: PLAYBOOK_POWER_PROFILE_DISABLE,
}

export const PLAYBOOK_MEC_NODE_BODY = {
  nodeName: '机械臂控制边缘节点',
  n6LocalEndpoint: '10.10.2.10:2152',
  dnnIds: ['dnn-robot.private'],
  capabilityTags: ['N6_BREAKOUT', 'uRLLC_Optimized'],
  healthProbe: 'http://10.10.2.10:8080/health',
}

/** 《5G-A数据.md》高速环形线 — 注册节点. */
export const PLAYBOOK_MEC_NODE_BODY_RINGLINE = {
  nodeName: '环形线全局协同控制边缘节点',
  n6LocalEndpoint: '10.10.3.10:2152',
  dnnIds: ['dnn-ringline.private'],
  capabilityTags: ['N6_BREAKOUT', 'uRLLC_Optimized', 'L2_Bridging'],
  healthProbe: 'http://10.10.3.10:8080/health_ring',
}

/** 《5G-A数据.md》灌装注水机 — 注册节点. */
export const PLAYBOOK_MEC_NODE_BODY_FILLER = {
  nodeName: '灌装液位检测与阀门控制边缘网关',
  n6LocalEndpoint: '10.10.4.10:2152',
  dnnIds: ['dnn-filler.private'],
  capabilityTags: ['N6_BREAKOUT', 'uRLLC_Optimized', 'L2_Bridging'],
  healthProbe: 'http://10.10.4.10:8080/health_filler',
}

/** 《5G-A数据.md》高速旋转供料 — 注册节点. */
export const PLAYBOOK_MEC_NODE_BODY_ROTARY = {
  nodeName: '供料相位同步与检测边缘网关',
  n6LocalEndpoint: '10.10.5.10:2152',
  dnnIds: ['dnn-rotary-feeder.private'],
  capabilityTags: ['N6_BREAKOUT', 'uRLLC_Optimized', 'L2_Bridging'],
  healthProbe: 'http://10.10.5.10:8080/health_rotary',
}

/** 《5G-A数据.md》高速物料推送 — 注册节点. */
export const PLAYBOOK_MEC_NODE_BODY_PUSHER = {
  nodeName: '物料分流与剔除控制边缘网关',
  n6LocalEndpoint: '10.10.6.10:2152',
  dnnIds: ['dnn-pusher.private'],
  capabilityTags: ['N6_BREAKOUT', 'uRLLC_Optimized', 'L2_Bridging'],
  healthProbe: 'http://10.10.6.10:8080/health_pusher',
}

/** 《5G-A数据.md》视觉定位与伺服推送 — 注册节点（文档能力标签无 L2_Bridging）. */
export const PLAYBOOK_MEC_NODE_BODY_POS_PUSHER = {
  nodeName: '视觉定位与伺服推送协同',
  n6LocalEndpoint: '10.10.7.10:2152',
  dnnIds: ['dnn-pos-pusher.private'],
  capabilityTags: ['N6_BREAKOUT', 'uRLLC_Optimized', 'Edge_Computing_Vision'],
  healthProbe: 'http://10.10.7.10:8080/health_pos',
}

/** 《5G-A数据.md》工业相机大上行 — 注册节点. */
export const PLAYBOOK_MEC_NODE_BODY_VISION_EMBB = {
  nodeName: '工业相机边缘算力节点',
  n6LocalEndpoint: '10.10.8.10:2152',
  dnnIds: ['dnn-vision.private'],
  capabilityTags: ['N6_BREAKOUT', 'Massive_Uplink', 'Edge_AI_GPU'],
  healthProbe: 'http://10.10.8.10:8080/health_camera',
}

/** 《5G-A数据.md》气动伸缩夹爪 — 注册节点. */
export const PLAYBOOK_MEC_NODE_BODY_GRIPPER = {
  nodeName: '气动伸缩夹爪控制边缘网关',
  n6LocalEndpoint: '10.10.9.10:2152',
  dnnIds: ['dnn-gripper.private'],
  capabilityTags: ['N6_BREAKOUT', 'uRLLC_Optimized', 'L2_Bridging'],
  healthProbe: 'http://10.10.9.10:8080/health_gripper',
}

/** 《5G-A数据.md》边缘计算单元 — 注册节点. */
export const PLAYBOOK_MEC_NODE_BODY_EDGE_COMPUTE = {
  nodeName: '边缘计算单元算力分流网关',
  n6LocalEndpoint: '10.10.11.10:2152',
  dnnIds: ['dnn-edge-compute.private'],
  capabilityTags: ['N6_BREAKOUT', 'Edge_Computing_GPU', 'Data_Aggregation'],
  healthProbe: 'http://10.10.11.10:8080/health_edge',
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
    vnId: 'vn-line1',
  },
  action: {
    actionType: 'LOCAL_BREAKOUT' as const,
    nextHop: '10.10.2.10',
    bypassPublicNetwork: true,
  },
}

/** 《5G-A数据.md》高速环形线 — 新建规则（UDP+TCP → protocol ANY）. */
export const PLAYBOOK_MEC_RULE_BODY_RINGLINE = {
  priority: 10,
  name: '环线动子位置反馈极速卸载',
  enabled: true,
  match: {
    destIpCidrs: ['10.46.2.0/24'],
    srcIpCidrs: [] as string[],
    protocol: 'ANY' as const,
    portRanges: ['34964', '17222'],
    vnId: 'vn-ring-lan',
  },
  action: {
    actionType: 'LOCAL_BREAKOUT' as const,
    nextHop: '10.10.3.10',
    bypassPublicNetwork: true,
  },
}

/** 《5G-A数据.md》灌装注水机 — 新建规则（TCP+UDP → match protocol ANY）. */
export const PLAYBOOK_MEC_RULE_BODY_FILLER = {
  priority: 15,
  name: '注水启停指令与传感回传极速卸载',
  enabled: true,
  match: {
    destIpCidrs: ['10.47.2.0/24'],
    srcIpCidrs: [] as string[],
    protocol: 'ANY' as const,
    portRanges: ['502', '102'],
    vnId: 'vn-filler-lan',
  },
  action: {
    actionType: 'LOCAL_BREAKOUT' as const,
    nextHop: '10.10.4.10',
    bypassPublicNetwork: true,
  },
}

/** 《5G-A数据.md》高速旋转供料 — 新建规则（UDP+TCP → protocol ANY）. */
export const PLAYBOOK_MEC_RULE_BODY_ROTARY = {
  priority: 18,
  name: '多轴伺服运动控制极速卸载',
  enabled: true,
  match: {
    destIpCidrs: ['10.48.2.0/24'],
    srcIpCidrs: [] as string[],
    protocol: 'ANY' as const,
    portRanges: ['2222', '34964'],
    vnId: 'vn-rotary-lan',
  },
  action: {
    actionType: 'LOCAL_BREAKOUT' as const,
    nextHop: '10.10.5.10',
    bypassPublicNetwork: true,
  },
}

/** 《5G-A数据.md》高速物料推送 — 新建规则（UDP+TCP → protocol ANY，端口顺序同文档）. */
export const PLAYBOOK_MEC_RULE_BODY_PUSHER = {
  priority: 12,
  name: '高速推杆 I/O 触发指令极速卸载',
  enabled: true,
  match: {
    destIpCidrs: ['10.49.2.0/24'],
    srcIpCidrs: [] as string[],
    protocol: 'ANY' as const,
    portRanges: ['34964', '502'],
    vnId: 'vn-pusher-lan',
  },
  action: {
    actionType: 'LOCAL_BREAKOUT' as const,
    nextHop: '10.10.6.10',
    bypassPublicNetwork: true,
  },
}

/** 《5G-A数据.md》视觉定位与伺服推送 — 新建规则（UDP+TCP → protocol ANY，端口顺序同文档）. */
export const PLAYBOOK_MEC_RULE_BODY_POS_PUSHER = {
  priority: 14,
  name: '视觉定位流与伺服指令本地融合卸载',
  enabled: true,
  match: {
    destIpCidrs: ['10.50.2.0/24'],
    srcIpCidrs: [] as string[],
    protocol: 'ANY' as const,
    portRanges: ['3956', '34964'],
    vnId: 'vn-pos-pusher-lan',
  },
  action: {
    actionType: 'LOCAL_BREAKOUT' as const,
    nextHop: '10.10.7.10',
    bypassPublicNetwork: true,
  },
}

/** 《5G-A数据.md》工业相机大上行 — 新建规则（UDP+TCP → protocol ANY，端口顺序同文档）. */
export const PLAYBOOK_MEC_RULE_BODY_VISION_EMBB = {
  priority: 30,
  name: '工业相机图像流本地卸载',
  enabled: true,
  match: {
    destIpCidrs: ['10.51.2.0/24'],
    srcIpCidrs: [] as string[],
    protocol: 'ANY' as const,
    portRanges: ['3956', '554', '8081'],
    vnId: 'vn-vision-lan',
  },
  action: {
    actionType: 'LOCAL_BREAKOUT' as const,
    nextHop: '10.10.8.10',
    bypassPublicNetwork: true,
  },
}

/** 《5G-A数据.md》气动伸缩夹爪 — 新建规则（UDP+TCP → protocol ANY，端口顺序同文档）. */
export const PLAYBOOK_MEC_RULE_BODY_GRIPPER = {
  priority: 16,
  name: '气动伸缩夹爪开闭指令本地卸载',
  enabled: true,
  match: {
    destIpCidrs: ['10.52.2.0/24'],
    srcIpCidrs: [] as string[],
    protocol: 'ANY' as const,
    portRanges: ['34964', '502'],
    vnId: 'vn-gripper-lan',
  },
  action: {
    actionType: 'LOCAL_BREAKOUT' as const,
    nextHop: '10.10.9.10',
    bypassPublicNetwork: true,
  },
}

/** 《5G-A数据.md》边缘计算单元 — 新建规则（UDP+TCP → protocol ANY，端口顺序同文档）. */
export const PLAYBOOK_MEC_RULE_BODY_EDGE_COMPUTE = {
  priority: 5,
  name: '边缘计算单元 IT/OT 异构数据极速卸载',
  enabled: true,
  match: {
    destIpCidrs: ['10.54.2.0/24'],
    srcIpCidrs: [] as string[],
    protocol: 'ANY' as const,
    portRanges: ['1883', '9092', '4840'],
    vnId: 'vn-edge-compute-lan',
  },
  action: {
    actionType: 'LOCAL_BREAKOUT' as const,
    nextHop: '10.10.11.10',
    bypassPublicNetwork: true,
  },
}

export const PLAYBOOK_VN_BODY = {
  id: 'vn-line1',
  displayName: '装箱码垛机械臂 PROFINET 专网',
  technicalId: '5glan-vn-line1',
  linkedSliceId: 'slice-robot-urllc',
  ethernetPduAllowed: true,
  broadcastPolicy: 'ALLOW' as const,
  multicastPolicy: 'LIMITED' as const,
  memberIds: [] as string[],
}

/** 《5G-A数据.md》高速环形线 — 新建 VN 组. */
export const PLAYBOOK_VN_BODY_RINGLINE = {
  id: 'vn-ring-lan',
  displayName: '高速环形线 PROFINET RT/IRT 专网',
  technicalId: '5glan-vn-ring-lan',
  linkedSliceId: PLAYBOOK_SLICE_ID_RINGLINE_URLLC,
  ethernetPduAllowed: true,
  broadcastPolicy: 'ALLOW' as const,
  multicastPolicy: 'ALLOW' as const,
  memberIds: ['imsi-460001234560101', 'imsi-460001234560102', 'imsi-460001234560103'],
}

/** 《5G-A数据.md》灌装注水机场景 — 新建 VN 组（memberIds 为文档 SUPI 列表）. */
export const PLAYBOOK_VN_BODY_FILLER = {
  id: 'vn-filler-lan',
  displayName: '高精度灌装线 Modbus/PROFINET 融合专网',
  technicalId: '5glan-vn-filler-lan',
  linkedSliceId: PLAYBOOK_SLICE_ID_FILLER_URLLC,
  ethernetPduAllowed: true,
  broadcastPolicy: 'ALLOW' as const,
  multicastPolicy: 'ALLOW' as const,
  memberIds: ['imsi-460001234560201', 'imsi-460001234560202'],
}

/** 《5G-A数据.md》高速旋转供料 — 新建 VN 组. */
export const PLAYBOOK_VN_BODY_ROTARY = {
  id: 'vn-rotary-lan',
  displayName: '旋转供料运动控制 CIP Motion/PN 专网',
  technicalId: '5glan-vn-rotary-lan',
  linkedSliceId: PLAYBOOK_SLICE_ID_ROTARY_URLLC,
  ethernetPduAllowed: true,
  broadcastPolicy: 'ALLOW' as const,
  multicastPolicy: 'ALLOW' as const,
  memberIds: ['imsi-460001234560301', 'imsi-460001234560302'],
}

/** 《5G-A数据.md》高速物料推送 — 新建 VN 组. */
export const PLAYBOOK_VN_BODY_PUSHER = {
  id: 'vn-pusher-lan',
  displayName: '高速推杆阀门岛 PROFINET/Modbus 专网',
  technicalId: '5glan-vn-pusher-lan',
  linkedSliceId: PLAYBOOK_SLICE_ID_PUSHER_URLLC,
  ethernetPduAllowed: true,
  broadcastPolicy: 'ALLOW' as const,
  multicastPolicy: 'ALLOW' as const,
  memberIds: ['imsi-460001234560401', 'imsi-460001234560402'],
}

/** 《5G-A数据.md》视觉定位与伺服推送 — 新建 VN 组. */
export const PLAYBOOK_VN_BODY_POS_PUSHER = {
  id: 'vn-pos-pusher-lan',
  displayName: '定位推送 GigE/PROFINET 融合专网',
  technicalId: '5glan-vn-pos-pusher-lan',
  linkedSliceId: PLAYBOOK_SLICE_ID_POS_PUSHER_URLLC,
  ethernetPduAllowed: true,
  broadcastPolicy: 'ALLOW' as const,
  multicastPolicy: 'ALLOW' as const,
  memberIds: ['imsi-460001234560501', 'imsi-460001234560502'],
}

/** 《5G-A数据.md》工业相机大上行 — 新建 VN 组. */
export const PLAYBOOK_VN_BODY_VISION_EMBB = {
  id: 'vn-vision-lan',
  displayName: '工业相机专属专网',
  technicalId: '5glan-vn-vision-lan',
  linkedSliceId: PLAYBOOK_SLICE_ID_VISION_EMBB,
  ethernetPduAllowed: true,
  broadcastPolicy: 'ALLOW' as const,
  multicastPolicy: 'ALLOW' as const,
  memberIds: ['imsi-460001234560601', 'imsi-460001234560602'],
}

/** 《5G-A数据.md》气动伸缩夹爪 — 新建 VN 组. */
export const PLAYBOOK_VN_BODY_GRIPPER = {
  id: 'vn-gripper-lan',
  displayName: '气动伸缩夹爪专属专网',
  technicalId: '5glan-vn-gripper-lan',
  linkedSliceId: PLAYBOOK_SLICE_ID_GRIPPER_URLLC,
  ethernetPduAllowed: true,
  broadcastPolicy: 'ALLOW' as const,
  multicastPolicy: 'ALLOW' as const,
  memberIds: ['imsi-460001234560701', 'imsi-460001234560702'],
}

/** 《5G-A数据.md》边缘计算单元 — 新建 VN 组（成员仅文档所列 SUPI）. */
export const PLAYBOOK_VN_BODY_EDGE_COMPUTE = {
  id: 'vn-edge-compute-lan',
  displayName: '边缘计算单元算力协同专属专网',
  technicalId: '5glan-vn-edge-compute-lan',
  linkedSliceId: PLAYBOOK_SLICE_ID_EDGE_COMPUTE,
  ethernetPduAllowed: true,
  broadcastPolicy: 'ALLOW' as const,
  multicastPolicy: 'ALLOW' as const,
  memberIds: ['imsi-460001234560901'],
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

export function slicePlaybookRowsFromBody(b: DemoAgentSliceBody): PlaybookFieldRow[] {
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
export function buildSliceBodyFromDeviceName(deviceName: string): DemoAgentSliceBody {
  if (isRingModuleAgentSelection(deviceName)) {
    return { ...PLAYBOOK_SLICE_BODY_RINGLINE }
  }
  if (isWaterInjectorAgentSelection(deviceName)) {
    return { ...PLAYBOOK_SLICE_BODY_FILLER }
  }
  if (isRotaryFeedModuleAgentSelection(deviceName)) {
    return { ...PLAYBOOK_SLICE_BODY_ROTARY }
  }
  if (isMaterialPushModuleAgentSelection(deviceName)) {
    return { ...PLAYBOOK_SLICE_BODY_PUSHER }
  }
  if (isPositioningPushModuleAgentSelection(deviceName)) {
    return { ...PLAYBOOK_SLICE_BODY_POS_PUSHER }
  }
  if (isIndustrialCameraAgentSelection(deviceName)) {
    return { ...PLAYBOOK_SLICE_BODY_VISION_EMBB }
  }
  if (isPneumaticGripperModuleAgentSelection(deviceName)) {
    return { ...PLAYBOOK_SLICE_BODY_GRIPPER }
  }
  if (isEdgeComputeUnitModuleAgentSelection(deviceName)) {
    return { ...PLAYBOOK_SLICE_BODY_EDGE_COMPUTE }
  }
  if (isRobotArmModuleAgentSelection(deviceName)) {
    const { label } = deviceLabelAndTag(deviceName, PLAYBOOK_SLICE_BODY.displayName)
    return {
      ...PLAYBOOK_SLICE_BODY,
      displayName: `${label} · uRLLC 协同切片`,
      description: `面向「${label}」产线场景的极低时延与高可靠网络切片（Agent 根据设备名生成的草案）。`,
    }
  }
  const { label, tag } = deviceLabelAndTag(deviceName, PLAYBOOK_SLICE_BODY.displayName)
  return {
    ...PLAYBOOK_SLICE_BODY,
    id: demoPlaybookDerivedSliceIdFromTag(tag),
    sd: demoPlaybookDerivedSdHexFromTag(tag),
    displayName: `${label} · uRLLC 协同切片`,
    description: `面向「${label}」产线场景的极低时延与高可靠网络切片（Agent 根据设备名生成的草案）。`,
    memberGroupIds: [`grp-${tag}`],
  }
}

/** Log lines for the “generate from device name” step (slice Agent). */
export function scriptSliceGenerateFromDevice(deviceName: string): string[] {
  const label = deviceName.trim()
  if (isRingModuleAgentSelection(deviceName)) {
    return [
      `[Agent] 解析设备名「${label}」…`,
      '[Agent] 匹配《5G-A数据》高速环形线 uRLLC：SST=2，SD=020888，DNN=dnn-ringline.private',
      '[Agent] 映射 QoS：GBR 30/30 Mbps，MBR 100/100 Mbps，AMBR 300 Mbps，5QI=82，ARP=高，成员 grp-ring-movers',
      '[Agent] 冻结切片 ID slice-ringline-urllc（与 vn-ring-lan / 动子 SUPI 章节一致）…',
    ]
  }
  if (isWaterInjectorAgentSelection(deviceName)) {
    return [
      `[Agent] 解析设备名「${label}」…`,
      '[Agent] 匹配《5G-A数据》高精度灌装注水机 uRLLC：SST=2，SD=020999，DNN=dnn-filler.private',
      '[Agent] 映射 QoS：GBR 10/10 Mbps，MBR 30/30 Mbps，AMBR 100 Mbps，5QI=82，ARP=高，成员 grp-liquid-fillers',
      '[Agent] 冻结切片 ID slice-filler-urllc（与机械臂种子 slice-robot-urllc 隔离）…',
    ]
  }
  if (isRotaryFeedModuleAgentSelection(deviceName)) {
    return [
      `[Agent] 解析设备名「${label}」…`,
      '[Agent] 匹配《5G-A数据》高速旋转供料 uRLLC：SST=2，SD=020777，DNN=dnn-rotary-feeder.private',
      '[Agent] 映射 QoS：GBR 15/15 Mbps，MBR 40/40 Mbps，AMBR 150 Mbps，5QI=82，ARP=高，成员 grp-rotary-feeders',
      '[Agent] 冻结切片 ID slice-rotary-urllc（与 vn-rotary-lan / SUPI …0301 章节一致）…',
    ]
  }
  if (isMaterialPushModuleAgentSelection(deviceName)) {
    return [
      `[Agent] 解析设备名「${label}」…`,
      '[Agent] 匹配《5G-A数据》高速物料推送协同 uRLLC：SST=2，SD=020555，DNN=dnn-pusher.private',
      '[Agent] 映射 QoS：GBR 10/10 Mbps，MBR 25/25 Mbps，AMBR 100 Mbps，5QI=82，ARP=高，成员 grp-material-pushers',
      '[Agent] 冻结切片 ID slice-pusher-urllc（与 vn-pusher-lan / SUPI …0401 章节一致）…',
    ]
  }
  if (isPositioningPushModuleAgentSelection(deviceName)) {
    return [
      `[Agent] 解析设备名「${label}」…`,
      '[Agent] 匹配《5G-A数据》视觉定位与伺服推送协同 uRLLC：SST=2，SD=020444，DNN=dnn-pos-pusher.private',
      '[Agent] 映射 QoS：GBR 上行50/下行15 Mbps，MBR 150/40 Mbps，AMBR 300 Mbps，5QI=80，ARP=高，成员 grp-pos-pushers',
      '[Agent] 冻结切片 ID slice-pos-pusher-urllc（与 vn-pos-pusher-lan / SUPI …0501 章节一致）…',
    ]
  }
  if (isIndustrialCameraAgentSelection(deviceName)) {
    return [
      `[Agent] 解析设备名「${label}」…`,
      '[Agent] 匹配《5G-A数据》工业相机大上行切片：SST=1（eMBB），SD=010888，DNN=dnn-vision.private',
      '[Agent] 映射 QoS：GBR 上行150/下行10 Mbps，MBR 300/50 Mbps，AMBR 500 Mbps，5QI=80，ARP=中，成员 grp-ai-cameras',
      '[Agent] 冻结切片 ID slice-vision-embb（与 vn-vision-lan / SUPI …0601 章节一致）…',
    ]
  }
  if (isPneumaticGripperModuleAgentSelection(deviceName)) {
    return [
      `[Agent] 解析设备名「${label}」…`,
      '[Agent] 匹配《5G-A数据》气动伸缩夹爪协同 uRLLC：SST=2，SD=020333，DNN=dnn-gripper.private',
      '[Agent] 映射 QoS：GBR 10/10 Mbps，MBR 25/25 Mbps，AMBR 100 Mbps，5QI=82，ARP=高，成员 grp-pneumatic-grippers',
      '[Agent] 冻结切片 ID slice-gripper-urllc（与 vn-gripper-lan / SUPI …0701 章节一致）…',
    ]
  }
  if (isEdgeComputeUnitModuleAgentSelection(deviceName)) {
    return [
      `[Agent] 解析设备名「${label}」…`,
      '[Agent] 匹配《5G-A数据》边缘计算单元协同专属切片：SST=2，SD=020111，DNN=dnn-edge-compute.private',
      '[Agent] 映射 QoS：GBR 200/200 Mbps，MBR 1000/1000 Mbps，AMBR 2000 Mbps，5QI=80，ARP=高，成员 grp-edge-compute',
      '[Agent] 冻结切片 ID slice-edge-compute（与 vn-edge-compute-lan / SUPI …0901 章节一致）…',
    ]
  }
  if (isRobotArmModuleAgentSelection(deviceName)) {
    return [
      `[Agent] 解析设备名「${label}」…`,
      '[Agent] 匹配《5G-A数据》机械臂 uRLLC 场景，对齐演示种子 slice-robot-urllc…',
      '[Agent] S-NSSAI 2-020666，DNN dnn-robot.private，后续 VN 关联 vn-line1…',
    ]
  }
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
    { label: 'VN ID', value: b.vnId ?? '' },
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
  if (isRingModuleAgentSelection(deviceName)) {
    return { ...PLAYBOOK_REDCAP_DEVICE_BODY_RINGLINE }
  }
  if (isWaterInjectorAgentSelection(deviceName)) {
    return { ...PLAYBOOK_REDCAP_DEVICE_BODY_FILLER }
  }
  if (isRotaryFeedModuleAgentSelection(deviceName)) {
    return { ...PLAYBOOK_REDCAP_DEVICE_BODY_ROTARY }
  }
  if (isMaterialPushModuleAgentSelection(deviceName)) {
    return { ...PLAYBOOK_REDCAP_DEVICE_BODY_PUSHER }
  }
  if (isPositioningPushModuleAgentSelection(deviceName)) {
    return { ...PLAYBOOK_REDCAP_DEVICE_BODY_POS_PUSHER }
  }
  if (isIndustrialCameraAgentSelection(deviceName)) {
    return { ...PLAYBOOK_REDCAP_DEVICE_BODY_VISION_EMBB }
  }
  if (isPneumaticGripperModuleAgentSelection(deviceName)) {
    return { ...PLAYBOOK_REDCAP_DEVICE_BODY_GRIPPER }
  }
  if (isEdgeComputeUnitModuleAgentSelection(deviceName)) {
    return { ...PLAYBOOK_REDCAP_DEVICE_BODY_EDGE_COMPUTE }
  }
  if (isRobotArmModuleAgentSelection(deviceName)) {
    return { ...PLAYBOOK_REDCAP_DEVICE_BODY }
  }
  const { label, tag } = deviceLabelAndTag(deviceName, PLAYBOOK_REDCAP_DEVICE_BODY.alias)
  const h = fingerprint(tag)
  const supiSuffix = String((h % 900) + 100).padStart(3, '0')
  const imeiSuffix = String((fingerprint(tag + 'i') % 900) + 100).padStart(3, '0')
  const ipThird = 1 + (h % 80)
  const ipFourth = 20 + (fingerprint(tag + 'p') % 180)
  return {
    ...PLAYBOOK_REDCAP_DEVICE_BODY,
    sliceId: demoPlaybookDerivedSliceIdFromTag(tag),
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
  if (isRingModuleAgentSelection(deviceName)) {
    return [
      `[Agent] 解析现场设备「${label}」…`,
      '[Agent] 匹配《5G-A数据》环形线「连接新终端」：环形模块…',
      '[Agent] 绑定 slice-ringline-urllc、vn-ring-lan、SUPI imsi-460001234560101、流量 342 MB…',
    ]
  }
  if (isWaterInjectorAgentSelection(deviceName)) {
    return [
      `[Agent] 解析现场设备「${label}」…`,
      '[Agent] 匹配《5G-A数据》灌装注水机「连接新终端」参数…',
      '[Agent] 绑定 slice-filler-urllc、vn-filler-lan（与 slice-robot-urllc 种子隔离）…',
    ]
  }
  if (isRotaryFeedModuleAgentSelection(deviceName)) {
    return [
      `[Agent] 解析现场设备「${label}」…`,
      '[Agent] 匹配《5G-A数据》旋转供料「连接新终端」：2号线-高速星轮理料盘#01…',
      '[Agent] 绑定 slice-rotary-urllc、vn-rotary-lan、SUPI imsi-460001234560301、流量 128 MB…',
    ]
  }
  if (isMaterialPushModuleAgentSelection(deviceName)) {
    return [
      `[Agent] 解析现场设备「${label}」…`,
      '[Agent] 匹配《5G-A数据》物料推送「连接新终端」：4号线-高速分拣剔除推杆#A…',
      '[Agent] 绑定 slice-pusher-urllc、vn-pusher-lan、SUPI imsi-460001234560401、流量 45 MB…',
    ]
  }
  if (isPositioningPushModuleAgentSelection(deviceName)) {
    return [
      `[Agent] 解析现场设备「${label}」…`,
      '[Agent] 匹配《5G-A数据》定位推送「连接新终端」：5号线-高精定位伺服推杆#01…',
      '[Agent] 绑定 slice-pos-pusher-urllc、vn-pos-pusher-lan、SUPI imsi-460001234560501、流量 4850 MB…',
    ]
  }
  if (isIndustrialCameraAgentSelection(deviceName)) {
    return [
      `[Agent] 解析现场设备「${label}」…`,
      '[Agent] 匹配《5G-A数据》工业相机「连接新终端」：别名 工业相机…',
      '[Agent] 绑定 slice-vision-embb、vn-vision-lan、SUPI imsi-460001234560601、流量约 285040 MB…',
    ]
  }
  if (isPneumaticGripperModuleAgentSelection(deviceName)) {
    return [
      `[Agent] 解析现场设备「${label}」…`,
      '[Agent] 匹配《5G-A数据》气动伸缩夹爪「连接新终端」：别名 气动伸缩夹爪…',
      '[Agent] 绑定 slice-gripper-urllc、vn-gripper-lan、SUPI imsi-460001234560701、流量 42 MB…',
    ]
  }
  if (isEdgeComputeUnitModuleAgentSelection(deviceName)) {
    return [
      `[Agent] 解析现场设备「${label}」…`,
      '[Agent] 匹配《5G-A数据》边缘计算单元「连接新终端」：别名 边缘计算单元…',
      '[Agent] 绑定 slice-edge-compute、vn-edge-compute-lan、SUPI imsi-460001234560901、流量约 1540200 MB…',
    ]
  }
  if (isRobotArmModuleAgentSelection(deviceName)) {
    return [
      `[Agent] 解析现场设备「${label}」…`,
      '[Agent] 匹配《5G-A数据》机械臂终端：slice-robot-urllc / vn-line1…',
      '[Agent] 别名与 SUPI 与文档「连接新终端」一致…',
    ]
  }
  return [
    `[Agent] 解析现场设备「${label}」…`,
    '[Agent] 推导 RedCap 终端别名、SUPI、IP 与流量画像草案…',
    `[Agent] 对齐本条设备对应的 Agent 切片 ID（${demoAgentSliceIdForDeviceName(deviceName)}），非种子 slice-robot-urllc…`,
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
  if (isRingModuleAgentSelection(deviceName)) {
    return { ...PLAYBOOK_MEC_NODE_BODY_RINGLINE }
  }
  if (isWaterInjectorAgentSelection(deviceName)) {
    return { ...PLAYBOOK_MEC_NODE_BODY_FILLER }
  }
  if (isRotaryFeedModuleAgentSelection(deviceName)) {
    return { ...PLAYBOOK_MEC_NODE_BODY_ROTARY }
  }
  if (isMaterialPushModuleAgentSelection(deviceName)) {
    return { ...PLAYBOOK_MEC_NODE_BODY_PUSHER }
  }
  if (isPositioningPushModuleAgentSelection(deviceName)) {
    return { ...PLAYBOOK_MEC_NODE_BODY_POS_PUSHER }
  }
  if (isIndustrialCameraAgentSelection(deviceName)) {
    return { ...PLAYBOOK_MEC_NODE_BODY_VISION_EMBB }
  }
  if (isPneumaticGripperModuleAgentSelection(deviceName)) {
    return { ...PLAYBOOK_MEC_NODE_BODY_GRIPPER }
  }
  if (isEdgeComputeUnitModuleAgentSelection(deviceName)) {
    return { ...PLAYBOOK_MEC_NODE_BODY_EDGE_COMPUTE }
  }
  if (isRobotArmModuleAgentSelection(deviceName)) {
    return { ...PLAYBOOK_MEC_NODE_BODY }
  }
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
  if (isRingModuleAgentSelection(deviceName)) {
    return [
      `[Agent] 定位边缘站点设备「${label}」…`,
      '[Agent] 匹配《5G-A数据》环形线全局协同控制边缘节点：10.10.3.10:2152，DNN dnn-ringline.private…',
      '[Agent] 能力标签 N6_BREAKOUT / uRLLC_Optimized / L2_Bridging，健康探测 health_ring…',
    ]
  }
  if (isWaterInjectorAgentSelection(deviceName)) {
    return [
      `[Agent] 定位边缘站点设备「${label}」…`,
      '[Agent] 匹配《5G-A数据》灌装边缘网关：10.10.4.10:2152，DNN dnn-filler.private…',
      '[Agent] 健康探测 health_filler，与环形线/机械臂节点参数隔离…',
    ]
  }
  if (isRotaryFeedModuleAgentSelection(deviceName)) {
    return [
      `[Agent] 定位边缘站点设备「${label}」…`,
      '[Agent] 匹配《5G-A数据》供料相位同步与检测边缘网关：10.10.5.10:2152，DNN dnn-rotary-feeder.private…',
      '[Agent] 能力标签含 L2_Bridging，健康探测 health_rotary…',
    ]
  }
  if (isMaterialPushModuleAgentSelection(deviceName)) {
    return [
      `[Agent] 定位边缘站点设备「${label}」…`,
      '[Agent] 匹配《5G-A数据》物料分流与剔除控制边缘网关：10.10.6.10:2152，DNN dnn-pusher.private…',
      '[Agent] 健康探测 health_pusher…',
    ]
  }
  if (isPositioningPushModuleAgentSelection(deviceName)) {
    return [
      `[Agent] 定位边缘站点设备「${label}」…`,
      '[Agent] 匹配《5G-A数据》视觉定位与伺服推送协同：10.10.7.10:2152，DNN dnn-pos-pusher.private…',
      '[Agent] 能力标签含 Edge_Computing_Vision，健康探测 health_pos…',
    ]
  }
  if (isIndustrialCameraAgentSelection(deviceName)) {
    return [
      `[Agent] 定位边缘站点设备「${label}」…`,
      '[Agent] 匹配《5G-A数据》工业相机边缘算力节点：10.10.8.10:2152，DNN dnn-vision.private…',
      '[Agent] 能力标签 Massive_Uplink / Edge_AI_GPU，健康探测 health_camera…',
    ]
  }
  if (isPneumaticGripperModuleAgentSelection(deviceName)) {
    return [
      `[Agent] 定位边缘站点设备「${label}」…`,
      '[Agent] 匹配《5G-A数据》气动伸缩夹爪控制边缘网关：10.10.9.10:2152，DNN dnn-gripper.private…',
      '[Agent] 能力标签含 L2_Bridging，健康探测 health_gripper…',
    ]
  }
  if (isEdgeComputeUnitModuleAgentSelection(deviceName)) {
    return [
      `[Agent] 定位边缘站点设备「${label}」…`,
      '[Agent] 匹配《5G-A数据》边缘计算单元算力分流网关：10.10.11.10:2152，DNN dnn-edge-compute.private…',
      '[Agent] 能力标签 Edge_Computing_GPU / Data_Aggregation，健康探测 health_edge…',
    ]
  }
  if (isRobotArmModuleAgentSelection(deviceName)) {
    return [
      `[Agent] 定位边缘站点设备「${label}」…`,
      '[Agent] 匹配《5G-A数据》机械臂控制边缘节点（10.10.2.10:2152）…',
      '[Agent] DNN dnn-robot.private，与 slice-robot-urllc 一致…',
    ]
  }
  return [
    `[Agent] 定位边缘站点设备「${label}」…`,
    '[Agent] 分配 N6 本地点与健康探测路径…',
    '[Agent] 同步 DNN 与 UPF 分流能力标签…',
  ]
}

export function mecRulePlaybookRowsFromBody(
  b:
    | typeof PLAYBOOK_MEC_RULE_BODY
    | typeof PLAYBOOK_MEC_RULE_BODY_RINGLINE
    | typeof PLAYBOOK_MEC_RULE_BODY_FILLER
    | typeof PLAYBOOK_MEC_RULE_BODY_ROTARY
    | typeof PLAYBOOK_MEC_RULE_BODY_PUSHER
    | typeof PLAYBOOK_MEC_RULE_BODY_POS_PUSHER
    | typeof PLAYBOOK_MEC_RULE_BODY_VISION_EMBB
    | typeof PLAYBOOK_MEC_RULE_BODY_GRIPPER
    | typeof PLAYBOOK_MEC_RULE_BODY_EDGE_COMPUTE,
): PlaybookFieldRow[] {
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

export function buildMecRuleBodyFromDeviceName(
  deviceName: string,
):
  | typeof PLAYBOOK_MEC_RULE_BODY
  | typeof PLAYBOOK_MEC_RULE_BODY_RINGLINE
  | typeof PLAYBOOK_MEC_RULE_BODY_FILLER
  | typeof PLAYBOOK_MEC_RULE_BODY_ROTARY
  | typeof PLAYBOOK_MEC_RULE_BODY_PUSHER
  | typeof PLAYBOOK_MEC_RULE_BODY_POS_PUSHER
  | typeof PLAYBOOK_MEC_RULE_BODY_VISION_EMBB
  | typeof PLAYBOOK_MEC_RULE_BODY_GRIPPER
  | typeof PLAYBOOK_MEC_RULE_BODY_EDGE_COMPUTE {
  if (isRingModuleAgentSelection(deviceName)) {
    return { ...PLAYBOOK_MEC_RULE_BODY_RINGLINE }
  }
  if (isWaterInjectorAgentSelection(deviceName)) {
    return { ...PLAYBOOK_MEC_RULE_BODY_FILLER }
  }
  if (isRotaryFeedModuleAgentSelection(deviceName)) {
    return { ...PLAYBOOK_MEC_RULE_BODY_ROTARY }
  }
  if (isMaterialPushModuleAgentSelection(deviceName)) {
    return { ...PLAYBOOK_MEC_RULE_BODY_PUSHER }
  }
  if (isPositioningPushModuleAgentSelection(deviceName)) {
    return { ...PLAYBOOK_MEC_RULE_BODY_POS_PUSHER }
  }
  if (isIndustrialCameraAgentSelection(deviceName)) {
    return { ...PLAYBOOK_MEC_RULE_BODY_VISION_EMBB }
  }
  if (isPneumaticGripperModuleAgentSelection(deviceName)) {
    return { ...PLAYBOOK_MEC_RULE_BODY_GRIPPER }
  }
  if (isEdgeComputeUnitModuleAgentSelection(deviceName)) {
    return { ...PLAYBOOK_MEC_RULE_BODY_EDGE_COMPUTE }
  }
  if (isRobotArmModuleAgentSelection(deviceName)) {
    return { ...PLAYBOOK_MEC_RULE_BODY }
  }
  const { label, tag } = deviceLabelAndTag(deviceName, PLAYBOOK_MEC_RULE_BODY.name)
  const h = fingerprint(tag)
  const vnId = vnAgentBundleIdFromTag(tag)
  return {
    ...PLAYBOOK_MEC_RULE_BODY,
    name: `${label} · 协同卸载`,
    priority: 12 + (h % 48),
    match: {
      ...PLAYBOOK_MEC_RULE_BODY.match,
      vnId,
    },
  }
}

export function scriptMecRuleGenerateFromDevice(deviceName: string): string[] {
  const label = deviceName.trim()
  if (isRingModuleAgentSelection(deviceName)) {
    return [
      `[Agent] 关联业务设备「${label}」…`,
      '[Agent] 匹配《5G-A数据》环线动子位置反馈卸载：优先级 10，目的 10.46.2.0/24，端口 34964/17222，VN vn-ring-lan…',
      '[Agent] 下一跳 10.10.3.10，本地分流，绕过公网…',
    ]
  }
  if (isWaterInjectorAgentSelection(deviceName)) {
    return [
      `[Agent] 关联业务设备「${label}」…`,
      '[Agent] 匹配《5G-A数据》注水启停指令卸载：优先级 15，目的 10.47.2.0/24，端口 502/102，VN vn-filler-lan…',
      '[Agent] 下一跳 10.10.4.10…',
    ]
  }
  if (isRotaryFeedModuleAgentSelection(deviceName)) {
    return [
      `[Agent] 关联业务设备「${label}」…`,
      '[Agent] 匹配《5G-A数据》多轴伺服运动控制极速卸载：优先级 18，目的 10.48.2.0/24，端口 2222/34964，VN vn-rotary-lan…',
      '[Agent] 下一跳 10.10.5.10…',
    ]
  }
  if (isMaterialPushModuleAgentSelection(deviceName)) {
    return [
      `[Agent] 关联业务设备「${label}」…`,
      '[Agent] 匹配《5G-A数据》高速推杆 I/O 触发指令极速卸载：优先级 12，目的 10.49.2.0/24，端口 34964/502，VN vn-pusher-lan…',
      '[Agent] 下一跳 10.10.6.10…',
    ]
  }
  if (isPositioningPushModuleAgentSelection(deviceName)) {
    return [
      `[Agent] 关联业务设备「${label}」…`,
      '[Agent] 匹配《5G-A数据》视觉定位流与伺服指令本地融合卸载：优先级 14，目的 10.50.2.0/24，端口 3956/34964，VN vn-pos-pusher-lan…',
      '[Agent] 下一跳 10.10.7.10…',
    ]
  }
  if (isIndustrialCameraAgentSelection(deviceName)) {
    return [
      `[Agent] 关联业务设备「${label}」…`,
      '[Agent] 匹配《5G-A数据》工业相机图像流本地卸载：优先级 30，目的 10.51.2.0/24，端口 3956/554/8081，VN vn-vision-lan…',
      '[Agent] 下一跳 10.10.8.10…',
    ]
  }
  if (isPneumaticGripperModuleAgentSelection(deviceName)) {
    return [
      `[Agent] 关联业务设备「${label}」…`,
      '[Agent] 匹配《5G-A数据》气动伸缩夹爪开闭指令本地卸载：优先级 16，目的 10.52.2.0/24，端口 34964/502，VN vn-gripper-lan…',
      '[Agent] 下一跳 10.10.9.10…',
    ]
  }
  if (isEdgeComputeUnitModuleAgentSelection(deviceName)) {
    return [
      `[Agent] 关联业务设备「${label}」…`,
      '[Agent] 匹配《5G-A数据》边缘计算单元 IT/OT 异构数据极速卸载：优先级 5，目的 10.54.2.0/24，端口 1883/9092/4840，VN vn-edge-compute-lan…',
      '[Agent] 下一跳 10.10.11.10…',
    ]
  }
  if (isRobotArmModuleAgentSelection(deviceName)) {
    return [
      `[Agent] 关联业务设备「${label}」…`,
      '[Agent] 匹配《5G-A数据》机械臂协同指令卸载：TCP 10.45.2.0/24，VN vn-line1…',
      '[Agent] 下一跳 10.10.2.10…',
    ]
  }
  return [
    `[Agent] 关联业务设备「${label}」…`,
    '[Agent] 继承 TCP 分流匹配与 vn-line1 绑定…',
    '[Agent] 生成规则名与优先级草案…',
  ]
}

export function vnPlaybookRowsFromBody(
  b:
    | typeof PLAYBOOK_VN_BODY
    | typeof PLAYBOOK_VN_BODY_RINGLINE
    | typeof PLAYBOOK_VN_BODY_FILLER
    | typeof PLAYBOOK_VN_BODY_ROTARY
    | typeof PLAYBOOK_VN_BODY_PUSHER
    | typeof PLAYBOOK_VN_BODY_POS_PUSHER
    | typeof PLAYBOOK_VN_BODY_VISION_EMBB
    | typeof PLAYBOOK_VN_BODY_GRIPPER
    | typeof PLAYBOOK_VN_BODY_EDGE_COMPUTE,
): PlaybookFieldRow[] {
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

export function buildVnBodyFromDeviceName(
  deviceName: string,
):
  | typeof PLAYBOOK_VN_BODY
  | typeof PLAYBOOK_VN_BODY_RINGLINE
  | typeof PLAYBOOK_VN_BODY_FILLER
  | typeof PLAYBOOK_VN_BODY_ROTARY
  | typeof PLAYBOOK_VN_BODY_PUSHER
  | typeof PLAYBOOK_VN_BODY_POS_PUSHER
  | typeof PLAYBOOK_VN_BODY_VISION_EMBB
  | typeof PLAYBOOK_VN_BODY_GRIPPER
  | typeof PLAYBOOK_VN_BODY_EDGE_COMPUTE {
  if (isRingModuleAgentSelection(deviceName)) {
    return { ...PLAYBOOK_VN_BODY_RINGLINE }
  }
  if (isWaterInjectorAgentSelection(deviceName)) {
    return { ...PLAYBOOK_VN_BODY_FILLER }
  }
  if (isRotaryFeedModuleAgentSelection(deviceName)) {
    return { ...PLAYBOOK_VN_BODY_ROTARY }
  }
  if (isMaterialPushModuleAgentSelection(deviceName)) {
    return { ...PLAYBOOK_VN_BODY_PUSHER }
  }
  if (isPositioningPushModuleAgentSelection(deviceName)) {
    return { ...PLAYBOOK_VN_BODY_POS_PUSHER }
  }
  if (isIndustrialCameraAgentSelection(deviceName)) {
    return { ...PLAYBOOK_VN_BODY_VISION_EMBB }
  }
  if (isPneumaticGripperModuleAgentSelection(deviceName)) {
    return { ...PLAYBOOK_VN_BODY_GRIPPER }
  }
  if (isEdgeComputeUnitModuleAgentSelection(deviceName)) {
    return { ...PLAYBOOK_VN_BODY_EDGE_COMPUTE }
  }
  if (isRobotArmModuleAgentSelection(deviceName)) {
    const { label } = deviceLabelAndTag(deviceName, PLAYBOOK_VN_BODY.displayName)
    return {
      ...PLAYBOOK_VN_BODY,
      displayName: `${label} · PROFINET 专网`,
    }
  }
  const { label, tag } = deviceLabelAndTag(deviceName, PLAYBOOK_VN_BODY.displayName)
  const bundle = vnAgentBundleIdFromTag(tag)
  const sliceId = demoPlaybookDerivedSliceIdFromTag(tag)
  return {
    ...PLAYBOOK_VN_BODY,
    id: bundle,
    technicalId: `5glan-${bundle}`,
    linkedSliceId: sliceId,
    displayName: `${label} · PROFINET 专网`,
  }
}

export function scriptVnGenerateFromDevice(deviceName: string): string[] {
  const label = deviceName.trim()
  if (isRingModuleAgentSelection(deviceName)) {
    return [
      `[Agent] 解析工业侧设备「${label}」…`,
      '[Agent] 匹配《5G-A数据》高速环形线 PROFINET RT/IRT 专网（vn-ring-lan）…',
      '[Agent] 成员 SUPI …0101/0102/0103，以太网 PDU + 广播/组播允许…',
    ]
  }
  if (isWaterInjectorAgentSelection(deviceName)) {
    return [
      `[Agent] 解析工业侧设备「${label}」…`,
      '[Agent] 匹配《5G-A数据》高精度灌装线 Modbus/PROFINET 融合专网（vn-filler-lan）…',
      '[Agent] 关联 slice-filler-urllc，成员 SUPI …0201/0202…',
    ]
  }
  if (isRotaryFeedModuleAgentSelection(deviceName)) {
    return [
      `[Agent] 解析工业侧设备「${label}」…`,
      '[Agent] 匹配《5G-A数据》旋转供料运动控制 CIP Motion/PN 专网（vn-rotary-lan）…',
      '[Agent] 关联 slice-rotary-urllc，成员 SUPI …0301/0302，以太网 PDU + 广播/组播允许…',
    ]
  }
  if (isMaterialPushModuleAgentSelection(deviceName)) {
    return [
      `[Agent] 解析工业侧设备「${label}」…`,
      '[Agent] 匹配《5G-A数据》高速推杆阀门岛 PROFINET/Modbus 专网（vn-pusher-lan）…',
      '[Agent] 关联 slice-pusher-urllc，成员 SUPI …0401/0402…',
    ]
  }
  if (isPositioningPushModuleAgentSelection(deviceName)) {
    return [
      `[Agent] 解析工业侧设备「${label}」…`,
      '[Agent] 匹配《5G-A数据》定位推送 GigE/PROFINET 融合专网（vn-pos-pusher-lan）…',
      '[Agent] 关联 slice-pos-pusher-urllc，成员 SUPI …0501/0502…',
    ]
  }
  if (isIndustrialCameraAgentSelection(deviceName)) {
    return [
      `[Agent] 解析工业侧设备「${label}」…`,
      '[Agent] 匹配《5G-A数据》工业相机专属专网（vn-vision-lan）…',
      '[Agent] 关联 slice-vision-embb，成员 SUPI …0601/0602…',
    ]
  }
  if (isPneumaticGripperModuleAgentSelection(deviceName)) {
    return [
      `[Agent] 解析工业侧设备「${label}」…`,
      '[Agent] 匹配《5G-A数据》气动伸缩夹爪专属专网（vn-gripper-lan）…',
      '[Agent] 关联 slice-gripper-urllc，成员 SUPI …0701/0702…',
    ]
  }
  if (isEdgeComputeUnitModuleAgentSelection(deviceName)) {
    return [
      `[Agent] 解析工业侧设备「${label}」…`,
      '[Agent] 匹配《5G-A数据》边缘计算单元算力协同专属专网（vn-edge-compute-lan）…',
      '[Agent] 关联 slice-edge-compute，成员 SUPI …0901（与文档一致）…',
    ]
  }
  if (isRobotArmModuleAgentSelection(deviceName)) {
    return [
      `[Agent] 解析工业侧设备「${label}」…`,
      '[Agent] 绑定演示 VN vn-line1 与切片 slice-robot-urllc（《5G-A数据》机械臂专网）…',
      '[Agent] 校验以太网 PDU / 广播 / 组播策略模板…',
    ]
  }
  return [
    `[Agent] 解析工业侧设备「${label}」…`,
    '[Agent] 生成 VN 显示名并绑定派生切片 ID…',
    '[Agent] 校验以太网 PDU / 广播 / 组播策略模板…',
  ]
}

/** Required slice id for RedCap Agent flow (seed + playbook). */
/** Agent 写终端前须存在的切片 ID（与演示种子一致）。 */
export const PLAYBOOK_REQUIRED_SLICE_VISION_EMBB = PLAYBOOK_SLICE_ID_VISION_EMBB

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

/** Dynamic pre-script for slice Agent after device name is known. */
export function scriptSlicePreForAgent(ctx?: { deviceName?: string }): string[] {
  const name = ctx?.deviceName ?? ''
  if (isRingModuleAgentSelection(name)) {
    return [
      '[Agent] 加载《5G-A数据》「高速环形线协同 uRLLC 切片」参数块…',
      '[Agent] 映射 QoS：GBR 30/30 Mbps，MBR 100/100 Mbps，AMBR 300 Mbps，5QI=82，ARP=高，SD=020888',
      '[Agent] DNN dnn-ringline.private，LADN 开启，成员分组 grp-ring-movers',
      '[Agent] 即将 POST /api/slices（slice-ringline-urllc，demo-playbook）',
    ]
  }
  if (isWaterInjectorAgentSelection(name)) {
    return [
      '[Agent] 加载《5G-A数据》「高精度灌装注水机 uRLLC 切片」参数块…',
      '[Agent] 映射 QoS：GBR 10/10 Mbps，MBR 30/30 Mbps，AMBR 100 Mbps，5QI=82，ARP=高，SD=020999',
      '[Agent] DNN dnn-filler.private，LADN 开启，成员分组 grp-liquid-fillers',
      '[Agent] 即将 POST /api/slices（slice-filler-urllc，与 slice-robot-urllc 无冲突）',
    ]
  }
  if (isRotaryFeedModuleAgentSelection(name)) {
    return [
      '[Agent] 加载《5G-A数据》「高速旋转供料协同 uRLLC 切片」参数块…',
      '[Agent] 映射 QoS：GBR 15/15 Mbps，MBR 40/40 Mbps，AMBR 150 Mbps，5QI=82，ARP=高，SD=020777',
      '[Agent] DNN dnn-rotary-feeder.private，LADN 开启，成员分组 grp-rotary-feeders',
      '[Agent] 即将 POST /api/slices（slice-rotary-urllc，demo-playbook）',
    ]
  }
  if (isMaterialPushModuleAgentSelection(name)) {
    return [
      '[Agent] 加载《5G-A数据》「高速物料推送协同 uRLLC 切片」参数块…',
      '[Agent] 映射 QoS：GBR 10/10 Mbps，MBR 25/25 Mbps，AMBR 100 Mbps，5QI=82，ARP=高，SD=020555',
      '[Agent] DNN dnn-pusher.private，LADN 开启，成员分组 grp-material-pushers',
      '[Agent] 即将 POST /api/slices（slice-pusher-urllc，demo-playbook）',
    ]
  }
  if (isPositioningPushModuleAgentSelection(name)) {
    return [
      '[Agent] 加载《5G-A数据》「视觉定位与伺服推送协同 uRLLC 切片」参数块…',
      '[Agent] 映射 QoS：GBR 上行 50 / 下行 15 Mbps，MBR 150/40 Mbps，AMBR 300 Mbps，5QI=80，ARP=高，SD=020444',
      '[Agent] DNN dnn-pos-pusher.private，LADN 开启，成员分组 grp-pos-pushers',
      '[Agent] 即将 POST /api/slices（slice-pos-pusher-urllc，demo-playbook）',
    ]
  }
  if (isIndustrialCameraAgentSelection(name)) {
    return [
      '[Agent] 加载《5G-A数据》「工业相机大上行切片」参数块…',
      '[Agent] 映射 QoS：GBR 上行 150 / 下行 10 Mbps，MBR 300/50 Mbps，AMBR 500 Mbps，5QI=80，ARP=中，SD=010888，SST=1（eMBB）',
      '[Agent] DNN dnn-vision.private，LADN 开启，成员分组 grp-ai-cameras',
      '[Agent] 即将 POST /api/slices（slice-vision-embb，demo-playbook）',
    ]
  }
  if (isPneumaticGripperModuleAgentSelection(name)) {
    return [
      '[Agent] 加载《5G-A数据》「气动伸缩夹爪协同 uRLLC 切片」参数块…',
      '[Agent] 映射 QoS：GBR 10/10 Mbps，MBR 25/25 Mbps，AMBR 100 Mbps，5QI=82，ARP=高，SD=020333',
      '[Agent] DNN dnn-gripper.private，LADN 开启，成员分组 grp-pneumatic-grippers',
      '[Agent] 即将 POST /api/slices（slice-gripper-urllc，demo-playbook）',
    ]
  }
  if (isEdgeComputeUnitModuleAgentSelection(name)) {
    return [
      '[Agent] 加载《5G-A数据》「边缘计算单元协同专属切片」参数块…',
      '[Agent] 映射 QoS：GBR 200/200 Mbps，MBR 1000/1000 Mbps，AMBR 2000 Mbps，5QI=80，ARP=高，SD=020111',
      '[Agent] DNN dnn-edge-compute.private，LADN 开启，成员分组 grp-edge-compute',
      '[Agent] 即将 POST /api/slices（slice-edge-compute，demo-playbook）',
    ]
  }
  if (isRobotArmModuleAgentSelection(name)) {
    return [
      '[Agent] 加载《5G-A数据》「机械臂协同 uRLLC」参数块…',
      '[Agent] 对齐演示切片 slice-robot-urllc / S-NSSAI 2-020666 / dnn-robot.private…',
      '[Agent] 即将 POST /api/slices（若平台已存在同 ID 则跳过创建）',
    ]
  }
  if (name.trim()) {
    const sid = demoAgentSliceIdForDeviceName(name)
    return [
      '[Agent] 加载《5G-A数据》工业 uRLLC 模板并派生独立切片技术 ID…',
      `[Agent] 分配切片 ID ${sid} 与独立 SD（不与种子 slice-robot-urllc 复用）`,
      '[Agent] 即将请求 POST /api/slices（demo-playbook）',
    ]
  }
  return SCRIPT_SLICE_PRE
}

/** Dynamic post-script for slice Agent. */
export function scriptSlicePostForAgent(ctx?: { deviceName?: string }): string[] {
  const name = ctx?.deviceName ?? ''
  if (isRingModuleAgentSelection(name)) {
    return [
      '[Agent] 环形线切片 slice-ringline-urllc 已写入（与文档 vn-ring-lan / 动子 SUPI 章节对齐）',
      '[Agent] 可在列表中点击「编辑」后继续「下发」流程',
    ]
  }
  if (isWaterInjectorAgentSelection(name)) {
    return [
      '[Agent] 灌装注水切片 slice-filler-urllc 已写入（与 vn-filler-lan 章节对齐，未占用 slice-robot-urllc）',
      '[Agent] 可在列表中点击「编辑」后继续「下发」流程',
    ]
  }
  if (isRotaryFeedModuleAgentSelection(name)) {
    return [
      '[Agent] 旋转供料切片 slice-rotary-urllc 已写入（与 vn-rotary-lan / 供料边缘网关章节对齐）',
      '[Agent] 可在列表中点击「编辑」后继续「下发」流程',
    ]
  }
  if (isMaterialPushModuleAgentSelection(name)) {
    return [
      '[Agent] 物料推送切片 slice-pusher-urllc 已写入（与 vn-pusher-lan / 剔除边缘网关章节对齐）',
      '[Agent] 可在列表中点击「编辑」后继续「下发」流程',
    ]
  }
  if (isPositioningPushModuleAgentSelection(name)) {
    return [
      '[Agent] 定位推送切片 slice-pos-pusher-urllc 已写入（与 vn-pos-pusher-lan / SUPI …0501 章节对齐）',
      '[Agent] 可在列表中点击「编辑」后继续「下发」流程',
    ]
  }
  if (isIndustrialCameraAgentSelection(name)) {
    return [
      '[Agent] 工业相机大上行切片 slice-vision-embb 已写入（与 vn-vision-lan / SUPI …0601 章节对齐）',
      '[Agent] 可在列表中点击「编辑」后继续「下发」流程',
    ]
  }
  if (isPneumaticGripperModuleAgentSelection(name)) {
    return [
      '[Agent] 气动伸缩夹爪切片 slice-gripper-urllc 已写入（与 vn-gripper-lan / SUPI …0701 章节对齐）',
      '[Agent] 可在列表中点击「编辑」后继续「下发」流程',
    ]
  }
  if (isEdgeComputeUnitModuleAgentSelection(name)) {
    return [
      '[Agent] 边缘计算单元切片 slice-edge-compute 已写入（与 vn-edge-compute-lan / SUPI …0901 章节对齐）',
      '[Agent] 可在列表中点击「编辑」后继续「下发」流程',
    ]
  }
  if (isRobotArmModuleAgentSelection(name)) {
    return [
      '[Agent] slice-robot-urllc 已对齐（与列表中机械臂 uRLLC 同一技术 ID，可继续配置 vn-line1）',
      '[Agent] 可在列表中点击「编辑」后继续「下发」流程',
    ]
  }
  if (name.trim()) {
    const sid = demoAgentSliceIdForDeviceName(name)
    return [
      `[Agent] 切片 ${sid} 已写入（独立 ID / SD，避免与演示种子冲突）`,
      '[Agent] 可在列表中点击「编辑」后继续「下发」流程',
    ]
  }
  return SCRIPT_SLICE_POST
}

export const SCRIPT_REDCAP_PRE = [
  '[Agent] 加载《5G-A数据》「连接新终端」参数块…',
  '[Agent] 校验依赖：终端绑定切片 ID slice-robot-urllc 须已存在',
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
  '[Agent] 匹配：TCP 目的 10.45.2.0/24 端口 102, 4840，VN vn-line1',
  '[Agent] 即将请求 POST /api/mec/rules',
]

export const SCRIPT_MEC_RULE_POST = ['[Agent] 分流规则已提交并生成回执']

export const SCRIPT_VN_PRE = [
  '[Agent] 加载《5G-A数据》「新建 VN 组」参数块…',
  '[Agent] 校验依赖：关联切片 slice-robot-urllc 须已存在',
  '[Agent] 即将请求 POST /api/five-glan/vn',
]

export const SCRIPT_VN_POST = [
  '[Agent] VN 组 vn-line1 已创建（以太网 PDU / 广播 / 组播策略已套用）',
]

export function scriptRedcapPreForAgent(ctx?: { deviceName?: string }): string[] {
  const name = ctx?.deviceName ?? ''
  if (isRingModuleAgentSelection(name)) {
    return [
      '[Agent] 加载《5G-A数据》「连接新终端」（环形模块）参数块…',
      '[Agent] 校验依赖：终端绑定切片 ID slice-ringline-urllc 须已存在',
      '[Agent] 即将请求 POST /api/redcap/devices',
    ]
  }
  if (isWaterInjectorAgentSelection(name)) {
    return [
      '[Agent] 加载《5G-A数据》「连接新终端」（灌装注水机）参数块…',
      '[Agent] 校验依赖：终端绑定切片 ID slice-filler-urllc 须已存在',
      '[Agent] 即将请求 POST /api/redcap/devices',
    ]
  }
  if (isRotaryFeedModuleAgentSelection(name)) {
    return [
      '[Agent] 加载《5G-A数据》「连接新终端」（高速旋转供料）参数块…',
      '[Agent] 校验依赖：终端绑定切片 ID slice-rotary-urllc 须已存在',
      '[Agent] 即将请求 POST /api/redcap/devices',
    ]
  }
  if (isMaterialPushModuleAgentSelection(name)) {
    return [
      '[Agent] 加载《5G-A数据》「连接新终端」（高速物料推送）参数块…',
      '[Agent] 校验依赖：终端绑定切片 ID slice-pusher-urllc 须已存在',
      '[Agent] 即将请求 POST /api/redcap/devices',
    ]
  }
  if (isPositioningPushModuleAgentSelection(name)) {
    return [
      '[Agent] 加载《5G-A数据》「连接新终端」（定位推送模块 / 高精定位伺服推杆）参数块…',
      '[Agent] 校验依赖：终端绑定切片 ID slice-pos-pusher-urllc 须已存在',
      '[Agent] 即将请求 POST /api/redcap/devices',
    ]
  }
  if (isIndustrialCameraAgentSelection(name)) {
    return [
      '[Agent] 加载《5G-A数据》「连接新终端」（工业相机大上行）参数块…',
      '[Agent] 校验依赖：终端绑定切片 ID slice-vision-embb 须已存在',
      '[Agent] 即将请求 POST /api/redcap/devices',
    ]
  }
  if (isPneumaticGripperModuleAgentSelection(name)) {
    return [
      '[Agent] 加载《5G-A数据》「连接新终端」（气动伸缩夹爪）参数块…',
      '[Agent] 校验依赖：终端绑定切片 ID slice-gripper-urllc 须已存在',
      '[Agent] 即将请求 POST /api/redcap/devices',
    ]
  }
  if (isEdgeComputeUnitModuleAgentSelection(name)) {
    return [
      '[Agent] 加载《5G-A数据》「连接新终端」（边缘计算单元）参数块…',
      '[Agent] 校验依赖：终端绑定切片 ID slice-edge-compute 须已存在',
      '[Agent] 即将请求 POST /api/redcap/devices',
    ]
  }
  if (isRobotArmModuleAgentSelection(name)) {
    return SCRIPT_REDCAP_PRE
  }
  if (name.trim()) {
    const sid = demoAgentSliceIdForDeviceName(name)
    return [
      '[Agent] 加载《5G-A数据》「连接新终端」参数块…',
      `[Agent] 校验依赖：终端绑定切片 ID ${sid} 须已由同设备 Agent 创建`,
      '[Agent] 即将请求 POST /api/redcap/devices',
    ]
  }
  return SCRIPT_REDCAP_PRE
}

export function scriptMecNodePreForAgent(ctx?: { deviceName?: string }): string[] {
  const name = ctx?.deviceName ?? ''
  if (isRingModuleAgentSelection(name)) {
    return [
      '[Agent] 加载《5G-A数据》「注册节点」（环形线全局协同控制边缘节点）参数块…',
      '[Agent] 即将请求 POST /api/mec/nodes',
    ]
  }
  if (isWaterInjectorAgentSelection(name)) {
    return [
      '[Agent] 加载《5G-A数据》「注册节点」（灌装液位检测与阀门控制边缘网关）参数块…',
      '[Agent] 即将请求 POST /api/mec/nodes',
    ]
  }
  if (isRotaryFeedModuleAgentSelection(name)) {
    return [
      '[Agent] 加载《5G-A数据》「注册节点」（供料相位同步与检测边缘网关）参数块…',
      '[Agent] 即将请求 POST /api/mec/nodes',
    ]
  }
  if (isMaterialPushModuleAgentSelection(name)) {
    return [
      '[Agent] 加载《5G-A数据》「注册节点」（物料分流与剔除控制边缘网关）参数块…',
      '[Agent] 即将请求 POST /api/mec/nodes',
    ]
  }
  if (isPositioningPushModuleAgentSelection(name)) {
    return [
      '[Agent] 加载《5G-A数据》「注册节点」（视觉定位与伺服推送协同）参数块…',
      '[Agent] 即将请求 POST /api/mec/nodes',
    ]
  }
  if (isIndustrialCameraAgentSelection(name)) {
    return [
      '[Agent] 加载《5G-A数据》「注册节点」（工业相机边缘算力节点）参数块…',
      '[Agent] 即将请求 POST /api/mec/nodes',
    ]
  }
  if (isPneumaticGripperModuleAgentSelection(name)) {
    return [
      '[Agent] 加载《5G-A数据》「注册节点」（气动伸缩夹爪控制边缘网关）参数块…',
      '[Agent] 即将请求 POST /api/mec/nodes',
    ]
  }
  if (isEdgeComputeUnitModuleAgentSelection(name)) {
    return [
      '[Agent] 加载《5G-A数据》「注册节点」（边缘计算单元算力分流网关）参数块…',
      '[Agent] 即将请求 POST /api/mec/nodes',
    ]
  }
  if (isRobotArmModuleAgentSelection(name)) {
    return SCRIPT_MEC_NODE_PRE
  }
  return SCRIPT_MEC_NODE_PRE
}

export function scriptMecRulePreForAgent(ctx?: { deviceName?: string }): string[] {
  const name = ctx?.deviceName ?? ''
  if (isRingModuleAgentSelection(name)) {
    return [
      '[Agent] 加载《5G-A数据》「新建规则」（环线动子位置反馈极速卸载）参数块…',
      '[Agent] 匹配：ANY 目的 10.46.2.0/24 端口 34964, 17222，VN vn-ring-lan',
      '[Agent] 即将请求 POST /api/mec/rules',
    ]
  }
  if (isWaterInjectorAgentSelection(name)) {
    return [
      '[Agent] 加载《5G-A数据》「新建规则」（注水启停指令与传感回传极速卸载）参数块…',
      '[Agent] 匹配：ANY 目的 10.47.2.0/24 端口 502, 102，VN vn-filler-lan',
      '[Agent] 即将请求 POST /api/mec/rules',
    ]
  }
  if (isRotaryFeedModuleAgentSelection(name)) {
    return [
      '[Agent] 加载《5G-A数据》「新建规则」（多轴伺服运动控制极速卸载）参数块…',
      '[Agent] 匹配：ANY 目的 10.48.2.0/24 端口 2222, 34964，VN vn-rotary-lan',
      '[Agent] 即将请求 POST /api/mec/rules',
    ]
  }
  if (isMaterialPushModuleAgentSelection(name)) {
    return [
      '[Agent] 加载《5G-A数据》「新建规则」（高速推杆 I/O 触发指令极速卸载）参数块…',
      '[Agent] 匹配：ANY 目的 10.49.2.0/24 端口 34964, 502，VN vn-pusher-lan',
      '[Agent] 即将请求 POST /api/mec/rules',
    ]
  }
  if (isPositioningPushModuleAgentSelection(name)) {
    return [
      '[Agent] 加载《5G-A数据》「新建规则」（视觉定位流与伺服指令本地融合卸载）参数块…',
      '[Agent] 匹配：ANY 目的 10.50.2.0/24 端口 3956, 34964，VN vn-pos-pusher-lan',
      '[Agent] 即将请求 POST /api/mec/rules',
    ]
  }
  if (isIndustrialCameraAgentSelection(name)) {
    return [
      '[Agent] 加载《5G-A数据》「新建规则」（工业相机图像流本地卸载）参数块…',
      '[Agent] 匹配：ANY 目的 10.51.2.0/24 端口 3956, 554, 8081，VN vn-vision-lan',
      '[Agent] 即将请求 POST /api/mec/rules',
    ]
  }
  if (isPneumaticGripperModuleAgentSelection(name)) {
    return [
      '[Agent] 加载《5G-A数据》「新建规则」（气动伸缩夹爪开闭指令本地卸载）参数块…',
      '[Agent] 匹配：ANY 目的 10.52.2.0/24 端口 34964, 502，VN vn-gripper-lan',
      '[Agent] 即将请求 POST /api/mec/rules',
    ]
  }
  if (isEdgeComputeUnitModuleAgentSelection(name)) {
    return [
      '[Agent] 加载《5G-A数据》「新建规则」（边缘计算单元 IT/OT 异构数据极速卸载）参数块…',
      '[Agent] 匹配：ANY 目的 10.54.2.0/24 端口 1883, 9092, 4840，VN vn-edge-compute-lan',
      '[Agent] 即将请求 POST /api/mec/rules',
    ]
  }
  if (isRobotArmModuleAgentSelection(name)) {
    return SCRIPT_MEC_RULE_PRE
  }
  if (name.trim()) {
    const vid = demoAgentVnIdForDeviceName(name)
    return [
      '[Agent] 加载《5G-A数据》「新建规则」参数块（演示派生 VN）…',
      `[Agent] 匹配：TCP 目的 10.45.2.0/24 端口 102, 4840，VN ${vid}`,
      '[Agent] 即将请求 POST /api/mec/rules',
    ]
  }
  return SCRIPT_MEC_RULE_PRE
}

export function scriptVnPreForAgent(ctx?: { deviceName?: string }): string[] {
  const name = ctx?.deviceName ?? ''
  if (isRingModuleAgentSelection(name)) {
    return [
      '[Agent] 加载《5G-A数据》「新建 VN 组」（高速环形线 PROFINET RT/IRT 专网）参数块…',
      '[Agent] 校验依赖：关联切片 slice-ringline-urllc 须已存在',
      '[Agent] 即将请求 POST /api/five-glan/vn',
    ]
  }
  if (isWaterInjectorAgentSelection(name)) {
    return [
      '[Agent] 加载《5G-A数据》「新建 VN 组」（高精度灌装线 Modbus/PROFINET 融合专网）参数块…',
      '[Agent] 校验依赖：关联切片 slice-filler-urllc 须已存在',
      '[Agent] 即将请求 POST /api/five-glan/vn',
    ]
  }
  if (isRotaryFeedModuleAgentSelection(name)) {
    return [
      '[Agent] 加载《5G-A数据》「新建 VN 组」（旋转供料运动控制 CIP Motion/PN 专网）参数块…',
      '[Agent] 校验依赖：关联切片 slice-rotary-urllc 须已存在',
      '[Agent] 即将请求 POST /api/five-glan/vn',
    ]
  }
  if (isMaterialPushModuleAgentSelection(name)) {
    return [
      '[Agent] 加载《5G-A数据》「新建 VN 组」（高速推杆阀门岛 PROFINET/Modbus 专网）参数块…',
      '[Agent] 校验依赖：关联切片 slice-pusher-urllc 须已存在',
      '[Agent] 即将请求 POST /api/five-glan/vn',
    ]
  }
  if (isPositioningPushModuleAgentSelection(name)) {
    return [
      '[Agent] 加载《5G-A数据》「新建 VN 组」（定位推送 GigE/PROFINET 融合专网）参数块…',
      '[Agent] 校验依赖：关联切片 slice-pos-pusher-urllc 须已存在',
      '[Agent] 即将请求 POST /api/five-glan/vn',
    ]
  }
  if (isIndustrialCameraAgentSelection(name)) {
    return [
      '[Agent] 加载《5G-A数据》「新建 VN 组」（工业相机专属专网）参数块…',
      '[Agent] 校验依赖：关联切片 slice-vision-embb 须已存在',
      '[Agent] 即将请求 POST /api/five-glan/vn',
    ]
  }
  if (isPneumaticGripperModuleAgentSelection(name)) {
    return [
      '[Agent] 加载《5G-A数据》「新建 VN 组」（气动伸缩夹爪专属专网）参数块…',
      '[Agent] 校验依赖：关联切片 slice-gripper-urllc 须已存在',
      '[Agent] 即将请求 POST /api/five-glan/vn',
    ]
  }
  if (isEdgeComputeUnitModuleAgentSelection(name)) {
    return [
      '[Agent] 加载《5G-A数据》「新建 VN 组」（边缘计算单元算力协同专属专网）参数块…',
      '[Agent] 校验依赖：关联切片 slice-edge-compute 须已存在',
      '[Agent] 即将请求 POST /api/five-glan/vn',
    ]
  }
  if (isRobotArmModuleAgentSelection(name)) {
    return SCRIPT_VN_PRE
  }
  if (name.trim()) {
    const sid = demoAgentSliceIdForDeviceName(name)
    return [
      '[Agent] 加载《5G-A数据》「新建 VN 组」参数块（演示派生关联切片）…',
      `[Agent] 校验依赖：关联切片 ${sid} 须已存在`,
      '[Agent] 即将请求 POST /api/five-glan/vn',
    ]
  }
  return SCRIPT_VN_PRE
}

export function scriptVnPostForAgent(ctx?: { deviceName?: string }): string[] {
  const name = ctx?.deviceName ?? ''
  if (isRingModuleAgentSelection(name)) {
    return [
      '[Agent] VN 组 vn-ring-lan 已创建（以太网 PDU / 广播 / 组播策略已套用）',
    ]
  }
  if (isWaterInjectorAgentSelection(name)) {
    return ['[Agent] VN 组 vn-filler-lan 已创建（以太网 PDU / 广播 / 组播策略已套用）']
  }
  if (isRotaryFeedModuleAgentSelection(name)) {
    return ['[Agent] VN 组 vn-rotary-lan 已创建（以太网 PDU / 广播 / 组播策略已套用）']
  }
  if (isMaterialPushModuleAgentSelection(name)) {
    return ['[Agent] VN 组 vn-pusher-lan 已创建（以太网 PDU / 广播 / 组播策略已套用）']
  }
  if (isPositioningPushModuleAgentSelection(name)) {
    return ['[Agent] VN 组 vn-pos-pusher-lan 已创建（以太网 PDU / 广播 / 组播策略已套用）']
  }
  if (isIndustrialCameraAgentSelection(name)) {
    return ['[Agent] VN 组 vn-vision-lan 已创建（以太网 PDU / 广播 / 组播策略已套用）']
  }
  if (isPneumaticGripperModuleAgentSelection(name)) {
    return ['[Agent] VN 组 vn-gripper-lan 已创建（以太网 PDU / 广播 / 组播策略已套用）']
  }
  if (isEdgeComputeUnitModuleAgentSelection(name)) {
    return ['[Agent] VN 组 vn-edge-compute-lan 已创建（以太网 PDU / 广播 / 组播策略已套用）']
  }
  if (isRobotArmModuleAgentSelection(name)) {
    return SCRIPT_VN_POST
  }
  if (name.trim()) {
    return [`[Agent] VN 组 ${demoAgentVnIdForDeviceName(name)} 已创建（以太网 PDU / 广播 / 组播策略已套用）`]
  }
  return SCRIPT_VN_POST
}
