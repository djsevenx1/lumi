// 分类页(根据 type 浏览更多内容)
import { useEffect, useState, useCallback } from '@lynx-js/react';
import { useConfig } from '../store';
import { doubanHot } from '../api/endpoints';
import { back, navigate } from '../lib/router';
import { LoadingView, ErrorView, EmptyView } from '../components/Common';
import { VideoCard } from '../components/VideoCard';
import type { SearchResult, DoubanItem } from '../api/types';

interface Props {
  type: string;
}

const TYPE_LABEL: Record<string, string> = {
  movie: '电影',
  tv: '剧集',
  anime: '动漫',
  variety: '综艺',
  short: '短剧',
};

export function CategoryPage({ type }: Props) {
  const [config] = useConfig();
  const [data, setData] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const label = TYPE_LABEL[type] || type;

  const load = useCallback(async () => {
    if (!config.apiBase) {
      setError('请先配置服务地址');
      setLoading(false);
      return;
    }
    setLoading(true);
    setError('');
    try {
      // douban 接口:type=movie|tv, tag=热门
      // anime/variety 映射到 tv
      const doubanType: 'movie' | 'tv' = type === 'movie' ? 'movie' : 'tv';
      const r = await doubanHot(config.apiBase, doubanType, '热门', 30);
      const list: SearchResult[] = r.list.map((it: DoubanItem) => ({
        id: it.id,
        title: it.title,
        poster: it.poster,
        year: it.year,
        rate: it.rate,
        source: '',
        source_name: '豆瓣',
      }));
      setData(list);
    } catch (e: any) {
      setError(e?.message || '加载失败');
    } finally {
      setLoading(false);
    }
  }, [config.apiBase, type]);

  useEffect(() => {
    load();
  }, [load]);

  return (
    <view className="page page-no-tabbar">
      <view className="app-header">
        <view className="icon-btn" bindtap={() => back()}>
          <text style={{ color: '#FFFFFF', fontSize: 18 }}>‹</text>
        </view>
        <text className="app-title">{label}</text>
        <view style={{ width: 36 }} />
      </view>

      {loading ? (
        <LoadingView text={`加载${label}中...`} />
      ) : error ? (
        <ErrorView message={error} onRetry={load} />
      ) : data.length === 0 ? (
        <EmptyView icon="📭" text={`暂无${label}内容`} />
      ) : (
        <scroll-view scroll-y style={{ flex: 1 }}>
          <view
            style={{
              flexDirection: 'row',
              flexWrap: 'wrap',
              padding: 12,
              gap: 12,
            }}
          >
            {data.map((d, i) => (
              <view
                key={`${d.source}-${d.id}-${i}`}
                bindtap={() => navigate({ name: 'detail', source: d.source, id: d.id })}
              >
                <VideoCard data={d as any} />
              </view>
            ))}
          </view>
          <view style={{ height: 32 }} />
        </scroll-view>
      )}
    </view>
  );
}
