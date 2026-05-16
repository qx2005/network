import {
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

@Injectable()
export class RedcapService {
  private devices: RedCapDevice[] = [
    {
      id: 'dev-1',
      alias: '储罐液位-A1',
      supi: 'imsi-460001234567890',
      imeisv: '867400012345678',
      sliceId: 'slice-vision-embb',
      vnId: 'vn-line1',
      ipAddress: '10.45.1.12',
      rrcState: 'RRC_CONNECTED',
      signalQuality: 'RSRP -78 dBm',
      trafficMb: 128,
      edrxState: 'enabled 40.96s',
      powerProfileId: 'pp-sensors',
      lastSeenAt: nowIso(),
    },
    {
      id: 'dev-2',
      alias: '杀菌温控-B2',
      supi: 'imsi-460001234567891',
      sliceId: 'slice-plc-urllc',
      vnId: 'vn-line1',
      ipAddress: '10.45.1.13',
      rrcState: 'RRC_INACTIVE',
      signalQuality: 'RSRP -82 dBm',
      trafficMb: 12,
      edrxState: 'enabled 81.92s',
      powerProfileId: 'pp-sensors',
      lastSeenAt: nowIso(),
    },
    {
      id: 'dev-3',
      alias: '1号线-高速AI灯检相机A',
      supi: 'imsi-460001234567892',
      sliceId: 'slice-vision-embb',
      vnId: 'vn-line1',
      ipAddress: '10.45.1.55',
      rrcState: 'RRC_CONNECTED',
      signalQuality: 'RSRP -65 dBm (极好)',
      trafficMb: 5120,
      edrxState: 'enabled 81.92s',
      powerProfileId: 'pp-gas-report',
      lastSeenAt: nowIso(),
    },
    {
      id: 'dev-4',
      alias: '灌装主轴-无线PLC终端',
      supi: 'imsi-460001234567893',
      sliceId: 'slice-plc-urllc',
      vnId: 'vn-fill01',
      ipAddress: '10.45.1.82',
      rrcState: 'RRC_CONNECTED',
      signalQuality: 'RSRP -71 dBm (良好)',
      trafficMb: 256,
      edrxState: 'enabled 81.92s',
      powerProfileId: 'pp-gas-report',
      lastSeenAt: nowIso(),
    },
    {
      id: 'dev-5',
      alias: '窖池温湿度传感-042区',
      supi: 'imsi-460001234567894',
      sliceId: 'slice-plc-urllc',
      vnId: 'vn-line1',
      ipAddress: '10.45.3.15',
      rrcState: 'RRC_INACTIVE',
      signalQuality: 'RSRP -98 dBm (较弱)',
      trafficMb: 2,
      edrxState: 'enabled 163.84s',
      powerProfileId: 'pp-cellar',
      lastSeenAt: nowIso(),
    },
    {
      id: 'dev-6',
      alias: '基酒区-可燃气体防爆探头',
      supi: 'imsi-460001234567895',
      sliceId: 'slice-plc-urllc',
      vnId: 'vn-line1',
      ipAddress: '10.45.3.22',
      rrcState: 'RRC_IDLE',
      signalQuality: 'RSRP -82 dBm (中等)',
      trafficMb: 8,
      edrxState: 'enabled 81.92s',
      powerProfileId: 'pp-gas-report',
      lastSeenAt: nowIso(),
    },
  ];

  private profiles: PowerProfile[] = [
    {
      id: 'pp-sensors',
      templateName: 'RedCap 传感 — 均衡省电',
      deviceTypeTag: 'level_meter',
      edrxCycleSeconds: 40.96,
      ptwSeconds: 2.56,
      drxMs: 320,
      psmEnabled: false,
      heartbeatRecommendedSeconds: 30,
    },
    {
      id: 'pp-cellar',
      templateName: '窖池长待机模板',
      deviceTypeTag: 'cellar_sensor',
      edrxCycleSeconds: 163.84,
      ptwSeconds: 5.12,
      drxMs: 320,
      psmEnabled: true,
      heartbeatRecommendedSeconds: 3600,
    },
    {
      id: 'pp-gas-report',
      templateName: '定时上报模板',
      deviceTypeTag: 'gas_detector',
      edrxCycleSeconds: 81.92,
      ptwSeconds: 2.56,
      drxMs: 320,
      psmEnabled: false,
      heartbeatRecommendedSeconds: 600,
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
    const row: RedCapDevice = {
      id,
      alias: body.alias?.trim() || '新终端',
      supi: supiNorm,
      imeisv: body.imeisv?.trim(),
      sliceId: body.sliceId?.trim() || 'slice-vision-embb',
      vnId: body.vnId?.trim(),
      ipAddress: body.ipAddress?.trim(),
      rrcState: body.rrcState?.trim() || 'RRC_CONNECTED',
      signalQuality: body.signalQuality?.trim() || 'RSRP -80 dBm',
      trafficMb:
        typeof body.trafficMb === 'number' && !Number.isNaN(body.trafficMb)
          ? body.trafficMb
          : 0,
      edrxState: p
        ? `enabled ${p.edrxCycleSeconds}s`
        : body.edrxState?.trim() || 'disabled',
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
      edrxState: `enabled ${p.edrxCycleSeconds}s`,
      lastSeenAt: nowIso(),
    };
    const device = { ...this.devices[idx] };
    const report = buildRedcapPowerApplyReport(deviceId, device.supi, {
      templateName: p.templateName,
      edrxCycleSeconds: p.edrxCycleSeconds,
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
    const row: PowerProfile = {
      id,
      templateName: body.templateName ?? 'New Profile',
      deviceTypeTag: body.deviceTypeTag,
      edrxCycleSeconds: body.edrxCycleSeconds ?? 20.48,
      ptwSeconds: body.ptwSeconds ?? 2.56,
      drxMs: body.drxMs ?? 320,
      psmEnabled: body.psmEnabled ?? false,
      heartbeatRecommendedSeconds: body.heartbeatRecommendedSeconds ?? 25,
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
