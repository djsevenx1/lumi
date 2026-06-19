// 可插拔视频播放器组件
// 直接使用 <video-player> intrinsic element(由 @sigx/lynx-video 注册)
// 在原生端需要 sigx prebuild 注册元素;Web 端会静默不渲染
//
// 将来 Lynx 官方出 video 元素后,只需改这里的标签名

// video-player 元素的属性类型
// 对齐 @sigx/lynx-video 的 jsx-augment 声明
export interface VideoPlayerProps {
  src?: string;
  poster?: string;
  autoplay?: boolean;
  playing?: boolean;
  loop?: boolean;
  muted?: boolean;
  volume?: number;
  controls?: boolean;
  'resize-mode'?: 'contain' | 'cover' | 'stretch';
  style?: Record<string, string | number>;
  'bindload'?: (e: { detail: { durationMs: number; width: number; height: number } }) => void;
  'bindend'?: (e: any) => void;
  'binderror'?: (e: { detail: { message: string } }) => void;
  'bindtimeupdate'?: (e: { detail: { positionMs: number } }) => void;
}

// 声明 video-player 为 JSX intrinsic element
// @lynx-js/react 的 JSX.IntrinsicElements 继承自 @lynx-js/types 的 IntrinsicElements
declare module '@lynx-js/types' {
  interface IntrinsicElements {
    'video-player': VideoPlayerProps;
  }
}

interface Props {
  src: string;
  poster?: string;
  autoplay?: boolean;
  playing?: boolean;
  controls?: boolean;
  muted?: boolean;
  loop?: boolean;
  volume?: number;
  resizeMode?: 'contain' | 'cover' | 'stretch';
  style?: Record<string, string | number>;
  onLoad?: (e: { detail: { durationMs: number; width: number; height: number } }) => void;
  onEnd?: (e: any) => void;
  onError?: (e: { detail: { message: string } }) => void;
  onTimeUpdate?: (e: { detail: { positionMs: number } }) => void;
}

// 可插拔视频播放器
// 优先渲染 <video-player>(原生端 sigx prebuild 后可用)
// Web 端元素不存在时显示占位
export function VideoPlayer(props: Props) {
  const {
    src,
    poster,
    autoplay,
    playing,
    controls = true,
    muted,
    loop,
    volume,
    resizeMode = 'contain',
    style,
    onLoad,
    onEnd,
    onError,
    onTimeUpdate,
  } = props;

  return (
    <video-player
      src={src}
      poster={poster}
      autoplay={autoplay}
      playing={playing}
      controls={controls}
      muted={muted}
      loop={loop}
      volume={volume}
      resize-mode={resizeMode}
      style={style || { width: '100%', height: '100%' }}
      bindload={onLoad}
      bindend={onEnd}
      binderror={onError}
      bindtimeupdate={onTimeUpdate}
    />
  );
}
