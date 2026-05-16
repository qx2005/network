import { Button, Empty, Skeleton, Space, Table, Typography } from 'antd'
import type { ColumnsType } from 'antd/es/table'
import { useEffect, useState } from 'react'
import { apiGet } from '../../api/client'
import { TruthFeedbackModal } from '../../components/TruthFeedbackModal'
import type { ProvisionReport, ProvisioningJob } from '../../domain/types'
import {
  provisioningJobStatusZh,
  provisioningJobTypeZh,
  resourceTypeZh,
} from '../../lib/displayZh'

export function ProvisioningJobsPage() {
  const [rows, setRows] = useState<ProvisioningJob[]>([])
  const [loading, setLoading] = useState(false)
  const [fbOpen, setFbOpen] = useState(false)
  const [fbReport, setFbReport] = useState<ProvisionReport | null>(null)

  const load = async () => {
    setLoading(true)
    try {
      setRows(await apiGet<ProvisioningJob[]>('/api/provisioning/jobs'))
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    void load()
    const t = window.setInterval(() => void load(), 2000)
    return () => window.clearInterval(t)
  }, [])

  const columns: ColumnsType<ProvisioningJob> = [
    { title: '任务编号', dataIndex: 'id', ellipsis: true, width: 220 },
    {
      title: '类型',
      dataIndex: 'type',
      width: 140,
      render: (t: string) => provisioningJobTypeZh(t),
    },
    {
      title: '资源',
      dataIndex: 'resourceType',
      width: 140,
      render: (t: string) => resourceTypeZh(t),
    },
    { title: '资源 ID', dataIndex: 'resourceId', ellipsis: true },
    {
      title: '状态',
      dataIndex: 'status',
      width: 100,
      render: (s: string) => provisioningJobStatusZh(s),
    },
    { title: '消息', dataIndex: 'message', ellipsis: true },
    { title: '创建时间', dataIndex: 'createdAt', width: 200 },
    { title: '完成时间', dataIndex: 'finishedAt', width: 200 },
    {
      title: '配置回执',
      key: 'fb',
      width: 120,
      render: (_, r) =>
        r.report ? (
          <Button
            type="link"
            size="small"
            onClick={() => {
              setFbReport(r.report!)
              setFbOpen(true)
            }}
          >
            查看
          </Button>
        ) : (
          <Typography.Text type="secondary">—</Typography.Text>
        ),
    },
  ]

  return (
    <div>
      <Space className="page-toolbar" style={{ marginBottom: 0 }} wrap>
        <Button onClick={() => void load()} loading={loading}>
          立即刷新
        </Button>
      </Space>
      {loading && rows.length === 0 ? (
        <div style={{ padding: '16px 0' }}>
          {[1, 2, 3, 4, 5].map((i) => (
            <Skeleton key={i} active title={false} paragraph={{ rows: 1 }} style={{ marginBottom: 8 }} />
          ))}
        </div>
      ) : rows.length === 0 ? (
        <div className="app-empty-state">
          <Empty description="暂无下发任务" />
        </div>
      ) : (
        <Table rowKey="id" loading={loading} columns={columns} dataSource={rows} />
      )}
      <TruthFeedbackModal
        open={fbOpen}
        title="下发任务 — 配置回执"
        report={fbReport}
        onClose={() => setFbOpen(false)}
      />
    </div>
  )
}
