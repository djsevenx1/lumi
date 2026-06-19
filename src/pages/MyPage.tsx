// 我的 - Selene 风格(账号卡 + 4 个 tab: 收藏/历史/已看/设置)
import { useEffect, useState } from '@lynx-js/react';
import { useConfig, useAuth, getFavoritesLocal, getRecordsLocal } from '../store';
import { navigate } from '../lib/router';
import { imageProxyUrl } from '../api/endpoints-helper';
import type { PlayRecord, Favorite } from '../api/types';

type MyTab = 'records' | 'favorites' | 'settings';

export function MyPage() {
  const [config] = useConfig();
  const [auth] = useAuth();
  const [tab, setTab] = useState<MyTab>('records');
  const [records, setRecords] = useState<PlayRecord[]>([]);
  const [favorites, setFavorites] = useState<Favorite[]>([]);

  useEffect(() => {
    setRecords(getRecordsLocal());
    setFavorites(getFavoritesLocal());
  }, [auth.cookie, tab]);

  const username = auth.user?.username || '未登录';
  const initial = username.slice(0, 1).toUpperCase();

  return (
    <scroll-view scroll-y className="page">
      {/* 顶栏 */}
      <view className="app-header">
        <text className="app-title">{config.siteName || 'LunaTV'}</text>
        <view
          className="icon-btn"
          bindtap={() => navigate({ name: 'settings' })}
        >
          <text className="icon-btn-text">⚙</text>
        </view>
      </view>

      {/* 账号卡 */}
      <view className="account-card">
        <view className="avatar">
          <text className="avatar-text">{initial}</text>
        </view>
        <view className="account-info">
          <text className="account-name">
            {auth.cookie ? username : '游客'}
          </text>
          <text className="account-sub">
            {auth.cookie ? '已登录,可同步云端' : '点击下方按钮登录账号'}
          </text>
        </view>
        {auth.cookie ? null : (
          <view
            className="btn btn-primary btn-small"
            bindtap={() => navigate({ name: 'login' })}
          >
            <text className="btn-primary-text">登录</text>
          </view>
        )}
      </view>

      {/* segmented: 收藏 / 播放历史 */}
      <view className="segmented">
        <view
          className={
            tab === 'records'
              ? 'segmented-item segmented-item-active'
              : 'segmented-item'
          }
          bindtap={() => setTab('records')}
        >
          <text
            className={
              tab === 'records'
                ? 'segmented-item-text segmented-item-text-active'
                : 'segmented-item-text'
            }
          >
            🕐 播放历史
          </text>
        </view>
        <view
          className={
            tab === 'favorites'
              ? 'segmented-item segmented-item-active'
              : 'segmented-item'
          }
          bindtap={() => setTab('favorites')}
        >
          <text
            className={
              tab === 'favorites'
                ? 'segmented-item-text segmented-item-text-active'
                : 'segmented-item-text'
            }
          >
            ❤️ 收藏夹
          </text>
        </view>
      </view>

      {/* 播放历史列表 */}
      {tab === 'records' ? (
        <view>
          {records.length === 0 ? (
            <view className="empty">
              <text className="empty-icon">🎬</text>
              <text className="empty-title">还没有播放记录</text>
              <text className="empty-text">去首页选个视频开始看吧</text>
            </view>
          ) : (
            <view>
              {records.map((r, i) => {
                const poster = r.poster
                  ? imageProxyUrl(config.apiBase, r.poster, 'https://movie.douban.com/')
                  : '';
                return (
                  <view
                    key={`rec-${i}-${r.id}`}
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
                      {poster ? (
                        <image
                          src={poster}
                          className="list-poster-image"
                          mode="aspectFill"
                        />
                      ) : null}
                    </view>
                    <view className="list-content">
                      <text className="list-title" text-maxline="1">
                        {r.title}
                      </text>
                      <text className="list-sub">
                        {r.episodeName || ''} · {r.source_name || ''}
                      </text>
                      <text className="list-sub">
                        {r.playTime > 0 ? `已看 ${Math.floor((r.playTime / Math.max(r.totalTime, 1)) * 100)}%` : '点击继续观看'}
                      </text>
                    </view>
                    <view className="list-action">
                      <text className="list-action-text">续播</text>
                    </view>
                  </view>
                );
              })}
              <view style={{ height: 32 }} />
            </view>
          )}
        </view>
      ) : null}

      {/* 收藏列表 */}
      {tab === 'favorites' ? (
        <view>
          {favorites.length === 0 ? (
            <view className="empty">
              <text className="empty-icon">📁</text>
              <text className="empty-title">收藏夹是空的</text>
              <text className="empty-text">在详情页点击"收藏"按钮即可添加</text>
            </view>
          ) : (
            <view>
              {favorites.map((f, i) => {
                const poster =
                  f.poster || (f as any).cover
                    ? imageProxyUrl(config.apiBase, f.poster || (f as any).cover, 'https://movie.douban.com/')
                    : '';
                return (
                  <view
                    key={`fav-${i}-${f.key || f.id}`}
                    className="list-item"
                    bindtap={() =>
                      navigate({
                        name: 'detail',
                        source: f.source,
                        id: f.id,
                      })
                    }
                  >
                    <view className="list-poster">
                      {poster ? (
                        <image
                          src={poster}
                          className="list-poster-image"
                          mode="aspectFill"
                        />
                      ) : null}
                    </view>
                    <view className="list-content">
                      <text className="list-title" text-maxline="1">
                        {f.title}
                      </text>
                      <text className="list-sub">
                        {f.year || ''} {f.remarks ? `· ${f.remarks}` : ''}
                      </text>
                      <text className="list-sub">
                        {f.source_name || '收藏'}
                      </text>
                    </view>
                    <view className="list-action">
                      <text className="list-action-text">查看</text>
                    </view>
                  </view>
                );
              })}
              <view style={{ height: 32 }} />
            </view>
          )}
        </view>
      ) : null}
    </scroll-view>
  );
}
