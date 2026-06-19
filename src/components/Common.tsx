// 通用占位组件:Loading / Error / Empty
import { useState } from '@lynx-js/react';

export function LoadingView({ text = '加载中...' }: { text?: string }) {
  return (
    <view className="loading-page">
      <view className="loading-spinner" />
      <text className="text-mute t-sm">{text}</text>
    </view>
  );
}

export function EmptyView({
  icon = '📭',
  text = '暂无内容',
}: {
  icon?: string;
  text?: string;
}) {
  return (
    <view className="empty">
      <text className="empty-icon">{icon}</text>
      <text className="empty-text">{text}</text>
    </view>
  );
}

export function ErrorView({
  message,
  onRetry,
}: {
  message: string;
  onRetry?: () => void;
}) {
  return (
    <view className="error-box">
      <text className="error-text">{message}</text>
      {onRetry ? (
        <view
          bindtap={onRetry}
          style={{
            marginTop: 12,
            paddingTop: 8,
            paddingBottom: 8,
            paddingLeft: 16,
            paddingRight: 16,
            alignSelf: 'flex-start',
            borderRadius: 6,
            backgroundColor: 'rgba(239, 68, 68, 0.2)',
          }}
        >
          <text style={{ color: '#EF4444', fontSize: 13 }}>重试</text>
        </view>
      ) : null}
    </view>
  );
}

// 图片占位(海报没加载出来时)
export function PosterPlaceholder({
  width = '100%',
  height = '100%',
  text = '',
}: {
  width?: number | string;
  height?: number | string;
  text?: string;
}) {
  return (
    <view
      style={{
        width,
        height,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#1A1A2E',
      }}
    >
      <text style={{ color: '#6E6E80', fontSize: 12 }}>{text || '🎬'}</text>
    </view>
  );
}
