/**
 * Map route pathname to header title and breadcrumb trail for shell layout.
 * 路由与顶栏标题、面包屑映射。
 */

export type PageMeta = {
  title: string
  /** Short Chinese context line under the title. */
  subtitle?: string
  /** Breadcrumb trail (root "首页" prepended automatically). */
  breadcrumb?: { label: string; path?: string }[]
}

const FALLBACK: PageMeta = { title: '专网控制台', subtitle: '5G-A 专网配置' }

const MAP: Record<string, PageMeta> = {
  '/': {
    title: '专网概览',
    subtitle: '运行状态与关键指标',
  },
  '/slices': {
    title: '切片实例',
    subtitle: '网络切片生命周期',
    breadcrumb: [{ label: '网络切片' }],
  },
  '/slices/new': {
    title: '新建切片',
    subtitle: '填写切片与 QoS 参数',
    breadcrumb: [{ label: '网络切片', path: '/slices' }, { label: '新建切片' }],
  },
  '/redcap/devices': {
    title: 'RedCap 在线终端',
    subtitle: '终端清单与接入视图',
    breadcrumb: [{ label: 'RedCap 终端' }],
  },
  '/redcap/profiles': {
    title: '省电与寻呼策略',
    subtitle: 'eDRX / PTW 等模板',
    breadcrumb: [
      { label: 'RedCap 终端' },
      { label: '省电与寻呼策略' },
    ],
  },
  '/mec/nodes': {
    title: '本地数据面节点',
    subtitle: 'MEC 与 UPF 接入',
    breadcrumb: [{ label: 'MEC 与路由' }],
  },
  '/mec/rules': {
    title: '分流与卸载规则',
    subtitle: '本地流量策略',
    breadcrumb: [{ label: 'MEC 与路由' }, { label: '分流与卸载规则' }],
  },
  '/lan/vn': {
    title: '5G LAN / VN',
    subtitle: '二层虚拟网络',
  },
  '/system/jobs': {
    title: '下发队列',
    subtitle: '异步任务状态',
    breadcrumb: [{ label: '系统与运维' }],
  },
  '/system/audit': {
    title: '审计日志',
    subtitle: '操作留痕',
    breadcrumb: [{ label: '系统与运维' }],
  },
  '/system/rbac': {
    title: 'RBAC 说明',
    subtitle: '角色与权限',
    breadcrumb: [{ label: '系统与运维' }],
  },
}

export function getPageMeta(pathname: string): PageMeta {
  if (MAP[pathname]) return MAP[pathname]
  if (pathname.startsWith('/slices/') && pathname !== '/slices/new') {
    return {
      title: '编辑切片',
      subtitle: '修改切片参数并下发',
      breadcrumb: [
        { label: '网络切片', path: '/slices' },
        { label: '编辑切片' },
      ],
    }
  }
  return FALLBACK
}
