// 视频卡片 - LunaTV 海报风格
import { theme } from '../lib/theme';

export interface VideoCardData {
  id: string;
  title: string;
  poster?: string;        // URL
  source?: string;        // 源的显示名
  rating?: number;        // 7.5
  year?: string;
  badge?: string;         // "HD" / "8.0 分"
}

interface Props {
  data: VideoCardData;
  onClick?: () => void;
}

export function VideoCard(props: Props) {
  const c = theme.colors;
  return (
    <view
      bindtap={props.onClick}
      style="width:280px;margin-right:14px;flex-direction:column;"
    >
      {/* 海报占位 */}
      <view
        style={`width:280px;height:380px;background:${c.surfaceVariant};border-radius:14px;align-items:center;justify-content:center;overflow:hidden;`}
      >
        <text style="font-size:80px;">🎬</text>
        {props.data.badge ? (
          <view
            style={`position:absolute;top:8px;left:8px;padding:4px 8px;background:${c.primary};border-radius:6px;margin:8px;`}
          >
            <text style={`color:#000;font-size:12px;font-weight:bold;`}>{props.data.badge}</text>
          </view>
        ) : null}
        {props.data.rating ? (
          <view
            style={`position:absolute;top:8px;right:8px;padding:4px 8px;background:${c.rating};border-radius:6px;margin:8px;`}
          >
            <text style="color:#FFF;font-size:14px;font-weight:bold;">⭐ {props.data.rating}</text>
          </view>
        ) : null}
      </view>
      {/* 信息 */}
      <text
        style={`color:${c.text};font-size:16px;font-weight:bold;margin-top:10px;line-height:20px;`}
      >
        {props.data.title}
      </text>
      <view style="flex-direction:row;align-items:center;margin-top:6px;">
        {props.data.source ? (
          <text style={`color:${c.textSec};font-size:13px;`}>{props.data.source}</text>
        ) : null}
        {props.data.year ? (
          <text style={`color:${c.textMuted};font-size:13px;margin-left:6px;`}>· {props.data.year}</text>
        ) : null}
      </view>
    </view>
  );
}