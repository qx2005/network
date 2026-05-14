import { Typography } from 'antd'
import { useEffect, useState } from 'react'
import { apiGet } from '../../api/client'

export function RbacMatrixPage() {
  const [data, setData] = useState<unknown>(null)
  const [err, setErr] = useState<string | null>(null)

  useEffect(() => {
    void (async () => {
      try {
        setData(await apiGet('/api/system/rbac-matrix'))
      } catch (e) {
        setErr(e instanceof Error ? e.message : '加载失败')
      }
    })()
  }, [])

  return (
    <div>
      <Typography.Paragraph type="secondary" style={{ marginBottom: 12 }}>
        通过请求头 <Typography.Text code>x-user-role</Typography.Text> 与{' '}
        <Typography.Text code>x-user-id</Typography.Text> 指定当前会话的角色与用户标识。
      </Typography.Paragraph>
      {err ? (
        <Typography.Text type="danger">{err}</Typography.Text>
      ) : (
        <pre className="pre-json">{JSON.stringify(data, null, 2)}</pre>
      )}
    </div>
  )
}
