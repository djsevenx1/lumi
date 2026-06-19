// 简易路由(Lynx 没有内置路由,用状态机 + 单组件渲染实现)
// 路由表结构:
//   home               - 首页
//   search             - 搜索
//   category/<type>    - 分类列表
//   detail/<source>/<id> - 详情
//   play/<source>/<id>/<episode> - 播放
//   my                 - 我的
//   login              - 登录
//   settings           - 设置

import { useEffect, useState, useCallback } from '@lynx-js/react';

export type Route =
  | { name: 'home' }
  | { name: 'search' }
  | { name: 'category'; type: string }
  | { name: 'detail'; source: string; id: string }
  | { name: 'play'; source: string; id: string; episode: number; title?: string; poster?: string }
  | { name: 'my' }
  | { name: 'login' }
  | { name: 'settings' }
  | { name: 'setup' }; // 首次配置 API 地址

const listeners = new Set<(r: Route) => void>();
let _route: Route = { name: 'home' };
let _stack: Route[] = [];

export function getRoute(): Route {
  return _route;
}

export function navigate(to: Route) {
  if (to.name === _route.name) {
    // 同名但参数可能不同,直接替换
    _route = to;
  } else {
    _stack.push(_route);
    _route = to;
  }
  listeners.forEach((l) => l(_route));
}

export function back(): boolean {
  if (_stack.length === 0) return false;
  _route = _stack.pop()!;
  listeners.forEach((l) => l(_route));
  return true;
}

export function reset(to: Route = { name: 'home' }) {
  _stack = [];
  _route = to;
  listeners.forEach((l) => l(_route));
}

export function useRoute(): [Route, (r: Route) => void, () => boolean] {
  const [r, setR] = useState<Route>(_route);
  useEffect(() => {
    const l = (nr: Route) => setR(nr);
    listeners.add(l);
    return () => {
      listeners.delete(l);
    };
  }, []);
  return [r, navigate, back];
}

// Tab 配置 - LunaTV 8 项:首页/源浏览/电影/剧集/短剧/动漫/综艺/直播
export const TABS: Array<{ name: string; label: string; icon: string }> = [
  { name: 'home', label: '首页', icon: '🏠' },
  { name: 'category', label: '电影', icon: '🎬' },
  { name: 'category', label: '剧集', icon: '📺' },
];

export function isTabRoute(r: Route): boolean {
  if (r.name === 'home') return true;
  if (r.name === 'category') return true;
  return false;
}
