import { Descriptions, Modal, Result, Table, Tag, Typography } from 'antd'
import type { ColumnsType } from 'antd/es/table'
import type { ProvisionReport, SimulatedNeStep } from '../domain/types'

type TruthFeedbackModalProps = {
  open: boolean
  title: string
  report: ProvisionReport | null
  onClose: () => void
}

function stepStatusLabel(status: string): string {
  if (status === 'APPLIED') return '已应用'
  if (status === 'FAILED') return '失败'
  if (status === 'SKIPPED') return '跳过'
  return '未知'
}

/**
 * Configuration receipt panel: NE acknowledgement steps and correlation id.
 * 配置回执面板：网元回执步骤与关联标识。
 */
export function TruthFeedbackModal({
  open,
  title,
  report,
  onClose,
}: TruthFeedbackModalProps) {
  const ok = report?.overallStatus === 'SUCCESS'

  const columns: ColumnsType<SimulatedNeStep> = [
    { title: '网元', dataIndex: 'ne', width: 100 },
    { title: '操作', dataIndex: 'operation', width: 150 },
    {
      title: '状态',
      dataIndex: 'status',
      width: 100,
      render: (s: string) => (
        <Tag
          color={
            s === 'FAILED' ? 'red' : s === 'APPLIED' ? 'green' : 'default'
          }
        >
          {stepStatusLabel(s)}
        </Tag>
      ),
    },
    {
      title: '详情',
      dataIndex: 'detail',
      ellipsis: true,
    },
  ]

  return (
    <Modal
      open={open}
      onCancel={onClose}
      footer={null}
      width={860}
      title={title}
      className="config-receipt-modal"
      destroyOnHidden
      /* Stack above FormCreateModal (1100) and DemoAgentDrawer (1150).
       * 高于新建弹窗与 Agent 抽屉，回执始终在最前。 */
      zIndex={1200}
      centered
      styles={{
        body: { paddingTop: 12 },
      }}
    >
      {report ? (
        <>
          <Result
            status={ok ? 'success' : 'error'}
            style={{
              paddingBlock: 12,
              background: 'linear-gradient(180deg, rgba(240,253,250,0.5) 0%, transparent 100%)',
              borderRadius: 12,
              marginBottom: 8,
            }}
            title={ok ? '配置已下发并由核心网侧确认' : '配置未通过校验'}
            subTitle={
              <Typography.Text
                type="secondary"
                style={{ fontSize: 13, display: 'block', maxWidth: '100%' }}
              >
                <Typography.Text code copyable style={{ wordBreak: 'break-all' }}>
                  {report.summary}
                </Typography.Text>
              </Typography.Text>
            }
          />
          <Descriptions column={1} size="small" bordered style={{ marginBottom: 16 }}>
            <Descriptions.Item label="关联标识">
              <Typography.Text copyable>{report.correlationId}</Typography.Text>
            </Descriptions.Item>
            <Descriptions.Item label="完成时间">{report.completedAt}</Descriptions.Item>
          </Descriptions>
          {report.configEcho ? (
            <Typography.Paragraph style={{ marginBottom: 16 }}>
              <Typography.Text strong>配置快照</Typography.Text>
              <pre className="pre-json">
                {JSON.stringify(report.configEcho, null, 2)}
              </pre>
            </Typography.Paragraph>
          ) : null}
          <Typography.Text type="secondary" style={{ fontSize: 12 }}>
            以下为网元侧回执步骤（按下发编排顺序展示）。
          </Typography.Text>
          <Table
            style={{ marginTop: 10 }}
            size="small"
            pagination={false}
            dataSource={report.steps}
            rowKey={(_, i) => `${i}`}
            columns={columns}
          />
        </>
      ) : (
        <Typography.Text type="secondary">暂无回执数据</Typography.Text>
      )}
    </Modal>
  )
}
