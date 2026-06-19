// 搜索页 - 实时搜索 + 搜索历史 + 热搜
import { useEffect, useState, useCallback, useRef } from '@lynx-js/react';
import { useConfig, useSearchHistory, pushSearchHistory, clearSearchHistory } from '../store';
import { search } from '../api/endpoints';
import { VideoCard, HorizontalList } from '../components/VideoCard';
import { LoadingView, EmptyView, ErrorView } from '../components/Common';
import { SearchBar } from '../components/SearchBar';
import { VIDEO_TYPES, type VideoType } from '../lib/config';
import { navigate } from '../lib/router';
import type { SearchResult } from '../api/types';

export function SearchPage() {
  const [config] = useConfig();
  const [history, refresh] = useSearchHistory();
  const [keyword, setKeyword] = useState('');
  const [activeType, setActiveType] = useState<VideoType>('all');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [searched, setSearched] = useState(false);
  const debounceRef = useRef<any>(null);

  // 防抖搜索
  useEffect(() => {
    if (!keyword.trim()) {
      setResults([]);
      setSearched(false);
      return;
    }
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => doSearch(keyword), 500);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [keyword, activeType]);

  async function doSearch(q: string) {
    if (!q.trim() || !config.apiBase) return;
    setLoading(true);
    setError('');
    try {
      const r = await search(config.apiBase, q, {
        type: activeType === 'all' ? '' : activeType,
      });
      setResults(r.results || []);
      setSearched(true);
    } catch (e: any) {
      setError(e?.message || '搜索失败');
    } finally {
      setLoading(false);
    }
  }

  const onSubmit = useCallback(
    (q: string) => {
      if (q.trim()) {
        pushSearchHistory(q.trim());
        refresh();
      }
      doSearch(q);
    },
    [activeType, config.apiBase],
  );

  function onPickHistory(q: string) {
    setKeyword(q);
    pushSearchHistory(q);
    refresh();
    doSearch(q);
  }

  function onClearHistory() {
    clearSearchHistory();
    refresh();
  }

  return (
    <scroll-view scroll-y className="page">
      <view className="app-header">
        <text className="app-title">搜索</text>
      </view>
      <SearchBar
        value={keyword}
        onChange={setKeyword}
        onSubmit={onSubmit}
        placeholder="搜索电影、剧集、动漫..."
        autoFocus
      />

      {/* 类型筛选 */}
      <view className="chip-row">
        {VIDEO_TYPES.map((t) => (
          <view
            key={t.key}
            className={activeType === t.key ? 'chip chip-active' : 'chip'}
            bindtap={() => setActiveType(t.key)}
          >
            <text
              style={
                activeType === t.key
                  ? { color: '#FFFFFF', fontWeight: '600' }
                  : { color: '#A0A0B8' }
              }
            >
              {t.label}
            </text>
          </view>
        ))}
      </view>

      {/* 结果区 */}
      {loading ? (
        <LoadingView text="搜索中..." />
      ) : error ? (
        <ErrorView message={error} />
      ) : !keyword ? (
        // 未输入:显示历史
        <view>
          {history.length > 0 ? (
            <view className="search-history">
              <view
                style={{
                  flexDirection: 'row',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  paddingTop: 8,
                  paddingBottom: 8,
                }}
              >
                <text style={{ color: '#FFFFFF', fontWeight: '600', fontSize: 15 }}>
                  搜索历史
                </text>
                <text
                  style={{ color: '#A0A0B8', fontSize: 12 }}
                  bindtap={onClearHistory}
                >
                  🗑 清空
                </text>
              </view>
              {history.map((q, i) => (
                <view
                  key={i}
                  className="search-history-item"
                  bindtap={() => onPickHistory(q)}
                >
                  <view
                    style={{
                      flexDirection: 'row',
                      alignItems: 'center',
                      gap: 8,
                      flex: 1,
                    }}
                  >
                    <text style={{ color: '#6E6E80', fontSize: 14 }}>🕐</text>
                    <text style={{ color: '#FFFFFF', fontSize: 14 }}>{q}</text>
                  </view>
                  <text
                    style={{ color: '#6E6E80', fontSize: 18, padding: 4 }}
                    catchtap={(e: any) => {
                      e?.stopPropagation?.();
                    }}
                  >
                    ›
                  </text>
                </view>
              ))}
            </view>
          ) : (
            <EmptyView icon="🔍" text="输入关键词开始搜索" />
          )}
        </view>
      ) : results.length === 0 ? (
        <EmptyView
          icon="🤷"
          text={searched ? `没有找到关于"${keyword}"的结果` : '输入关键词开始搜索'}
        />
      ) : (
        <view>
          <view style={{ paddingLeft: 16, paddingRight: 16, marginBottom: 8 }}>
            <text style={{ color: '#A0A0B8', fontSize: 13 }}>
              共找到 {results.length} 个结果
            </text>
          </view>
          <scroll-view
            scroll-x
            className="horizontal-scroll-wide"
            show-scrollbar={false}
            style={{ paddingLeft: 16 }}
          >
            {results.map((r, i) => (
              <VideoCard key={`${r.source}-${r.id}-${i}`} data={r} />
            ))}
          </scroll-view>
          {/* 网格 */}
          <view
            style={{
              flexDirection: 'row',
              flexWrap: 'wrap',
              padding: 16,
              paddingTop: 0,
              gap: 12,
            }}
          >
            {results.map((r, i) => (
              <view key={`g-${r.source}-${r.id}-${i}`}>
                <VideoCard data={r} />
              </view>
            ))}
          </view>
        </view>
      )}
    </scroll-view>
  );
}
