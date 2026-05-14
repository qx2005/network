import {
  CloudServerOutlined,
  DeploymentUnitOutlined,
  FundProjectionScreenOutlined,
  GlobalOutlined,
  RadarChartOutlined,
  SettingOutlined,
} from '@ant-design/icons'
import { Badge, Layout, Menu, Select, Space, Typography, theme } from 'antd'
import type { CSSProperties, ReactNode } from 'react'
import { useEffect, useMemo, useState } from 'react'
import { Link, Outlet, useLocation } from 'react-router-dom'
import { getRole, setRole } from '../api/client'
import { getPageMeta } from './routeMeta'

const { Header, Sider, Content } = Layout

type MenuItem = {
  key: string
  icon?: ReactNode
  label: ReactNode
  children?: MenuItem[]
}

export function MainLayout() {
  const [collapsed, setCollapsed] = useState(false)
  const location = useLocation()
  const { token } = theme.useToken()
  const pageMeta = getPageMeta(location.pathname)

  const items: MenuItem[] = useMemo(
    () => [
      {
        key: '/',
        icon: <FundProjectionScreenOutlined />,
        label: <Link to="/">专网概览</Link>,
      },
      {
        key: 'slice',
        icon: <DeploymentUnitOutlined />,
        label: '网络切片',
        children: [
          { key: '/slices', label: <Link to="/slices">切片实例</Link> },
        ],
      },
      {
        key: 'redcap',
        icon: <RadarChartOutlined />,
        label: 'RedCap 终端',
        children: [
          {
            key: '/redcap/devices',
            label: <Link to="/redcap/devices">在线终端</Link>,
          },
          {
            key: '/redcap/profiles',
            label: <Link to="/redcap/profiles">省电与寻呼策略</Link>,
          },
        ],
      },
      {
        key: 'mec',
        icon: <CloudServerOutlined />,
        label: 'MEC 与路由',
        children: [
          { key: '/mec/nodes', label: <Link to="/mec/nodes">本地数据面</Link> },
          { key: '/mec/rules', label: <Link to="/mec/rules">分流 / 卸载规则</Link> },
        ],
      },
      {
        key: '/lan/vn',
        icon: <GlobalOutlined />,
        label: <Link to="/lan/vn">5G LAN / VN</Link>,
      },
      {
        key: 'system',
        icon: <SettingOutlined />,
        label: '系统与运维',
        children: [
          {
            key: '/system/jobs',
            label: <Link to="/system/jobs">下发队列</Link>,
          },
          {
            key: '/system/audit',
            label: <Link to="/system/audit">审计日志</Link>,
          },
          {
            key: '/system/rbac',
            label: <Link to="/system/rbac">RBAC 说明</Link>,
          },
        ],
      },
    ],
    [],
  )

  const selectedKeys = useMemo(() => [location.pathname], [location.pathname])

  const openKeysDefault = useMemo(() => {
    if (location.pathname.startsWith('/redcap')) return ['redcap']
    if (location.pathname.startsWith('/mec')) return ['mec']
    if (location.pathname.startsWith('/system')) return ['system']
    if (location.pathname.startsWith('/slices')) return ['slice']
    return []
  }, [location.pathname])

  const [openKeys, setOpenKeys] = useState<string[]>(openKeysDefault)

  useEffect(() => {
    setOpenKeys(openKeysDefault)
  }, [openKeysDefault])

  const siderStyle: CSSProperties = {
    background: `linear-gradient(165deg, var(--app-sider-gradient-start) 0%, var(--app-sider-gradient-end) 100%)`,
    boxShadow: '4px 0 24px rgba(0, 0, 0, 0.12)',
  }

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Sider
        width={246}
        collapsible
        collapsed={collapsed}
        onCollapse={setCollapsed}
        breakpoint="lg"
        style={siderStyle}
        theme="dark"
      >
        <div
          style={{
            margin: '16px 14px 20px',
            padding: collapsed ? '12px 8px' : '14px 16px',
            borderRadius: token.borderRadiusLG,
            background: 'linear-gradient(135deg, rgba(15, 23, 42, 0.55) 0%, rgba(15, 23, 42, 0.35) 100%)',
            border: '1px solid rgba(45, 212, 191, 0.22)',
            boxShadow: '0 4px 20px rgba(0, 0, 0, 0.2), inset 0 1px 0 rgba(255,255,255,0.06)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: collapsed ? 'center' : undefined,
            gap: 10,
          }}
        >
          {!collapsed ? (
            <div style={{ minWidth: 0 }}>
              <Typography.Text
                style={{
                  color: '#f8fafc',
                  fontWeight: 700,
                  fontSize: 15,
                  display: 'block',
                  letterSpacing: '0.02em',
                }}
              >
                5G-A 专网
              </Typography.Text>
              <Typography.Text
                style={{
                  color: 'var(--app-sider-text-muted)',
                  fontSize: 11,
                  display: 'block',
                  marginTop: 2,
                }}
              >
                专网智能配置
              </Typography.Text>
            </div>
          ) : (
            <Typography.Text
              style={{
                color: '#f8fafc',
                fontWeight: 700,
                fontSize: 13,
                letterSpacing: '0.02em',
              }}
            >
              5G-A
            </Typography.Text>
          )}
        </div>
        <Menu
          theme="dark"
          mode="inline"
          selectedKeys={selectedKeys}
          openKeys={openKeys}
          onOpenChange={setOpenKeys}
          items={items as never}
          style={{
            background: 'transparent',
            borderInlineEnd: 'none',
            paddingInline: 8,
          }}
        />
      </Sider>
      <Layout style={{ background: 'var(--app-canvas)' }}>
        <Header
          className="app-shell-header"
          style={{
            paddingInline: 24,
            background: token.colorBgContainer,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            position: 'sticky',
            top: 0,
            zIndex: 20,
            height: 58,
          }}
        >
          <div style={{ minWidth: 0 }}>
            <Typography.Title
              level={4}
              className="app-header-title"
              style={{
                margin: 0,
                fontSize: 19,
                fontWeight: 700,
                lineHeight: 1.3,
                color: token.colorTextHeading,
              }}
            >
              {pageMeta.title}
            </Typography.Title>
            {pageMeta.subtitle ? (
              <Typography.Text
                type="secondary"
                style={{ fontSize: 13, marginTop: 4, display: 'block', lineHeight: 1.45 }}
              >
                {pageMeta.subtitle}
              </Typography.Text>
            ) : null}
          </div>
          <Space size="middle" align="center" wrap>
            <Badge className="app-status-dot" status="success" text="编排链路正常" />
            <div className="app-role-shell">
              <Space size={8} align="center">
                <Typography.Text type="secondary" style={{ fontSize: 12 }}>
                  访问角色
                </Typography.Text>
                <Select
                  size="middle"
                  value={getRole()}
                  variant="borderless"
                  style={{ width: 120 }}
                  popupMatchSelectWidth={false}
                  options={[
                    { value: 'viewer', label: '只读' },
                    { value: 'operator', label: '运维' },
                    { value: 'admin', label: '管理员' },
                  ]}
                  onChange={(v) => {
                    setRole(v)
                    window.location.reload()
                  }}
                />
              </Space>
            </div>
          </Space>
        </Header>
        <Content style={{ padding: 24, background: 'var(--app-canvas)' }}>
          <div className="app-content-paper">
            <Outlet />
          </div>
        </Content>
      </Layout>
    </Layout>
  )
}
