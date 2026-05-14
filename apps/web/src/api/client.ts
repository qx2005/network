/**
 * Minimal fetch wrapper for BFF calls (proxied to NestJS in dev).
 * 轻量 fetch 封装：开发环境由 Vite 代理到 NestJS。
 */

import type { ProvisioningJob } from '../domain/types'

const ROLE_KEY = 'consoleRole'
const USER_KEY = 'consoleUserId'

export class ApiError extends Error {
  readonly status: number
  readonly body: unknown

  constructor(message: string, status: number, body?: unknown) {
    super(message)
    this.name = 'ApiError'
    this.status = status
    this.body = body
  }
}

async function rejectWithApiError(res: Response): Promise<never> {
  const text = await res.text()
  let body: unknown
  try {
    body = text ? JSON.parse(text) : undefined
  } catch {
    body = text
  }
  const msg =
    typeof body === 'object' &&
    body !== null &&
    'message' in body &&
    typeof (body as { message: unknown }).message === 'string'
      ? (body as { message: string }).message
      : text || res.statusText
  throw new ApiError(msg, res.status, body)
}

export function getRole(): string {
  return localStorage.getItem(ROLE_KEY) ?? 'operator'
}

export function setRole(role: string): void {
  localStorage.setItem(ROLE_KEY, role)
}

export function getUserId(): string {
  return localStorage.getItem(USER_KEY) ?? 'alice'
}

export function setUserId(id: string): void {
  localStorage.setItem(USER_KEY, id)
}

function headers(extra?: HeadersInit): HeadersInit {
  return {
    'Content-Type': 'application/json',
    'x-user-role': getRole(),
    'x-user-id': getUserId(),
    ...(extra ?? {}),
  }
}

export async function apiGet<T>(path: string): Promise<T> {
  const res = await fetch(path, { headers: headers() })
  if (!res.ok) await rejectWithApiError(res)
  return res.json() as Promise<T>
}

export async function apiSend<T>(
  path: string,
  init: RequestInit,
): Promise<T> {
  const merged = new Headers(headers())
  if (init.headers) {
    const extra = new Headers(init.headers as HeadersInit)
    extra.forEach((v, k) => merged.set(k, v))
  }
  const res = await fetch(path, {
    ...init,
    headers: merged,
  })
  if (!res.ok) await rejectWithApiError(res)
  if (res.status === 204) return undefined as T
  const ct = res.headers.get('content-type')
  if (ct?.includes('application/json')) return res.json() as Promise<T>
  const text = await res.text()
  if (text) {
    try {
      return JSON.parse(text) as T
    } catch {
      /* not JSON */
    }
  }
  return undefined as T
}

export function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

/**
 * Poll job until terminal state (optional; slice provision uses synchronous POST instead).
 * 轮询任务至终态（可选；切片下发已改为 POST 一次返回终态）。
 */
export async function pollProvisioningJob(
  jobId: string,
  opts?: { maxAttempts?: number; intervalMs?: number },
): Promise<ProvisioningJob> {
  const max = opts?.maxAttempts ?? 80
  const interval = opts?.intervalMs ?? 250
  for (let i = 0; i < max; i++) {
    const j = await apiGet<ProvisioningJob>(`/api/provisioning/jobs/${jobId}`)
    if (j.status === 'success' || j.status === 'failed') return j
    await sleep(interval)
  }
  throw new Error('下发任务状态轮询超时')
}
