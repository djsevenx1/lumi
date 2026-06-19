// 播放器页 - Lynx 原生 <video> + 自定义控件
import { useEffect, useState, useRef, useCallback } from '@lynx-js/react';
import { useConfig, setRecordsLocal, getRecordsLocal, usePlayRecords } from '../store';
import { parseVideo } from '../api/endpoints';
import { back, navigate } from '../lib/router';
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
  // 默认占位(无 native 视频实现)
  // 在生产项目里,需要替换为: <video-player src={src} poster={poster} {...events} />
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
  const [qualities, setQualities] = useState<Array<{ name: string; url: string }>>([]);
  const [activeQuality, setActiveQuality] = useState(0);
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
      const r = await parseVideo(config.apiBase, source, id, episode);
      if (r.qualities && r.qualities.length > 0) {
        setQualities(r.qualities);
        setVideoUrl(r.qualities[0].url);
      } else {
        setVideoUrl(r.url);
      }
    } catch (e: any) {
      setError(e?.message || '解析视频失败');
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
      // 触发 seek(用 ref 注入,这里先存 state)
      (window as any).__pendingSeek = rec.playTime;
    }
  }, [videoUrl, source, id, episode]);

  function saveProgress(currentTime: number, total: number) {
    if (!currentTime || currentTime < 1) return;
    const records = getRecordsLocal();
    const key = `${source}+${id}`;
    const idx = records.findIndex(
      (r) => r.source === source && r.id === id && r.episodeIndex === episode,
    );
    const next: PlayRecord = {
      key: `${key}+${episode}`,
      source,
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
    // 限制 50 条
    setRecordsLocal(records.slice(0, 50));
    refreshRec();
  }

  function toggleControls() {
    const next = !showControls;
    setShowControls(next);
    if (next) {
      if (controlsTimer.current) clearTimeout(controlsTimer.current);
      controlsTimer.current = setTimeout(() => setShowControls(false), 4000);
    }
  }

  function onLoaded(e: any) {
    const d = e?.detail?.duration || 0;
    setDuration(d);
    const seekTo = (window as any).__pendingSeek;
    if (seekTo && seekTo < d - 5) {
      // Lynx <video> 暂用 attribute 设置初值;但通常没提供 seek 方法
      // 这里仅记录,用户在 UI 上手动选集
    }
  }

  function onTimeUpdate(e: any) {
    const t = e?.detail?.currentTime || 0;
    setCurrent(t);
  }

  function onEnded() {
    // 自动保存并退出
    saveProgress(duration, duration);
    back();
  }

  function switchQuality(idx: number) {
    setActiveQuality(idx);
    setVideoUrl(qualities[idx].url);
  }

  if (loading) {
    return (
      <view className="player-page center">
        <LoadingView text="解析视频地址..." />
      </view>
    );
  }
  if (error || !videoUrl) {
    return (
      <view className="player-page center">
        <view style={{ padding: 24 }}>
          <ErrorView
            message={error || '无法解析视频'}
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
      {/*
        Lynx 没有内置 <video> 元素。
        实际播放需要 native module:
        - @sigx/lynx-video  (<video-player> 标签)
        - 或自定义原生播放器
        这里用 any 兜底,实际项目里替换为 <video-player src=...> 即可
      */}
      {renderVideo(videoUrl, poster, {
        bindtap: toggleControls,
        bindplay: () => setPaused(false),
        bindpause: () => {
          setPaused(true);
          saveProgress(current, duration);
        },
        bindended: onEnded,
        bindtimeupdate: onTimeUpdate,
        bindloadedmetadata: onLoaded,
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
            {qualities.length > 1 ? (
              <view
                className="player-btn"
                bindtap={() => {
                  // 简单循环切换清晰度
                  const next = (activeQuality + 1) % qualities.length;
                  switchQuality(next);
                }}
              >
                <text style={{ color: '#FFFFFF', fontSize: 12 }}>
                  {qualities[activeQuality].name}
                </text>
              </view>
            ) : null}
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
                bindtap={() => {
                  // 简单切换播放/暂停
                  // (Lynx <video> 元素在 native 层有 play/pause 方法,通过 ref 调用)
                  // 这里仅做 UI 反馈
                  setPaused((p) => !p);
                }}
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
