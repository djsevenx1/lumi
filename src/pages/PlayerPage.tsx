// 播放器页 - 从 detail 获取 episodes 直链 + 自定义控件
import { useEffect, useState, useRef, useCallback } from '@lynx-js/react';
import { useConfig, setRecordsLocal, getRecordsLocal, usePlayRecords, getAuth } from '../store';
import { detail, savePlayRecord } from '../api/endpoints';
import { back } from '../lib/router';
import { LoadingView, ErrorView } from '../components/Common';
import type { PlayRecord } from '../api/types';

/**
 * 渲染视频元素。
 * Lynx 没有内置 <video>,这里把 video 渲染抽象出来,方便替换实现。
 * 默认是空的占位,实际项目里应该:
 *   1) 集成 @sigx/lynx-video (推荐,iOS AVPlayer + Android Media3)
 *   2) 或实现自定义 NativeModules.VideoPlayer
 *   3) 或退回到 webview 内嵌 HLS.js
 */
function renderVideo(
  src: string,
  poster?: string,
  events: Record<string, any> = {},
): any {
  return (
    <view
      style={{
        width: '100%',
        height: '100%',
        backgroundColor: '#000',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <view
        style={{
          padding: 16,
          backgroundColor: 'rgba(255,255,255,0.05)',
          borderRadius: 8,
          alignItems: 'center',
        }}
      >
        <text style={{ color: '#A0A0B8', fontSize: 14, marginBottom: 8 }}>
          🎬 视频播放
        </text>
        <text
          style={{ color: '#6E6E80', fontSize: 11, textAlign: 'center' }}
        >
          (需要在原生端实现 VideoPlayer){'\n'}
          {src.substring(0, 60)}...
        </text>
      </view>
    </view>
  );
}

interface Props {
  source: string;
  id: string;
  episode: number;
  title?: string;
  poster?: string;
}

function fmtTime(s: number): string {
  if (!isFinite(s) || s < 0) return '00:00';
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const sec = Math.floor(s % 60);
  const mm = String(m).padStart(2, '0');
  const ss = String(sec).padStart(2, '0');
  if (h > 0) return `${h}:${mm}:${ss}`;
  return `${mm}:${ss}`;
}

export function PlayerPage({ source, id, episode, title, poster }: Props) {
  const [config] = useConfig();
  const [, refreshRec] = usePlayRecords();
  const [videoUrl, setVideoUrl] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [paused, setPaused] = useState(false);
  const [current, setCurrent] = useState(0);
  const [duration, setDuration] = useState(0);
  const [showControls, setShowControls] = useState(true);
  const [episodes, setEpisodes] = useState<string[]>([]);
  const [sourceName, setSourceName] = useState('');
  const controlsTimer = useRef<any>(null);

  const load = useCallback(async () => {
    if (!config.apiBase) {
      setError('请先配置服务地址');
      setLoading(false);
      return;
    }
    setLoading(true);
    setError('');
    try {
      // 从 detail 获取 episodes 直链(search/detail 已返回 m3u8 URL)
      const r = await detail(config.apiBase, source, id);
      setEpisodes(r.episodes || []);
      setSourceName(r.source_name || '');
      if (r.episodes && r.episodes.length > episode) {
        setVideoUrl(r.episodes[episode]);
      } else if (r.episodes && r.episodes.length > 0) {
        setVideoUrl(r.episodes[0]);
      } else {
        setError('没有可播放的集数');
      }
    } catch (e: any) {
      setError(e?.message || '加载视频失败');
    } finally {
      setLoading(false);
    }
  }, [config.apiBase, source, id, episode]);

  useEffect(() => {
    load();
  }, [load]);

  // 加载历史进度
  useEffect(() => {
    if (!videoUrl) return;
    const records = getRecordsLocal();
    const rec = records.find(
      (r) => r.source === source && r.id === id && r.episodeIndex === episode,
    );
    if (rec && rec.playTime > 5) {
      (globalThis as any).__pendingSeek = rec.playTime;
    }
  }, [videoUrl, source, id, episode]);

  function saveProgress(currentTime: number, total: number) {
    if (!currentTime || currentTime < 1) return;
    const records = getRecordsLocal();
    const key = `${source}+${id}+${episode}`;
    const idx = records.findIndex(
      (r) => r.source === source && r.id === id && r.episodeIndex === episode,
    );
    const next: PlayRecord = {
      key,
      source,
      source_name: sourceName,
      id,
      title: title || '',
      poster: poster || '',
      episodeIndex: episode,
      episodeName: `第${episode + 1}集`,
      playTime: currentTime,
      totalTime: total,
      updatedAt: Date.now(),
    };
    if (idx >= 0) records[idx] = next;
    else records.unshift(next);
    setRecordsLocal(records.slice(0, 50));
    refreshRec();

    // 同步到服务端
    const auth = getAuth();
    if (auth.cookie && config.apiBase) {
      savePlayRecord(config.apiBase, key, {
        source,
        source_name: sourceName,
        id,
        title: title || '',
        poster: poster || '',
        episodeIndex: episode,
        episodeName: `第${episode + 1}集`,
        playTime: currentTime,
        totalTime: total,
        updatedAt: Date.now(),
      }).catch(() => {});
    }
  }

  function toggleControls() {
    const next = !showControls;
    setShowControls(next);
    if (next) {
      if (controlsTimer.current) clearTimeout(controlsTimer.current);
      controlsTimer.current = setTimeout(() => setShowControls(false), 4000);
    }
  }

  function onEnded() {
    saveProgress(duration, duration);
    back();
  }

  if (loading) {
    return (
      <view className="player-page center">
        <LoadingView text="加载视频地址..." />
      </view>
    );
  }
  if (error || !videoUrl) {
    return (
      <view className="player-page center">
        <view style={{ padding: 24 }}>
          <ErrorView
            message={error || '无法加载视频'}
            onRetry={load}
          />
        </view>
        <view
          className="btn btn-secondary"
          bindtap={() => back()}
          style={{ marginTop: 16 }}
        >
          <text style={{ color: '#FFFFFF' }}>返回</text>
        </view>
      </view>
    );
  }

  return (
    <view className="player-page">
      {renderVideo(videoUrl, poster, {
        bindtap: toggleControls,
        bindplay: () => setPaused(false),
        bindpause: () => {
          setPaused(true);
          saveProgress(current, duration);
        },
        bindended: onEnded,
        bindtimeupdate: (e: any) => setCurrent(e?.detail?.currentTime || 0),
        bindloadedmetadata: (e: any) => setDuration(e?.detail?.duration || 0),
        binderror: () => setError('视频加载失败'),
      })}

      {showControls ? (
        <>
          <view className="player-top">
            <view className="player-btn" bindtap={() => back()}>
              <text style={{ color: '#FFFFFF', fontSize: 18 }}>‹</text>
            </view>
            <text className="player-title" text-maxline="1">
              {title || '播放中'}
            </text>
          </view>
          <view className="player-controls">
            <view className="player-progress">
              <view
                className="player-progress-bar"
                style={{
                  width: duration > 0 ? `${(current / duration) * 100}%` : '0%',
                }}
              />
            </view>
            <view className="player-time">
              <text>{fmtTime(current)}</text>
              <text>{fmtTime(duration)}</text>
            </view>
            <view
              style={{
                flexDirection: 'row',
                justifyContent: 'center',
                alignItems: 'center',
                marginTop: 8,
              }}
            >
              <view
                className="player-btn"
                style={{ width: 56, height: 56, borderRadius: 28 }}
                bindtap={() => setPaused((p) => !p)}
              >
                <text style={{ color: '#FFFFFF', fontSize: 24 }}>
                  {paused ? '▶' : '⏸'}
                </text>
              </view>
            </view>
          </view>
        </>
      ) : null}
    </view>
  );
}
