import { App, Button, Form, Input, Select, Space, Switch, Table, Typography } from 'antd'
import type { ColumnsType } from 'antd/es/table'
import { useEffect, useState } from 'react'
import { apiGet, apiSend } from '../../api/client'
import { TruthFeedbackModal } from '../../components/TruthFeedbackModal'
import type { CommitResult, FiveGLanVn, ProvisionReport } from '../../domain/types'
import { vnLifecycleStatusZh, vnPolicyZh } from '../../lib/displayZh'

export function VnPage() {
  const { message } = App.useApp()
  const [rows, setRows] = useState<FiveGLanVn[]>([])
  const [loading, setLoading] = useState(false)
  const [open, setOpen] = useState(false)
  const [form] = Form.useForm()
  const [fbOpen, setFbOpen] = useState(false)
  const [fbReport, setFbReport] = useState<ProvisionReport | null>(null)

  const load = async () => {
    setLoading(true)
    try {
      setRows(await apiGet<FiveGLanVn[]>('/api/five-glan/vn'))
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    void load()
  }, [])

  const columns: ColumnsType<FiveGLanVn> = [
    { title: '显示名', dataIndex: 'displayName' },
    { title: '技术 ID', dataIndex: 'technicalId' },
    { title: '关联切片', dataIndex: 'linkedSliceId' },
    {
      title: '成员数',
      key: 'mc',
      render: (_, r) => r.memberIds.length,
    },
    {
      title: '以太网 PDU',
      dataIndex: 'ethernetPduAllowed',
      render: (v: boolean) => (v ? '是' : '否'),
    },
    {
      title: '广播策略',
      dataIndex: 'broadcastPolicy',
      render: (p: string) => vnPolicyZh(p),
    },
    {
      title: '组播策略',
      dataIndex: 'multicastPolicy',
      render: (p: string) => vnPolicyZh(p),
    },
    {
      title: '状态',
      dataIndex: 'status',
      render: (s: string) => vnLifecycleStatusZh(s),
    },
  ]

  return (
    <div>
      <Space className="page-toolbar" style={{ marginBottom: 0 }} wrap>
        <Button type="primary" onClick={() => setOpen(true)}>
          新建 VN 组
        </Button>
        <Button onClick={() => void load()} loading={loading}>
          刷新
        </Button>
      </Space>
      <Table rowKey="id" loading={loading} columns={columns} dataSource={rows} />
      {open ? (
        <div style={{ marginTop: 16 }}>
          <Typography.Title level={5}>新建 VN 组</Typography.Title>
          <Form
            form={form}
            layout="vertical"
            initialValues={{
              ethernetPduAllowed: true,
              broadcastPolicy: 'LIMITED',
              multicastPolicy: 'ALLOW',
              linkedSliceId: 'slice-vision-embb',
            }}
            onFinish={async (v) => {
              const memberIds = String(v.memberIds || '')
                .split(',')
                .map((s: string) => s.trim())
                .filter(Boolean)
              try {
                const res = await apiSend<CommitResult<FiveGLanVn>>(
                  '/api/five-glan/vn',
                  {
                    method: 'POST',
                    body: JSON.stringify({ ...v, memberIds }),
                  },
                )
                setFbReport(res.report)
                setFbOpen(true)
                message.success('已创建虚拟网络')
                form.resetFields()
                setOpen(false)
                await load()
              } catch (e) {
                message.error(e instanceof Error ? e.message : '创建失败')
              }
            }}
          >
            <Form.Item name="displayName" label="显示名" rules={[{ required: true }]}>
              <Input />
            </Form.Item>
            <Form.Item name="technicalId" label="技术 ID（可留空自动生成）">
              <Input />
            </Form.Item>
            <Form.Item name="linkedSliceId" label="关联切片 ID">
              <Input />
            </Form.Item>
            <Form.Item name="memberIds" label="成员终端 ID（逗号分隔）">
              <Input placeholder="dev-1,dev-2" />
            </Form.Item>
            <Form.Item name="ethernetPduAllowed" label="允许以太网 PDU" valuePropName="checked">
              <Switch />
            </Form.Item>
            <Form.Item name="broadcastPolicy" label="广播策略">
              <Select
                options={[
                  { value: 'ALLOW', label: '允许' },
                  { value: 'LIMITED', label: '受限' },
                  { value: 'DENY', label: '禁止' },
                ]}
              />
            </Form.Item>
            <Form.Item name="multicastPolicy" label="组播策略">
              <Select
                options={[
                  { value: 'ALLOW', label: '允许' },
                  { value: 'LIMITED', label: '受限' },
                  { value: 'DENY', label: '禁止' },
                ]}
              />
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
      <TruthFeedbackModal
        open={fbOpen}
        title="5G LAN VN — 配置回执"
        report={fbReport}
        onClose={() => setFbOpen(false)}
      />
    </div>
  )
}
