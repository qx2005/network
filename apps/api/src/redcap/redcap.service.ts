import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { v4 as uuidv4 } from 'uuid';
import { REDCAP_PROFILE_DISABLE } from './redcap.constants';
import { AuditService } from '../audit/audit.service';
import type { CommitResult, PowerProfile, RedCapDevice } from '../domain/types';
import {
  buildRedcapPowerApplyReport,
  buildRedcapPowerDisableReport,
} from '../domain/provision-report.builder';

function nowIso(): string {
  return new Date().toISOString();
}

/** eDRX state string shown on terminal row / after profile apply. */
function edrxStateFromProfile(p: PowerProfile): string {
  if (p.edrxEnabled === false) {
    return 'eDRX 关（PSM 主导）';
  }
  return `enabled ${p.edrxCycleSeconds}s`;
}

@Injectable()
export class RedcapService {
  /**
   * Demo seed: empty; devices are onboarded via console or Agent playbook.
   * 演示种子：默认无终端；省电模板列表仍保留。
   */
  private devices: RedCapDevice[] = [];

  /** Only battery / low-power field devices get templates; no eDRX “templates” for mains-fed uRLLC. */
  /** 仅电池/现场低功耗设备保留省电模板；常电 uRLLC/eMBB 不在此列表生成行。 */
  private profiles: PowerProfile[] = [
    {
      id: 'pp-env-sensor',
      templateName: '环境传感 — 电池长周期',
      deviceTypeTag: 'env_sensor',
      edrxCycleSeconds: 163.84,
      ptwSeconds: 10.24,
      drxMs: 640,
      psmEnabled: true,
      heartbeatRecommendedSeconds: 3600,
    },
    {
      id: 'pp-asset-tracker',
      templateName: '资产定位标签 — 均衡省电',
      deviceTypeTag: 'asset_tracker_tag',
      edrxCycleSeconds: 262.14,
      ptwSeconds: 2.56,
      drxMs: 320,
      psmEnabled: false,
      heartbeatRecommendedSeconds: 300,
    },
    {
      id: 'pp-remote-smart-meter',
      templateName: '厂务远端水电气表 — 深度休眠',
      deviceTypeTag: 'remote_smart_meter',
      edrxEnabled: false,
      edrxCycleSeconds: 0,
      ptwSeconds: 0,
      drxMs: 0,
      psmEnabled: true,
      heartbeatRecommendedSeconds: 86400,
    },
  ];

  constructor(private readonly audit: AuditService) {}

  listDevices(): RedCapDevice[] {
    return [...this.devices];
  }

  getDevice(id: string): RedCapDevice {
    const d = this.devices.find((x) => x.id === id);
    if (!d) throw new NotFoundException(`未找到终端：${id}`);
    return { ...d };
  }

  createDevice(
    body: Partial<RedCapDevice>,
    actor: string,
    demoPlaybook = false,
  ): RedCapDevice {
    const supiNorm = body.supi?.trim() || 'imsi-460000000000000';
    if (this.devices.some((d) => d.supi === supiNorm)) {
      throw new ConflictException(`SUPI 已存在：${supiNorm}`);
    }
    const id = `dev-${uuidv4().slice(0, 8)}`;
    const rawPid = body.powerProfileId?.trim();
    const profileId =
      !rawPid || rawPid === REDCAP_PROFILE_DISABLE ? undefined : rawPid;
    const p = profileId
      ? this.profiles.find((x) => x.id === profileId)
      : undefined;
    if (profileId && !p) {
      throw new NotFoundException(`未找到省电模板：${profileId}`);
    }
    const sliceId = body.sliceId?.trim();
    if (!sliceId) {
      throw new BadRequestException('须指定关联切片 ID');
    }
    const row: RedCapDevice = {
      id,
      alias: body.alias?.trim() || '新终端',
      supi: supiNorm,
      imeisv: body.imeisv?.trim(),
      sliceId,
      vnId: body.vnId?.trim(),
      ipAddress: body.ipAddress?.trim(),
      rrcState: body.rrcState?.trim() || 'RRC_CONNECTED',
      signalQuality: body.signalQuality?.trim() || 'RSRP -80 dBm',
      trafficMb:
        typeof body.trafficMb === 'number' && !Number.isNaN(body.trafficMb)
          ? body.trafficMb
          : 0,
      edrxState: p ? edrxStateFromProfile(p) : body.edrxState?.trim() || 'disabled',
      powerProfileId: p?.id,
      lastSeenAt: nowIso(),
      provenance: demoPlaybook ? 'demo-playbook' : undefined,
    };
    this.devices.unshift(row);
    this.audit.append({
      actor,
      action: 'redcap.device.create',
      resourceType: 'RedCapDevice',
      resourceId: id,
      diff: { alias: row.alias, supi: row.supi, sliceId: row.sliceId },
      result: 'success',
      traceId: uuidv4(),
    });
    return { ...row };
  }

