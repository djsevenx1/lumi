// 关于页
import { TopBar } from '../components/TopBar';

interface Props {
  onNav: (route: { name: 'home' | 'settings' | 'about' }) => void;
}

export function About(props: Props) {
  return (
    <view style="flex:1;background:#0a0a0a;">
      <TopBar title="关于" canBack={true} onBack={() => props.onNav({ name: 'home' })} />
      <view style="padding:32px;">
        <text style="color:#42b883;font-size:60px;font-weight:bold;">Lumi</text>
        <text style="color:#fff;font-size:28px;margin-top:8px;">v0.3.0</text>

        <view style="height:32px;" />

        <text style="color:#aaa;font-size:24px;line-height:40px;">用 Lynx + ReactLynx 写的小 App</text>
        <text style="color:#888;font-size:22px;margin-top:16px;line-height:36px;">
          本地优先, 没有后端依赖{"\n"}所有视频源都在设置里手动填
        </text>

        <view style="height:32px;" />

        <text style="color:#666;font-size:18px;">github.com/djsevenx1/lumi</text>
      </view>
    </view>
  );
}