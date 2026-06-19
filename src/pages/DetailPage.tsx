// 详情页 - 简介 + 集数 + 收藏/播放
import { useEffect, useState, useCallback } from '@lynx-js/react';
import { useConfig, useFavorites, isFavoritedLocal, setFavoritesLocal, getAuth } from '../store';
import { detail, addFavorite, removeFavorite } from '../api/endpoints';
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
      // detail 返回扁平结构
      const r = await detail(config.apiBase, source, id);
      setData(r);
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
    if (!auth.cookie) {
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
      // 添加 - favorite 必须包含 title 和 source_name
      const fav = {
        source: data.source,
        source_name: data.source_name,
        id: data.id,
        title: data.title,
        poster: data.poster,
        remarks: data.remarks || '',
      };
      setFavoritesLocal([{ ...fav, key }, ...favorites]);
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
    ? imageProxyUrl(config.apiBase, data.poster)
    : '';

  // 集数名称:优先用 episodes_titles,否则用序号
  const episodeNames = data.episodes_titles && data.episodes_titles.length > 0
    ? data.episodes_titles
    : data.episodes.map((_, i) => `第${i + 1}集`);

  return (
    <scroll-view scroll-y className="page page-no-tabbar">
      {/* Hero */}
      <view className="detail-hero">
        {poster ? (
          <image
            src={poster}
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
      {data.desc ? (
        <view className="detail-overview">
          <text className="detail-overview-title">简介</text>
          <text className="detail-overview-text">{data.desc}</text>
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
                  {episodeNames[i] || `第${i + 1}集`}
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
