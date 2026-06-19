// 工具方法
// 不放在 endpoints.ts 里以避免循环依赖
import { loadConfig as _getConfig } from '../lib/storage';
import { imageProxyUrl as _imageProxyUrl } from './endpoints';

export function getConfig() {
  return _getConfig();
}

export function imageProxyUrl(base: string, url: string, referer?: string) {
  return _imageProxyUrl(base, url, referer);
}
