import { App, Button, Card, Empty, Form, Input, InputNumber, Modal, Skeleton, Space, Switch, Table, Typography } from 'antd'
import type { ColumnsType } from 'antd/es/table'
import { useEffect, useState } from 'react'
import { apiGet, apiSend } from '../../api/client'
import type { PowerProfile } from '../../domain/types'

const newProfileFormDefaults = {
  edrxEnabled: true,
  edrxCycleSeconds: 163.84,
  ptwSeconds: 10.24,
  drxMs: 640,
  psmEnabled: true,
  heartbeatRecommendedSeconds: 3600,
} as const

export function PowerProfilesPage() {
  const { message } = App.useApp()
  const [rows, setRows] = useState<PowerProfile[]>([])
  const [loading, setLoading] = useState(false)
  const [open, setOpen] = useState(false)
  const [form] = Form.useForm<PowerProfile>()
  const edrxOn = Form.useWatch('edrxEnabled', form) ?? true

  const closeModal = () => {
    setOpen(false)
    form.resetFields()
  }

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
    {
      title: 'eDRX 周期 (s)',
      dataIndex: 'edrxCycleSeconds',
      render: (_: number, r: PowerProfile) => (r.edrxEnabled === false ? '禁用' : r.edrxCycleSeconds),
    },
    {
      title: 'PTW (s)',
      dataIndex: 'ptwSeconds',
      render: (v: number, r: PowerProfile) => (r.edrxEnabled === false ? '—' : v),
    },
    {
      title: 'DRX (ms)',
      dataIndex: 'drxMs',
      render: (v: number, r: PowerProfile) => (r.edrxEnabled === false ? '—' : v),
    },
    {
      title: 'PSM',
      dataIndex: 'psmEnabled',
      render: (v: boolean) => (v ? '开' : '关'),
    },
    { title: '推荐心跳 (s)', dataIndex: 'heartbeatRecommendedSeconds' },
  ]

  return (
    <div>
      <Typography.Paragraph type="secondary" style={{ marginBottom: 12 }}>
        常电 uRLLC / eMBB / 边缘网关类终端应在「终端列表」对设备使用「禁用省电模板」，勿为机械臂、PLC、相机等生成
        eDRX 行。本页模板面向电池供电的传感、资产定位标签、远端水电气表等低速物联场景。
      </Typography.Paragraph>
      <Space className="page-toolbar" style={{ marginBottom: 0 }} wrap>
        <Button type="primary" onClick={() => setOpen(true)}>
          新建模板
        </Button>
        <Button onClick={() => void load()} loading={loading}>
          刷新
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
          <Empty description="暂无省电模板" />
          <Button type="primary" style={{ marginTop: 16 }} onClick={() => setOpen(true)}>
            新建模板
          </Button>
        </div>
      ) : (
        <Table rowKey="id" loading={loading} columns={columns} dataSource={rows} />
      )}
      <Modal
        title="新建模板"
        open={open}
        onCancel={closeModal}
        footer={null}
        width={720}
        destroyOnHidden
        afterOpenChange={(visible) => {
          if (visible) {
            form.resetFields()
            form.setFieldsValue({ ...newProfileFormDefaults })
          }
        }}
        styles={{ body: { maxHeight: 'calc(100vh - 220px)', overflowY: 'auto', paddingTop: 8 } }}
      >
        <Form
          form={form}
          layout="vertical"
          initialValues={newProfileFormDefaults}
          onFinish={async (v) => {
            try {
              await apiSend('/api/redcap/power-profiles', {
                method: 'POST',
                body: JSON.stringify(v),
              })
              message.success('已创建模板')
              closeModal()
              await load()
            } catch (e) {
              message.error(e instanceof Error ? e.message : '创建失败')
            }
          }}
        >
          <Card className="form-section-card" size="small" title="基本信息">
            <Form.Item name="templateName" label="模板名" rules={[{ required: true }]}>
              <Input />
            </Form.Item>
            <Form.Item name="deviceTypeTag" label="设备类型标签">
              <Input placeholder="level_meter / thermometer" />
            </Form.Item>
          </Card>
          <Card className="form-section-card" size="small" title="省电参数">
            <Form.Item
              name="edrxEnabled"
              label="启用 eDRX"
              valuePropName="checked"
              tooltip="关闭时适用于 PSM + 超长周期上报：激活期外长 eDRX 无意义。"
            >
              <Switch />
            </Form.Item>
            <Form.Item name="edrxCycleSeconds" label="eDRX 周期 (s)">
              <InputNumber style={{ width: '100%' }} step={0.01} disabled={!edrxOn} />
            </Form.Item>
            <Form.Item name="ptwSeconds" label="PTW (s)">
              <InputNumber style={{ width: '100%' }} step={0.01} disabled={!edrxOn} />
            </Form.Item>
            <Form.Item name="drxMs" label="DRX (ms)">
              <InputNumber style={{ width: '100%' }} disabled={!edrxOn} />
            </Form.Item>
            <Form.Item name="psmEnabled" label="PSM" valuePropName="checked">
              <Switch />
            </Form.Item>
            <Form.Item name="heartbeatRecommendedSeconds" label="推荐心跳 (s)">
              <InputNumber style={{ width: '100%' }} />
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
    </div>
  )
}
