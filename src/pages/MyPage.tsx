// 我的 - 收藏/历史/账号
import { useEffect, useState } from '@lynx-js/react';
import {
  useAuth,
  setAuth,
  useFavorites,
  usePlayRecords,
  setFavoritesLocal,
  setRecordsLocal,
} from '../store';
import { getFavorites, getPlayRecords, logout } from '../api/endpoints';
import { imageProxyUrl } from '../api/endpoints-helper';
import { useConfig } from '../store';
import { navigate } from '../lib/router';
import { EmptyView, LoadingView } from '../components/Common';
import type { Favorite, PlayRecord } from '../api/types';

type Tab = 'fav' | 'history';

export function MyPage() {
  const [auth] = useAuth();
  const [config] = useConfig();
  const [favs] = useFavorites();
  const [records] = usePlayRecords();
  const [tab, setTab] = useState<Tab>('history');
  const [syncing, setSyncing] = useState(false);
  const [syncError, setSyncError] = useState('');

  async function sync() {
    if (!config.apiBase || !auth.token) {
      navigate({ name: 'login' });
      return;
    }
    setSyncing(true);
    setSyncError('');
    try {
      const [f, r] = await Promise.all([
        getFavorites(config.apiBase).catch(() => ({ favorites: [] as Favorite[] })),
        getPlayRecords(config.apiBase).catch(() => ({ records: [] as PlayRecord[] })),
      ]);
      setFavoritesLocal(f.favorites || []);
      setRecordsLocal(r.records || []);
    } catch (e: any) {
      setSyncError(e?.message || '同步失败');
    } finally {
      setSyncing(false);
    }
  }

  useEffect(() => {
    if (auth.token) sync();
  }, [auth.token]);

  async function onLogout() {
    try {
      if (config.apiBase && auth.token) {
        await logout(config.apiBase);
      }
    } catch {}
    setAuth(null, null);
  }

  return (
    <view className="page">
      <view className="app-header">
        <text className="app-title">我的</text>
        {auth.token ? (
          <view bindtap={onLogout}>
            <text style={{ color: '#A0A0B8', fontSize: 13 }}>退出登录</text>
          </view>
        ) : null}
      </view>

      {/* 账号卡片 */}
      <view
        style={{
          margin: 16,
          padding: 16,
          borderRadius: 12,
          backgroundColor: '#1A1A2E',
        }}
      >
        <view style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
          <view className="avatar">
            <text className="avatar-text">
              {auth.user?.username?.[0]?.toUpperCase() || 'U'}
            </text>
          </view>
          <view style={{ flex: 1 }}>
            {auth.user ? (
              <>
                <text
                  style={{
                    color: '#FFFFFF',
                    fontSize: 16,
                    fontWeight: '600',
                  }}
                >
                  {auth.user.username}
                </text>
                <text
                  style={{
                    color: '#A0A0B8',
                    fontSize: 12,
                    marginTop: 2,
                  }}
                >
                  {auth.user.role === 'owner'
                    ? '站长'
                    : auth.user.role === 'admin'
                      ? '管理员'
                      : '用户'}
                  {auth.user.expiresAt
                    ? ` · 到期 ${new Date(auth.user.expiresAt).toLocaleDateString()}`
                    : ''}
                </text>
              </>
            ) : (
              <>
                <text
                  style={{
                    color: '#FFFFFF',
                    fontSize: 16,
                    fontWeight: '600',
                  }}
                >
                  未登录
                </text>
                <text
                  style={{
                    color: '#A0A0B8',
                    fontSize: 12,
                    marginTop: 2,
                  }}
                >
                  登录后可同步数据
                </text>
              </>
            )}
          </view>
          {auth.token ? (
            <view bindtap={sync}>
              <text style={{ color: '#6366F1', fontSize: 13 }}>
                {syncing ? '同步中...' : '🔄 同步'}
              </text>
            </view>
          ) : (
            <view
              bindtap={() => navigate({ name: 'login' })}
              className="btn btn-primary"
              style={{ height: 32, paddingLeft: 16, paddingRight: 16 }}
            >
              <text style={{ color: '#FFFFFF', fontSize: 13 }}>登录</text>
            </view>
          )}
        </view>
        {syncError ? (
          <text style={{ color: '#EF4444', fontSize: 12, marginTop: 8 }}>
            {syncError}
          </text>
        ) : null}
      </view>

      {/* Tab 切换 */}
      <view
        style={{
          flexDirection: 'row',
          marginLeft: 16,
          marginRight: 16,
          marginBottom: 8,
          backgroundColor: '#1A1A2E',
          borderRadius: 8,
          padding: 4,
        }}
      >
        {(
          [
            { key: 'history' as Tab, label: `播放历史 (${records.length})` },
            { key: 'fav' as Tab, label: `我的收藏 (${favs.length})` },
          ]
        ).map((t) => (
          <view
            key={t.key}
            style={{
              flex: 1,
              paddingTop: 8,
              paddingBottom: 8,
              alignItems: 'center',
              borderRadius: 6,
              backgroundColor: tab === t.key ? '#E50914' : 'transparent',
            }}
            bindtap={() => setTab(t.key)}
          >
            <text
              style={{
                color: tab === t.key ? '#FFFFFF' : '#A0A0B8',
                fontSize: 13,
                fontWeight: '500',
              }}
            >
              {t.label}
            </text>
          </view>
        ))}
      </view>

      {/* 列表 */}
      {tab === 'history' ? (
        records.length === 0 ? (
          <EmptyView icon="🕐" text="暂无播放记录" />
        ) : (
          <scroll-view scroll-y style={{ flex: 1 }}>
            {records.map((r, i) => (
              <view
                key={i}
                className="list-item"
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
                <view className="list-poster">
                  {r.poster ? (
                    <image
                      src={imageProxyUrl(config.apiBase, r.poster, 'https://movie.douban.com/')}
                      style={{ width: '100%', height: '100%' }}
                      mode="aspectFill"
                    />
                  ) : null}
                </view>
                <view className="list-content">
                  <text className="list-title" text-maxline="1">
                    {r.title}
                  </text>
                  <text className="list-sub" text-maxline="1">
                    {r.episodeName} · 已看 {fmtDuration(r.playTime)}
                  </text>
                  <text className="list-sub">
                    {new Date(r.updatedAt).toLocaleString()}
                  </text>
                </view>
                <view className="list-action">
                  <text style={{ color: '#E50914', fontSize: 12 }}>继续</text>
                </view>
              </view>
            ))}
          </scroll-view>
        )
      ) : favs.length === 0 ? (
        <EmptyView icon="⭐" text="还没有收藏" />
      ) : (
        <scroll-view scroll-y style={{ flex: 1 }}>
          {favs.map((f, i) => (
            <view
              key={i}
              className="list-item"
              bindtap={() =>
                navigate({ name: 'detail', source: f.source, id: f.id })
              }
            >
              <view className="list-poster">
                {f.poster ? (
                  <image
                    src={imageProxyUrl(config.apiBase, f.poster, 'https://movie.douban.com/')}
                    style={{ width: '100%', height: '100%' }}
                    mode="aspectFill"
                  />
                ) : null}
              </view>
              <view className="list-content">
                <text className="list-title" text-maxline="1">
                  {f.title}
                </text>
                <text className="list-sub" text-maxline="1">
                  {f.year || ''} {f.remarks || ''}
                </text>
              </view>
            </view>
          ))}
        </scroll-view>
      )}
    </view>
  );
}

function fmtDuration(s: number): string {
  if (!s || !isFinite(s)) return '0:00';
  const m = Math.floor(s / 60);
  const sec = Math.floor(s % 60);
  return `${m}:${String(sec).padStart(2, '0')}`;
}
