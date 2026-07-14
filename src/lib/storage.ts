// Lynx 存储封装 - 三层兜底(lynx storage / globalThis / 内存)
import type { VideoSource } from './types';

const KEY_SOURCES = 'lumi.sources.v1';

function getBackend(): Storage | null {
  try {
    const candidates: any[] = [
      (globalThis as any).lynxStorage,
      (globalThis as any).storage,
      (typeof globalThis !== 'undefined' ? globalThis : null),
    ];
    for (const c of candidates) {
      if (c && typeof c.getItem === 'function' && typeof c.setItem === 'function') {
        return c as Storage;
      }
    }
  } catch {}
  return null;
}

const memoryStore: Record<string, string> = {};
const memBackend = {
  getItem: (k: string) => (k in memoryStore ? memoryStore[k] : null),
  setItem: (k: string, v: string) => (memoryStore[k] = String(v)),
  removeItem: (k: string) => delete memoryStore[k],
};

function backend(): Storage {
  return getBackend() || (memBackend as any);
}

export function loadSources(): VideoSource[] {
  try {
    const raw = backend().getItem(KEY_SOURCES);
    if (!raw) return [];
    const arr = JSON.parse(raw);
    if (!Array.isArray(arr)) return [];
    return arr.filter((s) => s && typeof s.url === 'string');
  } catch {
    return [];
  }
}

export function saveSources(list: VideoSource[]) {
  try {
    backend().setItem(KEY_SOURCES, JSON.stringify(list));
  } catch {}
}

export function addSource(name: string, url: string): { ok: boolean; msg?: string } {
  const n = (name || '').trim();
  const u = (url || '').trim();
  if (!n) return { ok: false, msg: '请填写名称' };
  if (!u) return { ok: false, msg: '请填写 URL' };
  if (!/^https?:\/\//i.test(u)) {
    return { ok: false, msg: 'URL 必须以 http(s):// 开头' };
  }
  const list = loadSources();
  if (list.some((s) => s.url === u)) {
    return { ok: false, msg: '该 URL 已存在' };
  }
  list.push({
    id: String(Date.now()) + Math.random().toString(36).slice(2, 6),
    name: n,
    url: u,
    enabled: true,
    addedAt: Date.now(),
  });
  saveSources(list);
  return { ok: true };
}

export function removeSource(id: string) {
  saveSources(loadSources().filter((s) => s.id !== id));
}

export function toggleSource(id: string) {
  const list = loadSources();
  const found = list.find((s) => s.id === id);
  if (found) {
    found.enabled = !found.enabled;
    saveSources(list);
  }
}