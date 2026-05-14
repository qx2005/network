/**
 * Shared 5G-A–oriented semantic checks for slice configuration.
 * 切片配置语义检查，供 API 校验与北向编排共用。
 */

import type { NetworkSlice, ProvisionSlicePayload } from './types';
import { isUrllcFiveQi } from './provision-report.builder';

export function networkSliceToProvisionPayload(
  s: NetworkSlice,
): ProvisionSlicePayload {
  return {
    sliceId: s.id,
    displayName: s.displayName,
    dnn: s.dnn,
    sst: s.sst,
    sd: s.sd,
    fiveQi: s.fiveQi,
    ulGbrMbps: s.ulGbrMbps,
    dlGbrMbps: s.dlGbrMbps,
    ulMbrMbps: s.ulMbrMbps,
    dlMbrMbps: s.dlMbrMbps,
    ambrMbps: s.ambrMbps,
    memberGroupIds: s.memberGroupIds,
  };
}

export interface SliceSemanticFields {
  dnn: string;
  sst: number;
  sd?: string | null;
  fiveQi: number;
  ulGbrMbps: number;
  dlGbrMbps: number;
  ulMbrMbps: number;
  dlMbrMbps: number;
  ambrMbps: number;
}

/**
 * Returns human-readable issue strings (Chinese for console).
 * 返回中文问题说明，供控制台与接口提示使用。
 */
export function getSlicePayloadSemanticIssues(
  s: SliceSemanticFields,
): string[] {
  const issues: string[] = [];
  if (s.ulGbrMbps > s.ulMbrMbps)
    issues.push('上行 GBR 不得大于上行 MBR');
  if (s.dlGbrMbps > s.dlMbrMbps)
    issues.push('下行 GBR 不得大于下行 MBR');
  const maxMbr = Math.max(s.ulMbrMbps, s.dlMbrMbps);
  if (s.ambrMbps < maxMbr)
    issues.push('AMBR 应不小于上行/下行 MBR 中的较大值');
  if (s.sd && !/^[0-9A-Fa-f]{6}$/.test(s.sd))
    issues.push('若填写 SD，须为 6 位十六进制字符');
  if (s.sst === 2 && !isUrllcFiveQi(s.fiveQi)) {
    issues.push(
      'SST=2（uRLLC）时，5QI 须在 uRLLC 资源类型范围内（65–69、80–83）',
    );
  }
  if (s.sst === 1 && isUrllcFiveQi(s.fiveQi)) {
    issues.push('SST=1（eMBB）与 uRLLC 类型的 5QI 组合不符合策略');
  }
  if (s.dnn.toLowerCase().includes('invalid')) {
    issues.push('DNN 未通过运营商策略（名称中不得包含「invalid」）');
  }
  return issues;
}
