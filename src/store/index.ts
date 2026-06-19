// 全局状态(轻量 context-less 实现)
// 用全局单例 + 订阅模型,避免引入额外依赖

import { useEffect, useState } from '@lynx-js/react';
import { storage } from '../lib/storage';
import { STORAGE_KEYS, defaultConfig, type AppConfig } from '../lib/config';
import { loadConfig, saveConfig } from '../lib/storage';
import type { Favorite, PlayRecord, User } from '../api/types';

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

// ====== 登录态 ======
type AuthState = { user: User | null; token: string | null };
type AuthListener = (s: AuthState) => void;
let _auth: AuthState = {
  token: storage.get<string>(STORAGE_KEYS.AUTH_TOKEN) || null,
  user: storage.get<User>(STORAGE_KEYS.AUTH_USER) || null,
};
const _authListeners = new Set<AuthListener>();

export function getAuth() {
  return _auth;
}
export function setAuth(token: string | null, user: User | null) {
  _auth = { token, user };
  if (token) storage.set(STORAGE_KEYS.AUTH_TOKEN, token);
  else storage.remove(STORAGE_KEYS.AUTH_TOKEN);
  if (user) storage.set(STORAGE_KEYS.AUTH_USER, user);
  else storage.remove(STORAGE_KEYS.AUTH_USER);
  _authListeners.forEach((l) => l(_auth));
}
export function useAuth(): [AuthState, typeof setAuth] {
  const [a, setA] = useState<AuthState>(_auth);
  useEffect(() => {
    const l = (na: AuthState) => setA(na);
    _authListeners.add(l);
    return () => {
      _authListeners.delete(l);
    };
  }, []);
  return [a, setAuth];
}

// ====== 收藏(本地缓存 + 服务端同步) ======
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

// ====== 播放记录 ======
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
