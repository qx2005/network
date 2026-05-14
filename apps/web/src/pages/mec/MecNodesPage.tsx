import { App, Button, Form, Input, Space, Table, Typography } from 'antd'
import type { ColumnsType } from 'antd/es/table'
import { useEffect, useState } from 'react'
import { apiGet, apiSend } from '../../api/client'
import type { MecNode } from '../../domain/types'

export function MecNodesPage() {
  const { message } = App.useApp()
  const [rows, setRows] = useState<MecNode[]>([])
  const [loading, setLoading] = useState(false)
  const [open, setOpen] = useState(false)
  const [form] = Form.useForm()

  const load = async () => {
    setLoading(true)
    try {
      setRows(await apiGet<MecNode[]>('/api/mec/nodes'))
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    void load()
  }, [])

  const columns: ColumnsType<MecNode> = [
    { title: '节点名', dataIndex: 'nodeName' },
    { title: 'N6 本地端点', dataIndex: 'n6LocalEndpoint' },
    {
      title: 'DNN',
      dataIndex: 'dnnIds',
      render: (v: string[]) => v.join(', '),
    },
    {
      title: '能力标签',
      dataIndex: 'capabilityTags',
      render: (v: string[]) => v.join(', '),
    },
    { title: '健康探测', dataIndex: 'healthProbe', ellipsis: true },
  ]

  return (
    <div>
      <Space className="page-toolbar" style={{ marginBottom: 0 }} wrap>
        <Button type="primary" onClick={() => setOpen(true)}>
          注册节点
        </Button>
        <Button onClick={() => void load()} loading={loading}>
          刷新
        </Button>
      </Space>
      <Table rowKey="id" loading={loading} columns={columns} dataSource={rows} />
      {open ? (
        <div style={{ marginTop: 16 }}>
          <Typography.Title level={5}>注册节点</Typography.Title>
          <Form
            form={form}
            layout="vertical"
            onFinish={async (v) => {
              try {
                await apiSend('/api/mec/nodes', {
                  method: 'POST',
                  body: JSON.stringify({
                    ...v,
                    dnnIds: String(v.dnnIds || '')
                      .split(',')
                      .map((s: string) => s.trim())
                      .filter(Boolean),
                    capabilityTags: String(v.capabilityTags || '')
                      .split(',')
                      .map((s: string) => s.trim())
                      .filter(Boolean),
                  }),
                })
                message.success('已创建节点')
                form.resetFields()
                setOpen(false)
                await load()
              } catch (e) {
                message.error(e instanceof Error ? e.message : '创建失败')
              }
            }}
          >
            <Form.Item name="nodeName" label="节点名" rules={[{ required: true }]}>
              <Input />
            </Form.Item>
            <Form.Item name="n6LocalEndpoint" label="N6 本地端点" rules={[{ required: true }]}>
              <Input placeholder="10.10.0.3:2152" />
            </Form.Item>
            <Form.Item name="dnnIds" label="DNN 列表（逗号分隔）">
              <Input placeholder="dnn-a.private,dnn-b.private" />
            </Form.Item>
            <Form.Item name="capabilityTags" label="能力标签（逗号分隔）">
              <Input placeholder="N6_BREAKOUT,LCL" />
            </Form.Item>
            <Form.Item name="healthProbe" label="健康探测 URL">
              <Input />
            </Form.Item>
            <Space>
              <Button type="primary" htmlType="submit">
                保存
              </Button>
              <Button
                onClick={() => {
                  setOpen(false)
                  form.resetFields()
                }}
              >
                取消
              </Button>
            </Space>
          </Form>
        </div>
      ) : null}
    </div>
  )
}
