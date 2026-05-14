import { Button, Table, Typography } from 'antd'
import type { ColumnsType } from 'antd/es/table'
import { useEffect, useState } from 'react'
import { apiGet } from '../../api/client'
import type { AuditLogEntry } from '../../domain/types'
import { auditResultZh } from '../../lib/displayZh'

export function AuditLogsPage() {
  const [rows, setRows] = useState<AuditLogEntry[]>([])
  const [loading, setLoading] = useState(false)

  const load = async () => {
    setLoading(true)
    try {
      setRows(await apiGet<AuditLogEntry[]>('/api/audit/logs'))
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    void load()
  }, [])

  const columns: ColumnsType<AuditLogEntry> = [
    { title: '时间', dataIndex: 'timestamp', width: 200 },
    { title: '操作者', dataIndex: 'actor', width: 120 },
    { title: '动作', dataIndex: 'action', width: 180 },
    { title: '资源类型', dataIndex: 'resourceType', width: 160 },
    { title: '资源标识', dataIndex: 'resourceId', ellipsis: true },
    {
      title: '结果',
      dataIndex: 'result',
      width: 100,
      render: (r: string) => auditResultZh(r),
    },
    { title: '追踪标识', dataIndex: 'traceId', ellipsis: true },
  ]

  return (
    <div>
      <Typography.Paragraph type="secondary" style={{ marginBottom: 12 }}>
        字段值与后端审计模型一致，便于对接分析与留存系统。
      </Typography.Paragraph>
      <Button onClick={() => void load()} loading={loading} style={{ marginBottom: 12 }}>
        刷新
      </Button>
      <Table rowKey="id" loading={loading} columns={columns} dataSource={rows} />
    </div>
  )
}
