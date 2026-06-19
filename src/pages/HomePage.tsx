// 首页 - Banner + 继续观看 + 热门电影/剧集 + 收藏推荐
import { useEffect, useState, useCallback } from '@lynx-js/react';
import { useConfig, getAuth, getRecordsLocal } from '../store';
import { doubanHot } from '../api/endpoints';
import { navigate } from '../lib/router';
import { VideoCard, HorizontalList } from '../components/VideoCard';
import { LoadingView, ErrorView } from '../components/Common';
import type { SearchResult, DoubanItem, PlayRecord } from '../api/types';

export function HomePage() {
  const [config] = useConfig();
  const [hotMovie, setHotMovie] = useState<SearchResult[]>([]);
  const [hotTv, setHotTv] = useState<SearchResult[]>([]);
  const [banner, setBanner] = useState<DoubanItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [records, setRecords] = useState<PlayRecord[]>([]);
  const [bannerIndex, setBannerIndex] = useState(0);

  const load = useCallback(async () => {
    if (!config.apiBase) {
      setError('请先在设置中配置 LunaTV 服务地址');
      setLoading(false);
      return;
    }
    setLoading(true);
    setError('');
    try {
      // douban 接口不需要鉴权,type=movie|tv,tag=热门
      const [m, t] = await Promise.all([
        doubanHot(config.apiBase, 'movie', '热门', 12).catch(() => ({ list: [] as DoubanItem[] })),
        doubanHot(config.apiBase, 'tv', '热门', 12).catch(() => ({ list: [] as DoubanItem[] })),
      ]);
      const toCard = (it: DoubanItem): SearchResult => ({
        id: it.id,
        title: it.title,
        poster: it.poster,
        year: it.year,
        source: '',
        source_name: '豆瓣',
      });
      setHotMovie(m.list.map(toCard));
      setHotTv(t.list.map(toCard));
      setBanner(m.list.slice(0, 5));
      setRecords(getRecordsLocal());
    } catch (e: any) {
      setError(e?.message || '加载失败');
    } finally {
      setLoading(false);
    }
  }, [config.apiBase]);

  useEffect(() => {
    load();
  }, [load]);

  // Banner 轮播
  useEffect(() => {
    if (banner.length <= 1) return;
    const timer = setInterval(() => {
      setBannerIndex((i) => (i + 1) % banner.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [banner.length]);

  if (loading) return <LoadingView text="加载首页内容..." />;
  if (error)
    return (
      <view>
        <ErrorView message={error} onRetry={load} />
        <view style={{ padding: 16 }}>
          <view
            bindtap={() => navigate({ name: 'settings' })}
            className="btn btn-secondary"
            style={{ alignSelf: 'flex-start' }}
          >
            <text>去配置</text>
          </view>
        </view>
      </view>
    );

  const currentBanner = banner[bannerIndex] || banner[0];
  const auth = getAuth();

  return (
    <scroll-view scroll-y className="page">
      {/* Banner */}
      {currentBanner ? (
        <view className="banner">
          <image
            src={currentBanner.poster}
            style={{ width: '100%', height: '100%' }}
            mode="aspectFill"
          />
          <view className="banner-mask">
            <text className="banner-title">{currentBanner.title}</text>
            <text className="banner-sub">
              ⭐ {currentBanner.rate} · {currentBanner.year}
            </text>
          </view>
          {banner.length > 1 ? (
            <view className="banner-dots">
              {banner.map((_, i) => (
                <view
                  key={i}
                  className={
                    i === bannerIndex
                      ? 'banner-dot banner-dot-active'
                      : 'banner-dot'
                  }
                />
              ))}
            </view>
          ) : null}
        </view>
      ) : null}

      {/* 继续观看(历史) */}
      {records.length > 0 ? (
        <view className="section">
          <view className="section-header">
            <text className="section-title">继续观看</text>
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
                    remarks: `看到 ${r.episodeName}`,
                  }}
                />
              </view>
            ))}
          </scroll-view>
        </view>
      ) : null}

      <HorizontalList
        title="🔥 热门电影"
        data={hotMovie}
        onActionTap={() => navigate({ name: 'category', type: 'movie' })}
      />
      <HorizontalList
        title="📺 热门剧集"
        data={hotTv}
        onActionTap={() => navigate({ name: 'category', type: 'tv' })}
      />

      {/* 未登录提示 */}
      {!auth.cookie ? (
        <view
          className="section"
          bindtap={() => navigate({ name: 'login' })}
        >
          <view
            style={{
              padding: 16,
              borderRadius: 12,
              backgroundColor: 'rgba(99, 102, 241, 0.1)',
              borderWidth: 1,
              borderStyle: 'solid',
              borderColor: 'rgba(99, 102, 241, 0.3)',
              flexDirection: 'row',
              alignItems: 'center',
              gap: 12,
            }}
          >
            <text style={{ fontSize: 28 }}>👋</text>
            <view style={{ flex: 1 }}>
              <text style={{ color: '#FFFFFF', fontSize: 15, fontWeight: '600' }}>
                登录后可搜索和同步收藏
              </text>
              <text style={{ color: '#A0A0B8', fontSize: 12, marginTop: 2 }}>
                点击前往登录页面
              </text>
            </view>
            <text style={{ color: '#6366F1', fontSize: 14 }}>登录 ›</text>
          </view>
        </view>
      ) : null}
    </scroll-view>
  );
}
