import { App, Button, Form, Input, InputNumber, Space, Switch, Table, Typography } from 'antd'
import type { ColumnsType } from 'antd/es/table'
import { useEffect, useState } from 'react'
import { apiGet, apiSend } from '../../api/client'
import type { PowerProfile } from '../../domain/types'

export function PowerProfilesPage() {
  const { message } = App.useApp()
  const [rows, setRows] = useState<PowerProfile[]>([])
  const [loading, setLoading] = useState(false)
  const [open, setOpen] = useState(false)
  const [form] = Form.useForm<PowerProfile>()

  const load = async () => {
    setLoading(true)
    try {
      setRows(await apiGet<PowerProfile[]>('/api/redcap/power-profiles'))
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    void load()
  }, [])

  const columns: ColumnsType<PowerProfile> = [
    { title: '模板名', dataIndex: 'templateName' },
    { title: '设备类型标签', dataIndex: 'deviceTypeTag' },
    { title: 'eDRX 周期 (s)', dataIndex: 'edrxCycleSeconds' },
    { title: 'PTW (s)', dataIndex: 'ptwSeconds' },
    { title: 'DRX (ms)', dataIndex: 'drxMs' },
    {
      title: 'PSM',
      dataIndex: 'psmEnabled',
      render: (v: boolean) => (v ? '开' : '关'),
    },
    { title: '推荐心跳 (s)', dataIndex: 'heartbeatRecommendedSeconds' },
  ]

  return (
    <div>
      <Space className="page-toolbar" style={{ marginBottom: 0 }} wrap>
        <Button type="primary" onClick={() => setOpen(true)}>
          新建模板
        </Button>
        <Button onClick={() => void load()} loading={loading}>
          刷新
        </Button>
      </Space>
      <Table rowKey="id" loading={loading} columns={columns} dataSource={rows} />
      {open ? (
        <div style={{ marginTop: 16 }}>
          <Typography.Title level={5}>新建模板</Typography.Title>
          <Form
            form={form}
            layout="vertical"
            onFinish={async (v) => {
              try {
                await apiSend('/api/redcap/power-profiles', {
                  method: 'POST',
                  body: JSON.stringify(v),
                })
                message.success('已创建模板')
                form.resetFields()
                setOpen(false)
                await load()
              } catch (e) {
                message.error(e instanceof Error ? e.message : '创建失败')
              }
            }}
            initialValues={{
              edrxCycleSeconds: 40.96,
              ptwSeconds: 2.56,
              drxMs: 320,
              psmEnabled: false,
              heartbeatRecommendedSeconds: 30,
            }}
          >
            <Form.Item name="templateName" label="模板名" rules={[{ required: true }]}>
              <Input />
            </Form.Item>
            <Form.Item name="deviceTypeTag" label="设备类型标签">
              <Input placeholder="level_meter / thermometer" />
            </Form.Item>
            <Form.Item name="edrxCycleSeconds" label="eDRX 周期 (s)">
              <InputNumber style={{ width: '100%' }} step={0.01} />
            </Form.Item>
            <Form.Item name="ptwSeconds" label="PTW (s)">
              <InputNumber style={{ width: '100%' }} step={0.01} />
            </Form.Item>
            <Form.Item name="drxMs" label="DRX (ms)">
              <InputNumber style={{ width: '100%' }} />
            </Form.Item>
            <Form.Item name="psmEnabled" label="PSM" valuePropName="checked">
              <Switch />
            </Form.Item>
            <Form.Item name="heartbeatRecommendedSeconds" label="推荐心跳 (s)">
              <InputNumber style={{ width: '100%' }} />
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
