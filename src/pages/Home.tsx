// 首页 - 简洁版
import { useState, useEffect } from '@lynx-js/react';
import { loadSources } from '../lib/storage';
import { TopBar } from '../components/TopBar';

interface Props {
  onNav: (route: { name: 'home' | 'settings' | 'about' }) => void;
}

export function Home(props: Props) {
  const [count, setCount] = useState(0);
  const [sourcesN, setSourcesN] = useState(0);

  useEffect(() => {
    setSourcesN(loadSources().length);
  }, []);

  return (
    <view style="flex:1;background:#0a0a0a;">
      <TopBar title="Lumi" canBack={false} right="⚙" onRight={() => props.onNav({ name: 'settings' })} />

      <view style="padding:32px;flex:1;">

        <text style="color:#42b883;font-size:80px;font-weight:bold;">Lumi</text>
        <text style="color:#aaa;font-size:24px;margin-top:8px;">v0.3.0</text>

        <text style="color:#888;font-size:22px;margin-top:32px;line-height:36px;">
          一个 Lynx + ReactLynx 直播 App{"\n"}不用后端,所有源写在本地
        </text>

        <view style="height:24px;" />

        <view style="background:#131313;padding:24px;border-radius:14px;">
          <text style="color:#aaa;font-size:22px;">已配置的源</text>
          <text style="color:#42b883;font-size:48px;font-weight:bold;margin-top:8px;">{sourcesN}</text>
          <text style="color:#666;font-size:18px;margin-top:8px;">个</text>
        </view>

        <view style="flex:1;" />

        <view
          bindtap={() => props.onNav({ name: 'settings' })}
          style="padding:24px;background:#FF4757;border-radius:14px;align-items:center;margin-bottom:16px;"
        >
          <text style="color:#fff;font-size:30px;font-weight:bold;">⚙ 设置 · 配置源</text>
        </view>

        <view
          bindtap={() => props.onNav({ name: 'about' })}
          style="padding:18px;background:#222;border-radius:14px;align-items:center;"
        >
          <text style="color:#aaa;font-size:22px;">关于</text>
        </view>

        <view style="height:30px;" />

        <view style="padding:10px;background:#1a1a1a;border-radius:10px;">
          <text style="color:#666;font-size:18px;text-align:center;">点击计数 (v0.3.0 hook 测试) {count}</text>
          <view
            bindtap={() => setCount(count + 1)}
            style="margin-top:14px;padding:12px;background:#3455db;border-radius:8px;align-items:center;"
          >
            <text style="color:#fff;font-size:18px;">+1</text>
          </view>
        </view>

      </view>
    </view>
  );
}