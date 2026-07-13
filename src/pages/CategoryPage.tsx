// 分类页 - 改造:本地数据浏览
import { useEffect, useState, useCallback } from '@lynx-js/react';
import { listByCategory, allItems } from '../api/local';
import { back, navigate } from '../lib/router';
import { LoadingView, ErrorView, EmptyView } from '../components/Common';
import { VideoCard } from '../components/VideoCard';
import type { SearchResult } from '../api/types';
import type { LocalType } from '../data/content';

interface Props {
  type: string;
}

const TYPE_LABEL: Record<string, string> = {
  movie: '电影',
  tv: '剧集',
  anime: '动漫',
  variety: '综艺',
  short: '短剧',
  all: '全部',
};

export function CategoryPage({ type }: Props) {
  const [data, setData] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const label = TYPE_LABEL[type] || type;

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const r =
        type === 'all'
          ? await allItems()
          : await listByCategory(type as LocalType, 100);
      setData(r.results || []);
    } catch (e: any) {
      setError(e?.message || '加载失败');
    } finally {
      setLoading(false);
    }
  }, [type]);

  useEffect(() => {
    load();
  }, [load]);

  return (
    <view className="page page-no-tabbar">
      <view className="app-header">
        <view className="icon-btn" bindtap={() => back()}>
          <text className="icon-btn-text">‹</text>
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
        <scroll-view scroll-y className="category-scroll">
          <view className="category-grid">
            {data.map((d, i) => (
              <view
                key={`${d.source}-${d.id}-${i}`}
                className="category-cell"
                bindtap={() =>
                  navigate({ name: 'detail', source: d.source, id: d.id })
                }
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
