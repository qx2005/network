import { Injectable, NotFoundException } from '@nestjs/common';
import { v4 as uuidv4 } from 'uuid';
import { AuditService } from '../audit/audit.service';
import type { CommitResult, MecNode, MecOffloadRule } from '../domain/types';
import { buildMecRuleCommitReport } from '../domain/provision-report.builder';

@Injectable()
export class MecService {
  /** Demo: no pre-seeded MEC assets (robot-arm-only inventory). */
  /** 演示：不预置 MEC（当前演示数据仅保留机械臂场景）。 */
  private nodes: MecNode[] = [];

  private rules: MecOffloadRule[] = [];

  constructor(private readonly audit: AuditService) {}

  listNodes(): MecNode[] {
    return [...this.nodes];
  }

  createNode(
    body: Partial<MecNode>,
    actor: string,
    demoPlaybook = false,
  ): MecNode {
    const id = `mec-${uuidv4().slice(0, 8)}`;
    const row: MecNode = {
      id,
      nodeName: body.nodeName ?? 'MEC 节点',
      n6LocalEndpoint: body.n6LocalEndpoint ?? '0.0.0.0:2152',
      dnnIds: body.dnnIds ?? [],
      capabilityTags: body.capabilityTags ?? [],
      healthProbe: body.healthProbe,
      provenance: demoPlaybook ? 'demo-playbook' : undefined,
    };
    this.nodes.unshift(row);
    this.audit.append({
      actor,
      action: 'mec.node.create',
      resourceType: 'MecNode',
      resourceId: id,
      result: 'success',
      traceId: uuidv4(),
    });
    return row;
  }

  removeNode(id: string, actor: string): void {
    const idx = this.nodes.findIndex((n) => n.id === id);
    if (idx < 0) throw new NotFoundException(`未找到 MEC 节点：${id}`);
    this.nodes.splice(idx, 1);
    this.audit.append({
      actor,
      action: 'mec.node.delete',
      resourceType: 'MecNode',
      resourceId: id,
      result: 'success',
      traceId: uuidv4(),
    });
  }

  listRules(): MecOffloadRule[] {
    return [...this.rules].sort((a, b) => a.priority - b.priority);
  }

  createRule(
    body: Partial<MecOffloadRule>,
    actor: string,
    demoPlaybook = false,
  ): CommitResult<MecOffloadRule> {
    const id = `rule-${uuidv4().slice(0, 8)}`;
    const row: MecOffloadRule = {
      id,
      priority: body.priority ?? 100,
      name: body.name ?? '分流规则',
      enabled: body.enabled ?? true,
      match: body.match ?? {
        destIpCidrs: [],
        srcIpCidrs: [],
        protocol: 'ANY',
        portRanges: [],
      },
      action: body.action ?? {
        actionType: 'LOCAL_BREAKOUT',
        bypassPublicNetwork: true,
      },
      hitCount: 0,
      provenance: demoPlaybook ? 'demo-playbook' : undefined,
    };
    this.rules.unshift(row);
    const report = buildMecRuleCommitReport(row);
    this.audit.append({
      actor,
      action: 'mec.rule.create',
      resourceType: 'MecOffloadRule',
      resourceId: id,
      result: 'success',
      traceId: uuidv4(),
      diff: { correlationId: report.correlationId },
    });
    return { data: row, report };
  }

  updateRule(
    id: string,
    body: Partial<MecOffloadRule>,
    actor: string,
  ): CommitResult<MecOffloadRule> {
    const idx = this.rules.findIndex((r) => r.id === id);
    if (idx < 0) throw new NotFoundException(`未找到分流规则：${id}`);
    const prev = this.rules[idx];
    const next = { ...prev, ...body, id: prev.id };
    this.rules[idx] = next;
    const report = buildMecRuleCommitReport(next);
    this.audit.append({
      actor,
      action: 'mec.rule.update',
      resourceType: 'MecOffloadRule',
      resourceId: id,
      diff: { before: prev, after: next, correlationId: report.correlationId },
      result: 'success',
      traceId: uuidv4(),
    });
    return { data: next, report };
  }

  removeRule(id: string, actor: string): void {
    const idx = this.rules.findIndex((r) => r.id === id);
    if (idx < 0) throw new NotFoundException(`未找到分流规则：${id}`);
    this.rules.splice(idx, 1);
    this.audit.append({
      actor,
      action: 'mec.rule.delete',
      resourceType: 'MecOffloadRule',
      resourceId: id,
      result: 'success',
      traceId: uuidv4(),
    });
  }
}
