// 设置页 - 改造:去掉 API 配置,只保留站点名称 / 缓存清理 / 关于
import { useState } from '@lynx-js/react';
import {
  useConfig,
  setConfig,
  setFavoritesLocal,
  setRecordsLocal,
  clearSearchHistory,
} from '../store';
import { storage } from '../lib/storage';
import { STORAGE_KEYS } from '../lib/config';
import { back } from '../lib/router';

export function SettingsPage() {
  const [config] = useConfig();
  const [siteName, setSiteName] = useState(config.siteName);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState('');

  function onSave() {
    setConfig({
      ...config,
      siteName: siteName.trim() || 'LunaTV',
    });
    setSiteName(siteName.trim() || 'LunaTV');
    setError('');
    setSaved(true);
    setTimeout(() => setSaved(false), 1500);
  }

  function onClearCache() {
    setFavoritesLocal([]);
    setRecordsLocal([]);
    clearSearchHistory();
    storage.remove(STORAGE_KEYS.HISTORY);
    setSaved(true);
    setTimeout(() => setSaved(false), 1500);
  }

  return (
    <scroll-view scroll-y className="page page-no-tabbar">
      {/* 顶栏 */}
      <view className="app-header">
        <view className="icon-btn" bindtap={() => back()}>
          <text className="icon-btn-text">‹</text>
        </view>
        <text className="app-title">设置</text>
        <view className="settings-spacer" />
      </view>

      {/* 站点名称 */}
      <view className="settings-section">
        <text>站点名称</text>
        <text className="settings-hint">
          显示在首页顶栏,本地保存
        </text>
        <input
          key="input-name"
          className="input"
          placeholder="站点名称"
          placeholder-class="input-placeholder"
          bindinput={(e: any) => setSiteName(e.detail.value)}
        />
        {error ? (
          <text className="text-error" style={{ marginTop: 8 }}>
            {error}
          </text>
        ) : null}
        <view
          className="btn btn-primary btn-block"
          style={{ marginTop: 16 }}
          bindtap={onSave}
        >
          <text className="btn-primary-text">{saved ? '✓ 已保存' : '保存'}</text>
        </view>
      </view>

      {/* 缓存 */}
      <view className="settings-section">
        <text>缓存</text>
        <view className="settings-item" bindtap={onClearCache}>
          <text className="settings-item-label">清除本地缓存</text>
          <text className="settings-item-action">清空</text>
        </view>
      </view>

      {/* 关于 */}
      <view className="settings-section">
        <text>关于</text>
        <view className="settings-item">
          <text className="settings-item-label">应用</text>
          <text className="settings-item-value">LunaTV Client</text>
        </view>
        <view className="settings-item">
          <text className="settings-item-label">版本</text>
          <text className="settings-item-value">0.2.0-local</text>
        </view>
        <view className="settings-item">
          <text className="settings-item-label">UI 框架</text>
          <text className="settings-item-value">Lynx + ReactLynx</text>
        </view>
        <view className="settings-item">
          <text className="settings-item-label">数据模式</text>
          <text className="settings-item-value">本地内置(无后端)</text>
        </view>
        <view className="settings-item">
          <text className="settings-item-label">设计参考</text>
          <text className="settings-item-value">Selene 官方客户端</text>
        </view>
      </view>

      {/* 免责声明 */}
      <view className="settings-disclaimer">
        <text className="settings-disclaimer-text">
          本项目仅供学习交流使用{'\n'}
          所有视频内容均来自第三方平台{'\n'}
          请勿用于商业用途
        </text>
      </view>
    </scroll-view>
  );
}
