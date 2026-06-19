// 通用占位组件:Loading / Error / Empty
// 配色对齐 LunaTV 绿色系

export function LoadingView({ text = '加载中...' }: { text?: string }) {
  return (
    <view className="loading-page">
      <view className="loading-spinner" />
      <text style={{ color: '#6b7280', fontSize: 13 }}>{text}</text>
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
            borderRadius: 999,
            backgroundColor: 'rgba(16, 185, 129, 0.15)',
            borderWidth: 1,
            borderStyle: 'solid',
            borderColor: 'rgba(16, 185, 129, 0.3)',
          }}
        >
          <text style={{ color: '#10b981', fontSize: 13, fontWeight: '600' }}>
            重试
          </text>
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
        backgroundColor: '#141414',
      }}
    >
      <text style={{ color: '#4b5563', fontSize: 24 }}>{text || '🎬'}</text>
    </view>
  );
}
