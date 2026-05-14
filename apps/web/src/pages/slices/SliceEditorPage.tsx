import {
  App,
  Button,
  Card,
  Form,
  Input,
  InputNumber,
  Select,
  Space,
  Switch,
  Typography,
} from 'antd'
import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { ApiError, apiGet, apiSend, sleep } from '../../api/client'
import { isShowcaseConsole } from '../../config/showcase'
import { buildShowcaseSliceProvisionReport } from '../../lib/showcaseSliceReport'
import { TruthFeedbackModal } from '../../components/TruthFeedbackModal'
import type { NetworkSlice, ProvisionReport, ProvisioningJob } from '../../domain/types'

export function SliceEditorPage() {
  const { id } = useParams<{ id: string }>()
  const isNew = id === 'new'
  const nav = useNavigate()
  const { message } = App.useApp()
  const [form] = Form.useForm<NetworkSlice>()
  const [loading, setLoading] = useState(false)
  const [provisionSpinning, setProvisionSpinning] = useState(false)
  const [feedbackOpen, setFeedbackOpen] = useState(false)
  const [feedbackTitle, setFeedbackTitle] = useState('配置回执')
  const [feedbackReport, setFeedbackReport] = useState<ProvisionReport | null>(
    null,
  )

  useEffect(() => {
    if (isNew) {
      form.setFieldsValue({
        displayName: '新切片',
        sst: 1,
        dnn: 'dnn-default.private',
        ladnAllowed: false,
        ulGbrMbps: 10,
        dlGbrMbps: 50,
        ulMbrMbps: 20,
        dlMbrMbps: 100,
        ambrMbps: 200,
        fiveQi: 9,
        arpLevel: 'medium',
        memberGroupIds: [],
      } as never)
      return
    }
    if (!id) return
    let cancelled = false
    void (async () => {
      setLoading(true)
      try {
        const s = await apiGet<NetworkSlice>(`/api/slices/${id}`)
        if (!cancelled) form.setFieldsValue(s as never)
      } catch (e) {
        message.error(e instanceof Error ? e.message : '加载失败')
      } finally {
        if (!cancelled) setLoading(false)
      }
    })()
    return () => {
      cancelled = true
    }
  }, [id, isNew, form, message])

  const onSave = async () => {
    const v = await form.validateFields()
    setLoading(true)
    try {
      if (isNew) {
        const created = await apiSend<NetworkSlice>('/api/slices', {
          method: 'POST',
          body: JSON.stringify(v),
        })
        message.success('已保存草稿')
        nav(`/slices/${created.id}`)
      } else {
        await apiSend(`/api/slices/${id}`, {
          method: 'PATCH',
          body: JSON.stringify(v),
        })
        message.success('已更新')
      }
    } catch (e) {
      message.error(e instanceof Error ? e.message : '保存失败')
    } finally {
      setLoading(false)
    }
  }

  const onValidate = async () => {
    if (isNew) {
      message.info('请先保存草稿后再校验')
      return
    }
    try {
      const res = await apiGet<{ ok: boolean; issues: string[] }>(
        `/api/slices/${id}/validate`,
      )
      if (res.ok) message.success('校验通过')
      else message.warning(res.issues.join('；'))
    } catch (e) {
      message.error(e instanceof Error ? e.message : '校验失败')
    }
  }

  const onProvision = async () => {
    if (isNew || !id) return
    setProvisionSpinning(true)
    setFeedbackReport(null)
    const showcase = isShowcaseConsole()
    const loadingKey = 'slice-provision'
    message.open({
      key: loadingKey,
      type: 'loading',
      content: showcase ? '展示模式：模拟编排下发（NSSF → PCF → SMF → UPF → AMF）…' : '下发编排中…',
      duration: 0,
    })
    try {
      await sleep(showcase ? 1600 : 400)
      let final: ProvisioningJob | undefined
      try {
        final = await apiSend<ProvisioningJob>(`/api/slices/${id}/provision`, {
          method: 'POST',
          body: '{}',
        })
      } catch (apiErr) {
        if (!showcase) throw apiErr
      }

      const values = form.getFieldsValue() as Partial<NetworkSlice>
      const report =
        final?.report ??
        (showcase ? buildShowcaseSliceProvisionReport(id, values) : null)

      setFeedbackTitle(
        showcase ? '切片下发 — 配置回执（展示）' : '切片下发 — 配置回执',
      )
      setFeedbackReport(report)
      setFeedbackOpen(true)

      const serverOk = final?.status === 'success'
      if (showcase) {
        message.success('展示流程已完成，以下为合成回执')
        if (serverOk) {
          try {
            const s = await apiGet<NetworkSlice>(`/api/slices/${id}`)
            form.setFieldsValue(s as never)
          } catch {
            form.setFieldsValue({
              ...values,
              status: 'provisioned',
            } as never)
          }
        } else {
          form.setFieldsValue({
            ...values,
            status: 'provisioned',
          } as never)
        }
        return
      }

      if (serverOk && report) {
        message.success('下发成功')
        const s = await apiGet<NetworkSlice>(`/api/slices/${id}`)
        form.setFieldsValue(s as never)
      } else {
        message.warning(final?.message ?? '下发失败')
      }
    } catch (e) {
      if (e instanceof ApiError && e.status === 400) {
        const issues = (e.body as { issues?: string[] })?.issues ?? []
        message.error(issues.length ? issues.join('；') : e.message)
      } else {
        message.error(e instanceof Error ? e.message : '下发失败')
      }
    } finally {
      message.destroy(loadingKey)
      setProvisionSpinning(false)
    }
  }

  const onRollback = async () => {
    if (isNew || !id) return
    try {
      const res = await apiSend<{
        ok: boolean
        report?: ProvisionReport
        detail?: string
      }>(`/api/slices/${id}/rollback`, {
        method: 'POST',
        body: '{}',
      })
      if (res.report) {
        setFeedbackTitle('切片回滚 — 配置回执')
        setFeedbackReport(res.report)
        setFeedbackOpen(true)
      }
      message[res.ok ? 'success' : 'error'](
        res.ok ? '回滚已提交' : '回滚失败',
      )
      if (res.ok) {
        const s = await apiGet<NetworkSlice>(`/api/slices/${id}`)
        form.setFieldsValue(s as never)
      }
    } catch (e) {
      message.error(e instanceof Error ? e.message : '回滚失败')
    }
  }

  return (
    <div>
      <Typography.Title level={5} style={{ marginTop: 0, marginBottom: 16 }}>
        {isNew ? '新建切片草稿' : id ? `资源 ID：${id}` : '切片编辑'}
      </Typography.Title>
      <Card loading={loading} className="kpi-card" variant="borderless">
        <Form form={form} layout="vertical">
          <Form.Item name="displayName" label="切片显示名" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item name="description" label="描述">
            <Input.TextArea rows={3} />
          </Form.Item>
          <Form.Item name="sst" label="SST" rules={[{ required: true }]}>
            <Select
              options={[
                { value: 1, label: '1 — eMBB' },
                { value: 2, label: '2 — uRLLC' },
                { value: 3, label: '3 — mMTC' },
              ]}
            />
          </Form.Item>
          <Form.Item name="sd" label="SD（可选，6 位 hex）">
            <Input placeholder="010203" />
          </Form.Item>
          <Form.Item name="dnn" label="默认 DNN" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item name="ladnAllowed" label="允许 LADN" valuePropName="checked">
            <Switch />
          </Form.Item>
          <Space wrap size="large">
            <Form.Item name="ulGbrMbps" label="上行 GBR（Mbps）">
              <InputNumber min={0} />
            </Form.Item>
            <Form.Item name="dlGbrMbps" label="下行 GBR（Mbps）">
              <InputNumber min={0} />
            </Form.Item>
            <Form.Item name="ulMbrMbps" label="上行 MBR（Mbps）">
              <InputNumber min={0} />
            </Form.Item>
            <Form.Item name="dlMbrMbps" label="下行 MBR（Mbps）">
              <InputNumber min={0} />
            </Form.Item>
            <Form.Item name="ambrMbps" label="AMBR（Mbps）">
              <InputNumber min={0} />
            </Form.Item>
          </Space>
          <Form.Item name="fiveQi" label="5QI">
            <InputNumber min={1} max={255} />
          </Form.Item>
          <Form.Item name="arpLevel" label="ARP / 抢占档位">
            <Select
              options={[
                { value: 'low', label: '低' },
                { value: 'medium', label: '中' },
                { value: 'high', label: '高' },
              ]}
            />
          </Form.Item>
          <Form.Item
            name="memberGroupIds"
            label="成员分组 ID（多选字符串，对应 RedCap/CPE 分组）"
          >
            <Select mode="tags" placeholder="grp-sensors-east" tokenSeparators={[',']} />
          </Form.Item>
        </Form>
        <Space wrap>
          <Button type="primary" onClick={() => void onSave()} loading={loading}>
            保存草稿 / 更新
          </Button>
          <Button onClick={() => void onValidate()} disabled={isNew}>
            校验
          </Button>
          <Button
            onClick={() => void onProvision()}
            disabled={isNew}
            loading={provisionSpinning}
          >
            下发
          </Button>
          <Button danger onClick={() => void onRollback()} disabled={isNew}>
            回滚
          </Button>
          <Button onClick={() => nav('/slices')}>返回列表</Button>
        </Space>
      </Card>
      <TruthFeedbackModal
        open={feedbackOpen}
        title={feedbackTitle}
        report={feedbackReport}
        onClose={() => setFeedbackOpen(false)}
      />
    </div>
  )
}
