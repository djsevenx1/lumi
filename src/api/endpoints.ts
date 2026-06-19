// LunaTV API 端点封装
// 对应 LunaTV src/app/api/* 下的路由

import { request } from './client';
import type {
  AuthResponse,
  CategoryInfo,
  DetailResponse,
  DoubanItem,
  Favorite,
  ParseResponse,
  PlayRecord,
  SearchResponse,
  SearchResult,
  SourceItem,
  User,
} from './types';

// ====== 认证 ======
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

export function register(
  base: string,
  username: string,
  password: string,
  inviteCode?: string,
): Promise<AuthResponse> {
  return request<AuthResponse>(base, '/api/register', {
    method: 'POST',
    body: { username, password, inviteCode },
  });
}

export function logout(base: string): Promise<{ ok: boolean }> {
  return request<{ ok: boolean }>(base, '/api/logout', { method: 'POST' });
}

export function me(base: string): Promise<{ ok: boolean; user?: User }> {
  return request<{ ok: boolean; user?: User }>(base, '/api/me');
}

// ====== 搜索 ======
export async function search(
  base: string,
  keyword: string,
  opts: { type?: string; page?: number } = {},
): Promise<SearchResponse> {
  // LunaTV /api/search 返回的格式是 { results: SearchResult[] }
  return request<SearchResponse>(base, '/api/search', {
    query: { q: keyword, type: opts.type, page: opts.page ?? 1 },
  });
}

// ====== 详情 ======
export function detail(
  base: string,
  source: string,
  id: string,
): Promise<DetailResponse> {
  return request<DetailResponse>(base, '/api/detail', {
    query: { source, id },
  });
}

// ====== 解析视频地址 ======
export function parseVideo(
  base: string,
  source: string,
  id: string,
  episode: number,
): Promise<ParseResponse> {
  return request<ParseResponse>(base, '/api/parse', {
    query: { source, id, episode },
  });
}

// ====== 收藏 ======
export function getFavorites(base: string): Promise<{ favorites: Favorite[] }> {
  return request<{ favorites: Favorite[] }>(base, '/api/favorites');
}

export function addFavorite(
  base: string,
  key: string,
  data: Partial<Favorite>,
): Promise<{ ok: boolean }> {
  return request<{ ok: boolean }>(base, '/api/favorites', {
    method: 'POST',
    body: { key, ...data },
  });
}

export function removeFavorite(
  base: string,
  key: string,
): Promise<{ ok: boolean }> {
  return request<{ ok: boolean }>(base, '/api/favorites', {
    method: 'DELETE',
    query: { key },
  });
}

// ====== 播放记录 ======
export function getPlayRecords(
  base: string,
): Promise<{ records: PlayRecord[] }> {
  return request<{ records: PlayRecord[] }>(base, '/api/playrecords');
}

export function savePlayRecord(
  base: string,
  record: PlayRecord,
): Promise<{ ok: boolean }> {
  return request<{ ok: boolean }>(base, '/api/playrecords', {
    method: 'POST',
    body: record,
  });
}

// ====== 豆瓣(热门) ======
export function doubanHot(
  base: string,
  kind: 'movie' | 'tv' | 'anime' | 'variety' = 'movie',
  pageLimit: number = 20,
): Promise<{ list: DoubanItem[] }> {
  return request<{ list: DoubanItem[] }>(base, '/api/douban', {
    query: { kind, pageLimit, type: 'hot' },
  });
}

// ====== 分类浏览 ======
export function categoryList(
  base: string,
  type: string,
  page: number = 1,
): Promise<CategoryInfo> {
  return request<CategoryInfo>(base, '/api/category', {
    query: { type, page },
  });
}

// ====== 源管理 ======
export function listSources(base: string): Promise<{ sources: SourceItem[] }> {
  return request<{ sources: SourceItem[] }>(base, '/api/sources');
}

// ====== 热搜(首页用) ======
export function hotSearches(base: string): Promise<{ hot: string[] }> {
  return request<{ hot: string[] }>(base, '/api/search/hot');
}

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
