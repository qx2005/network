import { Injectable, NotFoundException } from '@nestjs/common';
import { v4 as uuidv4 } from 'uuid';
import { AuditService } from '../audit/audit.service';
import type { CommitResult, PowerProfile, RedCapDevice } from '../domain/types';
import { buildRedcapPowerApplyReport } from '../domain/provision-report.builder';

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

  applyProfile(
    deviceId: string,
    profileId: string,
    actor: string,
  ): CommitResult<RedCapDevice> {
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