  removeDevice(id: string, actor: string): void {
    const idx = this.devices.findIndex((x) => x.id === id);
    if (idx < 0) throw new NotFoundException(`未找到终端：${id}`);
    const removed = this.devices[idx];
    this.devices.splice(idx, 1);
    this.audit.append({
      actor,
      action: 'redcap.device.delete',
      resourceType: 'RedCapDevice',
      resourceId: id,
      diff: { alias: removed.alias, supi: removed.supi },
      result: 'success',
      traceId: uuidv4(),
    });
  }

  applyProfile(
    deviceId: string,
    profileId: string,
    actor: string,
  ): CommitResult<RedCapDevice> {
    if (profileId === REDCAP_PROFILE_DISABLE) {
      return this.applyProfileDisable(deviceId, actor);
    }
    const idx = this.devices.findIndex((x) => x.id === deviceId);
    if (idx < 0) throw new NotFoundException(`未找到终端：${deviceId}`);
    const p = this.profiles.find((x) => x.id === profileId);
    if (!p) throw new NotFoundException(`未找到省电模板：${profileId}`);
    this.devices[idx] = {
      ...this.devices[idx],
      powerProfileId: profileId,
      edrxState: edrxStateFromProfile(p),
      lastSeenAt: nowIso(),
    };
    const device = { ...this.devices[idx] };
    const report = buildRedcapPowerApplyReport(deviceId, device.supi, {
      templateName: p.templateName,
      edrxCycleSeconds: p.edrxCycleSeconds,
      edrxEnabled: p.edrxEnabled,
    });
    this.audit.append({
      actor,
      action: 'redcap.applyProfile',
      resourceType: 'RedCapDevice',
      resourceId: deviceId,
      diff: { profileId, correlationId: report.correlationId },
      result: 'success',
      traceId: uuidv4(),
    });
    return { data: device, report };
  }

  private applyProfileDisable(
    deviceId: string,
    actor: string,
  ): CommitResult<RedCapDevice> {
    const idx = this.devices.findIndex((x) => x.id === deviceId);
    if (idx < 0) throw new NotFoundException(`未找到终端：${deviceId}`);
    const prev = this.devices[idx];
    const device: RedCapDevice = {
      ...prev,
      edrxState: 'disabled',
      lastSeenAt: nowIso(),
    };
    delete device.powerProfileId;
    this.devices[idx] = device;
    const report = buildRedcapPowerDisableReport(deviceId, device.supi);
    this.audit.append({
      actor,
      action: 'redcap.applyProfile',
      resourceType: 'RedCapDevice',
      resourceId: deviceId,
      diff: { profileId: null, edrxDisabled: true, correlationId: report.correlationId },
      result: 'success',
      traceId: uuidv4(),
    });
    return { data: { ...device }, report };
  }

  listProfiles(): PowerProfile[] {
    return [...this.profiles];
  }

  createProfile(body: Partial<PowerProfile>, actor: string): PowerProfile {
    const id = `pp-${uuidv4().slice(0, 8)}`;
    const edrxOn = body.edrxEnabled !== false;
    const row: PowerProfile = {
      id,
      templateName: body.templateName ?? 'New Profile',
      deviceTypeTag: body.deviceTypeTag,
      edrxEnabled: edrxOn ? undefined : false,
      edrxCycleSeconds: edrxOn ? (body.edrxCycleSeconds ?? 163.84) : 0,
      ptwSeconds: edrxOn ? (body.ptwSeconds ?? 10.24) : 0,
      drxMs: edrxOn ? (body.drxMs ?? 640) : 0,
      psmEnabled: body.psmEnabled ?? true,
      heartbeatRecommendedSeconds: body.heartbeatRecommendedSeconds ?? 3600,
    };
    this.profiles.unshift(row);
    this.audit.append({
      actor,
      action: 'redcap.profile.create',
      resourceType: 'PowerProfile',
      resourceId: id,
      diff: { templateName: row.templateName },
      result: 'success',
      traceId: uuidv4(),
    });
    return row;
  }
}
