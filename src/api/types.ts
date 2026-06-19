// LunaTV API 类型定义
// 参考:https://github.com/djsevenx1/LunaTV src/lib/*.types.ts

export interface User {
  username: string;
  role?: 'owner' | 'admin' | 'user';
  banned?: boolean;
  expiresAt?: number;
}

export interface AuthResponse {
  ok: boolean;
  message?: string;
  token?: string;
  user?: User;
}

export interface SearchResult {
  id: string;
  title: string;
  poster: string;
  episodes?: string[];
  source: string;
  sourceName: string;
  year?: string;
  type?: string;
  doubanId?: number;
  rate?: string;
}

export interface SearchResponse {
  results: SearchResult[];
  total: number;
}

export interface Episode {
  name: string;
  url: string;
}

export interface DetailItem {
  id: string;
  title: string;
  poster: string;
  backdrop?: string;
  description?: string;
  year?: string;
  type?: string;
  region?: string;
  director?: string;
  actors?: string;
  doubanId?: number;
  rate?: string;
  episodes: string[]; // 集数名称列表
  episodes_url?: string[][]; // 每个源的 URL 列表
  source: string;
  sourceName: string;
  remarks?: string;
}

export interface DetailResponse {
  videoInfo: DetailItem;
}

export interface ParseResponse {
  url: string;
  qualities?: Array<{ name: string; url: string }>;
  parseType?: string;
}

export interface Favorite {
  key: string; // `${source}+${id}`
  source: string;
  id: string;
  title: string;
  poster: string;
  remarks?: string;
  year?: string;
  type?: string;
  addedAt: number;
}

export interface PlayRecord {
  key: string;
  source: string;
  id: string;
  title: string;
  poster: string;
  episodeIndex: number;
  episodeName: string;
  playTime: number; // 播放位置(秒)
  totalTime: number;
  updatedAt: number;
}

export interface DoubanItem {
  id: string;
  title: string;
  poster: string;
  rate: string;
  year: string;
}

export interface CategoryInfo {
  type_id: string; // 电影/剧集/动漫/综艺
  type_name: string;
  list: Array<{
    id: string;
    title: string;
    poster: string;
    year?: string;
    area?: string;
    remarks?: string;
  }>;
}

export interface SourceItem {
  key: string;
  name: string;
  api: string;
  status?: 'ok' | 'error' | 'disabled';
}

export interface ApiResponse<T> {
  ok: boolean;
  message?: string;
  data?: T;
}
