import {
  App,
  Button,
  Card,
  Empty,
  Form,
  Input,
  InputNumber,
  Popconfirm,
  Select,
  Skeleton,
  Space,
  Table,
  Tooltip,
  Typography,
} from 'antd'
import type { ColumnsType } from 'antd/es/table'
import { useEffect, useState } from 'react'
import { apiGet, apiSend } from '../../api/client'
import { FormCreateModal } from '../../components/FormCreateModal'
import { TruthFeedbackModal } from '../../components/TruthFeedbackModal'
import type {
  CommitResult,
  PowerProfile,
  ProvisionReport,
  RedCapDevice,
} from '../../domain/types'

const newDeviceDefaults = {
  sliceId: 'slice-vision-embb',
  vnId: 'vn-line1',
  rrcState: 'RRC_CONNECTED',
  signalQuality: 'RSRP -80 dBm',
  trafficMb: 0,
} as const

/** Must match apps/api/src/redcap/redcap.constants.ts REDCAP_PROFILE_DISABLE. */
const POWER_PROFILE_DISABLE_VALUE = '__redcap_edrx_disable__'

/** Placeholder when no power profile: eDRX stays disabled (same as「连接新终端」不选模板). */
const POWER_PROFILE_PLACEHOLDER = '不选则 eDRX 为禁用'

function powerProfileSelectValue(
  r: RedCapDevice,
  draft: string | undefined,
): string | undefined {
  if (draft !== undefined) {
    return draft || undefined
  }
  if (r.powerProfileId) {
    return r.powerProfileId
  }
  if (r.edrxState === 'disabled') {
    return POWER_PROFILE_DISABLE_VALUE
  }
  return undefined
}

