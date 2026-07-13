// 全局状态(轻量 context-less 实现)
// 改造:移除鉴权/cookie 相关逻辑,只保留本地展示与持久化
// 用全局单例 + 订阅模型,避免引入额外依赖

import { useEffect, useState } from '@lynx-js/react';
import { storage } from '../lib/storage';
import { STORAGE_KEYS, defaultConfig, type AppConfig } from '../lib/config';
import { loadConfig, saveConfig } from '../lib/storage';
import type { Favorite, PlayRecord } from '../api/types';

// ====== 配置 ======
type ConfigListener = (c: AppConfig) => void;
let _config: AppConfig = loadConfig();
const _cfgListeners = new Set<ConfigListener>();

export function getConfig(): AppConfig {
  return _config;
}
export function setConfig(c: AppConfig) {
  _config = c;
  saveConfig(c);
  _cfgListeners.forEach((l) => l(c));
}
export function useConfig(): [AppConfig, (c: AppConfig) => void] {
  const [c, setC] = useState<AppConfig>(_config);
  useEffect(() => {
    const l = (nc: AppConfig) => setC(nc);
    _cfgListeners.add(l);
    return () => {
      _cfgListeners.delete(l);
    };
  }, []);
  return [c, setConfig];
}

// ====== 本地"用户"占位(无后端,固定为本地游客) ======
// 保留 useAuth 钩子以最小化页面层改动,内部永远返回"已登录"占位
export interface LocalUser {
  username: string;
  role: 'owner';
}
const LOCAL_USER: LocalUser = {
  username: '本地用户',
  role: 'owner',
};

export function getAuth(): { user: LocalUser; cookie: string } {
  return { user: LOCAL_USER, cookie: 'local' };
}

export function useAuth() {
  return [{ user: LOCAL_USER, cookie: 'local' } as {
    user: LocalUser;
    cookie: string;
  }];
}

// 旧接口占位(避免被改页面之外仍有引用时崩溃)
export function setAuth(_cookie: string | null) {
  /* noop: 本地模式无鉴权 */
}
export function clearAuth() {
  /* noop */
}

// ====== 收藏(纯本地) ======
let _favorites: Favorite[] =
  storage.get<Favorite[]>(STORAGE_KEYS.FAVORITES_CACHE) || [];
const _favListeners = new Set<() => void>();

export function getFavoritesLocal() {
  return _favorites;
}

export function setFavoritesLocal(list: Favorite[]) {
  _favorites = list;
  storage.set(STORAGE_KEYS.FAVORITES_CACHE, list);
  _favListeners.forEach((l) => l());
}

// 旧接口占位(原后端同步)
export function setFavoritesFromMap(map: Record<string, Favorite>) {
  const list = Object.entries(map).map(([key, fav]) => ({
    ...fav,
    key,
  }));
  setFavoritesLocal(list);
}

export function isFavoritedLocal(key: string): boolean {
  return _favorites.some((f) => f.key === key);
}

export function useFavorites(): [Favorite[], () => void] {
  const [, force] = useState(0);
  useEffect(() => {
    const l = () => force((x) => x + 1);
    _favListeners.add(l);
    return () => {
      _favListeners.delete(l);
    };
  }, []);
  return [_favorites, () => force((x) => x + 1)];
}

// ====== 播放记录(纯本地) ======
let _records: PlayRecord[] =
  storage.get<PlayRecord[]>(STORAGE_KEYS.PLAY_RECORDS_CACHE) || [];
const _recListeners = new Set<() => void>();

export function getRecordsLocal() {
  return _records;
}

export function setRecordsLocal(list: PlayRecord[]) {
  _records = list;
  storage.set(STORAGE_KEYS.PLAY_RECORDS_CACHE, list);
  _recListeners.forEach((l) => l());
}

// 旧接口占位
export function setRecordsFromMap(map: Record<string, PlayRecord>) {
  const list = Object.entries(map).map(([key, rec]) => ({
    ...rec,
    key,
  }));
  list.sort((a, b) => (b.updatedAt || 0) - (a.updatedAt || 0));
  setRecordsLocal(list);
}

export function usePlayRecords(): [PlayRecord[], () => void] {
  const [, force] = useState(0);
  useEffect(() => {
    const l = () => force((x) => x + 1);
    _recListeners.add(l);
    return () => {
      _recListeners.delete(l);
    };
  }, []);
  return [_records, () => force((x) => x + 1)];
}

// ====== 搜索历史 ======
const SEARCH_HISTORY_KEY = STORAGE_KEYS.SEARCH_HISTORY;
let _searchHistory: string[] = storage.get<string[]>(SEARCH_HISTORY_KEY) || [];
const _shListeners = new Set<() => void>();

export function getSearchHistory() {
  return _searchHistory;
}

export function pushSearchHistory(q: string) {
  if (!q) return;
  const filtered = _searchHistory.filter((s) => s !== q);
  filtered.unshift(q);
  _searchHistory = filtered.slice(0, 20);
  storage.set(SEARCH_HISTORY_KEY, _searchHistory);
  _shListeners.forEach((l) => l());
}

export function clearSearchHistory() {
  _searchHistory = [];
  storage.set(SEARCH_HISTORY_KEY, _searchHistory);
  _shListeners.forEach((l) => l());
}

export function useSearchHistory(): [string[], () => void] {
  const [, force] = useState(0);
  useEffect(() => {
    const l = () => force((x) => x + 1);
    _shListeners.add(l);
    return () => {
      _shListeners.delete(l);
    };
  }, []);
  return [_searchHistory, () => force((x) => x + 1)];
}
