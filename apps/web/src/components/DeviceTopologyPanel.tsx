/**
 * Dashboard device topology: palette, canvas, API-driven node/edge semantics.
 * 专网概览设备拓扑：模块库、画布、由配置事实推导的节点/边语义。
 */

import {
  App,
  Button,
  Card,
  Collapse,
  Empty,
  Space,
  Tag,
  Typography,
} from 'antd'
import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type PointerEvent as ReactPointerEvent,
  type ReactNode,
} from 'react'
import { createPortal } from 'react-dom'
import { getRole } from '../api/client'
import {
  PLAYBOOK_SLICE_ID_EDGE_COMPUTE,
  PLAYBOOK_SLICE_ID_FILLER_URLLC,
  PLAYBOOK_SLICE_ID_GRIPPER_URLLC,
  PLAYBOOK_SLICE_ID_POS_PUSHER_URLLC,
  PLAYBOOK_SLICE_ID_PUSHER_URLLC,
  PLAYBOOK_SLICE_ID_RINGLINE_URLLC,
  PLAYBOOK_SLICE_ID_ROBOT_URLLC,
  PLAYBOOK_SLICE_ID_ROTARY_URLLC,
  PLAYBOOK_SLICE_ID_VISION_EMBB,
} from '../demo/demoPlaybook'
import type {
  FiveGLanVn,
  MecNode,
  MecOffloadRule,
  NetworkSlice,
  RedCapDevice,
} from '../domain/types'

const LS_KEY = 'deviceTopology.v1'
const NODE_W = 168
const NODE_H = 78
const GAP = 28
const CANVAS_MIN_H = 420
/** Padding beyond palette <aside> box so gap / edge releases still count / 扩大投放区：覆盖 flex 间隙与画布左缘松手. */
const PALETTE_RETURN_HIT_PAD = 28
/** Min pointer travel before plan-node ghost drag starts / 规划节点拖出幽灵前的最小位移. */
const PLAN_DRAG_GHOST_THRESHOLD = 6

type NodeKind =
  | 'anchor_core'
  | 'slice'
  | 'redcap_device'
  | 'mec_node'
  | 'mec_rule'
  | 'vn_group'

/** Sidebar palette entry id — industrial hardware narrative / 侧栏模块项（硬件叙事） */
type HardwarePaletteId =
  | 'hw_ring_module'
  | 'hw_robot_4axis'
  | 'hw_water_injector'
  | 'hw_rotary_feed'
  | 'hw_material_push'
  | 'hw_position_push'
  | 'hw_industrial_camera'
  | 'hw_pneumatic_gripper'
  | 'hw_lift_module'
  | 'hw_edge_compute'

type TopoNodeState = 'inactive' | 'placed' | 'active' | 'error'

type EdgeState = 'pending' | 'ok' | 'error'

/** 《5G-A数据.md》入库升降机 uRLLC（Playbook 未接前本地常量对齐文档 ID）. */
const SLICE_ELEVATOR_URLLC = 'slice-elevator-urllc'

export type PlannedTopoEdge = { id: string; from: string; to: string }

export interface TopologyStored {
  placedKeys: string[]
  positions: Record<string, { x: number; y: number }>
  /** Keys `plan:<uuid>` → sidebar module kind / 规划节点对应的模块库类型. */
  planPaletteByKey: Record<string, HardwarePaletteId>
  /** User-drawn topology links (persisted) / 用户手绘规划连线. */
  plannedEdges: PlannedTopoEdge[]
}

interface PaletteDef {
  id: HardwarePaletteId
  label: string
  tag: string
  description: string
}

/** Classify demo RedCap rows into camera vs robot/arm buckets for palette filters. */
function isIndustrialCameraAlias(alias: string): boolean {
  return /相机|摄像|灯检|视觉|AI检|高速AI/i.test(alias)
}

function isRoboticArmAlias(alias: string): boolean {
  if (isIndustrialCameraAlias(alias)) return false
  return /臂|机械手|主轴|关节|机器人|AGV|PLC|灌装|无线PLC/i.test(alias)
}

function isGripperModuleAlias(alias: string): boolean {
  return /夹爪|gripper/i.test(alias)
}

/** Robot arm preset only (exclude cameras + grippers) / 四轴臂场景：不含相机与夹爪别名. */
function isRobotArmOnlyAlias(alias: string): boolean {
  if (isIndustrialCameraAlias(alias)) return false
  if (isGripperModuleAlias(alias)) return false
  return isRoboticArmAlias(alias)
}

function isSliceProvisioned(slices: NetworkSlice[], sliceId: string): boolean {
  return slices.some((s) => s.id === sliceId && s.status === 'provisioned')
}

function hasDeviceOnSlice(
  devices: RedCapDevice[],
  sliceId: string,
  pred?: (d: RedCapDevice) => boolean,
): boolean {
  return devices.some((d) => d.sliceId === sliceId && (!pred || pred(d)))
}

/**
 * Palette module "fully configured" heuristic: playbook slice provisioned + terminal when scenario expects RedCap.
 * 模块就绪：对应演示切片已下发 + 文档场景要求终端时已存在绑定终端。
 */
