// 详情页 - 简介 + 集数 + 收藏/播放
import { useEffect, useState, useCallback } from '@lynx-js/react';
import { useConfig, useFavorites, isFavoritedLocal, setFavoritesLocal, getAuth } from '../store';
import { detail, addFavorite, removeFavorite, getFavorites } from '../api/endpoints';
import { imageProxyUrl } from '../api/endpoints-helper';
import { back, navigate } from '../lib/router';
import { LoadingView, ErrorView } from '../components/Common';
import type { DetailItem } from '../api/types';

interface Props {
  source: string;
  id: string;
}

export function DetailPage({ source, id }: Props) {
  const [config] = useConfig();
  const [favorites, refresh] = useFavorites();
  const [data, setData] = useState<DetailItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeEpisode, setActiveEpisode] = useState(0);

  const load = useCallback(async () => {
    if (!config.apiBase) {
      setError('请先配置服务地址');
      setLoading(false);
      return;
    }
    setLoading(true);
    setError('');
    try {
      const r = await detail(config.apiBase, source, id);
      setData(r.videoInfo);
    } catch (e: any) {
      setError(e?.message || '加载详情失败');
    } finally {
      setLoading(false);
    }
  }, [config.apiBase, source, id]);

  useEffect(() => {
    load();
  }, [load]);

  async function toggleFavorite() {
    if (!data) return;
    const key = `${data.source}+${data.id}`;
    const auth = getAuth();
    if (!auth.token) {
      navigate({ name: 'login' });
      return;
    }
    if (isFavoritedLocal(key)) {
      // 取消
      setFavoritesLocal(favorites.filter((f) => f.key !== key));
      try {
        await removeFavorite(config.apiBase, key);
      } catch {}
    } else {
      // 添加
      const fav = {
        key,
        source: data.source,
        id: data.id,
        title: data.title,
        poster: data.poster,
        remarks: data.remarks,
        year: data.year,
        type: data.type,
        addedAt: Date.now(),
      };
      setFavoritesLocal([fav, ...favorites]);
      try {
        await addFavorite(config.apiBase, key, fav);
      } catch {}
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
          <view bindtap={() => back()} className="btn btn-secondary">
            <text>返回</text>
          </view>
        </view>
      </view>
    );
  }

  const key = `${data.source}+${data.id}`;
  const isFav = isFavoritedLocal(key);
  const poster = data.poster
    ? imageProxyUrl(
        config.apiBase,
        data.poster,
        'https://movie.douban.com/',
      )
    : '';
  const backdrop = data.backdrop
    ? imageProxyUrl(config.apiBase, data.backdrop)
    : poster;

  return (
    <scroll-view scroll-y className="page page-no-tabbar">
      {/* Hero */}
      <view className="detail-hero">
        {backdrop ? (
          <image
            src={backdrop}
            style={{ width: '100%', height: '100%' }}
            mode="aspectFill"
          />
        ) : null}
        <view className="detail-hero-mask" />
        <view className="detail-back-btn" bindtap={() => back()}>
          <text style={{ color: '#FFFFFF', fontSize: 18 }}>‹</text>
        </view>
      </view>

      {/* 主信息 */}
      <view className="detail-info">
        <view className="detail-poster">
          {poster ? (
            <image
              src={poster}
              style={{ width: '100%', height: '100%' }}
              mode="aspectFill"
            />
          ) : null}
        </view>
        <view className="detail-meta">
          <text className="detail-title" text-maxline="2">
            {data.title}
          </text>
          <text className="detail-sub">
            {data.year || ''} {data.region ? `· ${data.region}` : ''}
          </text>
          <text className="detail-sub">
            {data.director ? `导演: ${data.director}` : ''}
          </text>
          {data.actors ? (
            <text
              className="detail-sub"
              text-maxline="2"
              style={{ lineHeight: 18 }}
            >
              主演: {data.actors}
            </text>
          ) : null}
          {data.rate ? (
            <view
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                gap: 6,
                marginTop: 4,
              }}
            >
              <text style={{ color: '#F59E0B', fontSize: 14 }}>⭐</text>
              <text
                style={{ color: '#F59E0B', fontSize: 16, fontWeight: '700' }}
              >
                {data.rate}
              </text>
              {data.remarks ? (
                <text
                  style={{
                    color: '#A0A0B8',
                    fontSize: 12,
                    marginLeft: 8,
                  }}
                >
                  {data.remarks}
                </text>
              ) : null}
            </view>
          ) : null}
        </view>
      </view>

      {/* 操作按钮 */}
      <view className="detail-actions">
        <view className="detail-btn-primary" bindtap={() => onPlay(0)}>
          <text>▶ 立即播放</text>
        </view>
        <view
          className={
            isFav ? 'detail-btn-secondary detail-btn-active' : 'detail-btn-secondary'
          }
          bindtap={toggleFavorite}
        >
          <text>{isFav ? '★ 已收藏' : '☆ 收藏'}</text>
        </view>
      </view>

      {/* 简介 */}
      {data.description ? (
        <view className="detail-overview">
          <text className="detail-overview-title">简介</text>
          <text className="detail-overview-text">{data.description}</text>
        </view>
      ) : null}

      {/* 集数 */}
      {data.episodes && data.episodes.length > 0 ? (
        <view style={{ marginTop: 16 }}>
          <view
            style={{
              paddingLeft: 16,
              paddingRight: 16,
              flexDirection: 'row',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}
          >
            <text className="section-title">选集 ({data.episodes.length})</text>
            <text style={{ color: '#A0A0B8', fontSize: 12 }}>
              选集 · 第{activeEpisode + 1}集
            </text>
          </view>
          <view className="episode-list">
            {data.episodes.map((ep, i) => (
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
                  style={
                    activeEpisode === i
                      ? { color: '#FFFFFF', fontSize: 13, fontWeight: '600' }
                      : { color: '#FFFFFF', fontSize: 13 }
                  }
                >
                  {ep}
                </text>
              </view>
            ))}
          </view>
          <view
            style={{
              padding: 16,
              paddingTop: 12,
            }}
          >
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
