import { App, Button, Collapse, Drawer, Select, Steps, Typography } from 'antd'
import { useEffect, useMemo, useRef, useState } from 'react'
import { sleep } from '../api/client'
import type { PlaybookFieldRow } from '../demo/demoPlaybook'

/** Pause between stepper phases to pace orchestration steps (UX pacing). */
/** 步骤条阶段之间的节奏停顿，用于编排步骤的可读展示。 */
const STEP_THINK_MS = 2000

export type DeviceNameSelectOption = { label: string; value: string }

/** Default device preset when parent does not pass `deviceSelectOptions`. */
/** 父组件未传入 `deviceSelectOptions` 时的默认设备预设。 */
const DEFAULT_DEVICE_SELECT_OPTIONS: DeviceNameSelectOption[] = [
  { label: '机械臂', value: '机械臂' },
]

/** Optional first step: simulate Agent deriving playbook fields from a device name. */
/** 可选的第一步：模拟 Agent 由设备名推导配置字段。 */
export type DeviceNameAgentStepConfig = {
  buildGenerateScript: (deviceName: string) => string[]
  buildFieldRows: (deviceName: string) => PlaybookFieldRow[]
  /** Device name dropdown; omit to use the default single option「机械臂」. */
  /** 设备名称下拉项；省略时仅「机械臂」一项。 */
  deviceSelectOptions?: DeviceNameSelectOption[]
}

export type AgentExecuteContext = {
  deviceName?: string
}

export type DemoAgentDrawerProps = {
  open: boolean
  /** Left panel: baseline key-value rows when no device-name step (or before generation). */
  fieldRows: PlaybookFieldRow[]
  /** Optional step before “加载方案参数”: user enters device name → scripted “generation”. */
  deviceNameStep?: DeviceNameAgentStepConfig
  /** Lines staged before API call */
  preScript: string[]
  /** Lines staged after API success */
  postScript: string[]
  /** Single async action: mutations with playbook orchestration header */
  /** 单次异步动作：带编排通道头的写入请求；开启 deviceNameStep 时会传入 deviceName。 */
  onExecute: (ctx?: AgentExecuteContext) => Promise<void>
  onClose: () => void
  /** Refresh list after success */
  onSuccess: () => void
}

/**
 * Agent auto-configuration shell: scripted logs + one orchestrated API call.
 * Agent 自动配置外壳：执行日志 + 一次性受编排的 API 写入。
 */
