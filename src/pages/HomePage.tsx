// 首页 - Selene 风格(分段切换 + 顶栏搜索 + 横向滚动)
// 入口:Selene 风格 segmented 切换"首页 / 收藏夹"
// 顶栏:🔍 搜索(跳转搜索页) + 主题/个人入口
// 主体:继续观看 / 热门电影 / 热门剧集 / 热门综艺 / 热门动漫
import { useEffect, useState, useCallback } from '@lynx-js/react';
import { useConfig, getRecordsLocal, getFavoritesLocal } from '../store';
import { doubanHot } from '../api/endpoints';
import { navigate } from '../lib/router';
import { VideoCard, HorizontalList } from '../components/VideoCard';
import { LoadingView, ErrorView } from '../components/Common';
import type { SearchResult, DoubanItem, PlayRecord } from '../api/types';

type HomeTab = 'home' | 'fav';

export function HomePage() {
  const [config] = useConfig();
  const [tab, setTab] = useState<HomeTab>('home');

  // 内容列表
  const [hotMovie, setHotMovie] = useState<SearchResult[]>([]);
  const [hotTv, setHotTv] = useState<SearchResult[]>([]);
  const [hotVariety, setHotVariety] = useState<SearchResult[]>([]);
  const [hotAnime, setHotAnime] = useState<SearchResult[]>([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [records, setRecords] = useState<PlayRecord[]>([]);
  const [favorites, setFavorites] = useState(getFavoritesLocal());

  const load = useCallback(async () => {
    if (!config.apiBase) {
      setError('请先在设置中配置 LunaTV 服务地址');
      setLoading(false);
      return;
    }
    setLoading(true);
    setError('');
    try {
      const toCard = (it: DoubanItem, source_name = '豆瓣'): any => ({
        id: it.id,
        title: it.title,
        poster: it.poster,
        year: it.year,
        rate: it.rate,
        source: '',
        source_name,
      });
      const safe = (p: Promise<any>) => p.catch(() => ({ list: [] as DoubanItem[] }));
      const [m, t, v, a] = await Promise.all([
        safe(doubanHot(config.apiBase, 'movie', '热门', 12)),
        safe(doubanHot(config.apiBase, 'tv', '热门', 12)),
        safe(doubanHot(config.apiBase, 'tv', '综艺', 12)),
        safe(doubanHot(config.apiBase, 'tv', '动漫', 12)),
      ]);
      setHotMovie(m.list.map((x: DoubanItem) => toCard(x)));
      setHotTv(t.list.map((x: DoubanItem) => toCard(x)));
      setHotVariety(v.list.map((x: DoubanItem) => toCard(x)));
      setHotAnime(a.list.map((x: DoubanItem) => toCard(x)));
      setRecords(getRecordsLocal());
      setFavorites(getFavoritesLocal());
    } catch (e: any) {
      setError(e?.message || '加载失败');
    } finally {
      setLoading(false);
    }
  }, [config.apiBase]);

  useEffect(() => {
    load();
  }, [load]);

  if (loading) return <LoadingView text="加载首页内容..." />;
  if (error) {
    return (
      <view>
        <ErrorView message={error} onRetry={load} />
        <view style={{ padding: 16 }}>
          <view
            bindtap={() => navigate({ name: 'settings' })}
            className="detail-btn-primary"
            style={{ alignSelf: 'flex-start' }}
          >
            <text className="detail-btn-primary-text">去配置</text>
          </view>
        </view>
      </view>
    );
  }

  // 渲染"首页"tab 内容
  function renderHome() {
    return (
      <view>
        {/* 继续观看 */}
        {records.length > 0 ? (
          <view className="section">
            <view className="section-header">
              <text className="section-title">🕐 继续观看</text>
              <view bindtap={() => navigate({ name: 'my' })}>
                <text className="section-action">查看全部 ›</text>
              </view>
            </view>
            <scroll-view
              scroll-x
              className="horizontal-scroll-wide"
              show-scrollbar={false}
            >
              {records.slice(0, 8).map((r, i) => (
                <view
                  key={i}
                  bindtap={() =>
                    navigate({
                      name: 'play',
                      source: r.source,
                      id: r.id,
                      episode: r.episodeIndex,
                      title: r.title,
                      poster: r.poster,
                    })
                  }
                >
                  <VideoCard
                    data={{
                      id: r.id,
                      title: r.title,
                      poster: r.poster,
                      source: r.source,
                      source_name: r.source_name || '播放记录',
                      remarks: `看到 ${r.episodeName}`,
                    }}
                  />
                </view>
              ))}
            </scroll-view>
          </view>
        ) : null}

        <HorizontalList
          title="🎬 热门电影"
          data={hotMovie as any}
          onActionTap={() => navigate({ name: 'category', type: 'movie' })}
        />
        <HorizontalList
          title="📺 热门剧集"
          data={hotTv as any}
          onActionTap={() => navigate({ name: 'category', type: 'tv' })}
        />
        <HorizontalList
          title="🎭 热门综艺"
          data={hotVariety as any}
          onActionTap={() => navigate({ name: 'category', type: 'variety' })}
        />
        <HorizontalList
          title="🌸 热门动漫"
          data={hotAnime as any}
          onActionTap={() => navigate({ name: 'category', type: 'anime' })}
        />

        <view style={{ height: 32 }} />
      </view>
    );
  }

  // 渲染"收藏夹"tab 内容
  function renderFav() {
    if (favorites.length === 0) {
      return (
        <view className="home-fav-empty">
          <text className="home-fav-empty-icon">📁</text>
          <text className="home-fav-empty-title">收藏夹是空的</text>
          <text className="home-fav-empty-sub">
            在详情页点击"收藏"按钮即可添加
          </text>
        </view>
      );
    }
    return (
      <view>
        <view className="home-fav-grid">
          {favorites.map((f, i) => (
            <view key={`${f.key}-${i}`} className="home-fav-cell">
              <VideoCard
                data={{
                  id: f.id || (f as any).save_key,
                  title: f.title,
                  poster: f.poster || (f as any).cover,
                  source: f.source,
                  source_name: f.source_name || '收藏',
                  year: f.year,
                  remarks: f.remarks,
                }}
                width="normal"
              />
            </view>
          ))}
        </view>
        <view style={{ height: 32 }} />
      </view>
    );
  }

  return (
    <scroll-view scroll-y className="page">
      {/* 顶栏 - Selene 风格:左标题,右搜索+个人 */}
      <view className="app-header">
        <text className="app-title">LunaTV</text>
        <view className="app-header-actions">
          <view
            className="icon-btn"
            bindtap={() => navigate({ name: 'search' })}
          >
            <text className="icon-btn-text">🔍</text>
          </view>
          <view
            className="icon-btn"
            bindtap={() => navigate({ name: 'my' })}
          >
            <text className="icon-btn-text">👤</text>
          </view>
        </view>
      </view>

      {/* 分段切换 首页 / 收藏夹 */}
      <view className="segmented">
        <view
          className={
            tab === 'home'
              ? 'segmented-item segmented-item-active'
              : 'segmented-item'
          }
          bindtap={() => setTab('home')}
        >
          <text
            className={
              tab === 'home'
                ? 'segmented-item-text segmented-item-text-active'
                : 'segmented-item-text'
            }
          >
            首页
          </text>
        </view>
        <view
          className={
            tab === 'fav'
              ? 'segmented-item segmented-item-active'
              : 'segmented-item'
          }
          bindtap={() => setTab('fav')}
        >
          <text
            className={
              tab === 'fav'
                ? 'segmented-item-text segmented-item-text-active'
                : 'segmented-item-text'
            }
          >
            收藏夹
          </text>
        </view>
      </view>

      {tab === 'home' ? renderHome() : renderFav()}
    </scroll-view>
  );
}
