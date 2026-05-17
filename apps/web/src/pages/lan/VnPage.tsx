import { App, Button, Card, Empty, Form, Input, Modal, Popconfirm, Select, Skeleton, Space, Switch, Table } from 'antd'
import type { ColumnsType } from 'antd/es/table'
import { useEffect, useRef, useState } from 'react'
import { apiGet, apiSend, getRole } from '../../api/client'
import { DemoAgentDrawer } from '../../components/DemoAgentDrawer'
import { TruthFeedbackModal } from '../../components/TruthFeedbackModal'
import {
  PLAYBOOK_VN_BODY,
  playbookRequiredLinkedSliceId,
  scriptVnPostForAgent,
  scriptVnPreForAgent,
  buildVnBodyFromDeviceName,
  scriptVnGenerateFromDevice,
  vnPlaybookRows,
  vnPlaybookRowsFromBody,
} from '../../demo/demoPlaybook'
import type { CommitResult, FiveGLanVn, NetworkSlice, ProvisionReport } from '../../domain/types'
import { vnLifecycleStatusZh, vnPolicyZh } from '../../lib/displayZh'

const newVnFormDefaults = {
  ethernetPduAllowed: true,
  broadcastPolicy: 'LIMITED',
  multicastPolicy: 'ALLOW',
  linkedSliceId: '',
} as const

export function VnPage() {
  const { message } = App.useApp()
  const [rows, setRows] = useState<FiveGLanVn[]>([])
  const [loading, setLoading] = useState(false)
  const [open, setOpen] = useState(false)
  const [agentOpen, setAgentOpen] = useState(false)
  const [form] = Form.useForm()
  const viewerOnly = getRole() === 'viewer'
  const [fbOpen, setFbOpen] = useState(false)
  const [fbReport, setFbReport] = useState<ProvisionReport | null>(null)
  /** Stash API report during onExecute; open modal in onSuccess after stepper completes. */
  /** onExecute 阶段暂存回执；进度条跑完后在 onSuccess 中再打开弹窗。 */
  const agentVnReportRef = useRef<ProvisionReport | null>(null)

  const closeModal = () => {
    setOpen(false)
    form.resetFields()
  }

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
    {
      title: '显示名',
      dataIndex: 'displayName',
      render: (text: string) => <span>{text}</span>,
    },
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
      width: 100,
    },
    {
      title: '操作',
      key: 'actions',
      width: 80,
      render: (_, r) => (
        <Popconfirm
          title="确认删除该 VN 组？"
          onConfirm={async () => {
            try {
              await apiSend(`/api/five-glan/vn/${r.id}`, { method: 'DELETE' })
              message.success('已删除')
              await load()
            } catch (e) {
              message.error(e instanceof Error ? e.message : '删除失败')
            }
          }}
        >
          <Button type="link" danger size="small">
            删除
          </Button>
        </Popconfirm>
      ),
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
          <Empty description="暂无 5G LAN VN 组" />
          <Button type="primary" style={{ marginTop: 16 }} onClick={() => setOpen(true)}>
            新建 VN 组
          </Button>
        </div>
      ) : (
        <Table rowKey="id" loading={loading} columns={columns} dataSource={rows} />
      )}
      <Modal
        title="新建 VN 组"
        open={open}
        onCancel={closeModal}
        footer={null}
        width={720}
        destroyOnHidden
        afterOpenChange={(visible) => {
          if (visible) {
            form.resetFields()
            form.setFieldsValue({ ...newVnFormDefaults })
          }
        }}
        styles={{ body: { maxHeight: 'calc(100vh - 220px)', overflowY: 'auto', paddingTop: 8 } }}
      >
        <Form
          form={form}
          layout="vertical"
          initialValues={newVnFormDefaults}
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
              closeModal()
              await load()
            } catch (e) {
              message.error(e instanceof Error ? e.message : '创建失败')
            }
          }}
        >
          <Card className="form-section-card" size="small" title="基本信息">
            <Form.Item name="displayName" label="显示名" rules={[{ required: true }]}>
              <Input />
            </Form.Item>
            <Form.Item name="technicalId" label="技术 ID（可留空自动生成）">
              <Input />
            </Form.Item>
            <Form.Item
              name="linkedSliceId"
              label="关联切片 ID"
              rules={[{ required: true, message: '请填写关联切片 ID' }]}
            >
              <Input placeholder="创建切片后填写其技术 ID" />
            </Form.Item>
          </Card>
          <Card className="form-section-card" size="small" title="成员配置">
            <Form.Item name="memberIds" label="成员终端 ID（逗号分隔）">
              <Input placeholder="dev-arm-01" />
            </Form.Item>
          </Card>
          <Card className="form-section-card" size="small" title="策略">
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
          </Card>
          <Space>
            <Button type="primary" htmlType="submit">
              保存
            </Button>
            <Button onClick={closeModal}>取消</Button>
          </Space>
        </Form>
      </Modal>
      <TruthFeedbackModal
        open={fbOpen}
        title="5G LAN VN — 配置回执"
        report={fbReport}
        onClose={() => setFbOpen(false)}
      />
      <DemoAgentDrawer
        open={agentOpen}
        onClose={() => setAgentOpen(false)}
        deviceNameStep={{
          buildGenerateScript: scriptVnGenerateFromDevice,
          buildFieldRows: (name) => vnPlaybookRowsFromBody(buildVnBodyFromDeviceName(name)),
        }}
        fieldRows={vnPlaybookRows()}
        preScript={scriptVnPreForAgent}
        postScript={scriptVnPostForAgent}
        onSuccess={() => {
          void load()
          const report = agentVnReportRef.current
          agentVnReportRef.current = null
          if (report) {
            setFbReport(report)
            setFbOpen(true)
          }
        }}
        onExecute={async (ctx) => {
          agentVnReportRef.current = null
          const slices = await apiGet<NetworkSlice[]>('/api/slices')
          const requireSliceId = playbookRequiredLinkedSliceId(ctx?.deviceName)
          if (!slices.some((s) => s.id === requireSliceId)) {
            throw new Error(
              `缺少文档要求的切片 ID：${requireSliceId}，请先在「切片实例」执行 Agent 配置或手动创建该切片`,
            )
          }
          const body = ctx?.deviceName
            ? buildVnBodyFromDeviceName(ctx.deviceName)
            : PLAYBOOK_VN_BODY
          const res = await apiSend<CommitResult<FiveGLanVn>>(
            '/api/five-glan/vn',
            {
              method: 'POST',
              body: JSON.stringify(body),
            },
            { demoPlaybook: true },
          )
          agentVnReportRef.current = res.report
        }}
      />
    </div>
  )
}