function isPaletteModuleReady(id: HardwarePaletteId, slices: NetworkSlice[], devices: RedCapDevice[]): boolean {
  switch (id) {
    case 'hw_ring_module':
      return (
        isSliceProvisioned(slices, PLAYBOOK_SLICE_ID_RINGLINE_URLLC) &&
        hasDeviceOnSlice(devices, PLAYBOOK_SLICE_ID_RINGLINE_URLLC)
      )
    case 'hw_robot_4axis':
      return (
        isSliceProvisioned(slices, PLAYBOOK_SLICE_ID_ROBOT_URLLC) &&
        hasDeviceOnSlice(devices, PLAYBOOK_SLICE_ID_ROBOT_URLLC, (d) => isRobotArmOnlyAlias(d.alias))
      )
    case 'hw_water_injector':
      return (
        isSliceProvisioned(slices, PLAYBOOK_SLICE_ID_FILLER_URLLC) &&
        hasDeviceOnSlice(devices, PLAYBOOK_SLICE_ID_FILLER_URLLC)
      )
    case 'hw_rotary_feed':
      return (
        isSliceProvisioned(slices, PLAYBOOK_SLICE_ID_ROTARY_URLLC) &&
        hasDeviceOnSlice(devices, PLAYBOOK_SLICE_ID_ROTARY_URLLC)
      )
    case 'hw_material_push':
      return (
        isSliceProvisioned(slices, PLAYBOOK_SLICE_ID_PUSHER_URLLC) &&
        hasDeviceOnSlice(devices, PLAYBOOK_SLICE_ID_PUSHER_URLLC)
      )
    case 'hw_position_push':
      return (
        isSliceProvisioned(slices, PLAYBOOK_SLICE_ID_POS_PUSHER_URLLC) &&
        hasDeviceOnSlice(devices, PLAYBOOK_SLICE_ID_POS_PUSHER_URLLC)
      )
    case 'hw_industrial_camera':
      return (
        isSliceProvisioned(slices, PLAYBOOK_SLICE_ID_VISION_EMBB) &&
        hasDeviceOnSlice(devices, PLAYBOOK_SLICE_ID_VISION_EMBB, (d) => isIndustrialCameraAlias(d.alias))
      )
    case 'hw_pneumatic_gripper':
      return (
        isSliceProvisioned(slices, PLAYBOOK_SLICE_ID_GRIPPER_URLLC) &&
        hasDeviceOnSlice(devices, PLAYBOOK_SLICE_ID_GRIPPER_URLLC, (d) => isGripperModuleAlias(d.alias))
      )
    case 'hw_lift_module':
      return (
        isSliceProvisioned(slices, SLICE_ELEVATOR_URLLC) &&
        hasDeviceOnSlice(devices, SLICE_ELEVATOR_URLLC)
      )
    case 'hw_edge_compute':
      return (
        isSliceProvisioned(slices, PLAYBOOK_SLICE_ID_EDGE_COMPUTE) &&
        hasDeviceOnSlice(devices, PLAYBOOK_SLICE_ID_EDGE_COMPUTE)
      )
    default:
      return false
  }
}

function emptyTopology(): TopologyStored {
  return {
    placedKeys: [],
    positions: {},
    planPaletteByKey: {},
    plannedEdges: [],
  }
}

function normalizeTopology(raw: unknown): TopologyStored | null {
  if (!raw || typeof raw !== 'object') return null
  const v = raw as Record<string, unknown>
  if (!Array.isArray(v.placedKeys) || typeof v.positions !== 'object' || v.positions === null)
    return null
  const planPaletteByKey = (v.planPaletteByKey ?? {}) as Record<string, HardwarePaletteId>
  const plannedEdges = Array.isArray(v.plannedEdges)
    ? (v.plannedEdges as PlannedTopoEdge[])
    : []
  return {
    placedKeys: v.placedKeys as string[],
    positions: v.positions as Record<string, { x: number; y: number }>,
    planPaletteByKey,
    plannedEdges,
  }
}

const HARDWARE_PALETTE: PaletteDef[] = [
  {
    id: 'hw_ring_module',
    label: '环形模块',
    tag: '产线',
    description:
      '环形容器/回转产线工位；拓扑上关联专网核心锚点与网络切片承载。',
  },
  {
    id: 'hw_robot_4axis',
    label: '四轴机械臂模块',
    tag: '执行',
    description:
      '四轴机械臂类执行终端（与 RedCap 别名中机械臂关键字匹配的在线终端）。',
  },
  {
    id: 'hw_water_injector',
    label: '注水机',
    tag: '工位',
    description: '灌装/注水工位；拓扑上对应 5G LAN 工业子网（VN）接入面。',
  },
  {
    id: 'hw_rotary_feed',
    label: '旋转供料模块',
    tag: '供料',
    description: '转盘/旋转上料机构；拓扑上映射 MEC 分流与本地工控网策略。',
  },
  {
    id: 'hw_material_push',
    label: '物料推送模块',
    tag: '输送',
    description: '推料/输送机构；拓扑上映射边缘节点与本地算力卸载。',
  },
  {
    id: 'hw_position_push',
    label: '定位推送模块',
    tag: '定位',
    description: '定位推送工装；拓扑上映射 MEC 分流规则。',
  },
  {
    id: 'hw_industrial_camera',
    label: '工业相机模块',
    tag: '视觉',
    description:
      '工业相机/视觉检测终端（与 RedCap 别名中视觉关键字匹配的终端）。',
  },
  {
    id: 'hw_pneumatic_gripper',
    label: '气动伸缩夹爪模块',
    tag: '执行',
    description:
      '末端夹爪与机械臂同域控制；与四轴臂类终端同一 RedCap 分组逻辑。',
  },
  {
    id: 'hw_lift_module',
    label: '升降机模块',
    tag: '提升',
    description: '顶升/升降机构；拓扑上映射 MEC 边缘节点。',
  },
  {
    id: 'hw_edge_compute',
    label: '边缘计算单元模块',
    tag: '边缘',
    description: '现场边缘算力与本地卸载节点（MEC）。',
  },
]

function paletteDefById(id: HardwarePaletteId): PaletteDef | undefined {
  return HARDWARE_PALETTE.find((p) => p.id === id)
}

function parseKey(key: string): { kind: NodeKind; id: string } | null {
  const [prefix, ...rest] = key.split(':')
  const id = rest.join(':')
  if (!prefix || !id) return null
  const map: Record<string, NodeKind> = {
    core: 'anchor_core',
    slice: 'slice',
    redcap: 'redcap_device',
    mec_node: 'mec_node',
    mec_rule: 'mec_rule',
    vn: 'vn_group',
  }
  const kind = map[prefix]
  return kind ? { kind, id } : null
}

function allEntityKeys(input: {
  slices: NetworkSlice[]
  devices: RedCapDevice[]
  mecNodes: MecNode[]
  rules: MecOffloadRule[]
  vns: FiveGLanVn[]
}): string[] {
  const keys: string[] = ['core:anchor']
  for (const s of input.slices) keys.push(`slice:${s.id}`)
  for (const d of input.devices) keys.push(`redcap:${d.id}`)
  for (const n of input.mecNodes) keys.push(`mec_node:${n.id}`)
  for (const r of input.rules) keys.push(`mec_rule:${r.id}`)
  for (const v of input.vns) keys.push(`vn:${v.id}`)
  return keys
}

