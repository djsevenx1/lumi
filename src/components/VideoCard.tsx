// 视频卡片 - Selene 风格
// 评分徽章(粉/金/灰) + 集数角标(绿色) + 进度条 + 来源标签("豆瓣资源")
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
  progress?: number; // 0-100 播放进度
  douban_id?: string; // 来自豆瓣时显示 "豆瓣资源" 标签
};

interface Props {
  data: CardData;
  width?: 'normal' | 'wide';
}

// 评分徽章颜色:Selene 风格(8.5+ 金色 / 6.0+ 玫红 / 其它 灰)
function getRatingClass(rate?: string): string {
  if (!rate) return '';
  const n = parseFloat(rate);
  if (isNaN(n)) return '';
  if (n >= 8.5) return 'video-card-rating-high';
  if (n >= 6.0) return 'video-card-rating-mid';
  return 'video-card-rating-low';
}

// 集数角标:已完结(包含 "完结" 或 "全")用灰底
function getRemarksClass(remarks?: string): string {
  if (!remarks) return '';
  if (remarks.includes('完结') || /全\d+/.test(remarks) || /完$/.test(remarks)) {
    return 'video-card-remarks video-card-remarks-finished';
  }
  return 'video-card-remarks';
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

  const ratingClass = getRatingClass(data.rate);
  const remarksClass = getRemarksClass(data.remarks);

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
        {/* 集数角标 - 左上角(已完结=灰底) */}
        {data.remarks ? (
          <view className={remarksClass}>
            <text>{data.remarks}</text>
          </view>
        ) : null}
        {/* 评分徽章 - 右上角 */}
        {data.rate && ratingClass ? (
          <view className={`video-card-rating ${ratingClass}`}>
            <text>{data.rate}</text>
          </view>
        ) : null}
        {/* 播放进度条 - 底部 */}
        {data.progress && data.progress > 0 ? (
          <view className="video-card-progress">
            <view
              className="video-card-progress-bar"
              style={{ width: `${data.progress}%` }}
            />
          </view>
        ) : null}
      </view>
      <text className="video-title" text-maxline="1">
        {data.title}
      </text>
      {/* 来源标签 - 豆瓣 / 资源站 */}
      {data.source_name ? (
        <view className="video-card-source">
          <text className="video-card-source-text">{data.source_name}</text>
        </view>
      ) : null}
    </view>
  );
}

// 横向滚动列表 - Selene ScrollableRow
export function HorizontalList({
  title,
  action = '查看全部',
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
        {onActionTap ? (
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
