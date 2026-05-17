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
  useMemo,
  useRef,
  useState,
  type PointerEvent as ReactPointerEvent,
} from 'react'
import { getRole } from '../api/client'
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

export interface TopologyStored {
  placedKeys: string[]
  positions: Record<string, { x: number; y: number }>
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

/** Palette entries tied to RedCap — tailored hint when no matching terminals. */
const PALETTE_REDCAP_ARM_IDS = new Set<HardwarePaletteId>([
  'hw_robot_4axis',
  'hw_pneumatic_gripper',
])
const PALETTE_REDCAP_CAMERA_IDS = new Set<HardwarePaletteId>([
  'hw_industrial_camera',
])

function paletteNeedsRedcapDeviceHint(id: HardwarePaletteId): boolean {
  return PALETTE_REDCAP_ARM_IDS.has(id) || PALETTE_REDCAP_CAMERA_IDS.has(id)
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
    const v = JSON.parse(raw) as TopologyStored
    if (!v || !Array.isArray(v.placedKeys) || typeof v.positions !== 'object')
      return null
    return v
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

type TopoEdge = {
  id: string
  from: string
  to: string
  state: EdgeState
  label: string
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
    const keys = allEntityKeys({ slices, devices, mecNodes, rules, vns })
    const init = { placedKeys: keys, positions: autoPositions(keys) }
    saveStored(init)
    return init
  })

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
    [lookup, slices],
  )

  const nodeLabel = useCallback(
    (key: string): string => {
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
    [lookup],
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
    ) => {
      if (!placed.has(from) || !placed.has(to)) return
      list.push({
        id,
        from,
        to,
        state: ok ? 'ok' : 'pending',
        label,
      })
    }

    for (const d of devices) {
      const ok =
        lookup.sliceById.get(d.sliceId)?.status === 'provisioned'
      push(`e-rd-${d.id}`, `redcap:${d.id}`, `slice:${d.sliceId}`, ok, '签约')
    }
    for (const v of vns) {
      const sl = lookup.sliceById.get(v.linkedSliceId)
      const ok =
        sl?.status === 'provisioned' && v.status === 'active'
      push(`e-vn-${v.id}`, `vn:${v.id}`, `slice:${v.linkedSliceId}`, ok, '绑定')
    }
    for (const s of slices) {
      const ok = s.status === 'provisioned'
      push(`e-sc-${s.id}`, `slice:${s.id}`, `core:anchor`, ok, '核心')
    }
    for (const r of rules) {
      const vnId = r.match.vnId
      if (!vnId) continue
      const vn = lookup.vnById.get(vnId)
      const ok = r.enabled && Boolean(vn)
      push(`e-mr-${r.id}`, `mec_rule:${r.id}`, `vn:${vnId}`, ok, '匹配')
    }

    return list
  }, [devices, vns, slices, rules, stored.placedKeys, lookup])

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

  const dragRef = useRef<{
    key: string
    startX: number
    startY: number
    ox: number
    oy: number
  } | null>(null)

  const onNodePointerDown = (key: string, e: ReactPointerEvent) => {
    if (!editable) return
    e.preventDefault()
    e.stopPropagation()
    const pos = stored.positions[key] ?? { x: GAP, y: GAP }
    dragRef.current = {
      key,
      startX: e.clientX,
      startY: e.clientY,
      ox: pos.x,
      oy: pos.y,
    }
    const el = e.currentTarget as HTMLElement
    el.setPointerCapture(e.pointerId)
  }

  const onNodePointerMove = (key: string, e: ReactPointerEvent) => {
    if (!editable) return
    const d = dragRef.current
    if (!d || d.key !== key) return
    const dx = e.clientX - d.startX
    const dy = e.clientY - d.startY
    const nx = Math.max(0, d.ox + dx)
    const ny = Math.max(0, d.oy + dy)
    setStored((prev) => ({
      ...prev,
      positions: { ...prev.positions, [key]: { x: nx, y: ny } },
    }))
  }

  const onNodePointerUp = (key: string, e: ReactPointerEvent) => {
    const d = dragRef.current
    if (d?.key === key) dragRef.current = null
    try {
      ;(e.currentTarget as HTMLElement).releasePointerCapture(e.pointerId)
    } catch {
      /* noop */
    }
    setStored((prev) => {
      saveStored(prev)
      return prev
    })
  }

  const onResetLayout = () => {
    const next = {
      placedKeys: stored.placedKeys,
      positions: autoPositions(stored.placedKeys),
    }
    persist(next)
    message.success('布局已重置')
  }

  const onClearCanvas = () => {
    persist({ placedKeys: [], positions: {} })
    message.info('画布已清空，可从左侧拖入模块')
  }

  const onSyncAll = () => {
    const keys = allEntityKeys({ slices, devices, mecNodes, rules, vns })
    const positions = { ...autoPositions(keys), ...stored.positions }
    for (const k of keys) {
      if (!positions[k]) positions[k] = { x: GAP, y: GAP }
    }
    persist({ placedKeys: keys, positions })
    message.success('已从当前配置同步拓扑节点')
  }

  const keysForHardwarePalette = useCallback(
    (id: HardwarePaletteId): string[] => {
      switch (id) {
        case 'hw_ring_module':
          return ['core:anchor', ...slices.map((s) => `slice:${s.id}`)]
        case 'hw_robot_4axis':
        case 'hw_pneumatic_gripper':
          return devices
            .filter((d) => isRoboticArmAlias(d.alias))
            .map((d) => `redcap:${d.id}`)
        case 'hw_water_injector':
          return vns.map((v) => `vn:${v.id}`)
        case 'hw_rotary_feed':
        case 'hw_position_push':
          return rules.map((r) => `mec_rule:${r.id}`)
        case 'hw_material_push':
        case 'hw_lift_module':
        case 'hw_edge_compute':
          return mecNodes.map((n) => `mec_node:${n.id}`)
        case 'hw_industrial_camera':
          return devices
            .filter((d) => isIndustrialCameraAlias(d.alias))
            .map((d) => `redcap:${d.id}`)
        default:
          return []
      }
    },
    [slices, devices, mecNodes, rules, vns],
  )

  const addKeysFromPalette = (id: HardwarePaletteId) => {
    if (!editable) {
      message.warning('查看者无权编辑拓扑布局')
      return
    }
    const add = keysForHardwarePalette(id).filter(
      (k) => !stored.placedKeys.includes(k),
    )
    if (add.length === 0) {
      if (paletteNeedsRedcapDeviceHint(id)) {
        message.info(
          '当前没有匹配该类别的终端，或已全部在画布上。可使用「同步配置」加载全部对象。',
        )
      } else {
        message.info('该类型节点已全部在画布上，或配置中暂无对应资源')
      }
      return
    }
    const nextKeys = [...stored.placedKeys, ...add]
    const positions = { ...stored.positions }
    const baseKeys = stored.placedKeys
    let idx = 0
    for (const k of add) {
      if (!positions[k]) {
        positions[k] = {
          x: GAP + (baseKeys.length + idx) * 40,
          y: GAP + (baseKeys.length + idx) * 36,
        }
        idx += 1
      }
    }
    persist({ placedKeys: nextKeys, positions })
    message.success(`已添加 ${add.length} 个节点`)
  }

  const onPaletteDragStart = (e: React.DragEvent, id: HardwarePaletteId) => {
    e.dataTransfer.setData('application/topo-hw', id)
    e.dataTransfer.effectAllowed = 'copy'
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
    const add = keysForHardwarePalette(id).filter(
      (k) => !stored.placedKeys.includes(k),
    )
    if (add.length === 0) {
      if (paletteNeedsRedcapDeviceHint(id)) {
        message.info(
          '当前没有匹配该类别的终端，或已全部在画布上。可使用「同步配置」加载全部对象。',
        )
      } else {
        message.info('该类型节点已全部在画布上，或配置中暂无对应资源')
      }
      return
    }
    const positions = { ...stored.positions }
    add.forEach((k, i) => {
      positions[k] = { x: x + i * 20, y: y + i * 18 }
    })
    persist({ placedKeys: [...stored.placedKeys, ...add], positions })
    message.success(`已放置 ${add.length} 个节点`)
  }

  const edgeElements = useMemo(() => {
    return edges.map((edge) => {
      const a = stored.positions[edge.from]
      const b = stored.positions[edge.to]
      if (!a || !b) return null
      const x1 = a.x + NODE_W / 2
      const y1 = a.y + NODE_H / 2
      const x2 = b.x + NODE_W / 2
      const y2 = b.y + NODE_H / 2
      const stroke =
        edge.state === 'ok'
          ? 'var(--app-status-green, #16a34a)'
          : 'rgba(100,116,139,0.45)'
      return (
        <line
          key={edge.id}
          x1={x1}
          y1={y1}
          x2={x2}
          y2={y2}
          stroke={stroke}
          strokeWidth={2}
          strokeDasharray={edge.state === 'ok' ? undefined : '6 4'}
        />
      )
    })
  }, [edges, stored.positions])

  const empty = stored.placedKeys.length === 0

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
        <aside className={`device-topology-palette${empty ? '' : ''}`}>
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
                        className="device-topology-palette-item"
                        draggable={editable}
                        onDragStart={(e) => onPaletteDragStart(e, p.id)}
                        onClick={() => addKeysFromPalette(p.id)}
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
            从模块库拖入<strong>产线硬件与网络要素</strong>，或点击快速添加。边线仍由平台配置自动推导：灰=待贯通，绿=已满足。
          </Typography.Paragraph>
        </aside>

        <div
          className="device-topology-canvas-wrap"
          onDragOver={onCanvasDragOver}
          onDrop={onCanvasDrop}
        >
          {empty ? (
            <Empty
              className="device-topology-empty"
              description={
                <span>
                  画布为空。从左侧<strong>拖入</strong>模块或点击「同步配置」加载当前对象。
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
          <div
            className="device-topology-canvas"
            style={{ width: canvasW, minHeight: canvasH }}
          >
            {stored.placedKeys.map((key) => {
              const pos = stored.positions[key] ?? { x: GAP, y: GAP }
              const st = nodeState(key)
              const stateCls =
                st === 'active'
                  ? 'is-active'
                  : st === 'error'
                    ? 'is-error'
                    : st === 'placed'
                      ? 'is-placed'
                      : 'is-inactive'
              return (
                <div
                  key={key}
                  className={`device-topology-node ${stateCls}`}
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
                      {st === 'active' && '已点亮'}
                      {st === 'placed' && '待贯通'}
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
            </Space>
          </div>
        </div>
      </div>
    </Card>
  )
}
