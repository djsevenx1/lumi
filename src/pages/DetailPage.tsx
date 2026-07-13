// 详情页 - 改造:本地数据,无鉴权
import { useEffect, useState, useCallback } from '@lynx-js/react';
import {
  useFavorites,
  isFavoritedLocal,
  setFavoritesLocal,
} from '../store';
import { detail as localDetail } from '../api/local';
import { back, navigate } from '../lib/router';
import { LoadingView, ErrorView } from '../components/Common';
import type { DetailItem } from '../api/types';

interface Props {
  source: string;
  id: string;
}

export function DetailPage({ source, id }: Props) {
  const [favorites, refresh] = useFavorites();
  const [data, setData] = useState<DetailItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeEpisode, setActiveEpisode] = useState(0);

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const r = await localDetail(source, id);
      if (!r) {
        setError('未找到该内容');
        setData(null);
      } else {
        setData(r);
      }
    } catch (e: any) {
      setError(e?.message || '加载详情失败');
    } finally {
      setLoading(false);
    }
  }, [source, id]);

  useEffect(() => {
    load();
  }, [load]);

  function toggleFavorite() {
    if (!data) return;
    const key = `${data.source}+${data.id}`;
    if (isFavoritedLocal(key)) {
      // 取消
      setFavoritesLocal(favorites.filter((f) => f.key !== key));
    } else {
      // 添加
      const fav = {
        key,
        source: data.source,
        source_name: data.source_name,
        id: data.id,
        title: data.title,
        poster: data.poster,
        remarks: data.remarks || '',
        year: data.year,
      } as any;
      setFavoritesLocal([fav, ...favorites]);
    }
    refresh();
  }

  function onPlay(episodeIndex: number) {
    if (!data) return;
    setActiveEpisode(episodeIndex);
    navigate({
      name: 'play',
      source: data.source,
      id: data.id,
      episode: episodeIndex,
      title: `${data.title} · 第${episodeIndex + 1}集`,
      poster: data.poster,
    });
  }

  if (loading) {
    return (
      <view className="page page-no-tabbar">
        <LoadingView text="加载详情..." />
      </view>
    );
  }
  if (error || !data) {
    return (
      <view className="page page-no-tabbar">
        <ErrorView message={error || '详情不存在'} onRetry={load} />
        <view style={{ padding: 16 }}>
          <view bindtap={() => back()} className="btn btn-secondary btn-block">
            <text>返回</text>
          </view>
        </view>
      </view>
    );
  }

  const key = `${data.source}+${data.id}`;
  const isFav = isFavoritedLocal(key);

  // 集数名称:优先用 episodes_titles,否则用序号
  const episodeNames =
    data.episodes_titles && data.episodes_titles.length > 0
      ? data.episodes_titles
      : data.episodes.map((_, i) => `第${i + 1}集`);

  return (
    <scroll-view scroll-y className="page page-no-tabbar">
      {/* Hero */}
      <view className="detail-hero">
        {data.poster ? (
          <image
            src={data.poster}
            className="detail-hero-image"
            mode="aspectFill"
          />
        ) : null}
        <view className="detail-hero-mask" />
        <view className="detail-back-btn" bindtap={() => back()}>
          <text className="detail-back-btn-text">‹</text>
        </view>
      </view>

      {/* 主信息 */}
      <view className="detail-info">
        <view className="detail-poster">
          {data.poster ? (
            <image
              src={data.poster}
              className="detail-poster-image"
              mode="aspectFill"
            />
          ) : null}
        </view>
        <view className="detail-meta">
          <text className="detail-title" text-maxline="2">
            {data.title}
          </text>
          <text className="detail-sub">
            {data.year || ''} {data.type_name ? `· ${data.type_name}` : ''}
          </text>
          {data.source_name ? (
            <text className="detail-sub">来源: {data.source_name}</text>
          ) : null}
          {data.remarks ? (
            <text className="detail-sub">{data.remarks}</text>
          ) : null}
        </view>
      </view>

      {/* 操作按钮 */}
      <view className="detail-actions">
        <view className="detail-btn-primary" bindtap={() => onPlay(0)}>
          <text className="detail-btn-primary-text">▶ 立即播放</text>
        </view>
        <view
          className={
            isFav
              ? 'detail-btn-secondary detail-btn-active'
              : 'detail-btn-secondary'
          }
          bindtap={toggleFavorite}
        >
          <text className="detail-btn-secondary-text">
            {isFav ? '★ 已收藏' : '☆ 收藏'}
          </text>
        </view>
      </view>

      {/* 简介 */}
      {data.desc ? (
        <view className="detail-overview">
          <text className="detail-overview-title">简介</text>
          <text className="detail-overview-text">{data.desc}</text>
        </view>
      ) : null}

      {/* 集数 */}
      {data.episodes && data.episodes.length > 0 ? (
        <view className="detail-episodes">
          <view className="detail-episodes-header">
            <text className="section-title">选集 ({data.episodes.length})</text>
            <text className="detail-episodes-sub">
              选集 · 第{activeEpisode + 1}集
            </text>
          </view>
          <view className="episode-list">
            {data.episodes.map((_ep, i) => (
              <view
                key={i}
                className={
                  activeEpisode === i
                    ? 'episode-chip episode-chip-active'
                    : 'episode-chip'
                }
                bindtap={() => setActiveEpisode(i)}
              >
                <text
                  className={
                    activeEpisode === i
                      ? 'episode-chip-text episode-chip-text-active'
                      : 'episode-chip-text'
                  }
                >
                  {episodeNames[i] || `第${i + 1}集`}
                </text>
              </view>
            ))}
          </view>
          <view className="detail-play-bar">
            <view
              className="btn btn-primary btn-block"
              bindtap={() => onPlay(activeEpisode)}
            >
              <text>▶ 播放第 {activeEpisode + 1} 集</text>
            </view>
          </view>
        </view>
      ) : null}

      <view style={{ height: 32 }} />
    </scroll-view>
  );
}
