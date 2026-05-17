import { App, Button, Card, Empty, Form, Input, Popconfirm, Skeleton, Space, Table, Typography } from 'antd'
import type { ColumnsType } from 'antd/es/table'
import { useEffect, useState } from 'react'
import { apiGet, apiSend, getRole } from '../../api/client'
import { DemoAgentDrawer } from '../../components/DemoAgentDrawer'
import { FormCreateModal } from '../../components/FormCreateModal'
import {
  PLAYBOOK_MEC_NODE_BODY,
  SCRIPT_MEC_NODE_POST,
  scriptMecNodePreForAgent,
  buildMecNodeBodyFromDeviceName,
  mecNodePlaybookRows,
  mecNodePlaybookRowsFromBody,
  scriptMecNodeGenerateFromDevice,
} from '../../demo/demoPlaybook'
import type { MecNode } from '../../domain/types'

function joinList(v: string[] | undefined): string {
  return Array.isArray(v) ? v.join(', ') : ''
}

export function MecNodesPage() {
  const { message } = App.useApp()
  const [rows, setRows] = useState<MecNode[]>([])
  const [loading, setLoading] = useState(false)
  const [open, setOpen] = useState(false)
  const [agentOpen, setAgentOpen] = useState(false)
  const [form] = Form.useForm()
  const viewerOnly = getRole() === 'viewer'

  const closeModal = () => {
    setOpen(false)
    form.resetFields()
  }

  const openModal = () => setOpen(true)

  const load = async () => {
    setLoading(true)
    try {
      setRows(await apiGet<MecNode[]>('/api/mec/nodes'))
    } catch (e) {
      message.error(e instanceof Error ? e.message : '加载节点列表失败')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    void load()
  }, [])

  const columns: ColumnsType<MecNode> = [
    {
      title: '节点名',
      dataIndex: 'nodeName',
      render: (text: string) => <span>{text}</span>,
    },
    { title: 'N6 本地端点', dataIndex: 'n6LocalEndpoint' },
    {
      title: 'DNN',
      dataIndex: 'dnnIds',
      render: (v: string[]) => joinList(v),
    },
    {
      title: '能力标签',
      dataIndex: 'capabilityTags',
      render: (v: string[]) => joinList(v),
    },
    { title: '健康探测', dataIndex: 'healthProbe', ellipsis: true },
    {
      title: '操作',
      key: 'actions',
      width: 88,
      fixed: 'right',
      render: (_, r) =>
        viewerOnly ? (
          <Typography.Text type="secondary" style={{ fontSize: 13 }}>
            —
          </Typography.Text>
        ) : (
          <Popconfirm
            title="确认删除该节点？"
            description="删除后不可恢复，相关审计仍会保留。"
            okText="删除"
            cancelText="取消"
            okButtonProps={{ danger: true }}
            onConfirm={async () => {
              try {
                await apiSend(`/api/mec/nodes/${r.id}`, { method: 'DELETE' })
                message.success('已删除节点')
                await load()
              } catch (e) {
                message.error(e instanceof Error ? e.message : '删除失败')
              }
            }}
          >
            <Button type="link" danger size="small" style={{ padding: 0 }}>
              删除
            </Button>
          </Popconfirm>
        ),
    },
  ]

  return (
    <div>
      <Space className="page-toolbar" style={{ marginBottom: 0 }} wrap>
        <Button type="primary" onClick={openModal}>
          注册节点
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
          <Empty description="暂无 MEC 节点" />
          <Button type="primary" style={{ marginTop: 16 }} onClick={openModal}>
            注册节点
          </Button>
        </div>
      ) : (
        <Table rowKey="id" loading={loading} columns={columns} dataSource={rows} />
      )}
      <FormCreateModal
        title="注册节点"
        open={open}
        onCancel={closeModal}
        afterOpenChange={(visible) => {
          if (visible) form.resetFields()
        }}
      >
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
              closeModal()
              await load()
            } catch (e) {
              message.error(e instanceof Error ? e.message : '创建失败')
            }
          }}
        >
          <Card className="form-section-card" size="small" title="节点信息">
            <Form.Item name="nodeName" label="节点名" rules={[{ required: true }]}>
              <Input />
            </Form.Item>
            <Form.Item name="n6LocalEndpoint" label="N6 本地端点" rules={[{ required: true }]}>
              <Input placeholder="10.10.0.3:2152" />
            </Form.Item>
          </Card>
          <Card className="form-section-card" size="small" title="路由与探测">
            <Form.Item name="dnnIds" label="DNN 列表（逗号分隔）">
              <Input placeholder="dnn-a.private,dnn-b.private" />
            </Form.Item>
            <Form.Item name="capabilityTags" label="能力标签（逗号分隔）">
              <Input placeholder="N6_BREAKOUT,LCL" />
            </Form.Item>
            <Form.Item name="healthProbe" label="健康探测 URL">
              <Input />
            </Form.Item>
          </Card>
          <Space>
            <Button type="primary" htmlType="submit">
              保存
            </Button>
            <Button onClick={closeModal}>取消</Button>
          </Space>
        </Form>
      </FormCreateModal>
      <DemoAgentDrawer
        open={agentOpen}
        onClose={() => setAgentOpen(false)}
        deviceNameStep={{
          buildGenerateScript: scriptMecNodeGenerateFromDevice,
          buildFieldRows: (name) => mecNodePlaybookRowsFromBody(buildMecNodeBodyFromDeviceName(name)),
        }}
        fieldRows={mecNodePlaybookRows()}
        preScript={scriptMecNodePreForAgent}
        postScript={SCRIPT_MEC_NODE_POST}
        onSuccess={() => void load()}
        onExecute={async (ctx) => {
          const body = ctx?.deviceName
            ? buildMecNodeBodyFromDeviceName(ctx.deviceName)
            : PLAYBOOK_MEC_NODE_BODY
          await apiSend('/api/mec/nodes', {
            method: 'POST',
            body: JSON.stringify(body),
          }, { demoPlaybook: true })
        }}
      />
    </div>
  )
}
