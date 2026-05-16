import { Card, Col, Row, Skeleton, Space, Statistic, Typography } from 'antd'
import { useEffect, useState } from 'react'
import { apiGet } from '../api/client'
import { StatusDistributionBar } from '../components/DashboardChart'
import type {
  FiveGLanVn,
  MecOffloadRule,
  NetworkSlice,
  RedCapDevice,
} from '../domain/types'

export function DashboardPage() {
  const [slices, setSlices] = useState<NetworkSlice[]>([])
  const [devices, setDevices] = useState<RedCapDevice[]>([])
  const [rules, setRules] = useState<MecOffloadRule[]>([])
  const [vns, setVns] = useState<FiveGLanVn[]>([])
  const [err, setErr] = useState<string | null>(null)
  const [loaded, setLoaded] = useState(false)

  useEffect(() => {
    let cancelled = false
    void (async () => {
      try {
        const [s, d, r, v] = await Promise.all([
          apiGet<NetworkSlice[]>('/api/slices'),
          apiGet<RedCapDevice[]>('/api/redcap/devices'),
          apiGet<MecOffloadRule[]>('/api/mec/rules'),
          apiGet<FiveGLanVn[]>('/api/five-glan/vn'),
        ])
        if (!cancelled) {
          setSlices(s)
          setDevices(d)
          setRules(r)
          setVns(v)
          setLoaded(true)
        }
      } catch (e) {
        if (!cancelled)
          setErr(e instanceof Error ? e.message : '概览数据加载失败')
      }
    })()
    return () => {
      cancelled = true
    }
  }, [])

  const provisioned = slices.filter((x) => x.status === 'provisioned').length
  const draftCount = slices.filter((x) => x.status === 'draft').length
  const errorCount = slices.filter((x) => x.status === 'error').length
  const hitTotal = rules.reduce((a, b) => a + (b.hitCount ?? 0), 0)
  const activeDevices = devices.filter(
    (d) => d.rrcState === 'RRC_CONNECTED',
  ).length

  const sliceSegments = [
    { label: '已下发', value: provisioned, color: 'var(--app-status-green)' },
    { label: '草稿', value: draftCount, color: 'var(--app-status-amber)' },
    { label: '异常', value: errorCount, color: 'var(--app-status-red)' },
  ]

  return (
    <div>
      <Space orientation="vertical" size="large" style={{ width: '100%' }}>
        <Typography.Paragraph
          type="secondary"
          className="dashboard-intro"
          style={{ marginBottom: 0 }}
        >
          聚合展示切片接入、RedCap 终端、MEC 分流与 5G LAN
          虚拟网络等对象状态，便于快速掌握专网运行概况。
        </Typography.Paragraph>
        {err ? (
          <Typography.Text type="danger">{err}</Typography.Text>
        ) : !loaded ? (
          <Row gutter={[16, 16]}>
            {[1, 2, 3, 4].map((i) => (
              <Col xs={24} sm={12} lg={6} key={i}>
                <Card className="kpi-card" variant="borderless">
                  <Skeleton active title paragraph={{ rows: 1 }} />
                </Card>
              </Col>
            ))}
          </Row>
        ) : (
          <>
            <Row gutter={[16, 16]}>
              <Col xs={24} sm={12} lg={6}>
                <Card className="kpi-card" variant="borderless">
                  <Statistic
                    title="网络切片（已下发）"
                    value={provisioned}
                    suffix={`/ ${slices.length}`}
                  />
                  <StatusDistributionBar
                    segments={sliceSegments}
                    total={slices.length}
                  />
                </Card>
              </Col>
              <Col xs={24} sm={12} lg={6}>
                <Card className="kpi-card" variant="borderless">
                  <Statistic
                    title="RedCap 在线终端"
                    value={devices.length}
                    suffix={
                      <span style={{ fontSize: 14, color: '#64748b' }}>
                        {' '}
                        / 活跃 {activeDevices}
                      </span>
                    }
                  />
                  <StatusDistributionBar
                    segments={[
                      {
                        label: 'RRC 连接',
                        value: activeDevices,
                        color: 'var(--app-status-green)',
                      },
                      {
                        label: '待机',
                        value: devices.length - activeDevices,
                        color: 'var(--app-status-slate)',
                      },
                    ]}
                    total={devices.length}
                  />
                </Card>
              </Col>
              <Col xs={24} sm={12} lg={6}>
                <Card className="kpi-card" variant="borderless">
                  <Statistic title="MEC 规则命中（累计）" value={hitTotal} />
                  <StatusDistributionBar
                    segments={[
                      {
                        label: '已启用',
                        value: rules.filter((r) => r.enabled).length,
                        color: 'var(--app-status-green)',
                      },
                      {
                        label: '已禁用',
                        value: rules.filter((r) => !r.enabled).length,
                        color: 'var(--app-status-slate)',
                      },
                    ]}
                    total={rules.length}
                  />
                </Card>
              </Col>
              <Col xs={24} sm={12} lg={6}>
                <Card className="kpi-card" variant="borderless">
                  <Statistic title="5G LAN VN 组" value={vns.length} />
                  <StatusDistributionBar
                    segments={[
                      {
                        label: '已激活',
                        value: vns.filter((v) => v.status === 'active').length,
                        color: 'var(--app-status-green)',
                      },
                      {
                        label: '非活跃',
                        value: vns.filter((v) => v.status !== 'active').length,
                        color: 'var(--app-status-slate)',
                      },
                    ]}
                    total={vns.length}
                  />
                </Card>
              </Col>
            </Row>
          </>
        )}
      </Space>
    </div>
  )
}