function autoPositions(keys: string[]): Record<string, { x: number; y: number }> {
  const positions: Record<string, { x: number; y: number }> = {}
  const cols = Math.max(1, Math.ceil(Math.sqrt(keys.length)))
  keys.forEach((k, i) => {
    const col = i % cols
    const row = Math.floor(i / cols)
    positions[k] = {
      x: GAP + col * (NODE_W + GAP),
      y: GAP + row * (NODE_H + GAP),
    }
  })
  return positions
}

function loadStored(): TopologyStored | null {
  try {
    const raw = localStorage.getItem(LS_KEY)
    if (!raw) return null
    return normalizeTopology(JSON.parse(raw))
  } catch {
    return null
  }
}

function saveStored(data: TopologyStored) {
  try {
    localStorage.setItem(LS_KEY, JSON.stringify(data))
  } catch {
    /* ignore quota / private mode */
  }
}

function pointInPaddedRect(
  x: number,
  y: number,
  r: DOMRect,
  padX: number,
  padY: number,
): boolean {
  return (
    x >= r.left - padX &&
    x <= r.right + padX &&
    y >= r.top - padY &&
    y <= r.bottom + padY
  )
}

function clientToCanvasPosition(
  wrap: HTMLDivElement,
  clientX: number,
  clientY: number,
): { x: number; y: number } {
  const rect = wrap.getBoundingClientRect()
  return {
    x: Math.max(0, clientX - rect.left + wrap.scrollLeft - NODE_W / 2),
    y: Math.max(0, clientY - rect.top + wrap.scrollTop - NODE_H / 2),
  }
}

function isPointerOverPalette(
  clientX: number,
  clientY: number,
  paletteEl: HTMLElement | null,
): boolean {
  const pr = paletteEl?.getBoundingClientRect()
  if (!pr) return false
  return pointInPaddedRect(
    clientX,
    clientY,
    pr,
    PALETTE_RETURN_HIT_PAD,
    PALETTE_RETURN_HIT_PAD,
  )
}

function paletteSlotAtPointer(
  paletteEl: HTMLElement,
  clientX: number,
  clientY: number,
): HardwarePaletteId | null {
  for (const btn of Array.from(
    paletteEl.querySelectorAll('[data-palette-id]'),
  ) as HTMLElement[]) {
    const id = btn.dataset.paletteId as HardwarePaletteId | undefined
    if (!id) continue
    const br = btn.getBoundingClientRect()
    if (
      clientX >= br.left &&
      clientX <= br.right &&
      clientY >= br.top &&
      clientY <= br.bottom
    ) {
      return id
    }
  }
  return null
}

function clientToCanvasPoint(
  wrap: HTMLDivElement,
  clientX: number,
  clientY: number,
): { x: number; y: number } {
  const rect = wrap.getBoundingClientRect()
  return {
    x: clientX - rect.left + wrap.scrollLeft,
    y: clientY - rect.top + wrap.scrollTop,
  }
}

function nodeCenterFromPos(pos: { x: number; y: number }): { x: number; y: number } {
  return { x: pos.x + NODE_W / 2, y: pos.y + NODE_H / 2 }
}

/** Top-most node under pointer (canvas coords) / 取画布坐标下最上层节点. */
function findNodeKeyAtClientPoint(
  clientX: number,
  clientY: number,
  wrap: HTMLDivElement,
  placedKeys: string[],
  positions: Record<string, { x: number; y: number }>,
  excludeKey?: string,
): string | null {
  const { x: cx, y: cy } = clientToCanvasPoint(wrap, clientX, clientY)
  for (let i = placedKeys.length - 1; i >= 0; i--) {
    const key = placedKeys[i]
    if (key === excludeKey) continue
    const pos = positions[key]
    if (!pos) continue
    if (
      cx >= pos.x &&
      cx <= pos.x + NODE_W &&
      cy >= pos.y &&
      cy <= pos.y + NODE_H
    ) {
      return key
    }
  }
  return null
}

function plannedEdgeId(a: string, b: string): string {
  const [from, to] = a < b ? [a, b] : [b, a]
  return `plan-edge:${from}:${to}`
}

type TopoEdge = {
  id: string
  from: string
  to: string
  state: EdgeState
  label: string
  origin: 'config' | 'plan'
}

export interface DeviceTopologyPanelProps {
  slices: NetworkSlice[]
  devices: RedCapDevice[]
  mecNodes: MecNode[]
  rules: MecOffloadRule[]
  vns: FiveGLanVn[]
}

