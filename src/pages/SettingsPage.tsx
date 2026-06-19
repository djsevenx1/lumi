// 设置页 - Selene 浅色风格
import { useState } from '@lynx-js/react';
import { useConfig, setConfig, useAuth, clearAuth, setFavoritesLocal, setRecordsLocal, clearSearchHistory } from '../store';
import { storage } from '../lib/storage';
import { STORAGE_KEYS } from '../lib/config';
import { back, navigate } from '../lib/router';

export function SettingsPage() {
  const [config] = useConfig();
  const [auth] = useAuth();
  const [apiBase, setApiBase] = useState(config.apiBase);
  const [siteName, setSiteName] = useState(config.siteName);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState('');

  function onSave() {
    if (!apiBase.trim()) {
      setError('服务地址不能为空');
      return;
    }
    let base = apiBase.trim();
    if (!/^https?:\/\//i.test(base)) {
      base = 'https://' + base;
    }
    base = base.replace(/\/+$/, '');
    setConfig({
      ...config,
      apiBase: base,
      siteName: siteName.trim() || 'LunaTV',
    });
    setApiBase(base);
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

  function onLogout() {
    clearAuth();
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

      {/* 服务配置 */}
      <view className="settings-section">
        <text>服务配置</text>
        <text className="settings-hint">
          输入 LunaTV 后端服务地址(包含协议,不包含尾部斜杠)
        </text>
        <input
          key="input-api"
          className="input"
          placeholder="https://moontv.example.com"
          placeholder-class="input-placeholder"
          bindinput={(e: any) => setApiBase(e.detail.value)}
        />
        <view style={{ height: 8 }} />
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

      {/* 账号 */}
      <view className="settings-section">
        <text>账号</text>
        <view className="settings-item" bindtap={() => navigate({ name: 'login' })}>
          <text className="settings-item-label">
            {auth.cookie ? '已登录账号' : '未登录 · 去登录'}
          </text>
          <view className="settings-item-row">
            <text
              className={
                auth.cookie
                  ? 'settings-item-value settings-item-value-online'
                  : 'settings-item-value settings-item-value-offline'
              }
            >
              {auth.user?.username || '未登录'}
            </text>
            <text className="settings-item-arrow">›</text>
          </view>
        </view>
        {auth.cookie ? (
          <view className="settings-item" bindtap={onLogout}>
            <text className="settings-item-label settings-item-danger">退出登录</text>
            <text className="settings-item-arrow">›</text>
          </view>
        ) : null}
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
          <text className="settings-item-value">0.1.0</text>
        </view>
        <view className="settings-item">
          <text className="settings-item-label">UI 框架</text>
          <text className="settings-item-value">Lynx + ReactLynx</text>
        </view>
        <view className="settings-item">
          <text className="settings-item-label">后端</text>
          <text className="settings-item-value">LunaTV (兼容 MoonTV)</text>
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
