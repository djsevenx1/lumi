// 简单路由 - App 持有 route state, 子组件收 onNav 切换
export type RouteName = 'home' | 'settings' | 'about';

export interface Route {
  name: RouteName;
  params?: Record<string, string>;
}

export function defaultRoute(): Route {
  return { name: 'home' };
}

export const nav = {
  to: (name: RouteName, params?: Record<string, string>): Route =>
    ({ name, params }),
  back: (): Route => defaultRoute(),
};