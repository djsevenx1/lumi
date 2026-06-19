// 全局配置
// 用户可在首次启动时填入自己的 LunaTV 服务地址

export interface AppConfig {
  apiBase: string; // LunaTV 后端服务地址,如 https://moontv.example.com
  siteName: string; // 站点名称
  enableDouban: boolean; // 是否启用豆瓣
  enableLogin: boolean; // 是否启用登录
}

export const defaultConfig: AppConfig = {
  apiBase: 'https://ys.fn1.xx.kg', // 默认 LunaTV 后端地址,首次启动自动配置
  siteName: 'LunaTV',
  enableDouban: true,
  enableLogin: true,
};

export const STORAGE_KEYS = {
  CONFIG: 'lunatv:config',
  AUTH_COOKIE: 'lunatv:auth_cookie', // user_auth cookie 值
  AUTH_USER: 'lunatv:auth_user',
  FAVORITES_CACHE: 'lunatv:favorites_cache',
  PLAY_RECORDS_CACHE: 'lunatv:playrecords_cache',
  HISTORY: 'lunatv:history',
  SEARCH_HISTORY: 'lunatv:search_history',
  THEME: 'lunatv:theme',
} as const;

// 分类映射(与 LunaTV 一致)
export const VIDEO_TYPES = [
  { key: 'all', label: '全部' },
  { key: 'movie', label: '电影' },
  { key: 'tv', label: '剧集' },
  { key: 'anime', label: '动漫' },
  { key: 'variety', label: '综艺' },
  { key: 'short', label: '短剧' },
] as const;

export type VideoType = (typeof VIDEO_TYPES)[number]['key'];
