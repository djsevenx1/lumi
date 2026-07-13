// 首页 - 改造:数据全部来自本地,无 apiBase / 鉴权
import { useEffect, useState, useCallback, useMemo } from '@lynx-js/react';
import { useConfig, useAuth, getRecordsLocal, getFavoritesLocal } from '../store';
import { doubanHot, listByCategory } from '../api/local';
import { navigate } from '../lib/router';
import { VideoCard, HorizontalList } from '../components/VideoCard';
import { LoadingView } from '../components/Common';
import { CapsuleSwitch } from '../components/CapsuleSwitch';
import type { SearchResult, PlayRecord } from '../api/types';

type HomeTab = 'home' | 'fav' | 'wish';

const TAB_OPTIONS = [
  { label: '首页', value: 'home' },
  { label: '收藏夹', value: 'fav' },
  { label: '想看', value: 'wish' },
];

export function HomePage() {
  const [config] = useConfig();
  const [auth] = useAuth();
  const [tab, setTab] = useState<HomeTab>('home');

  // 内容列表
  const [hotMovie, setHotMovie] = useState<SearchResult[]>([]);
  const [hotTv, setHotTv] = useState<SearchResult[]>([]);
  const [hotVariety, setHotVariety] = useState<SearchResult[]>([]);
  const [hotAnime, setHotAnime] = useState<SearchResult[]>([]);
  const [wishList, setWishList] = useState<SearchResult[]>([]);

  const [loading, setLoading] = useState(true);
  const [records, setRecords] = useState<PlayRecord[]>([]);
  const [favorites, setFavorites] = useState(getFavoritesLocal());

  // 问候语:按时间段
  const greeting = useMemo(() => {
    const hour = new Date().getHours();
    if (hour < 12) return '早上好';
    if (hour < 18) return '下午好';
    return '晚上好';
  }, []);

  const username = useMemo(() => {
    return auth.user?.username || '';
  }, [auth.user]);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      // 全部从本地数据拿,无网络
      const [m, t, v, a, w] = await Promise.all([
        doubanHot('movie', '热门', 12),
        doubanHot('tv', '热门', 12),
        listByCategory('variety', 12),
        listByCategory('anime', 12),
        listByCategory('short', 12),
      ]);
      const toCard = (r: any): SearchResult => ({
        id: r.id,
        title: r.title,
        poster: r.poster,
        year: r.year,
        rate: r.rate,
        source: r.source,
        source_name: r.source_name,
      });
      setHotMovie(m.list.map(toCard));
      setHotTv(t.list.map(toCard));
      setHotVariety(v.results.map(toCard));
      setHotAnime(a.results.map(toCard));
      setWishList(w.results.map(toCard));
      setRecords(getRecordsLocal());
      setFavorites(getFavoritesLocal());
    } catch {
      // 本地数据无失败可能,ignore
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  if (loading) return <LoadingView text="加载首页内容..." />;

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

  // 渲染"想看"tab 内容(本地短剧充当"想看"清单)
  function renderWish() {
    if (wishList.length === 0) {
      return (
        <view className="home-fav-empty">
          <text className="home-fav-empty-icon">🔔</text>
          <text className="home-fav-empty-title">想看清单为空</text>
          <text className="home-fav-empty-sub">浏览短剧分类看看</text>
        </view>
      );
    }
    return (
      <view>
        <view className="home-fav-grid">
          {wishList.map((w, i) => (
            <view key={`${w.id}-${i}`} className="home-fav-cell">
              <VideoCard
                data={{
                  id: w.id,
                  title: w.title,
                  poster: w.poster,
                  source: w.source,
                  source_name: w.source_name || '短剧',
                  year: w.year,
                  remarks: w.remarks,
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
      {/* 顶栏 */}
      <view className="app-header">
        <text className="app-title">{config.siteName || 'LunaTV'}</text>
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

      {/* 问候渐变卡 */}
      <view className="greeting-card">
        <view className="greeting-inner">
          <view className="greeting-content">
            <text className="greeting-text">
              {greeting}
              {username ? ',' : ''}
              {username ? <text className="greeting-username">{username}</text> : null} 👋
            </text>
            <text className="greeting-sub">本地精选影视内容 ✨</text>
          </view>
          <view className="greeting-icon">
            <text className="greeting-icon-text">🎬</text>
          </view>
        </view>
      </view>

      {/* 3 段 CapsuleSwitch */}
      <view className="capsule-wrap">
        <CapsuleSwitch
          options={TAB_OPTIONS}
          active={tab}
          onChange={(v) => setTab(v as HomeTab)}
        />
      </view>

      {tab === 'home' ? renderHome() : tab === 'fav' ? renderFav() : renderWish()}
    </scroll-view>
  );
}
