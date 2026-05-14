import { App, Button, Select, Space, Table, Typography } from 'antd'
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
    { title: '别名', dataIndex: 'alias' },
    { title: 'SUPI', dataIndex: 'supi', ellipsis: true },
    { title: '切片', dataIndex: 'sliceId' },
    { title: 'VN', dataIndex: 'vnId' },
    { title: 'IP', dataIndex: 'ipAddress' },
    { title: 'RRC', dataIndex: 'rrcState' },
    { title: '信号', dataIndex: 'signalQuality' },
    { title: 'eDRX', dataIndex: 'edrxState' },
    {
      title: '套用省电模板',
      key: 'prof',
      render: (_, r) => (
        <Space>
          <Select
            style={{ minWidth: 220 }}
            placeholder="选择模板"
            value={profilePick[r.id] ?? r.powerProfileId}
            options={profiles.map((p) => ({ value: p.id, label: p.templateName }))}
            onChange={(v) => setProfilePick((m) => ({ ...m, [r.id]: v }))}
          />
          <Button
            type="link"
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
        </Space>
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
      <Table rowKey="id" loading={loading} columns={columns} dataSource={rows} />
      <TruthFeedbackModal
        open={fbOpen}
        title="RedCap 省电策略 — 配置回执"
        report={fbReport}
        onClose={() => setFbOpen(false)}
      />
    </div>
  )
}