export function DeviceTopologyPanel({
  slices,
  devices,
  mecNodes,
  rules,
  vns,
}: DeviceTopologyPanelProps) {
  const { message } = App.useApp()
  const editable = getRole() !== 'viewer'

  const [stored, setStored] = useState<TopologyStored>(() => {
    const s = loadStored()
    if (s) return s
    return emptyTopology()
  })

  const [wireMode, setWireMode] = useState(false)
  /** connect = drag link; delete = click plan edge to remove / 连线子模式：拖线连接 | 点击删线. */
  const [wireTool, setWireTool] = useState<'connect' | 'delete'>('connect')
  /** Rubber-band draft while dragging a link / 拖拽连线时的橡皮筋终点（画布坐标）. */
  const [wireDraft, setWireDraft] = useState<{
    fromKey: string
    x2: number
    y2: number
  } | null>(null)
  const [wireHoverTarget, setWireHoverTarget] = useState<string | null>(null)
  const wireSessionCleanupRef = useRef<(() => void) | null>(null)
  const topologySnapshotRef = useRef(stored)

  useEffect(() => {
    topologySnapshotRef.current = stored
  }, [stored])
  /** Highlight palette when dragging a plan node over it / 规划节点拖经模块库时高亮投放区. */
  const [paletteReturnHover, setPaletteReturnHover] = useState(false)
  /** Matching palette row while returning a plan node / 拖回时高亮对应模块库条目. */
  const [paletteReturnSlotId, setPaletteReturnSlotId] = useState<HardwarePaletteId | null>(
    null,
  )
  /** Native drag-out from palette — dim source row like browser ghost / 侧栏拖出时源项占位样式. */
  const [paletteDraggingOutId, setPaletteDraggingOutId] = useState<HardwarePaletteId | null>(
    null,
  )
  /**
   * Floating palette-styled ghost while dragging a plan node (mirrors HTML5 drag-out).
   * 规划节点拖拽时的浮动幽灵（与侧栏拖出视觉一致）.
   */
  const [planDragGhost, setPlanDragGhost] = useState<{
    nodeKey: string
    x: number
    y: number
  } | null>(null)
  const paletteDropZoneRef = useRef<HTMLElement>(null)
  const canvasWrapRef = useRef<HTMLDivElement>(null)

  /**
   * While dragging a canvas node, palette items must not use HTML5 drag — it can steal the gesture and break drop detection.
   * 画布拖拽进行中时关闭侧栏原生 draggable，避免与 Pointer Events 冲突导致无法检测拖回模块库。
   */
  const [paletteNativeDragLocked, setPaletteNativeDragLocked] = useState(false)
  const globalPointerEndRef = useRef<((ev: PointerEvent) => void) | null>(null)

  const persist = useCallback((next: TopologyStored) => {
    setStored(next)
    saveStored(next)
  }, [])

  const lookup = useMemo(() => {
    const sliceById = new Map(slices.map((s) => [s.id, s]))
    const deviceById = new Map(devices.map((d) => [d.id, d]))
    const mecById = new Map(mecNodes.map((n) => [n.id, n]))
    const ruleById = new Map(rules.map((r) => [r.id, r]))
    const vnById = new Map(vns.map((v) => [v.id, v]))
    return { sliceById, deviceById, mecById, ruleById, vnById }
  }, [slices, devices, mecNodes, rules, vns])

  const nodeState = useCallback(
    (key: string): TopoNodeState => {
      if (key.startsWith('plan:')) {
        const pal = stored.planPaletteByKey[key]
        if (!pal) return 'inactive'
        return isPaletteModuleReady(pal, slices, devices) ? 'active' : 'placed'
      }
      const p = parseKey(key)
      if (!p) return 'inactive'
      if (p.kind === 'anchor_core') {
        const anyProv = slices.some((s) => s.status === 'provisioned')
        return anyProv ? 'active' : 'placed'
      }
      if (p.kind === 'slice') {
        const s = lookup.sliceById.get(p.id)
        if (!s) return 'error'
        if (s.status === 'provisioned') return 'active'
        if (s.status === 'error') return 'error'
        return 'placed'
      }
      if (p.kind === 'redcap_device') {
        const d = lookup.deviceById.get(p.id)
        if (!d) return 'error'
        const sl = lookup.sliceById.get(d.sliceId)
        if (sl?.status === 'provisioned') return 'active'
        return 'placed'
      }
      if (p.kind === 'mec_node') {
        return lookup.mecById.has(p.id) ? 'active' : 'error'
      }
      if (p.kind === 'mec_rule') {
        const r = lookup.ruleById.get(p.id)
        if (!r) return 'error'
        return r.enabled ? 'active' : 'placed'
      }
      if (p.kind === 'vn_group') {
        const v = lookup.vnById.get(p.id)
        if (!v) return 'error'
        if (v.status === 'active') return 'active'
        return 'placed'
      }
      return 'inactive'
    },
    [lookup, slices, devices, stored.planPaletteByKey],
  )

  const nodeLabel = useCallback(
    (key: string): string => {
      if (key.startsWith('plan:')) {
        const pal = stored.planPaletteByKey[key]
        const def = pal ? HARDWARE_PALETTE.find((x) => x.id === pal) : undefined
        return def ? def.label : key.slice(0, 16)
      }
      const p = parseKey(key)
      if (!p) return key
      if (p.kind === 'anchor_core') return '5G 专网核心'
      if (p.kind === 'slice') {
        const name =
          lookup.sliceById.get(p.id)?.displayName ?? p.id.slice(0, 8)
        return `产线切片 · ${name}`
      }
      if (p.kind === 'redcap_device') {
        const d = lookup.deviceById.get(p.id)
        const alias = d?.alias ?? p.id.slice(0, 8)
        if (isIndustrialCameraAlias(alias)) return `工业相机模块 · ${alias}`
        if (isRoboticArmAlias(alias)) return `机械臂 · ${alias}`
        return `工业终端 · ${alias}`
      }
      if (p.kind === 'mec_node') {
        const name = lookup.mecById.get(p.id)?.nodeName ?? p.id.slice(0, 8)
        return `边缘计算单元模块 · ${name}`
      }
      if (p.kind === 'mec_rule') {
        const name = lookup.ruleById.get(p.id)?.name ?? p.id.slice(0, 8)
        return `边缘分流 · ${name}`
      }
      if (p.kind === 'vn_group') {
        const name = lookup.vnById.get(p.id)?.displayName ?? p.id.slice(0, 8)
        return `工业子网 · ${name}`
      }
      return key
    },
    [lookup, stored.planPaletteByKey],
  )

  const edges = useMemo((): TopoEdge[] => {
    const placed = new Set(stored.placedKeys)
    const list: TopoEdge[] = []
    const push = (
      id: string,
      from: string,
      to: string,
      ok: boolean,
      label: string,
      origin: 'config' | 'plan' = 'config',
    ) => {
      if (!placed.has(from) || !placed.has(to)) return
      list.push({
        id,
        from,
        to,
        state: ok ? 'ok' : 'pending',
        label,
        origin,
      })
    }

    for (const d of devices) {
      const ok = lookup.sliceById.get(d.sliceId)?.status === 'provisioned'
      push(`e-rd-${d.id}`, `redcap:${d.id}`, `slice:${d.sliceId}`, ok, '签约', 'config')
    }
    for (const v of vns) {
      const sl = lookup.sliceById.get(v.linkedSliceId)
      const ok = sl?.status === 'provisioned' && v.status === 'active'
      push(`e-vn-${v.id}`, `vn:${v.id}`, `slice:${v.linkedSliceId}`, ok, '绑定', 'config')
    }
    for (const s of slices) {
      const ok = s.status === 'provisioned'
      push(`e-sc-${s.id}`, `slice:${s.id}`, `core:anchor`, ok, '核心', 'config')
    }
    for (const r of rules) {
      const vnId = r.match.vnId
      if (!vnId) continue
      const vn = lookup.vnById.get(vnId)
      const ok = r.enabled && Boolean(vn)
      push(`e-mr-${r.id}`, `mec_rule:${r.id}`, `vn:${vnId}`, ok, '匹配', 'config')
    }

    for (const pe of stored.plannedEdges) {
      const ok =
        nodeState(pe.from) === 'active' && nodeState(pe.to) === 'active'
      push(pe.id, pe.from, pe.to, ok, '规划', 'plan')
    }

    return list
  }, [devices, vns, slices, rules, stored.placedKeys, stored.plannedEdges, lookup, nodeState])

  const canvasW = useMemo(() => {
    if (stored.placedKeys.length === 0) return 640
    let maxX = NODE_W + GAP * 2
    for (const k of stored.placedKeys) {
      const pos = stored.positions[k]
      if (pos) maxX = Math.max(maxX, pos.x + NODE_W + GAP)
    }
    return Math.max(640, maxX)
  }, [stored.placedKeys, stored.positions])

  const canvasH = useMemo(() => {
    if (stored.placedKeys.length === 0) return CANVAS_MIN_H
    let maxY = CANVAS_MIN_H
    for (const k of stored.placedKeys) {
      const pos = stored.positions[k]
      if (pos) maxY = Math.max(maxY, pos.y + NODE_H + GAP * 2)
    }
    return maxY
  }, [stored.placedKeys, stored.positions])

  const detachGlobalPointerEnd = useCallback(() => {
    const fn = globalPointerEndRef.current
    if (fn) {
      window.removeEventListener('pointerup', fn, true)
      window.removeEventListener('pointercancel', fn, true)
      globalPointerEndRef.current = null
    }
  }, [])

  const detachWireSession = useCallback(() => {
    wireSessionCleanupRef.current?.()
    wireSessionCleanupRef.current = null
  }, [])

  const addPlannedEdge = useCallback(
    (fromKey: string, toKey: string) => {
      if (fromKey === toKey) {
        message.warning('不能将节点连接到自身')
        return
      }
      const [a, b] = fromKey < toKey ? [fromKey, toKey] : [toKey, fromKey]
      const edgeId = plannedEdgeId(a, b)
      const snap = topologySnapshotRef.current
      if (snap.plannedEdges.some((edg) => edg.from === a && edg.to === b)) {
        message.warning('两节点间已有规划连线')
        return
      }
      setStored((prev) => {
        if (prev.plannedEdges.some((edg) => edg.from === a && edg.to === b)) {
          return prev
        }
        const next = {
          ...prev,
          plannedEdges: [...prev.plannedEdges, { id: edgeId, from: a, to: b }],
        }
        saveStored(next)
        return next
      })
      message.success('已添加规划连线')
    },
    [message],
  )

  const removePlannedEdge = useCallback(
    (edgeId: string) => {
      const snap = topologySnapshotRef.current
      if (!snap.plannedEdges.some((ed) => ed.id === edgeId)) return
      setStored((prev) => {
        const next = {
          ...prev,
          plannedEdges: prev.plannedEdges.filter((ed) => ed.id !== edgeId),
        }
        saveStored(next)
        return next
      })
      message.success('已删除规划连线')
    },
    [message],
  )

  const clearWireInteraction = useCallback(() => {
    setWireDraft(null)
    setWireHoverTarget(null)
    detachWireSession()
  }, [detachWireSession])

  const addPlannedModule = (paletteId: HardwarePaletteId, x: number, y: number) => {
    if (!editable) {
      message.warning('查看者无权编辑拓扑布局')
      return
    }
    setStored((prev) => {
      const id = `plan:${crypto.randomUUID()}`
      const next = {
        ...prev,
        placedKeys: [...prev.placedKeys, id],
        positions: { ...prev.positions, [id]: { x, y } },
        planPaletteByKey: { ...prev.planPaletteByKey, [id]: paletteId },
      }
      saveStored(next)
      return next
    })
    message.success('已添加规划模块（灰）；该模块配置完成后将变绿')
  }

  /** Return planning node to library UX (remove from canvas only). / 移回模块库：仅清本地拓扑与手绘边。 */
  const removePlannedModule = useCallback(
    (nodeKey: string) => {
      if (!editable || !nodeKey.startsWith('plan:')) return
      setStored((prev) => {
        const nextPositions = { ...prev.positions }
        delete nextPositions[nodeKey]
        const nextPal = { ...prev.planPaletteByKey }
        delete nextPal[nodeKey]
        const next: TopologyStored = {
          placedKeys: prev.placedKeys.filter((k) => k !== nodeKey),
          positions: nextPositions,
          planPaletteByKey: nextPal,
          plannedEdges: prev.plannedEdges.filter((ed) => ed.from !== nodeKey && ed.to !== nodeKey),
        }
        saveStored(next)
        return next
      })
      message.success('已拖回模块库，需要时可再次拖入画布')
    },
    [editable, message],
  )

  const dragRef = useRef<{
    key: string
    pointerId: number
    startX: number
    startY: number
    ox: number
    oy: number
    planPaletteId?: HardwarePaletteId
    ghostActive: boolean
  } | null>(null)
  const dragDeltaRef = useRef({ dx: 0, dy: 0 })

  const clearPlanDragVisuals = useCallback(() => {
    setPlanDragGhost(null)
    setPaletteReturnHover(false)
    setPaletteReturnSlotId(null)
  }, [])

  const updatePlanReturnHover = useCallback(
    (clientX: number, clientY: number, fallbackPaletteId: HardwarePaletteId) => {
      const paletteEl = paletteDropZoneRef.current
      const overPalette = isPointerOverPalette(clientX, clientY, paletteEl)
      setPaletteReturnHover(overPalette)
      if (!overPalette || !paletteEl) {
        setPaletteReturnSlotId(null)
        return
      }
      setPaletteReturnSlotId(
        paletteSlotAtPointer(paletteEl, clientX, clientY) ?? fallbackPaletteId,
      )
    },
    [],
  )

  useEffect(() => {
    return () => {
      detachGlobalPointerEnd()
      detachWireSession()
      setPaletteNativeDragLocked(false)
      clearPlanDragVisuals()
    }
  }, [clearPlanDragVisuals, detachGlobalPointerEnd, detachWireSession])

  const finalizeNodePointerInteraction = useCallback(
    (
      nodeKey: string,
      clientX: number,
      clientY: number,
      pointerId: number,
      captureTarget: HTMLElement | null,
    ) => {
      const d = dragRef.current
      if (!d || d.key !== nodeKey || d.pointerId !== pointerId) return

      const wasGhost = d.ghostActive

      dragRef.current = null
      setPaletteNativeDragLocked(false)
      clearPlanDragVisuals()

      if (captureTarget) {
        try {
          captureTarget.releasePointerCapture(pointerId)
        } catch {
          /* noop */
        }
      }

      const releasedOnPalette = isPointerOverPalette(
        clientX,
        clientY,
        paletteDropZoneRef.current,
      )

      // Return-to-palette / 拖回模块库
      if (editable && nodeKey.startsWith('plan:') && releasedOnPalette) {
        removePlannedModule(nodeKey)
        return
      }

      // Drop plan ghost on canvas / 幽灵拖动画布上松手：落点定位
      if (
        editable &&
        nodeKey.startsWith('plan:') &&
        wasGhost &&
        !releasedOnPalette &&
        canvasWrapRef.current
      ) {
        const drop = clientToCanvasPosition(
          canvasWrapRef.current,
          clientX,
          clientY,
        )
        setStored((prev) => {
          const next = {
            ...prev,
            positions: { ...prev.positions, [nodeKey]: drop },
          }
          saveStored(next)
          return next
        })
        return
      }

      setStored((prev) => {
        saveStored(prev)
        return prev
      })
    },
    [clearPlanDragVisuals, editable, removePlannedModule],
  )

  const startWireFromNode = useCallback(
    (fromKey: string, pointerId: number, clientX: number, clientY: number) => {
      const wrap = canvasWrapRef.current
      if (!wrap) return
      detachWireSession()
      const pt = clientToCanvasPoint(wrap, clientX, clientY)
      setWireDraft({ fromKey, x2: pt.x, y2: pt.y })
      setWireHoverTarget(null)

      const onWireMove = (ev: PointerEvent) => {
        if (ev.pointerId !== pointerId) return
        const p = clientToCanvasPoint(wrap, ev.clientX, ev.clientY)
        setWireDraft((prev) => (prev ? { ...prev, x2: p.x, y2: p.y } : null))
        const snap = topologySnapshotRef.current
        setWireHoverTarget(
          findNodeKeyAtClientPoint(
            ev.clientX,
            ev.clientY,
            wrap,
            snap.placedKeys,
            snap.positions,
            fromKey,
          ),
        )
      }

      let wireEnded = false
      const onWireEnd = (ev: PointerEvent) => {
        if (wireEnded || ev.pointerId !== pointerId) return
        wireEnded = true
        detachWireSession()
        const snap = topologySnapshotRef.current
        const target = findNodeKeyAtClientPoint(
          ev.clientX,
          ev.clientY,
          wrap,
          snap.placedKeys,
          snap.positions,
          fromKey,
        )
        setWireDraft(null)
        setWireHoverTarget(null)
        if (target) {
          addPlannedEdge(fromKey, target)
        }
      }

      const cleanup = () => {
        window.removeEventListener('pointermove', onWireMove, true)
        window.removeEventListener('pointerup', onWireEnd, true)
        window.removeEventListener('pointercancel', onWireEnd, true)
      }
      wireSessionCleanupRef.current = cleanup
      window.addEventListener('pointermove', onWireMove, true)
      window.addEventListener('pointerup', onWireEnd, true)
      window.addEventListener('pointercancel', onWireEnd, true)
    },
    [addPlannedEdge, detachWireSession],
  )

  const onNodePointerDown = (nodeKey: string, e: ReactPointerEvent) => {
    if (!editable) return
    e.preventDefault()
    e.stopPropagation()

    if (wireMode) {
      if (wireTool === 'connect') {
        startWireFromNode(nodeKey, e.pointerId, e.clientX, e.clientY)
      }
      return
    }

    dragDeltaRef.current = { dx: 0, dy: 0 }
    clearPlanDragVisuals()
    const pos = stored.positions[nodeKey] ?? { x: GAP, y: GAP }
    const pid = e.pointerId
    const el = e.currentTarget as HTMLElement
    const planPaletteId = nodeKey.startsWith('plan:')
      ? stored.planPaletteByKey[nodeKey]
      : undefined
    dragRef.current = {
      key: nodeKey,
      pointerId: pid,
      startX: e.clientX,
      startY: e.clientY,
      ox: pos.x,
      oy: pos.y,
      planPaletteId,
      ghostActive: false,
    }
    detachGlobalPointerEnd()
    setPaletteNativeDragLocked(true)
    el.setPointerCapture(pid)

    const onGlobalEnd = (ev: PointerEvent) => {
      if (ev.pointerId !== pid) return
      detachGlobalPointerEnd()
      finalizeNodePointerInteraction(nodeKey, ev.clientX, ev.clientY, ev.pointerId, el)
    }
    globalPointerEndRef.current = onGlobalEnd
    window.addEventListener('pointerup', onGlobalEnd, true)
    window.addEventListener('pointercancel', onGlobalEnd, true)
  }

  const onNodePointerMove = (nodeKey: string, e: ReactPointerEvent) => {
    if (!editable) return
    const d = dragRef.current
    if (!d || d.key !== nodeKey || d.pointerId !== e.pointerId) return
    const dx = e.clientX - d.startX
    const dy = e.clientY - d.startY
    dragDeltaRef.current = { dx, dy }

    const planPaletteId = d.planPaletteId
    const travel = Math.abs(dx) + Math.abs(dy)

    if (planPaletteId && travel > PLAN_DRAG_GHOST_THRESHOLD) {
      const def = paletteDefById(planPaletteId)
      if (!def) {
        /* corrupt plan key — fall through to canvas reposition / 无模块元数据则按画布拖动 */
      } else {
        if (!d.ghostActive) {
          d.ghostActive = true
          setStored((prev) => ({
            ...prev,
            positions: {
              ...prev.positions,
              [nodeKey]: { x: d.ox, y: d.oy },
            },
          }))
        }
        setPlanDragGhost({ nodeKey, x: e.clientX, y: e.clientY })
        updatePlanReturnHover(e.clientX, e.clientY, planPaletteId)
        return
      }
    }

    const nx = Math.max(0, d.ox + dx)
    const ny = Math.max(0, d.oy + dy)
    setStored((prev) => ({
      ...prev,
      positions: { ...prev.positions, [nodeKey]: { x: nx, y: ny } },
    }))
  }

  const onNodePointerUp = (nodeKey: string, e: ReactPointerEvent) => {
    if (dragRef.current?.key !== nodeKey) {
      try {
        ;(e.currentTarget as HTMLElement).releasePointerCapture(e.pointerId)
      } catch {
        /* noop */
      }
      return
    }
    detachGlobalPointerEnd()
    finalizeNodePointerInteraction(
      nodeKey,
      e.clientX,
      e.clientY,
      e.pointerId,
      e.currentTarget as HTMLElement,
    )
  }

  const onResetLayout = () => {
    persist({
      ...stored,
      positions: autoPositions(stored.placedKeys),
    })
    message.success('布局已重置')
  }

  const onClearCanvas = () => {
    persist(emptyTopology())
    setWireMode(false)
    setWireTool('connect')
    clearWireInteraction()
    message.info('画布已清空，可从左侧拖入模块规划拓扑')
  }

  const onSyncAll = () => {
    const entityKeys = allEntityKeys({ slices, devices, mecNodes, rules, vns })
    const planKeys = stored.placedKeys.filter((k) => k.startsWith('plan:'))
    const mergedKeys = [...new Set([...planKeys, ...entityKeys])]
    const positions = { ...autoPositions(entityKeys), ...stored.positions }
    for (const k of mergedKeys) {
      if (!positions[k]) positions[k] = { x: GAP, y: GAP }
    }
    persist({
      placedKeys: mergedKeys,
      positions,
      planPaletteByKey: stored.planPaletteByKey,
      plannedEdges: stored.plannedEdges,
    })
    message.success('已合并当前配置对象（保留规划节点与手绘连线）')
  }

  const onPaletteDragStart = (e: React.DragEvent, id: HardwarePaletteId) => {
    e.dataTransfer.setData('application/topo-hw', id)
    e.dataTransfer.effectAllowed = 'copy'
    setPaletteDraggingOutId(id)
  }

  const onPaletteDragEnd = () => {
    setPaletteDraggingOutId(null)
  }

  const onCanvasDragOver = (e: React.DragEvent) => {
    if (!editable) return
    e.preventDefault()
    e.dataTransfer.dropEffect = 'copy'
  }

  const onCanvasDrop = (e: React.DragEvent) => {
    if (!editable) return
    e.preventDefault()
    const id = e.dataTransfer.getData('application/topo-hw') as HardwarePaletteId
    if (!id || !HARDWARE_PALETTE.some((p) => p.id === id)) return
    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect()
    const x = Math.max(0, e.clientX - rect.left - NODE_W / 2)
    const y = Math.max(0, e.clientY - rect.top - NODE_H / 2)
    addPlannedModule(id, x, y)
  }

  const edgeElements = useMemo(() => {
    return edges.map((edge) => {
      const a = stored.positions[edge.from]
      const b = stored.positions[edge.to]
      if (!a || !b) return null
      const c1 = nodeCenterFromPos(a)
      const c2 = nodeCenterFromPos(b)
      const stroke =
        edge.state === 'ok'
          ? 'var(--app-status-green, #16a34a)'
          : 'rgba(100,116,139,0.45)'
      const isPlan = edge.origin === 'plan'
      const strokeDasharray =
        edge.state === 'ok' ? (isPlan ? '5 4' : undefined) : isPlan ? '3 7' : '6 4'
      const strokeWidth = isPlan ? 1.75 : 2
      return (
        <line
          key={edge.id}
          x1={c1.x}
          y1={c1.y}
          x2={c2.x}
          y2={c2.y}
          stroke={stroke}
          strokeWidth={strokeWidth}
          strokeDasharray={strokeDasharray}
        />
      )
    })
  }, [edges, stored.positions])

  const wireOverlayElements = useMemo(() => {
    const items: ReactNode[] = []
    if (wireDraft) {
      const fromPos = stored.positions[wireDraft.fromKey]
      if (fromPos) {
        const c1 = nodeCenterFromPos(fromPos)
        items.push(
          <line
            key="wire-draft"
            className="device-topology-wire-draft"
            x1={c1.x}
            y1={c1.y}
            x2={wireDraft.x2}
            y2={wireDraft.y2}
          />,
        )
      }
    }
    if (wireMode && wireTool === 'delete') {
      for (const pe of stored.plannedEdges) {
        const a = stored.positions[pe.from]
        const b = stored.positions[pe.to]
        if (!a || !b) continue
        const c1 = nodeCenterFromPos(a)
        const c2 = nodeCenterFromPos(b)
        items.push(
          <line
            key={`hit-${pe.id}`}
            className="device-topology-plan-edge-hit"
            x1={c1.x}
            y1={c1.y}
            x2={c2.x}
            y2={c2.y}
            stroke="transparent"
            strokeWidth={14}
            onClick={() => removePlannedEdge(pe.id)}
          />,
        )
      }
    }
    return items
  }, [removePlannedEdge, stored.plannedEdges, stored.positions, wireDraft, wireMode, wireTool])

  const empty = stored.placedKeys.length === 0

  const planDragGhostPalId = planDragGhost
    ? stored.planPaletteByKey[planDragGhost.nodeKey]
    : undefined
  const planDragGhostDef = planDragGhostPalId
    ? paletteDefById(planDragGhostPalId)
    : undefined

  return (
    <Card
      className="device-topology-card"
      size="small"
      title={
        <Space align="center" wrap>
          <span>设备拓扑 / 配置态一览</span>
          <Typography.Text type="secondary" style={{ fontSize: 12 }}>
            逻辑拓扑示意，非物理布线
          </Typography.Text>
        </Space>
      }
      extra={
        <Space wrap>
          <Button
            size="small"
            type={wireMode && wireTool === 'connect' ? 'primary' : 'default'}
            onClick={() => {
              const entering = !wireMode
              setWireMode(entering)
              setWireTool('connect')
              clearWireInteraction()
              if (entering) {
                message.info('从节点拖向另一节点以创建规划连线；删除请点「删除连线」')
              }
            }}
            disabled={!editable}
          >
            {wireMode ? '退出连线' : '连线规划'}
          </Button>
          {wireMode ? (
            <Button
              size="small"
              danger={wireTool === 'delete'}
              type={wireTool === 'delete' ? 'primary' : 'default'}
              onClick={() => {
                const enteringDelete = wireTool !== 'delete'
                setWireTool(enteringDelete ? 'delete' : 'connect')
                clearWireInteraction()
                if (enteringDelete) {
                  message.info('点击画布上的规划连线即可删除')
                }
              }}
              disabled={!editable || stored.plannedEdges.length === 0}
            >
              删除连线
            </Button>
          ) : null}
          <Button size="small" onClick={onSyncAll} disabled={!editable}>
            同步配置
          </Button>
          <Button size="small" onClick={onResetLayout} disabled={!editable}>
            重置布局
          </Button>
          <Button size="small" danger onClick={onClearCanvas} disabled={!editable}>
            清空画布
          </Button>
        </Space>
      }
    >
      <div className="device-topology-body">
        <aside
          ref={paletteDropZoneRef}
          className={`device-topology-palette${paletteReturnHover ? ' is-return-target' : ''}`}
        >
          <Collapse
            size="small"
            defaultActiveKey={['palette']}
            items={[
              {
                key: 'palette',
                label: '模块库',
                children: (
                  <Space orientation="vertical" size={10} style={{ width: '100%' }}>
                    {!editable && (
                      <Typography.Text type="secondary" style={{ fontSize: 12 }}>
                        当前为只读（查看者）
                      </Typography.Text>
                    )}
                    {HARDWARE_PALETTE.map((p) => (
                      <button
                        key={p.id}
                        type="button"
                        data-palette-id={p.id}
                        className={[
                          'device-topology-palette-item',
                          paletteDraggingOutId === p.id ? 'is-dragging-out' : '',
                          paletteReturnSlotId === p.id ? 'is-return-slot' : '',
                        ]
                          .filter(Boolean)
                          .join(' ')}
                        draggable={editable && !paletteNativeDragLocked}
                        onDragStart={(e) => onPaletteDragStart(e, p.id)}
                        onDragEnd={onPaletteDragEnd}
                        onClick={() =>
                          addPlannedModule(
                            p.id,
                            GAP + stored.placedKeys.length * 40,
                            GAP + stored.placedKeys.length * 36,
                          )
                        }
                        disabled={!editable}
                        title={p.description}
                      >
                        <span className="device-topology-palette-label">
                          {p.label}
                        </span>
                        <Tag style={{ marginInlineEnd: 0 }}>{p.tag}</Tag>
                      </button>
                    ))}
                  </Space>
                ),
              },
            ]}
          />
          <Typography.Paragraph type="secondary" style={{ fontSize: 12, marginTop: 12 }}>
            无需先有配置即可<strong>拖入或点击</strong>添加规划节点（灰）；按《5G-A数据》Playbook
            完成该模块下发后节点<strong>变绿</strong>。<strong>从模块库拖入、尚未同步后台的节点</strong>可拖回左侧模块库。点<strong>「连线规划」</strong>后拖线连接；点<strong>「删除连线」</strong>后点击规划线删除。灰色虚线为配置推导边，细点划线为手绘规划边。
          </Typography.Paragraph>
        </aside>

        <div
          ref={canvasWrapRef}
          className={`device-topology-canvas-wrap${wireMode ? ' is-wire-mode' : ''}${wireMode && wireTool === 'delete' ? ' is-wire-delete-mode' : ''}`}
          onDragOver={onCanvasDragOver}
          onDrop={onCanvasDrop}
        >
          {empty ? (
            <Empty
              className="device-topology-empty"
              description={
                <span>
                  画布为空。请从左侧<strong>拖入</strong>模块做拓扑规划（无需已有配置），或通过「同步配置」合并后台对象。
                </span>
              }
            />
          ) : null}
          <svg
            className="device-topology-edges"
            width={canvasW}
            height={canvasH}
            aria-hidden
          >
            {edgeElements}
          </svg>
          {(wireMode || wireDraft) && (
            <svg
              className="device-topology-edges device-topology-edges--overlay"
              width={canvasW}
              height={canvasH}
              aria-hidden={!wireMode}
            >
              {wireOverlayElements}
            </svg>
          )}
          <div
            className="device-topology-canvas"
            style={{ width: canvasW, minHeight: canvasH }}
          >
            {stored.placedKeys.map((key) => {
              const pos = stored.positions[key] ?? { x: GAP, y: GAP }
              const st = nodeState(key)
              const isPlanNode = key.startsWith('plan:')
              const stateCls =
                st === 'active'
                  ? 'is-active'
                  : st === 'error'
                    ? 'is-error'
                    : st === 'placed'
                      ? 'is-placed'
                      : 'is-inactive'
              const isWireSource = wireDraft?.fromKey === key
              const isWireTarget = wireHoverTarget === key
              const isGhostSource = planDragGhost?.nodeKey === key
              return (
                <div
                  key={key}
                  className={`device-topology-node ${stateCls}${isWireSource ? ' is-wire-source' : ''}${isWireTarget ? ' is-wire-target' : ''}${isGhostSource ? ' is-plan-drag-source' : ''}`}
                  style={{
                    width: NODE_W,
                    height: NODE_H,
                    left: pos.x,
                    top: pos.y,
                  }}
                  onPointerDown={(e) => onNodePointerDown(key, e)}
                  onPointerMove={(e) => onNodePointerMove(key, e)}
                  onPointerUp={(e) => onNodePointerUp(key, e)}
                  onPointerCancel={(e) => onNodePointerUp(key, e)}
                  role="group"
                >
                  <div className="device-topology-node-title">{nodeLabel(key)}</div>
                  <div className="device-topology-node-meta">
                    <span className="device-topology-node-state">
                      {isPlanNode && st === 'active' && '已就绪'}
                      {isPlanNode && st === 'placed' && '待配置'}
                      {!isPlanNode && st === 'active' && '已点亮'}
                      {!isPlanNode && st === 'placed' && '待贯通'}
                      {st === 'error' && '异常'}
                      {st === 'inactive' && '未接入'}
                    </span>
                  </div>
                </div>
              )
            })}
          </div>

          <div className="device-topology-legend">
            <Space size="middle" wrap>
              <span>
                <i className="device-topology-legend-line is-ok" /> 已贯通
              </span>
              <span>
                <i className="device-topology-legend-line is-pending" /> 待贯通
              </span>
              <span>
                <i className="device-topology-legend-line is-pending thin" /> 规划手绘边
              </span>
            </Space>
          </div>
        </div>
      </div>
      {planDragGhost && planDragGhostDef &&
        createPortal(
          <div
            className="device-topology-drag-ghost"
            style={{
              left: planDragGhost.x,
              top: planDragGhost.y,
            }}
            aria-hidden
          >
            <span className="device-topology-palette-label">{planDragGhostDef.label}</span>
            <Tag style={{ marginInlineEnd: 0 }}>{planDragGhostDef.tag}</Tag>
          </div>,
          document.body,
        )}
    </Card>
  )
}
