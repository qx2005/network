import { App, Button, Empty, Popconfirm, Skeleton, Space, Table, Tag, Typography } from 'antd'
import type { ColumnsType } from 'antd/es/table'
import { useEffect, useRef, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { apiGet, apiSend, getRole } from '../../api/client'
import { DemoAgentDrawer } from '../../components/DemoAgentDrawer'
import { TruthFeedbackModal } from '../../components/TruthFeedbackModal'
import {
  PLAYBOOK_SLICE_BODY,
  buildSliceBodyFromDeviceName,
  scriptSliceGenerateFromDevice,
  scriptSlicePostForAgent,
  scriptSlicePreForAgent,
  slicePlaybookRows,
  slicePlaybookRowsFromBody,
} from '../../demo/demoPlaybook'
import { buildDemoAgentSliceProvisionReport } from '../../demo/demoSliceAgentReport'
import type { NetworkSlice, ProvisionReport } from '../../domain/types'

export function SlicesListPage() {
  const [rows, setRows] = useState<NetworkSlice[]>([])
  const [loading, setLoading] = useState(false)
  const [agentOpen, setAgentOpen] = useState(false)
  const [fbOpen, setFbOpen] = useState(false)
  const [fbReport, setFbReport] = useState<ProvisionReport | null>(null)
  const agentCreatedSliceRef = useRef<NetworkSlice | null>(null)
  const nav = useNavigate()
  const { message } = App.useApp()
  const viewerOnly = getRole() === 'viewer'

  const load = async () => {
    setLoading(true)
    try {
      setRows(await apiGet<NetworkSlice[]>('/api/slices'))
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    void load()
  }, [])

  const columns: ColumnsType<NetworkSlice> = [
    {
      title: '名称',
      dataIndex: 'displayName',
      key: 'displayName',
      render: (text: string) => <span>{text}</span>,
    },
    {
      title: 'S-NSSAI',
      key: 'snssai',
      render: (_, r) => (
        <span>
          SST {r.sst}
          {r.sd ? ` / SD ${r.sd}` : ''}
        </span>
      ),
    },
    { title: 'DNN', dataIndex: 'dnn', key: 'dnn' },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      render: (s: string) =>
        s === 'provisioned' ? (
          <Tag color="green">已下发</Tag>
        ) : s === 'draft' ? (
          <Tag>草稿</Tag>
        ) : (
          <Tag color="red">异常</Tag>
        ),
    },
    { title: '版本', dataIndex: 'version', width: 90 },
    {
      title: '操作',
      key: 'actions',
      render: (_, r) => {
        const isProvisioned = r.status === 'provisioned'
        return (
          <Space size="middle" wrap>
            <Link to={`/slices/${r.id}`}>编辑</Link>
            {isProvisioned ? (
              <Typography.Text type="secondary" style={{ fontSize: 13 }}>
                删除（需先回滚）
              </Typography.Text>
            ) : (
              <Popconfirm
                title="确认删除该切片？"
                description="删除后不可恢复，相关审计仍会保留。"
                okText="删除"
                cancelText="取消"
                okButtonProps={{ danger: true }}
                onConfirm={async () => {
                  try {
                    await apiSend(`/api/slices/${r.id}`, { method: 'DELETE' })
                    message.success('已删除')
                    await load()
                  } catch (e) {
                    message.error(
                      e instanceof Error ? e.message : '删除失败',
                    )
                  }
                }}
              >
                <Button type="link" danger style={{ padding: 0 }}>
                  删除
                </Button>
              </Popconfirm>
            )}
          </Space>
        )
      },
    },
  ]

  return (
    <div>
      <Space className="page-toolbar" style={{ marginBottom: 0 }} align="center" wrap>
        <Button type="primary" onClick={() => nav('/slices/new')}>
          新建切片
        </Button>
        <Button onClick={() => void load()} loading={loading}>
          刷新
        </Button>
        <Button disabled={viewerOnly} onClick={() => setAgentOpen(true)}>
          Agent 配置
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
          <Empty description="暂无切片实例" />
          <Button type="primary" style={{ marginTop: 16 }} onClick={() => nav('/slices/new')}>
            新建切片
          </Button>
        </div>
      ) : (
        <Table rowKey="id" loading={loading} columns={columns} dataSource={rows} />
      )}
      <DemoAgentDrawer
        open={agentOpen}
        onClose={() => setAgentOpen(false)}
        deviceNameStep={{
          buildGenerateScript: scriptSliceGenerateFromDevice,
          buildFieldRows: (name) =>
            slicePlaybookRowsFromBody(buildSliceBodyFromDeviceName(name)),
        }}
        fieldRows={slicePlaybookRows()}
        preScript={scriptSlicePreForAgent}
        postScript={scriptSlicePostForAgent}
        onSuccess={() => {
          void load()
          const created = agentCreatedSliceRef.current
          agentCreatedSliceRef.current = null
          if (created) {
            setFbReport(buildDemoAgentSliceProvisionReport(created))
            setFbOpen(true)
          }
        }}
        onExecute={async (ctx) => {
          agentCreatedSliceRef.current = null
          const body = ctx?.deviceName
            ? buildSliceBodyFromDeviceName(ctx.deviceName)
            : PLAYBOOK_SLICE_BODY
          const existing = await apiGet<NetworkSlice[]>('/api/slices')
          const hit = existing.find((s) => s.id === body.id)
          if (hit) {
            agentCreatedSliceRef.current = hit
            return
          }
          const slice = await apiSend<NetworkSlice>(
            '/api/slices',
            {
              method: 'POST',
              body: JSON.stringify(body),
            },
            { demoPlaybook: true },
          )
          agentCreatedSliceRef.current = slice
        }}
      />
      <TruthFeedbackModal
        open={fbOpen}
        title="切片下发 — 配置回执"
        report={fbReport}
        onClose={() => setFbOpen(false)}
      />
    </div>
  )
}
