// 收藏 - LunaTV 风格占位
import { theme } from '../lib/theme';
import { BottomNav, type Tab } from '../components/BottomNav';

interface Props {
  onTab: (t: Tab) => void;
  active: Tab;
}

export function Favorites(props: Props) {
  const c = theme.colors;
  return (
    <view style="flex:1;background:#000;">
      <view style="padding:24px;background:#000;">
        <text style={`color:${c.text};font-size:32px;font-weight:bold;`}>收藏</text>
      </view>

      <view style="flex:1;align-items:center;justify-content:center;padding:48px;">
        <text style="font-size:80px;">⭐</text>
        <text style={`color:${c.text};font-size:24px;font-weight:bold;margin-top:24px;`}>
          暂无收藏
        </text>
        <text style={`color:${c.textSec};font-size:15px;margin-top:12px;text-align:center;line-height:24px;`}>
          看到喜欢的影片{"\n"}点 ⭐ 加到这儿
        </text>
      </view>

      <BottomNav active={props.active} onChange={props.onTab} />
    </view>
  );
}