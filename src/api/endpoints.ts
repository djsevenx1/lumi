// LunaTV API 端点封装
// 对齐 LunaTV 后端真实接口(2026-06 验证)
// 鉴权:cookie session(user_auth),非 Bearer token

import { request } from './client';
import type {
  AuthResponse,
  DetailItem,
  DoubanResponse,
  Favorite,
  FavoritesResponse,
  PlayRecord,
  PlayRecordsResponse,
  SearchResponse,
  SuccessResponse,
  User,
} from './types';

// ====== 认证 ======
// 登录返回 {ok:true},通过 Set-Cookie 设置 user_auth cookie
export function login(
  base: string,
  username: string,
  password: string,
): Promise<AuthResponse> {
  return request<AuthResponse>(base, '/api/login', {
    method: 'POST',
    body: { username, password },
  });
}

// 注册返回 {ok:true, message, needDelay},通过 Set-Cookie 自动登录
export function register(
  base: string,
  username: string,
  password: string,
  confirmPassword: string,
  inviteCode?: string,
): Promise<AuthResponse> {
  return request<AuthResponse>(base, '/api/register', {
    method: 'POST',
    body: { username, password, confirmPassword, inviteCode },
  });
}

// 退出:清除本地 cookie 即可(后端无 /api/logout)
export function logout(): void {
  // 在 client.ts 里实现
}

// 获取当前用户(从 cookie 解析,无 /api/me 接口)
export function me(): { ok: boolean; user?: User } {
  // 用户信息从 cookie 解析,在 store 里处理
  return { ok: false };
}

// ====== 搜索 ======
// GET /api/search?q=xxx
// 需要 cookie 鉴权
export function search(
  base: string,
  keyword: string,
): Promise<SearchResponse> {
  return request<SearchResponse>(base, '/api/search', {
    query: { q: keyword },
  });
}

// ====== 详情 ======
// GET /api/detail?id=xxx&source=xxx
// 返回扁平结构(非 {videoInfo: ...})
export function detail(
  base: string,
  source: string,
  id: string,
): Promise<DetailItem> {
  return request<DetailItem>(base, '/api/detail', {
    query: { id, source },
  });
}

// ====== 收藏 ======
// GET /api/favorites → Record<string, Favorite>
export function getFavorites(base: string): Promise<FavoritesResponse> {
  return request<FavoritesResponse>(base, '/api/favorites');
}

// POST /api/favorites body: {key, favorite: {...}}
// favorite 必须包含 title 和 source_name
export function addFavorite(
  base: string,
  key: string,
  favorite: Omit<Favorite, 'key'>,
): Promise<SuccessResponse> {
  return request<SuccessResponse>(base, '/api/favorites', {
    method: 'POST',
    body: { key, favorite },
  });
}

// DELETE /api/favorites?key=xxx
export function removeFavorite(
  base: string,
  key: string,
): Promise<SuccessResponse> {
  return request<SuccessResponse>(base, '/api/favorites', {
    method: 'DELETE',
    query: { key },
  });
}

// ====== 播放记录 ======
// GET /api/playrecords → Record<string, PlayRecord>
export function getPlayRecords(base: string): Promise<PlayRecordsResponse> {
  return request<PlayRecordsResponse>(base, '/api/playrecords');
}

// POST /api/playrecords body: {key, record: {...}}
export function savePlayRecord(
  base: string,
  key: string,
  record: Omit<PlayRecord, 'key'>,
): Promise<SuccessResponse> {
  return request<SuccessResponse>(base, '/api/playrecords', {
    method: 'POST',
    body: { key, record },
  });
}

// ====== 豆瓣(热门) ======
// GET /api/douban?type=movie|tv&tag=xxx&pageSize=16&pageStart=0
// 不需要鉴权
export function doubanHot(
  base: string,
  type: 'movie' | 'tv',
  tag: string = '热门',
  pageSize: number = 16,
  pageStart: number = 0,
): Promise<DoubanResponse> {
  return request<DoubanResponse>(base, '/api/douban', {
    query: { type, tag, pageSize, pageStart },
  });
}

// 豆瓣 tag 映射
export const DOUBAN_TAGS = {
  hot: '热门',
  latest: '最新',
  classic: '经典',
  top250: 'top250',
} as const;

// ====== 图片代理(防止防盗链) ======
export function imageProxyUrl(
  base: string,
  url: string,
  referer?: string,
): string {
  const q = referer ? `&referer=${encodeURIComponent(referer)}` : '';
  return `${base.replace(/\/+$/, '')}/api/image-proxy?url=${encodeURIComponent(
    url,
  )}${q}`;
}
