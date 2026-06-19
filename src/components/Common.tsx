// 通用占位组件:Loading / Error / Empty
// 配色对齐 Selene 浅色风格

export function LoadingView({ text = '加载中...' }: { text?: string }) {
  return (
    <view className="loading-page">
      <view className="loading-spinner" />
      <text className="loading-text">{text}</text>
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
          className="error-retry"
        >
          <text className="error-retry-text">重试</text>
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
      className="poster-placeholder"
      style={{ width, height }}
    >
      <text className="poster-placeholder-text">{text || '🎬'}</text>
    </view>
  );
}
