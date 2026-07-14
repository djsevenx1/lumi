// v0.2.4 - 测试 hook + state + tap
import { useState } from '@lynx-js/react';
import { root } from '@lynx-js/react';

function App() {
  const [count, setCount] = useState(0);
  return (
    <view style="flex:1;background:#0a0a0a;justify-content:center;align-items:center;">
      <text style="color:#42b883;font-size:36px;font-weight:bold;">Lumi OK</text>
      <text style="color:#aaa;font-size:18px;margin-top:12px;">v0.2.4 hook test</text>
      <view
        bindtap={() => setCount(count + 1)}
        style="margin-top:32px;padding:14px 28px;background:#FF4757;border-radius:24px;"
      >
        <text style="color:#FFF;font-size:18px;">点我 {count}</text>
      </view>
      <text style="color:#666;font-size:13px;margin-top:24px;">点击测试交互</text>
    </view>
  );
}

root.render(<App />);

console.log('[LUMI_BOOT_OK]', new Date().toISOString());