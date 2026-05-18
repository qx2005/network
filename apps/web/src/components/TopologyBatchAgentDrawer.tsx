import { App, Button, Checkbox, Collapse, Drawer, Steps, Typography } from 'antd'
import { useEffect, useMemo, useRef, useState } from 'react'
import { sleep } from '../api/client'
import {
  buildTopologyBatchFieldRows,
  runTopologyBatchProvisionForLabels,
  scriptTopologyGenerateForDevices,
  scriptTopologyPostForBatch,
  scriptTopologyPreForBatch,
  TOPOLOGY_MODULE_DEVICE_LABELS,
  type TopologyBatchProvisionResult,
} from '../demo/topologyBatchPlaybook'

const STEP_THINK_MS = 2000

const MODULE_OPTIONS = TOPOLOGY_MODULE_DEVICE_LABELS.map((label) => ({
  label,
  value: label,
}))

export type TopologyBatchAgentDrawerProps = {
  open: boolean
  onClose: () => void
  /** Refresh dashboard + topology after success / 成功后刷新概览. */
  onSuccess: () => void | Promise<void>
  /** Place selected modules on canvas before API writes / 执行前将所选模块放上画布. */
  onPlaceModules?: (labels: string[]) => void
  /** Show configuration receipt after successful orchestration / 编排成功后展示配置回执. */
  onProvisionComplete?: (
    labels: string[],
    result: TopologyBatchProvisionResult,
  ) => void
}

/**
 * Topology batch Agent shell — multi-select modules + full Playbook chain.
 * 拓扑一键配置：与分菜单 Agent 同款抽屉，支持勾选模块批量下发。
 */
