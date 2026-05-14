import { Card, Col, Row, Space, Statistic, Typography } from 'antd'
import { useEffect, useState } from 'react'
import { apiGet } from '../api/client'
import type {
  FiveGLanVn,
  MecOffloadRule,
  NetworkSlice,
  ProvisioningJob,
  RedCapDevice,
} from '../domain/types'

export function DashboardPage() {
  const [slices, setSlices] = useState<NetworkSlice[]>([])
  const [devices, setDevices] = useState<RedCapDevice[]>([])
  const [rules, setRules] = useState<MecOffloadRule[]>([])
  const [vns, setVns] = useState<FiveGLanVn[]>([])
  const [jobs, setJobs] = useState<ProvisioningJob[]>([])
  const [err, setErr] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false
    void (async () => {
      try {
        const [s, d, r, v, j] = await Promise.all([
          apiGet<NetworkSlice[]>('/api/slices'),
          apiGet<RedCapDevice[]>('/api/redcap/devices'),
          apiGet<MecOffloadRule[]>('/api/mec/rules'),
          apiGet<FiveGLanVn[]>('/api/five-glan/vn'),
          apiGet<ProvisioningJob[]>('/api/provisioning/jobs'),
        ])
        if (!cancelled) {
          setSlices(s)
          setDevices(d)
          setRules(r)
          setVns(v)
          setJobs(j)
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
  const hitTotal = rules.reduce((a, b) => a + (b.hitCount ?? 0), 0)
  const pendingJobs = jobs.filter(
    (j) => j.status === 'pending' || j.status === 'processing',
  ).length

  return (
    <div>
      <Space direction="vertical" size="large" style={{ width: '100%' }}>
        <Typography.Paragraph type="secondary" className="dashboard-intro" style={{ marginBottom: 0 }}>
          聚合展示切片接入、RedCap 终端、MEC 分流与 5G LAN
          虚拟网络等对象状态，便于快速掌握专网运行概况。
        </Typography.Paragraph>
        {err ? (
          <Typography.Text type="danger">{err}</Typography.Text>
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
                </Card>
              </Col>
              <Col xs={24} sm={12} lg={6}>
                <Card className="kpi-card" variant="borderless">
                  <Statistic title="RedCap 在线终端" value={devices.length} />
                </Card>
              </Col>
              <Col xs={24} sm={12} lg={6}>
                <Card className="kpi-card" variant="borderless">
                  <Statistic title="MEC 规则命中（累计）" value={hitTotal} />
                </Card>
              </Col>
              <Col xs={24} sm={12} lg={6}>
                <Card className="kpi-card" variant="borderless">
                  <Statistic title="5G LAN VN 组" value={vns.length} />
                </Card>
              </Col>
            </Row>
            <Card className="kpi-card" variant="borderless" title="下发队列">
              <Statistic title="进行中任务" value={pendingJobs} suffix="个" />
            </Card>
          </>
        )}
      </Space>
    </div>
  )
}
