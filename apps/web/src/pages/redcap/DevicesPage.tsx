import { App, Button, Empty, Select, Skeleton, Table, Typography } from 'antd'
import type { ColumnsType } from 'antd/es/table'
import { useEffect, useState } from 'react'
import { apiGet, apiSend } from '../../api/client'
import { TruthFeedbackModal } from '../../components/TruthFeedbackModal'
import type {
  CommitResult,
  PowerProfile,
  ProvisionReport,
  RedCapDevice,
} from '../../domain/types'

export function RedcapDevicesPage() {
  const { message } = App.useApp()
  const [rows, setRows] = useState<RedCapDevice[]>([])
  const [profiles, setProfiles] = useState<PowerProfile[]>([])
  const [loading, setLoading] = useState(false)
  const [profilePick, setProfilePick] = useState<Record<string, string>>({})
  const [fbOpen, setFbOpen] = useState(false)
  const [fbReport, setFbReport] = useState<ProvisionReport | null>(null)

  const load = async () => {
    setLoading(true)
    try {
      const [d, p] = await Promise.all([
        apiGet<RedCapDevice[]>('/api/redcap/devices'),
        apiGet<PowerProfile[]>('/api/redcap/power-profiles'),
      ])
      setRows(d)
      setProfiles(p)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    void load()
  }, [])

  const columns: ColumnsType<RedCapDevice> = [
    { title: '别名', dataIndex: 'alias', width: 120 },
    { title: 'SUPI', dataIndex: 'supi', width: 160, ellipsis: true },
    { title: '切片', dataIndex: 'sliceId', width: 140, ellipsis: true },
    { title: 'VN', dataIndex: 'vnId', width: 100, ellipsis: true },
    { title: 'IP', dataIndex: 'ipAddress', width: 120 },
    { title: 'RRC', dataIndex: 'rrcState', width: 100 },
    { title: '信号', dataIndex: 'signalQuality', width: 100 },
    { title: 'eDRX', dataIndex: 'edrxState', width: 110, ellipsis: true },
    {
      title: '省电模板',
      key: 'prof',
      width: 180,
      render: (_, r) => (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
          <Select
            size="small"
            style={{ width: '100%' }}
            placeholder="选择模板"
            value={profilePick[r.id] ?? r.powerProfileId}
            options={profiles.map((p) => ({ value: p.id, label: p.templateName }))}
            onChange={(v) => setProfilePick((m) => ({ ...m, [r.id]: v }))}
          />
          <Button
            type="link"
            size="small"
            style={{ padding: 0, alignSelf: 'flex-start' }}
            onClick={async () => {
              const pid = profilePick[r.id] ?? r.powerProfileId
              if (!pid) {
                message.warning('请选择模板')
                return
              }
              try {
                const res = await apiSend<CommitResult<RedCapDevice>>(
                  `/api/redcap/devices/${r.id}/profile`,
                  {
                    method: 'PATCH',
                    body: JSON.stringify({ profileId: pid }),
                  },
                )
                setFbReport(res.report)
                setFbOpen(true)
                message.success('已应用省电模板')
                await load()
              } catch (e) {
                message.error(e instanceof Error ? e.message : '应用失败')
              }
            }}
          >
            应用
          </Button>
        </div>
      ),
    },
  ]

  return (
    <div>
      <Typography.Paragraph type="secondary" style={{ marginBottom: 12 }}>
        终端接入清单；应用模板后将展示核心网与无线侧回执摘要。
      </Typography.Paragraph>
      <Button onClick={() => void load()} style={{ marginBottom: 12 }} loading={loading}>
        刷新
      </Button>
      {loading && rows.length === 0 ? (
        <div style={{ padding: '16px 0' }}>
          {[1, 2, 3, 4, 5].map((i) => (
            <Skeleton key={i} active title={false} paragraph={{ rows: 1 }} style={{ marginBottom: 8 }} />
          ))}
        </div>
      ) : rows.length === 0 ? (
        <div className="app-empty-state">
          <Empty description="暂无在线终端" />
          <Button style={{ marginTop: 16 }} onClick={() => void load()}>
            刷新
          </Button>
        </div>
      ) : (
        <Table rowKey="id" loading={loading} columns={columns} dataSource={rows} scroll={{ x: 1100 }} />
      )}
      <TruthFeedbackModal
        open={fbOpen}
        title="RedCap 省电策略 — 配置回执"
        report={fbReport}
        onClose={() => setFbOpen(false)}
      />
    </div>
  )
}
