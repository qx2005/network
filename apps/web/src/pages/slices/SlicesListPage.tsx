import { App, Button, Popconfirm, Space, Table, Tag, Typography } from 'antd'
import type { ColumnsType } from 'antd/es/table'
import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { apiGet, apiSend } from '../../api/client'
import type { NetworkSlice } from '../../domain/types'

export function SlicesListPage() {
  const [rows, setRows] = useState<NetworkSlice[]>([])
  const [loading, setLoading] = useState(false)
  const nav = useNavigate()
  const { message } = App.useApp()

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
    { title: '名称', dataIndex: 'displayName', key: 'displayName' },
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
      </Space>
      <Table rowKey="id" loading={loading} columns={columns} dataSource={rows} />
    </div>
  )
}
