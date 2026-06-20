// HTTP 客户端
// LunaTV 后端用 cookie session 鉴权(user_auth cookie),不是 Bearer token。
// 策略:
//   1. 登录/注册成功后,从 Set-Cookie header 提取 user_auth 值,存到 storage
//   2. 后续请求手动加 Cookie header(原生端 fetch 不自动管理 cookie)
//   3. 同时加 credentials: 'include'(Web 端 fallback)

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
  raw?: boolean; // 返回原始 Response(用于提取 Set-Cookie)
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

// 从 Set-Cookie header 提取 user_auth 的值
function extractUserAuth(setCookie: string | null): string | null {
  if (!setCookie) return null;
  // 格式: user_auth=xxx; Path=/; Expires=...
  const match = setCookie.match(/user_auth=([^;]+)/);
  return match ? match[1] : null;
}

// Lynx 运行时(PrimJS)没有全局 FormData 构造函数,不能直接 `body instanceof FormData`
// 用 duck-typing 判断:有 append 方法 + 没有常见普通对象方法
function isFormData(body: any): boolean {
  if (!body) return false;
  // 优先用 typeof 兜底(避免在没 FormData 的环境里直接引用触发 ReferenceError)
  try {
    return (
      typeof body.append === 'function' &&
      typeof body.set === 'function' &&
      typeof body.getAll === 'function' &&
      typeof body.entries === 'function'
    );
  } catch {
    return false;
  }
}

// 保存/读取 cookie
export function saveAuthCookie(cookieValue: string) {
  storage.set(STORAGE_KEYS.AUTH_COOKIE, cookieValue);
  // 尝试从 cookie 里解析 username
  try {
    const decoded = decodeURIComponent(cookieValue);
    const parsed = JSON.parse(decoded);
    if (parsed.username) {
      storage.set(STORAGE_KEYS.AUTH_USER, {
        username: parsed.username,
        role: parsed.role || 'user',
      });
    }
  } catch {}
}

export function getAuthCookie(): string | null {
  return storage.get<string>(STORAGE_KEYS.AUTH_COOKIE);
}

export function clearAuthCookie() {
  storage.remove(STORAGE_KEYS.AUTH_COOKIE);
  storage.remove(STORAGE_KEYS.AUTH_USER);
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

  // cookie 鉴权:从 storage 读 user_auth,手动加 Cookie header
  const cookie = getAuthCookie();
  if (cookie) {
    headers['Cookie'] = `user_auth=${cookie}`;
  }

  if (body && !isFormData(body) && !headers['Content-Type']) {
    headers['Content-Type'] = 'application/json';
  }

  const url = buildUrl(base, path, query);

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeout);
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
          : isFormData(body)
            ? body
            : typeof body === 'string'
              ? body
              : JSON.stringify(body),
      signal: controller.signal,
      // Web 端 fallback:让浏览器自动管理 cookie
      credentials: 'include',
    } as any);
  } catch (e: any) {
    clearTimeout(timer);
    throw new ApiError(
      e?.message || '网络请求失败',
      0,
      { network: true, original: String(e) },
    );
  }
  clearTimeout(timer);

  // 提取 Set-Cookie(登录/注册时用)
  if (raw) {
    // 尝试从 header 提取 cookie
    const setCookie = res.headers.get('set-cookie');
    const authCookie = extractUserAuth(setCookie);
    if (authCookie) {
      saveAuthCookie(authCookie);
    }
    return res as any;
  }

  // 非 raw 模式也尝试提取 cookie(某些环境下 header 可读)
  try {
    const setCookie = res.headers.get('set-cookie');
    const authCookie = extractUserAuth(setCookie);
    if (authCookie) {
      saveAuthCookie(authCookie);
    }
  } catch {}

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
      clearAuthCookie();
    }
    throw new ApiError(
      (data && (data.message || data.error)) || `HTTP ${res.status}`,
      res.status,
      data,
    );
  }

  return data as T;
}
