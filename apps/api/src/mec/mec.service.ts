import { Injectable, NotFoundException } from '@nestjs/common';
import { v4 as uuidv4 } from 'uuid';
import { AuditService } from '../audit/audit.service';
import type { CommitResult, MecNode, MecOffloadRule } from '../domain/types';
import { buildMecRuleCommitReport } from '../domain/provision-report.builder';

@Injectable()
export class MecService {
  private nodes: MecNode[] = [
    {
      id: 'mec-1',
      nodeName: '产线1-MEC-UPF',
      n6LocalEndpoint: '10.10.0.3:2152',
      dnnIds: ['dnn-vision.private', 'dnn-plc.private'],
      capabilityTags: ['N6_BREAKOUT', 'LCL'],
      healthProbe: 'http://10.10.0.3:8080/health',
    },
  ];

  private rules: MecOffloadRule[] = [
    {
      id: 'rule-1',
      priority: 10,
      name: '产线 PLC 至本地控制器',
      enabled: true,
      match: {
        destIpCidrs: ['10.45.0.0/16'],
        srcIpCidrs: [],
        protocol: 'TCP',
        portRanges: ['4840'],
        vnId: 'vn-line1',
      },
      action: {
        actionType: 'LOCAL_BREAKOUT',
        nextHop: '10.10.0.10',
        bypassPublicNetwork: true,
      },
      hitCount: 18432,
    },
  ];

  constructor(private readonly audit: AuditService) {}

  listNodes(): MecNode[] {
    return [...this.nodes];
  }

  createNode(body: Partial<MecNode>, actor: string): MecNode {
    const id = `mec-${uuidv4().slice(0, 8)}`;
    const row: MecNode = {
      id,
      nodeName: body.nodeName ?? 'MEC 节点',
      n6LocalEndpoint: body.n6LocalEndpoint ?? '0.0.0.0:2152',
      dnnIds: body.dnnIds ?? [],
      capabilityTags: body.capabilityTags ?? [],
      healthProbe: body.healthProbe,
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

  listRules(): MecOffloadRule[] {
    return [...this.rules].sort((a, b) => a.priority - b.priority);
  }

  createRule(
    body: Partial<MecOffloadRule>,
    actor: string,
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
}