export function TopologyBatchAgentDrawer({
  open,
  onClose,
  onSuccess,
  onPlaceModules,
  onProvisionComplete,
}: TopologyBatchAgentDrawerProps) {
  const { message } = App.useApp()
  const [running, setRunning] = useState(false)
  const [step, setStep] = useState(0)
  const [logText, setLogText] = useState('')
  const [selected, setSelected] = useState<string[]>([...TOPOLOGY_MODULE_DEVICE_LABELS])
  const [generatedRows, setGeneratedRows] = useState<ReturnType<typeof buildTopologyBatchFieldRows> | null>(
    null,
  )
  const logRef = useRef<HTMLPreElement>(null)

  useEffect(() => {
    if (open) {
      setSelected([...TOPOLOGY_MODULE_DEVICE_LABELS])
      setGeneratedRows(null)
      setStep(0)
      setLogText('')
    } else {
      setRunning(false)
    }
  }, [open])

  useEffect(() => {
    logRef.current?.scrollTo({ top: logRef.current.scrollHeight, behavior: 'smooth' })
  }, [logText])

  const append = (line: string) => {
    setLogText((t) => (t ? `${t}\n${line}` : line))
  }

  const runScript = async (lines: string[]) => {
    for (const line of lines) {
      append(line)
      await sleep(280)
    }
  }

  const collapseItems = useMemo(() => {
    const rows = generatedRows ?? []
    return rows.map((row, i) => ({
      key: `row-${i}-${row.label}`,
      label: row.label,
      children: (
        <Typography.Paragraph
          style={{
            margin: 0,
            whiteSpace: 'pre-wrap',
            wordBreak: 'break-word',
            overflowWrap: 'anywhere',
          }}
          copyable={row.value !== '—'}
        >
          {row.value}
        </Typography.Paragraph>
      ),
    }))
  }, [generatedRows])

  const handleStart = async () => {
    const labels = selected.map((s) => s.trim()).filter(Boolean)
    if (labels.length === 0) {
      message.warning('请至少选择一个模块')
      return
    }

    setRunning(true)
    setLogText('')
    setGeneratedRows(null)

    try {
      setStep(0)
      await runScript(scriptTopologyGenerateForDevices(labels))
      await sleep(STEP_THINK_MS)
      setGeneratedRows(buildTopologyBatchFieldRows(labels))
      await sleep(STEP_THINK_MS)
      setStep(1)

      await runScript(scriptTopologyPreForBatch(labels))
      await sleep(STEP_THINK_MS)
      setStep(2)

      onPlaceModules?.(labels)
      for (const label of labels) {
        append(`[Agent] 正在配置「${label}」…`)
      }
      const batchResult = await runTopologyBatchProvisionForLabels(labels)
      await sleep(STEP_THINK_MS)
      setStep(3)

      await runScript(scriptTopologyPostForBatch(batchResult))
      await sleep(STEP_THINK_MS)
      setStep(4)

      await onSuccess()

      onProvisionComplete?.(labels, batchResult)

      if (batchResult.failed.length > 0) {
        message.warning(
          `已完成 ${batchResult.configured} 项，跳过 ${batchResult.skipped} 项；失败：${batchResult.failed.map((f) => f.label).join('、')}`,
        )
      } else {
        message.success('已按方案写入')
      }
    } catch (e) {
      const msg = e instanceof Error ? e.message : '执行失败'
      append(`[Agent] 错误: ${msg}`)
      message.error(msg)
    } finally {
      setRunning(false)
    }
  }

  const allChecked = selected.length === TOPOLOGY_MODULE_DEVICE_LABELS.length
  const indeterminate =
    selected.length > 0 && selected.length < TOPOLOGY_MODULE_DEVICE_LABELS.length

  return (
    <Drawer
      title={
        <Typography.Title level={5} style={{ margin: 0 }}>
          Agent 自动配置
        </Typography.Title>
      }
      placement="right"
      width={960}
      open={open}
      onClose={running ? undefined : onClose}
      destroyOnHidden
      zIndex={1150}
      styles={{ body: { overflowX: 'hidden' } }}
      footer={
        <div style={{ textAlign: 'right' }}>
          <Button onClick={onClose} disabled={running} style={{ marginRight: 8 }}>
            关闭
          </Button>
          <Button type="primary" onClick={() => void handleStart()} loading={running}>
            开始执行
          </Button>
        </div>
      }
    >
      <Steps
        size="small"
        current={step}
        style={{ marginBottom: 16 }}
        items={[
          { title: '生成配置参数' },
          { title: '加载方案参数' },
          { title: '执行下发' },
          { title: '生成回执摘要' },
          { title: '完成' },
        ]}
      />
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'minmax(0, 1fr) minmax(0, 1fr)',
          gap: 16,
          alignItems: 'start',
          width: '100%',
          maxWidth: '100%',
          boxSizing: 'border-box',
        }}
      >
        <div style={{ minWidth: 0, maxWidth: '100%' }}>
          <Typography.Text strong>选择模块</Typography.Text>
          <Typography.Paragraph type="secondary" style={{ marginBottom: 8, marginTop: 4, fontSize: 12 }}>
            勾选需要按《5G-A数据》Playbook 写入的产线模块（含切片、RedCap、MEC、5G LAN）
          </Typography.Paragraph>
          <div style={{ marginBottom: 8 }}>
            <Checkbox
              indeterminate={indeterminate}
              checked={allChecked}
              disabled={running}
              onChange={(e) => {
                setSelected(e.target.checked ? [...TOPOLOGY_MODULE_DEVICE_LABELS] : [])
                setGeneratedRows(null)
              }}
            >
              全选
            </Checkbox>
          </div>
          <Checkbox.Group
            options={MODULE_OPTIONS}
            value={selected}
            disabled={running}
            onChange={(vals) => {
              setSelected(vals as string[])
              setGeneratedRows(null)
            }}
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: 6,
              maxHeight: 160,
              overflowY: 'auto',
            }}
          />
          <Typography.Text strong style={{ display: 'block', marginTop: 16 }}>
            将写入字段（只读）
          </Typography.Text>
          {collapseItems.length === 0 ? (
            <Typography.Paragraph type="secondary" style={{ marginTop: 12, marginBottom: 0 }}>
              执行第一步后，所选模块的参数将展开在下方。
            </Typography.Paragraph>
          ) : null}
          {collapseItems.length > 0 ? (
            <Collapse
              size="small"
              items={collapseItems}
              style={{
                marginTop: 8,
                maxHeight: 'calc(100vh - 360px)',
                overflowY: 'auto',
                overflowX: 'hidden',
              }}
            />
          ) : null}
        </div>
        <div style={{ minWidth: 0, maxWidth: '100%' }}>
          <Typography.Text strong>执行日志</Typography.Text>
          <pre
            ref={logRef}
            className="pre-json"
            style={{
              marginTop: 8,
              minHeight: 320,
              maxHeight: 'calc(100vh - 280px)',
              overflow: 'auto',
              fontSize: 12,
              whiteSpace: 'pre-wrap',
              wordBreak: 'break-word',
              overflowWrap: 'anywhere',
            }}
          >
            {logText || '（点击「开始执行」）'}
          </pre>
        </div>
      </div>
    </Drawer>
  )
}