export function RedcapDevicesPage() {
  const { message } = App.useApp()
  const [rows, setRows] = useState<RedCapDevice[]>([])
  const [profiles, setProfiles] = useState<PowerProfile[]>([])
  const [loading, setLoading] = useState(false)
  const [profilePick, setProfilePick] = useState<Record<string, string>>({})
  const [fbOpen, setFbOpen] = useState(false)
  const [fbReport, setFbReport] = useState<ProvisionReport | null>(null)
  const [modalOpen, setModalOpen] = useState(false)
  const [form] = Form.useForm()

  const load = async () => {
    setLoading(true)
    try {
      const [d, p] = await Promise.all([
        apiGet<RedCapDevice[]>('/api/redcap/devices'),
        apiGet<PowerProfile[]>('/api/redcap/power-profiles'),
      ])
      setRows(d)
      setProfiles(p)
    } catch (e) {
      message.error(e instanceof Error ? e.message : '加载失败')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    void load()
  }, [])

  const closeModal = () => {
    setModalOpen(false)
    form.resetFields()
  }

  const openConnectModal = () => {
    setModalOpen(true)
  }

  const columns: ColumnsType<RedCapDevice> = [
    { title: '别名', dataIndex: 'alias', width: 120 },
    { title: 'SUPI', dataIndex: 'supi', width: 160, ellipsis: true },
    { title: '切片', dataIndex: 'sliceId', width: 140, ellipsis: true },
    { title: 'VN', dataIndex: 'vnId', width: 100, ellipsis: true },
    { title: 'IP', dataIndex: 'ipAddress', width: 120 },
    { title: 'RRC', dataIndex: 'rrcState', width: 100 },
    { title: '信号', dataIndex: 'signalQuality', width: 100 },
    { title: 'eDRX', dataIndex: 'edrxState', width: 110, ellipsis: true },
    {
      title: (
        <span>
          省电模板
          <Tooltip title={POWER_PROFILE_PLACEHOLDER}>
            <Typography.Text type="secondary" style={{ marginLeft: 4, cursor: 'help', fontSize: 12 }}>
              (?)
            </Typography.Text>
          </Tooltip>
        </span>
      ),
      key: 'prof',
      width: 200,
      render: (_, r) => (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
          <Tooltip title={POWER_PROFILE_PLACEHOLDER}>
            <Select
              size="small"
              style={{ width: '100%' }}
              placeholder={POWER_PROFILE_PLACEHOLDER}
              allowClear
              value={powerProfileSelectValue(r, profilePick[r.id])}
              options={[
                { value: POWER_PROFILE_DISABLE_VALUE, label: '禁用' },
                ...profiles.map((p) => ({ value: p.id, label: p.templateName })),
              ]}
              onChange={(v) =>
                setProfilePick((m) => ({
                  ...m,
                  [r.id]: v ?? '',
                }))
              }
            />
          </Tooltip>
          <Button
            type="link"
            size="small"
            style={{ padding: 0, alignSelf: 'flex-start' }}
            onClick={async () => {
              const pid = powerProfileSelectValue(r, profilePick[r.id])
              if (!pid) {
                message.warning('请先选择「禁用」或某一省电模板后再应用')
                return
              }
              try {
                const res = await apiSend<CommitResult<RedCapDevice>>(
                  `/api/redcap/devices/${r.id}/profile`,
                  {
                    method: 'PATCH',
                    body: JSON.stringify({ profileId: pid }),
                  },
                )
                if (!res?.report) {
                  message.error('未收到配置回执，请检查接口返回')
                  await load()
                  return
                }
                setFbReport(res.report)
                setFbOpen(true)
                await load()
              } catch (e) {
                message.error(e instanceof Error ? e.message : '应用失败')
              }
            }}
          >
            应用
          </Button>
        </div>
      ),
    },
    {
      title: '操作',
      key: 'actions',
      width: 88,
      fixed: 'right',
      render: (_, r) => (
        <Popconfirm
          title="确认从清单中移除该终端？"
          description="演示环境为内存数据；删除后相关审计仍会保留。"
          okText="删除"
          cancelText="取消"
          okButtonProps={{ danger: true }}
          onConfirm={async () => {
            try {
              await apiSend(`/api/redcap/devices/${r.id}`, { method: 'DELETE' })
              message.success('已删除终端')
              setProfilePick((m) => {
                const next = { ...m }
                delete next[r.id]
                return next
              })
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
      <Typography.Paragraph type="secondary" style={{ marginBottom: 12 }}>
        终端接入清单；应用模板后将展示核心网与无线侧回执摘要。
      </Typography.Paragraph>
      <Space className="page-toolbar" style={{ marginBottom: 12 }} wrap>
        <Button type="primary" onClick={openConnectModal}>
          连接新终端
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
          <Empty description="暂无在线终端" />
          <Space style={{ marginTop: 16 }}>
            <Button type="primary" onClick={openConnectModal}>
              连接新终端
            </Button>
            <Button onClick={() => void load()}>刷新</Button>
          </Space>
        </div>
      ) : (
        <Table rowKey="id" loading={loading} columns={columns} dataSource={rows} scroll={{ x: 1220 }} />
      )}
      <FormCreateModal
        title="连接新终端"
        open={modalOpen}
        onCancel={closeModal}
        afterOpenChange={(visible) => {
          if (visible) {
            form.resetFields()
            form.setFieldsValue({ ...newDeviceDefaults })
          }
        }}
      >
        <Form
          form={form}
          layout="vertical"
          initialValues={newDeviceDefaults}
          onFinish={async (v) => {
            try {
              await apiSend<RedCapDevice>('/api/redcap/devices', {
                method: 'POST',
                body: JSON.stringify({
                  alias: v.alias,
                  supi: v.supi,
                  imeisv: v.imeisv || undefined,
                  sliceId: v.sliceId,
                  vnId: v.vnId || undefined,
                  ipAddress: v.ipAddress || undefined,
                  rrcState: v.rrcState,
                  signalQuality: v.signalQuality,
                  trafficMb: v.trafficMb ?? 0,
                  powerProfileId: v.powerProfileId || undefined,
                }),
              })
              message.success('连接成功，终端已加入清单')
              closeModal()
              await load()
            } catch (e) {
              message.error(e instanceof Error ? e.message : '连接失败')
            }
          }}
        >
          <Card className="form-section-card" size="small" title="标识与接入">
            <Form.Item name="alias" label="别名" rules={[{ required: true, message: '请输入别名' }]}>
              <Input placeholder="例如：储罐液位-A1" />
            </Form.Item>
            <Form.Item
              name="supi"
              label="SUPI（IMSI 等）"
              rules={[{ required: true, message: '请输入 SUPI' }]}
            >
              <Input placeholder="imsi-460001234567890" />
            </Form.Item>
            <Form.Item name="imeisv" label="IMEISV（可选）">
              <Input placeholder="867400012345678" />
            </Form.Item>
          </Card>
          <Card className="form-section-card" size="small" title="网络与状态">
            <Form.Item name="sliceId" label="切片 ID" rules={[{ required: true }]}>
              <Input placeholder="slice-vision-embb" />
            </Form.Item>
            <Form.Item name="vnId" label="VN ID（可选）">
              <Input placeholder="vn-line1" />
            </Form.Item>
            <Form.Item name="ipAddress" label="IP（可选）">
              <Input placeholder="10.45.1.20" />
            </Form.Item>
            <Form.Item name="rrcState" label="RRC 状态">
              <Select
                options={[
                  { value: 'RRC_CONNECTED', label: 'RRC_CONNECTED' },
                  { value: 'RRC_INACTIVE', label: 'RRC_INACTIVE' },
                  { value: 'RRC_IDLE', label: 'RRC_IDLE' },
                ]}
              />
            </Form.Item>
            <Form.Item name="signalQuality" label="信号质量描述">
              <Input placeholder="RSRP -80 dBm" />
            </Form.Item>
            <Form.Item name="trafficMb" label="流量累计 (MB)">
              <InputNumber style={{ width: '100%' }} min={0} />
            </Form.Item>
          </Card>
          <Card className="form-section-card" size="small" title="省电模板（可选）">
            <Form.Item name="powerProfileId" label="绑定省电模板">
              <Select
                allowClear
                placeholder={POWER_PROFILE_PLACEHOLDER}
                options={[
                  { value: POWER_PROFILE_DISABLE_VALUE, label: '禁用' },
                  ...profiles.map((p) => ({ value: p.id, label: p.templateName })),
                ]}
              />
            </Form.Item>
          </Card>
          <Space>
            <Button type="primary" htmlType="submit">
              确认连接
            </Button>
            <Button onClick={closeModal}>取消</Button>
          </Space>
        </Form>
      </FormCreateModal>
      <TruthFeedbackModal
        open={fbOpen}
        title="RedCap 省电策略 — 配置回执"
        report={fbReport}
        onClose={() => setFbOpen(false)}
      />
    </div>
  )
}
