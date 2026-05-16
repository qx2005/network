/**
 * Builders for ProvisionReport objects (synthetic NE acknowledgement for console).
 * 下发报告构造器：合成网元回执，供控制台展示（无真实网元 I/O）。
 */

import { v4 as uuidv4 } from 'uuid';
import type {
  MecOffloadRule,
  ProvisionReport,
  ProvisionSlicePayload,
  SimulatedNeStep,
} from './types';

const URLLC_5QI = new Set([
  65, 66, 67, 68, 69, 80, 81, 82, 83,
]);

export function isUrllcFiveQi(fiveQi: number): boolean {
  return URLLC_5QI.has(fiveQi);
}

function snssai(sst: number, sd?: string | null): string {
  return sd ? `${sst}-${sd}` : `${sst}`;
}

export function buildSliceSuccessReport(
  payload: ProvisionSlicePayload,
): ProvisionReport {
  const correlationId = uuidv4();
  const completedAt = new Date().toISOString();
  const ns = snssai(payload.sst, payload.sd);
  const qosSummary = `5QI=${payload.fiveQi} 上行GBR=${payload.ulGbrMbps}Mbps 下行GBR=${payload.dlGbrMbps}Mbps AMBR=${payload.ambrMbps}Mbps 成员组=${payload.memberGroupIds.length}个`;

  const steps: SimulatedNeStep[] = [
    {
      ne: 'NSSF',
      operation: '网络切片选择',
      status: 'APPLIED',
      detail: `已将 S-NSSAI ${ns} 的切片模板登记至 NSSF。`,
    },
    {
      ne: 'PCF',
      operation: '策略控制',
      status: 'APPLIED',
      detail: `已将会话策略绑定至 DNN「${payload.dnn}」，QoS：${qosSummary}。`,
    },
    {
      ne: 'SMF',
      operation: '会话管理',
      status: 'APPLIED',
      detail: `已更新「${payload.dnn}」的 PDU 会话策略（SMF 回执）。`,
    },
    {
      ne: 'UPF',
      operation: '用户面',
      status: 'APPLIED',
      detail: `已为「${payload.dnn}」预置 N6 分流与 QoS 门控。`,
    },
    {
      ne: 'AMF',
      operation: '接入与移动性',
      status: 'APPLIED',
      detail: `已刷新允许 NSSAI，切片实例 ${payload.sliceId}。`,
    },
  ];

  return {
    correlationId,
    completedAt,
    overallStatus: 'SUCCESS',
    summary: `切片下发成功：S-NSSAI ${ns}，DNN「${payload.dnn}」。`,
    configEcho: { snssai: ns, dnn: payload.dnn, qosSummary },
    steps,
  };
}

export function buildSliceValidationFailureReport(
  payload: ProvisionSlicePayload,
  reasons: string[],
): ProvisionReport {
  const correlationId = uuidv4();
  const completedAt = new Date().toISOString();
  const ns = snssai(payload.sst, payload.sd);
  const step: SimulatedNeStep = {
    ne: '编排器',
    operation: '下发前校验',
    status: 'FAILED',
    detail: reasons.join('；'),
  };
  return {
    correlationId,
    completedAt,
    overallStatus: 'FAILED',
    summary: `切片下发未通过语义校验：S-NSSAI ${ns}。`,
    configEcho: { snssai: ns, dnn: payload.dnn },
    steps: [step],
  };
}

export function buildMecRuleCommitReport(rule: MecOffloadRule): ProvisionReport {
  const correlationId = uuidv4();
  const completedAt = new Date().toISOString();
  const steps: SimulatedNeStep[] = [
    {
      ne: 'UPF',
      operation: '分流规则',
      status: 'APPLIED',
      detail: `N6 卸载规则「${rule.name}」已安装，优先级 ${rule.priority}。`,
    },
    {
      ne: 'SMF',
      operation: 'UPF 选择',
      status: 'APPLIED',
      detail: `已更新本地 PSA / ULCL 规则指针。`,
    },
    {
      ne: 'MEC-OSS',
      operation: '本地路由',
      status: 'APPLIED',
      detail: `策略路由已同步至边缘编排。`,
    },
  ];
  return {
    correlationId,
    completedAt,
    overallStatus: 'SUCCESS',
    summary: `MEC 卸载规则「${rule.name}」已提交生效。`,
    configEcho: {
      ruleId: rule.id,
      match: rule.match,
      action: rule.action,
    },
    steps,
  };
}

