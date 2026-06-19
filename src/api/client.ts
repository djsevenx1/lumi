// HTTP 客户端
// 统一封装 fetch,自动带上 token、错误处理

import { storage } from '../lib/storage';
import { STORAGE_KEYS } from '../lib/config';

export class ApiError extends Error {
  status: number;
  data: any;
  constructor(message: string, status: number, data?: any) {
    super(message);
    this.status = status;
    this.data = data;
  }
}

interface RequestOptions {
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE';
  body?: any;
  query?: Record<string, string | number | boolean | undefined>;
  headers?: Record<string, string>;
  signal?: AbortSignal;
  timeout?: number; // ms
  raw?: boolean; // 返回原始 Response
}

function buildUrl(
  base: string,
  path: string,
  query?: RequestOptions['query'],
): string {
  const cleanBase = base.replace(/\/+$/, '');
  const cleanPath = path.startsWith('/') ? path : `/${path}`;
  let url = `${cleanBase}${cleanPath}`;
  if (query) {
    const qs = Object.entries(query)
      .filter(([_, v]) => v !== undefined && v !== null && v !== '')
      .map(
        ([k, v]) =>
          `${encodeURIComponent(k)}=${encodeURIComponent(String(v))}`,
      )
      .join('&');
    if (qs) url += (url.includes('?') ? '&' : '?') + qs;
  }
  return url;
}

export async function request<T = any>(
  base: string,
  path: string,
  opts: RequestOptions = {},
): Promise<T> {
  const {
    method = 'GET',
    body,
    query,
    headers = {},
    signal,
    timeout = 15000,
    raw = false,
  } = opts;

  const token = storage.get<string>(STORAGE_KEYS.AUTH_TOKEN);
  if (token) headers['Authorization'] = `Bearer ${token}`;

  if (body && !(body instanceof FormData) && !headers['Content-Type']) {
    headers['Content-Type'] = 'application/json';
  }

  const url = buildUrl(base, path, query);

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeout);
  // 如果外部有 signal,联动取消
  if (signal) {
    if (signal.aborted) controller.abort();
    signal.addEventListener('abort', () => controller.abort());
  }

  let res: Response;
  try {
    res = await fetch(url, {
      method,
      headers,
      body:
        body == null
          ? undefined
          : body instanceof FormData
            ? body
            : typeof body === 'string'
              ? body
              : JSON.stringify(body),
      signal: controller.signal,
    });
  } catch (e: any) {
    clearTimeout(timer);
    throw new ApiError(
      e?.message || '网络请求失败',
      0,
      { network: true, original: String(e) },
    );
  }
  clearTimeout(timer);

  if (raw) return res as any;

  const ctype = res.headers.get('content-type') || '';
  let data: any;
  try {
    data = ctype.includes('application/json')
      ? await res.json()
      : await res.text();
  } catch {
    data = null;
  }

  if (!res.ok) {
    // 401:清掉登录态
    if (res.status === 401) {
      storage.remove(STORAGE_KEYS.AUTH_TOKEN);
      storage.remove(STORAGE_KEYS.AUTH_USER);
    }
    throw new ApiError(
      (data && (data.message || data.error)) || `HTTP ${res.status}`,
      res.status,
      data,
    );
  }

  return data as T;
}
