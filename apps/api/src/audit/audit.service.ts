import { Injectable } from '@nestjs/common';
import { v4 as uuidv4 } from 'uuid';
import type { AuditLogEntry } from '../domain/types';

/**
 * In-memory audit trail (replace with DB in production).
 * 内存审计日志；生产环境应写入 PostgreSQL 等持久化存储。
 */
@Injectable()
export class AuditService {
  private readonly entries: AuditLogEntry[] = [];

  append(entry: Omit<AuditLogEntry, 'id' | 'timestamp'>): AuditLogEntry {
    const row: AuditLogEntry = {
      ...entry,
      id: uuidv4(),
      timestamp: new Date().toISOString(),
    };
    this.entries.unshift(row);
    if (this.entries.length > 500) this.entries.pop();
    return row;
  }

  list(limit = 100): AuditLogEntry[] {
    return this.entries.slice(0, limit);
  }
}
