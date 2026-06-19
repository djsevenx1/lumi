// 设置页 - API 地址 / 主题 / 缓存 / 关于
import { useState } from '@lynx-js/react';
import { useConfig, setConfig, useAuth, setAuth, setFavoritesLocal, setRecordsLocal } from '../store';
import { clearSearchHistory } from '../store';
import { storage } from '../lib/storage';
import { STORAGE_KEYS } from '../lib/config';
import { back } from '../lib/router';

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
    // 保留登录态和配置
    setFavoritesLocal([]);
    setRecordsLocal([]);
    clearSearchHistory();
    storage.remove(STORAGE_KEYS.HISTORY);
    setSaved(true);
    setTimeout(() => setSaved(false), 1500);
  }

  function onLogout() {
    setAuth(null, null);
  }

  return (
    <scroll-view scroll-y className="page page-no-tabbar">
      <view className="app-header">
        <view
          className="icon-btn"
          bindtap={() => back()}
          style={{ width: 36, height: 36 }}
        >
          <text style={{ color: '#FFFFFF', fontSize: 18 }}>‹</text>
        </view>
        <text className="app-title">设置</text>
        <view style={{ width: 36 }} />
      </view>

      <view className="settings-section">
        <text
          style={{
            color: '#A0A0B8',
            fontSize: 12,
            marginBottom: 4,
            fontWeight: '600',
            textTransform: 'uppercase',
          }}
        >
          服务配置
        </text>
        <text style={{ color: '#A0A0B8', fontSize: 12, marginBottom: 8 }}>
          输入你的 LunaTV 后端服务地址(包含协议,不包含尾部斜杠)
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
          <text style={{ color: '#EF4444', fontSize: 12, marginTop: 8 }}>
            {error}
          </text>
        ) : null}
        <view
          className="btn btn-primary"
          style={{ marginTop: 16, width: '100%' }}
          bindtap={onSave}
        >
          <text>{saved ? '✓ 已保存' : '保存'}</text>
        </view>
      </view>

      <view className="settings-section">
        <text
          style={{
            color: '#A0A0B8',
            fontSize: 12,
            marginBottom: 8,
            fontWeight: '600',
            textTransform: 'uppercase',
          }}
        >
          账号
        </text>
        <view className="settings-item">
          <text className="settings-item-label">当前账号</text>
          <text className="settings-item-value">
            {auth.user?.username || '未登录'}
          </text>
        </view>
        {auth.token ? (
          <view
            className="settings-item"
            bindtap={onLogout}
          >
            <text className="settings-item-label text-error">退出登录</text>
            <text className="settings-item-arrow">›</text>
          </view>
        ) : null}
      </view>

      <view className="settings-section">
        <text
          style={{
            color: '#A0A0B8',
            fontSize: 12,
            marginBottom: 8,
            fontWeight: '600',
            textTransform: 'uppercase',
          }}
        >
          缓存
        </text>
        <view className="settings-item" bindtap={onClearCache}>
          <text className="settings-item-label">清除本地缓存</text>
          <text style={{ color: '#EF4444', fontSize: 12 }}>清空</text>
        </view>
      </view>

      <view className="settings-section">
        <text
          style={{
            color: '#A0A0B8',
            fontSize: 12,
            marginBottom: 8,
            fontWeight: '600',
            textTransform: 'uppercase',
          }}
        >
          关于
        </text>
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
      </view>

      <view
        style={{
          padding: 24,
          alignItems: 'center',
        }}
      >
        <text
          style={{
            color: '#6E6E80',
            fontSize: 11,
            textAlign: 'center',
            lineHeight: 16,
          }}
        >
          本项目仅供学习交流使用{'\n'}
          所有视频内容均来自第三方平台{'\n'}
          请勿用于商业用途
        </text>
      </view>
    </scroll-view>
  );
}
