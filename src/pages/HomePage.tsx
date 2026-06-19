// 首页 - LunaTV Web 同款
// 问候渐变卡 + 3 段 CapsuleSwitch(首页/收藏夹/想看) + 横向滚动
import { useEffect, useState, useCallback, useMemo } from '@lynx-js/react';
import { useConfig, useAuth, getRecordsLocal, getFavoritesLocal } from '../store';
import { doubanHot } from '../api/endpoints';
import { navigate } from '../lib/router';
import { VideoCard, HorizontalList } from '../components/VideoCard';
import { LoadingView, ErrorView } from '../components/Common';
import { CapsuleSwitch } from '../components/CapsuleSwitch';
import type { SearchResult, DoubanItem, PlayRecord } from '../api/types';

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

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
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
      // 并行请求,但失败时记录到 partialErr
      const partialErr: string[] = [];
      const safe = async (
        label: string,
        p: Promise<any>,
      ): Promise<DoubanItem[]> => {
        try {
          const r = await p;
          return r?.list || [];
        } catch (e: any) {
          partialErr.push(`${label}: ${e?.message || '失败'}`);
          return [];
        }
      };
      const [m, t, v, a] = await Promise.all([
        safe('电影', doubanHot(config.apiBase, 'movie', '热门', 12)),
        safe('剧集', doubanHot(config.apiBase, 'tv', '热门', 12)),
        safe('综艺', doubanHot(config.apiBase, 'tv', '综艺', 12)),
        safe('动漫', doubanHot(config.apiBase, 'tv', '动漫', 12)),
      ]);
      setHotMovie(m.map((x) => toCard(x)));
      setHotTv(t.map((x) => toCard(x)));
      setHotVariety(v.map((x) => toCard(x)));
      setHotAnime(a.map((x) => toCard(x)));
      setRecords(getRecordsLocal());
      setFavorites(getFavoritesLocal());
      // 全部都失败时才算错误
      if (m.length === 0 && t.length === 0 && v.length === 0 && a.length === 0) {
        if (partialErr.length > 0) {
          setError(partialErr[0] + (partialErr.length > 1 ? ` 等${partialErr.length}项` : ''));
        }
      }
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
  if (error && tab === 'home') {
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

  // 渲染"想看"tab 内容(暂作空状态,LunaTV 远端同步需登录)
  function renderWish() {
    return (
      <view className="home-fav-empty">
        <text className="home-fav-empty-icon">🔔</text>
        <text className="home-fav-empty-title">想看清单为空</text>
        <text className="home-fav-empty-sub">
          标记"想看"的影片将出现在这里
        </text>
      </view>
    );
  }

  return (
    <scroll-view scroll-y className="page">
      {/* 顶栏 */}
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

      {/* 问候渐变卡 - LunaTV:from-blue-500/90 via-purple-500/90 to-pink-500/90 */}
      <view className="greeting-card">
        <view className="greeting-inner">
          <view className="greeting-content">
            <text className="greeting-text">
              {greeting}
              {username ? ',' : ''}
              {username ? <text className="greeting-username">{username}</text> : null} 👋
            </text>
            <text className="greeting-sub">发现更多精彩影视内容 ✨</text>
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
