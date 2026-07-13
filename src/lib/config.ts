// 全局配置
// 改造:不再有 apiBase / 鉴权相关字段,只保留展示与持久化 key

export interface AppConfig {
  siteName: string; // 站点名称(显示在顶栏)
  enableDouban: boolean; // 保留字段以兼容旧逻辑,本地模式无意义
}

export const defaultConfig: AppConfig = {
  siteName: 'LunaTV',
  enableDouban: true,
};

export const STORAGE_KEYS = {
  CONFIG: 'lunatv:config',
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
