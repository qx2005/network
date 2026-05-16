import { App, Button, Card, Empty, Form, Input, InputNumber, Modal, Popconfirm, Select, Skeleton, Space, Switch, Table } from 'antd'
import type { ColumnsType } from 'antd/es/table'
import { useEffect, useRef, useState } from 'react'
import { apiGet, apiSend, getRole } from '../../api/client'
import { DemoAgentDrawer } from '../../components/DemoAgentDrawer'
import { TruthFeedbackModal } from '../../components/TruthFeedbackModal'
import {
  PLAYBOOK_MEC_RULE_BODY,
  SCRIPT_MEC_RULE_POST,
  SCRIPT_MEC_RULE_PRE,
  buildMecRuleBodyFromDeviceName,
  mecRulePlaybookRows,
  mecRulePlaybookRowsFromBody,
  scriptMecRuleGenerateFromDevice,
} from '../../demo/demoPlaybook'
import type { CommitResult, MecOffloadRule, ProvisionReport } from '../../domain/types'
import { mecActionTypeZh, protocolLabelZh } from '../../lib/displayZh'

const newRuleFormDefaults = {
  priority: 100,
  protocol: 'ANY',
  bypassPublicNetwork: true,
  actionType: 'LOCAL_BREAKOUT',
} as const

