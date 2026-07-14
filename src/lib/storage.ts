// 持久化存储包装
// 优先用 NativeModules.Storage(原生实现,持久化),
// 降级到 globalThis 内存存储(仅当次运行有效)

import { STORAGE_KEYS, defaultConfig, type AppConfig } from './config';

interface StorageLike {
  get(key: string): string | null;
  set(key: string, value: string): void;
  remove(key: string): void;
  clear(): void;
}

declare const NativeModules: {
  Storage?: StorageLike;
  LynxStorage?: StorageLike;
};

class MemoryStorage implements StorageLike {
  private data = new Map<string, string>();

  get(key: string): string | null {
    return this.data.has(key) ? this.data.get(key)! : null;
  }

  set(key: string, value: string): void {
    this.data.set(key, value);
  }

  remove(key: string): void {
    this.data.delete(key);
  }

  clear(): void {
    this.data.clear();
  }
}

let _storage: StorageLike | null = null;

function getStorage(): StorageLike {
  if (_storage) return _storage;
  let NativeModulesRef: any;
  try {
    NativeModulesRef = (globalThis as any)?.NativeModules;
  } catch {
    NativeModulesRef = undefined;
  }
  if (NativeModulesRef) {
    if (NativeModulesRef.Storage) {
      _storage = NativeModulesRef.Storage;
      return _storage;
    }
    if (NativeModulesRef.LynxStorage) {
      _storage = NativeModulesRef.LynxStorage;
      return _storage;
    }
  }
  // 兜底: Lynx 沙盒 / Web 都安全降级到内存存储
  const fallback = new MemoryStorage();
  _storage = fallback;
  return fallback;
}

export const storage = {
  get<T = unknown>(key: string): T | null {
    try {
      const raw = getStorage().get(key);
      if (raw === null || raw === undefined) return null;
      return JSON.parse(raw) as T;
    } catch {
      return null;
    }
  },
  set<T = unknown>(key: string, value: T): void {
    try {
      getStorage().set(key, JSON.stringify(value));
    } catch (e) {
      console.error('storage.set error', e);
    }
  },
  remove(key: string): void {
    try {
      getStorage().remove(key);
    } catch (e) {
      console.error('storage.remove error', e);
    }
  },
  clear(): void {
    try {
      getStorage().clear();
    } catch (e) {
      console.error('storage.clear error', e);
    }
  },
};

export function loadConfig(): AppConfig {
  return storage.get<AppConfig>(STORAGE_KEYS.CONFIG) || defaultConfig;
}

export function saveConfig(cfg: AppConfig) {
  storage.set(STORAGE_KEYS.CONFIG, cfg);
}
