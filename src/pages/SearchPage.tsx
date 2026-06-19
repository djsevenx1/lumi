// 搜索页 - 对齐 LunaTV search/page.tsx
// 列表式搜索结果卡片 + 搜索历史
import { useEffect, useState, useCallback, useRef } from '@lynx-js/react';
import { useConfig, useSearchHistory, pushSearchHistory, clearSearchHistory, getAuth } from '../store';
import { search } from '../api/endpoints';
import { imageProxyUrl } from '../api/endpoints-helper';
import { EmptyView, ErrorView, LoadingView } from '../components/Common';
import { SearchBar } from '../components/SearchBar';
import { navigate } from '../lib/router';
import type { SearchResult } from '../api/types';

export function SearchPage() {
  const [config] = useConfig();
  const [history, refresh] = useSearchHistory();
  const [keyword, setKeyword] = useState('');
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
  }, [keyword]);

  async function doSearch(q: string) {
    if (!q.trim() || !config.apiBase) return;
    const auth = getAuth();
    if (!auth.cookie) {
      setError('请先登录后再搜索');
      setSearched(true);
      return;
    }
    setLoading(true);
    setError('');
    try {
      const r = await search(config.apiBase, q);
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
    [config.apiBase],
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
                  style={{ color: '#6b7280', fontSize: 12 }}
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
                    <text style={{ color: '#6b7280', fontSize: 14 }}>🕐</text>
                    <text style={{ color: '#FFFFFF', fontSize: 14 }}>{q}</text>
                  </view>
                  <text
                    style={{ color: '#6b7280', fontSize: 18, padding: 4 }}
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
        // LunaTV 列表式搜索结果
        <view>
          <view style={{ paddingLeft: 16, paddingRight: 16, marginBottom: 8 }}>
            <text style={{ color: '#6b7280', fontSize: 12 }}>
              共找到 {results.length} 个结果
            </text>
          </view>
          {results.map((r, i) => (
            <view
              key={`${r.source}-${r.id}-${i}`}
              className="search-result-card"
              bindtap={() =>
                navigate({ name: 'detail', source: r.source, id: r.id })
              }
            >
              {/* 海报 */}
              <view className="search-result-poster">
                {r.poster ? (
                  <image
                    src={imageProxyUrl(config.apiBase, r.poster)}
                    style={{ width: '100%', height: '100%' }}
                    mode="aspectFill"
                  />
                ) : null}
              </view>
              {/* 信息 */}
              <view className="search-result-info">
                <text className="search-result-title" text-maxline="2">
                  {r.title}
                </text>
                <view className="search-result-meta">
                  {r.type_name ? (
                    <view className="search-result-tag">
                      <text>{r.type_name}</text>
                    </view>
                  ) : null}
                  {r.year ? (
                    <view className="search-source-tag">
                      <text>{r.year}</text>
                    </view>
                  ) : null}
                  {r.remarks ? (
                    <view className="search-source-tag">
                      <text>{r.remarks}</text>
                    </view>
                  ) : null}
                </view>
                {r.desc ? (
                  <text className="search-result-desc" text-maxline="2">
                    {r.desc}
                  </text>
                ) : null}
                {/* 播放源标签 - LunaTV 风格 */}
                {r.source_name ? (
                  <view
                    style={{
                      flexDirection: 'row',
                      marginTop: 4,
                    }}
                  >
                    <view className="search-source-tag">
                      <text>{r.source_name}</text>
                    </view>
                  </view>
                ) : null}
              </view>
              {/* 播放按钮 */}
              <view
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: 18,
                  backgroundColor: '#10b981',
                  alignItems: 'center',
                  justifyContent: 'center',
                  alignSelf: 'center',
                }}
              >
                <text style={{ color: '#fff', fontSize: 16 }}>▶</text>
              </view>
            </view>
          ))}
          <view style={{ height: 32 }} />
        </view>
      )}
    </scroll-view>
  );
}
