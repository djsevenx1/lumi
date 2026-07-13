// LunaTV API 类型定义
// 对齐 LunaTV 后端真实接口(2026-06 验证)

export interface User {
  username: string;
  role?: 'owner' | 'admin' | 'user';
  banned?: boolean;
  expiresAt?: number;
}

// 登录/注册返回(不返回 token,靠 cookie 鉴权)
export interface AuthResponse {
  ok: boolean;
  message?: string;
  needDelay?: boolean;
  error?: string;
}

// 搜索结果(对齐后端 searchFromApi 返回)
export interface SearchResult {
  id: string;
  title: string;
  poster: string;
  episodes?: string[]; // m3u8 直链
  episodes_titles?: string[]; // 集数名称
  source: string; // 如 "iqiyizyapi.com"
  source_name: string; // 如 "🎬-爱奇艺-"
  class?: string; // 分类,如 "动画"
  year?: string;
  desc?: string;
  type_name?: string; // 如 "国产动漫"
  douban_id?: number;
  remarks?: string; // 如 "更新至72集"
  rate?: string; // 评分(本地数据扩展字段)
}

export interface SearchResponse {
  results: SearchResult[];
}

// 详情(后端返回扁平结构,非 {videoInfo: ...})
export interface DetailItem {
  id: string;
  title: string;
  poster: string;
  episodes: string[]; // m3u8 直链
  episodes_titles?: string[]; // 集数名称
  source: string;
  source_name: string;
  class?: string;
  year?: string;
  desc?: string;
  type_name?: string;
  douban_id?: number;
  remarks?: string; // 如 "更新至72集"
}

// 详情接口直接返回 DetailItem(扁平)
export type DetailResponse = DetailItem;

// 播放:search/detail 已返回 episodes 直链,无需 parse
export interface ParseResponse {
  url: string;
  qualities?: Array<{ name: string; url: string }>;
}

export interface Favorite {
  key: string; // `${source}+${id}`
  source: string;
  source_name: string;
  id: string;
  title: string;
  poster: string;
  remarks?: string;
  year?: string;
  type?: string;
  save_time?: number;
  origin?: string;
}

export interface PlayRecord {
  key: string;
  source: string;
  source_name?: string;
  id: string;
  title: string;
  poster: string;
  episodeIndex: number;
  episodeName: string;
  playTime: number;
  totalTime: number;
  updatedAt: number;
  save_time?: number;
}

// 豆瓣
export interface DoubanItem {
  id: string;
  title: string;
  poster: string;
  rate: string;
  year: string;
}

export interface DoubanResponse {
  code: number;
  message: string;
  list: DoubanItem[];
}

// favorites / playrecords 后端返回 Record<string, T>
export type FavoritesResponse = Record<string, Favorite>;
export type PlayRecordsResponse = Record<string, PlayRecord>;

// 通用成功响应
export interface SuccessResponse {
  success?: boolean;
  ok?: boolean;
  error?: string;
}