export function buildFiveGLanVnCommitReport(vn: {
  id: string;
  displayName: string;
  technicalId: string;
  linkedSliceId: string;
  memberIds: string[];
}): ProvisionReport {
  const correlationId = uuidv4();
  const completedAt = new Date().toISOString();
  const steps: SimulatedNeStep[] = [
    {
      ne: 'NEF',
      operation: '5G LAN 虚拟网络',
      status: 'APPLIED',
      detail: `虚拟网络 ${vn.technicalId} 已登记：${vn.displayName}。`,
    },
    {
      ne: 'UPF',
      operation: '以太网 PDU',
      status: 'APPLIED',
      detail: `二层域桥接策略已就绪（成员 ${vn.memberIds.length} 个）。`,
    },
    {
      ne: 'SMF',
      operation: '切片绑定',
      status: 'APPLIED',
      detail: `VN 已绑定切片引用 ${vn.linkedSliceId}。`,
    },
  ];
  return {
    correlationId,
    completedAt,
    overallStatus: 'SUCCESS',
    summary: `5G LAN VN「${vn.displayName}」配置已应用。`,
    configEcho: {
      vnId: vn.id,
      technicalId: vn.technicalId,
      linkedSliceId: vn.linkedSliceId,
    },
    steps,
  };
}

export function buildRedcapPowerApplyReport(
  deviceId: string,
  supi: string,
  profile: { templateName: string; edrxCycleSeconds: number },
): ProvisionReport {
  const correlationId = uuidv4();
  const completedAt = new Date().toISOString();
  const steps: SimulatedNeStep[] = [
    {
      ne: 'AMF',
      operation: 'RRC 配置',
      status: 'APPLIED',
      detail: `已将省电模板「${profile.templateName}」下发至签约用户 ${supi}。`,
    },
    {
      ne: 'RAN',
      operation: '无线资源管理',
      status: 'APPLIED',
      detail: `寻呼与 eDRX 周期对齐：${profile.edrxCycleSeconds} 秒（gNB 回执）。`,
    },
  ];
  return {
    correlationId,
    completedAt,
    overallStatus: 'SUCCESS',
    summary: `RedCap 省电模板「${profile.templateName}」已应用至终端 ${deviceId}。`,
    configEcho: { deviceId, supi, profile: profile.templateName },
    steps,
  };
}

export function buildRedcapPowerDisableReport(
  deviceId: string,
  supi: string,
): ProvisionReport {
  const correlationId = uuidv4();
  const completedAt = new Date().toISOString();
  const steps: SimulatedNeStep[] = [
    {
      ne: 'AMF',
      operation: 'RRC 配置',
      status: 'APPLIED',
      detail: `已取消签约用户 ${supi} 的省电模板与 eDRX 周期配置。`,
    },
    {
      ne: 'RAN',
      operation: '无线资源管理',
      status: 'APPLIED',
      detail:
        '无线侧已关闭扩展 DRX，终端维持常规寻呼与连续接收策略（演示回执）。',
    },
  ];
  return {
    correlationId,
    completedAt,
    overallStatus: 'SUCCESS',
    summary: `RedCap eDRX 已对终端 ${deviceId} 设置为禁用（已解绑省电模板）。`,
    configEcho: { deviceId, supi, profile: null, edrx: 'disabled' },
    steps,
  };
}

export function buildRollbackReport(sliceId: string): ProvisionReport {
  const correlationId = uuidv4();
  const completedAt = new Date().toISOString();
  return {
    correlationId,
    completedAt,
    overallStatus: 'SUCCESS',
    summary: `切片 ${sliceId} 回滚已被北向接受。`,
    configEcho: { sliceId },
    steps: [
      {
        ne: '编排器',
        operation: '回滚',
        status: 'APPLIED',
        detail: '已恢复上一版切片配置。',
      },
    ],
  };
}
