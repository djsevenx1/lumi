// LoginPage 改造:本地版无登录,改为一个轻量"关于"页
// 保留同名 export 是为了不让 App.tsx / 路由层报错
import { useConfig } from '../store';
import { back } from '../lib/router';

export function LoginPage() {
  const [config] = useConfig();
  return (
    <scroll-view scroll-y className="page page-no-tabbar">
      <view className="app-header">
        <view className="icon-btn" bindtap={() => back()}>
          <text className="icon-btn-text">‹</text>
        </view>
        <text className="app-title">关于</text>
        <view className="settings-spacer" />
      </view>

      <view className="settings-section">
        <text>本应用</text>
        <view className="settings-item">
          <text className="settings-item-label">名称</text>
          <text className="settings-item-value">
            {config.siteName || 'LunaTV'}
          </text>
        </view>
        <view className="settings-item">
          <text className="settings-item-label">版本</text>
          <text className="settings-item-value">0.2.0-local</text>
        </view>
        <view className="settings-item">
          <text className="settings-item-label">模式</text>
          <text className="settings-item-value">本地内置数据,无需后端</text>
        </view>
        <view className="settings-item">
          <text className="settings-item-label">UI</text>
          <text className="settings-item-value">Lynx + ReactLynx</text>
        </view>
      </view>

      <view className="settings-section">
        <text>说明</text>
        <text className="settings-hint">
          本版本已移除 LunaTV / MoonTV 后端依赖,所有影片元数据内置在 app 内,视频源使用公开 HLS 测试流,收藏和播放历史保存在本机。
        </text>
      </view>

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