export function DemoAgentDrawer({
  open,
  fieldRows,
  deviceNameStep,
  preScript,
  postScript,
  onExecute,
  onClose,
  onSuccess,
}: DemoAgentDrawerProps) {
  const { message } = App.useApp()
  const [running, setRunning] = useState(false)
  const [step, setStep] = useState(0)
  const [logText, setLogText] = useState('')
  const [deviceName, setDeviceName] = useState('')
  const [generatedRows, setGeneratedRows] = useState<PlaybookFieldRow[] | null>(null)
  const logRef = useRef<HTMLPreElement>(null)

  const hasDeviceStep = Boolean(deviceNameStep)

  const deviceSelectOptions = useMemo(() => {
    if (!deviceNameStep) return DEFAULT_DEVICE_SELECT_OPTIONS
    return deviceNameStep.deviceSelectOptions?.length
      ? deviceNameStep.deviceSelectOptions
      : DEFAULT_DEVICE_SELECT_OPTIONS
  }, [deviceNameStep])

  useEffect(() => {
    if (open) {
      const firstVal = hasDeviceStep ? (deviceSelectOptions[0]?.value ?? '') : ''
      setDeviceName(firstVal)
      setGeneratedRows(null)
      setStep(0)
      setLogText('')
    } else {
      setRunning(false)
    }
  }, [open, hasDeviceStep, deviceSelectOptions])

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

  const rowsForCollapse = useMemo(() => {
    if (hasDeviceStep) {
      return generatedRows ?? []
    }
    return fieldRows
  }, [fieldRows, generatedRows, hasDeviceStep])

  const collapseItems = useMemo(
    () =>
      rowsForCollapse.map((row, i) => ({
        key: `row-${i}-${row.label}`,
        label: row.label,
        children: (
          <Typography.Paragraph style={{ margin: 0, whiteSpace: 'pre-wrap' }} copyable>
            {row.value}
          </Typography.Paragraph>
        ),
      })),
    [rowsForCollapse],
  )

  const handleStart = async () => {
    setRunning(true)
    setLogText('')
    setGeneratedRows(null)
    try {
      let execCtx: AgentExecuteContext | undefined

      if (hasDeviceStep && deviceNameStep) {
        const name = deviceName.trim()
        if (!name) {
          message.warning('请选择设备名称')
          setRunning(false)
          return
        }
        execCtx = { deviceName: name }
        setStep(0)
        await runScript(deviceNameStep.buildGenerateScript(name))
        await sleep(STEP_THINK_MS)
        setGeneratedRows(deviceNameStep.buildFieldRows(name))
        await sleep(STEP_THINK_MS)
        setStep(1)
      } else {
        setStep(0)
      }

      await runScript(preScript)
      await sleep(STEP_THINK_MS)
      setStep(hasDeviceStep ? 2 : 1)

      await onExecute(execCtx)
      await sleep(STEP_THINK_MS)
      setStep(hasDeviceStep ? 3 : 2)

      await runScript(postScript)
      await sleep(STEP_THINK_MS)
      setStep(hasDeviceStep ? 4 : 3)

      message.success('已按方案写入')
      onSuccess()
    } catch (e) {
      const msg = e instanceof Error ? e.message : '执行失败'
      append(`[Agent] 错误: ${msg}`)
      message.error(msg)
    } finally {
      setRunning(false)
    }
  }

  const stepItems = hasDeviceStep
    ? [
        { title: '生成配置参数' },
        { title: '加载方案参数' },
        { title: '执行下发' },
        { title: '生成回执摘要' },
        { title: '完成' },
      ]
    : [
        { title: '加载方案参数' },
        { title: '执行下发' },
        { title: '生成回执摘要' },
        { title: '完成' },
      ]

  return (
    <Drawer
      title={
        <Typography.Title level={5} style={{ margin: 0 }}>
          Agent自动配置
        </Typography.Title>
      }
      placement="right"
      width={880}
      open={open}
      onClose={running ? undefined : onClose}
      destroyOnHidden
      zIndex={1150}
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
      <Steps size="small" current={step} style={{ marginBottom: 16 }} items={stepItems} />
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
        <div>
          {hasDeviceStep ? (
            <>
              <Typography.Text strong>设备名称</Typography.Text>
              <Typography.Paragraph type="secondary" style={{ marginBottom: 8, marginTop: 4, fontSize: 12 }}>
                Agent 将据此生成切片展示名、描述与成员分组等草案
              </Typography.Paragraph>
              <Select
                placeholder="请选择设备名称"
                value={deviceName || undefined}
                onChange={setDeviceName}
                disabled={running}
                options={deviceSelectOptions}
                style={{ width: '100%' }}
              />
              <Typography.Text strong style={{ display: 'block', marginTop: 16 }}>
                将写入字段（只读）
              </Typography.Text>
            </>
          ) : (
            <Typography.Text strong>将写入字段（只读）</Typography.Text>
          )}
          {hasDeviceStep && collapseItems.length === 0 ? (
            <Typography.Paragraph type="secondary" style={{ marginTop: 12, marginBottom: 0 }}>
              执行第一步后，生成的参数将展开在下方。
            </Typography.Paragraph>
          ) : null}
          {collapseItems.length > 0 ? (
            <Collapse
              size="small"
              items={collapseItems}
              style={{ marginTop: 8, maxHeight: 'calc(100vh - 280px)', overflowY: 'auto' }}
            />
          ) : null}
        </div>
        <div>
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
            }}
          >
            {logText || '（点击「开始执行」）'}
          </pre>
        </div>
      </div>
    </Drawer>
  )
}