export function MecRulesPage() {
  const { message } = App.useApp()
  const [rows, setRows] = useState<MecOffloadRule[]>([])
  const [loading, setLoading] = useState(false)
  const [open, setOpen] = useState(false)
  const [agentOpen, setAgentOpen] = useState(false)
  const [form] = Form.useForm()
  const viewerOnly = getRole() === 'viewer'
  const [fbOpen, setFbOpen] = useState(false)
  const [fbReport, setFbReport] = useState<ProvisionReport | null>(null)
  /** Stash API report during onExecute; open modal in onSuccess after stepper completes. */
  /** onExecute 阶段暂存回执；进度条跑完后在 onSuccess 中再打开弹窗。 */
  const agentMecRuleReportRef = useRef<ProvisionReport | null>(null)

  const closeModal = () => {
    setOpen(false)
    form.resetFields()
  }

  const load = async () => {
    setLoading(true)
    try {
      setRows(await apiGet<MecOffloadRule[]>('/api/mec/rules'))
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    void load()
  }, [])

  const columns: ColumnsType<MecOffloadRule> = [
    { title: '优先级', dataIndex: 'priority', width: 100 },
    {
      title: '名称',
      dataIndex: 'name',
      render: (text: string) => <span>{text}</span>,
    },
    {
      title: '匹配',
      key: 'm',
      render: (_, r) => (
        <span>
          {protocolLabelZh(r.match.protocol)} {r.match.destIpCidrs.join(',')} 端口{' '}
          {r.match.portRanges.join(',')}
        </span>
      ),
    },
    {
      title: '动作',
      key: 'a',
      render: (_, r) => (
        <span>
          {mecActionTypeZh(r.action.actionType)}
          {r.action.bypassPublicNetwork ? ' · 绕过公网' : ''}{' '}
          {r.action.nextHop ?? ''}
        </span>
      ),
    },
    { title: '命中', dataIndex: 'hitCount', width: 100 },
    {
      title: '操作',
      key: 'actions',
      width: 80,
      render: (_, r) => (
        <Popconfirm
          title="确认删除该规则？"
          onConfirm={async () => {
            try {
              await apiSend(`/api/mec/rules/${r.id}`, { method: 'DELETE' })
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
    {
      title: '启用',
      dataIndex: 'enabled',
      width: 90,
      render: (v: boolean, r) => (
        <Switch
          checked={v}
          onChange={async (checked) => {
            try {
              const res = await apiSend<CommitResult<MecOffloadRule>>(
                `/api/mec/rules/${r.id}`,
                {
                  method: 'PATCH',
                  body: JSON.stringify({ enabled: checked }),
                },
              )
              setFbReport(res.report)
              setFbOpen(true)
              message.success('规则状态已更新')
              await load()
            } catch (e) {
              message.error(e instanceof Error ? e.message : '更新失败')
            }
          }}
        />
      ),
    },
  ]

  return (
    <div>
      <Space className="page-toolbar" style={{ marginBottom: 0 }} wrap>
        <Button type="primary" onClick={() => setOpen(true)}>
          新建规则
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
          <Empty description="暂无分流规则" />
          <Button type="primary" style={{ marginTop: 16 }} onClick={() => setOpen(true)}>
            新建规则
          </Button>
        </div>
      ) : (
        <Table rowKey="id" loading={loading} columns={columns} dataSource={rows} />
      )}
      <Modal
        title="新建规则"
        open={open}
        onCancel={closeModal}
        footer={null}
        width={800}
        destroyOnHidden
        afterOpenChange={(visible) => {
          if (visible) {
            form.resetFields()
            form.setFieldsValue({ ...newRuleFormDefaults })
          }
        }}
        styles={{ body: { maxHeight: 'calc(100vh - 220px)', overflowY: 'auto', paddingTop: 8 } }}
      >
        <Form
          form={form}
          layout="vertical"
          initialValues={newRuleFormDefaults}
          onFinish={async (v) => {
            const destIpCidrs = String(v.destIpCidrs || '')
              .split(',')
              .map((s: string) => s.trim())
              .filter(Boolean)
            const srcIpCidrs = String(v.srcIpCidrs || '')
              .split(',')
              .map((s: string) => s.trim())
              .filter(Boolean)
            const portRanges = String(v.portRanges || '')
              .split(',')
              .map((s: string) => s.trim())
              .filter(Boolean)
            const body = {
              priority: v.priority,
              name: v.name,
              enabled: true,
              match: {
                destIpCidrs,
                srcIpCidrs,
                protocol: v.protocol,
                portRanges,
                vnId: v.vnId || undefined,
              },
              action: {
                actionType: v.actionType,
                nextHop: v.nextHop || undefined,
                bypassPublicNetwork: !!v.bypassPublicNetwork,
              },
            }
            try {
              const res = await apiSend<CommitResult<MecOffloadRule>>(
                '/api/mec/rules',
                {
                  method: 'POST',
                  body: JSON.stringify(body),
                },
              )
              setFbReport(res.report)
              setFbOpen(true)
              message.success('已创建规则')
              closeModal()
              await load()
            } catch (e) {
              message.error(e instanceof Error ? e.message : '创建失败')
            }
          }}
        >
          <Card className="form-section-card" size="small" title="基本信息">
            <Form.Item name="name" label="规则名" rules={[{ required: true }]}>
              <Input />
            </Form.Item>
            <Form.Item name="priority" label="优先级（数值越小越优先，按实现约定）">
              <InputNumber style={{ width: '100%' }} />
            </Form.Item>
          </Card>
          <Card className="form-section-card" size="small" title="匹配条件">
            <Form.Item name="destIpCidrs" label="目的网段 CIDR（逗号分隔）">
              <Input placeholder="10.45.0.0/16" />
            </Form.Item>
            <Form.Item name="srcIpCidrs" label="源网段 CIDR（可选，逗号分隔）">
              <Input />
            </Form.Item>
            <Form.Item name="protocol" label="协议">
              <Select
                options={[
                  { value: 'ANY', label: '任意' },
                  { value: 'TCP', label: 'TCP' },
                  { value: 'UDP', label: 'UDP' },
                ]}
              />
            </Form.Item>
            <Form.Item name="portRanges" label="端口范围（逗号分隔，如 4840 或 8000-8010）">
              <Input />
            </Form.Item>
            <Form.Item name="vnId" label="VN ID（可选）">
              <Input placeholder="vn-line1" />
            </Form.Item>
          </Card>
          <Card className="form-section-card" size="small" title="动作">
            <Form.Item name="actionType" label="动作类型">
              <Select
                options={[
                  { value: 'LOCAL_BREAKOUT', label: '本地分流' },
                  { value: 'NEXT_HOP', label: '下一跳' },
                  { value: 'MIRROR', label: '镜像' },
                ]}
              />
            </Form.Item>
            <Form.Item name="nextHop" label="下一跳（可选）">
              <Input />
            </Form.Item>
            <Form.Item name="bypassPublicNetwork" label="绕过公网" valuePropName="checked">
              <Switch />
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
        title="MEC 分流规则 — 配置回执"
        report={fbReport}
        onClose={() => setFbOpen(false)}
      />
      <DemoAgentDrawer
        open={agentOpen}
        onClose={() => setAgentOpen(false)}
        deviceNameStep={{
          buildGenerateScript: scriptMecRuleGenerateFromDevice,
          buildFieldRows: (name) => mecRulePlaybookRowsFromBody(buildMecRuleBodyFromDeviceName(name)),
        }}
        fieldRows={mecRulePlaybookRows()}
        preScript={SCRIPT_MEC_RULE_PRE}
        postScript={SCRIPT_MEC_RULE_POST}
        onSuccess={() => {
          void load()
          const report = agentMecRuleReportRef.current
          agentMecRuleReportRef.current = null
          if (report) {
            setFbReport(report)
            setFbOpen(true)
          }
        }}
        onExecute={async (ctx) => {
          agentMecRuleReportRef.current = null
          const body = ctx?.deviceName
            ? buildMecRuleBodyFromDeviceName(ctx.deviceName)
            : PLAYBOOK_MEC_RULE_BODY
          const res = await apiSend<CommitResult<MecOffloadRule>>(
            '/api/mec/rules',
            {
              method: 'POST',
              body: JSON.stringify(body),
            },
            { demoPlaybook: true },
          )
          agentMecRuleReportRef.current = res.report
        }}
      />
    </div>
  )
}
