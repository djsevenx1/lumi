// 视频卡片
import { navigate } from '../lib/router';
import { imageProxyUrl, getConfig } from '../api/endpoints-helper';
import type { SearchResult, DoubanItem } from '../api/types';

type CardData = {
  id: string;
  title: string;
  poster: string;
  year?: string;
  rate?: string;
  source?: string;
  source_name?: string;
  remarks?: string;
  type_name?: string;
};

interface Props {
  data: CardData;
  width?: 'normal' | 'wide';
}

export function VideoCard({ data, width = 'normal' }: Props) {
  function onTap() {
    if (!data.source) return;
    navigate({ name: 'detail', source: data.source, id: data.id });
  }

  const cfg = getConfig();
  const poster = data.poster
    ? imageProxyUrl(cfg.apiBase, data.poster, 'https://movie.douban.com/')
    : '';

  return (
    <view
      className={width === 'wide' ? 'video-card video-card-wide' : 'video-card'}
      bindtap={onTap}
    >
      <view className="video-poster">
        {poster ? (
          <image
            src={poster}
            style={{ width: '100%', height: '100%' }}
            mode="aspectFill"
          />
        ) : null}
        {data.rate ? (
          <view className="video-card-rating">
            <text style={{ color: '#fff', fontSize: 11, fontWeight: '700' }}>
              {data.rate}
            </text>
          </view>
        ) : null}
      </view>
      <text className="video-title" text-maxline="1">
        {data.title}
      </text>
      <text className="video-meta" text-maxline="1">
        {data.remarks || data.year || data.type_name || ''}
      </text>
    </view>
  );
}

// 横向滚动列表
export function HorizontalList({
  title,
  action,
  data,
  onActionTap,
}: {
  title: string;
  action?: string;
  data: CardData[];
  onActionTap?: () => void;
}) {
  if (!data || data.length === 0) return null;
  return (
    <view className="section">
      <view className="section-header">
        <text className="section-title">{title}</text>
        {action ? (
          <view bindtap={onActionTap}>
            <text className="section-action">{action} ›</text>
          </view>
        ) : null}
      </view>
      <scroll-view
        scroll-x
        className="horizontal-scroll-wide"
        show-scrollbar={false}
      >
        {data.map((d, i) => (
          <VideoCard key={`${d.source || 'src'}-${d.id}-${i}`} data={d} />
        ))}
      </scroll-view>
    </view>
  );
}
