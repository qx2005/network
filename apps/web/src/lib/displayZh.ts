/**
 * UI display labels (Chinese) for API enum / type strings.
 * 将接口返回的英文枚举转为界面中文展示（专有名词如 TCP、5QI 等保持原样）。
 */

export function provisioningJobTypeZh(type: string): string {
  switch (type) {
    case 'slice.provision':
      return '切片下发'
    default:
      return type
  }
}

export function provisioningJobStatusZh(status: string): string {
  switch (status) {
    case 'pending':
      return '排队中'
    case 'processing':
      return '执行中'
    case 'success':
      return '成功'
    case 'failed':
      return '失败'
    default:
      return status
  }
}

export function resourceTypeZh(t: string): string {
  switch (t) {
    case 'NetworkSlice':
      return '网络切片'
    case 'ProvisioningJob':
      return '下发任务'
    case 'RedCapDevice':
      return 'RedCap 终端'
    case 'PowerProfile':
      return '省电模板'
    case 'FiveGLanVn':
      return '5G LAN VN'
    case 'MecNode':
      return 'MEC 节点'
    case 'MecOffloadRule':
      return 'MEC 分流规则'
    default:
      return t
  }
}

export function auditResultZh(r: string): string {
  switch (r) {
    case 'success':
      return '成功'
    case 'failure':
      return '失败'
    default:
      return r
  }
}

export function mecActionTypeZh(t: string): string {
  switch (t) {
    case 'LOCAL_BREAKOUT':
      return '本地分流'
    case 'NEXT_HOP':
      return '下一跳'
    case 'MIRROR':
      return '镜像'
    default:
      return t
  }
}

export function vnPolicyZh(p: string): string {
  switch (p) {
    case 'ALLOW':
      return '允许'
    case 'LIMITED':
      return '受限'
    case 'DENY':
      return '禁止'
    default:
      return p
  }
}

export function protocolLabelZh(p: string): string {
  switch (p) {
    case 'ANY':
      return '任意'
    case 'TCP':
      return 'TCP'
    case 'UDP':
      return 'UDP'
    default:
      return p
  }
}

export function vnLifecycleStatusZh(s: string): string {
  switch (s) {
    case 'active':
      return '已激活'
    default:
      return s
  }
}
