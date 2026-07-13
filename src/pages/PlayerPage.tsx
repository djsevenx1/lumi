// 播放器页 - 改造:本地数据,记录仅写本地
import { useEffect, useState, useRef, useCallback } from '@lynx-js/react';
import {
  setRecordsLocal,
  getRecordsLocal,
  usePlayRecords,
} from '../store';
import { detail as localDetail } from '../api/local';
import { back } from '../lib/router';
import { LoadingView, ErrorView } from '../components/Common';
import { VideoPlayer } from '../components/VideoPlayer';
import type { PlayRecord } from '../api/types';

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
    setLoading(true);
    setError('');
    try {
      const r = await localDetail(source, id);
      if (!r) {
        setError('没有可播放的集数');
        return;
      }
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
  }, [source, id, episode]);

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
          <text className="btn-secondary-text">返回</text>
        </view>
      </view>
    );
  }

  return (
    <view className="player-page">
      <VideoPlayer
        src={videoUrl}
        poster={poster}
        controls={true}
        resizeMode="contain"
        playing={!paused}
        onLoad={(e: any) => setDuration((e?.detail?.durationMs || 0) / 1000)}
        onEnd={onEnded}
        onTimeUpdate={(e: any) =>
          setCurrent((e?.detail?.positionMs || 0) / 1000)
        }
        onError={(e: any) => setError(e?.detail?.message || '视频加载失败')}
        style={{ width: '100%', height: '100%' }}
      />

      {showControls ? (
        <>
          <view className="player-top">
            <view className="player-btn" bindtap={() => back()}>
              <text className="player-btn-text">‹</text>
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
                  width:
                    duration > 0 ? `${(current / duration) * 100}%` : '0%',
                }}
              />
            </view>
            <view className="player-time">
              <text className="player-time-text">{fmtTime(current)}</text>
              <text className="player-time-text">{fmtTime(duration)}</text>
            </view>
            <view className="player-center">
              <view
                className="player-btn player-btn-large"
                bindtap={() => setPaused((p) => !p)}
              >
                <text className="player-btn-text-large">
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
