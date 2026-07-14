// v0.2.4 - 测试 hook + state + tap
import { useState } from '@lynx-js/react';
import { root } from '@lynx-js/react';

// 必须 export 才能被 index.tsx re-export
export function App() {
  const [count] = useState(0);
  return (
    <view style="flex:1;background:#0a0a0a;justify-content:center;align-items:center;">
      <text style="color:#42b883;font-size:36px;font-weight:bold;">Lumi OK</text>
      <text style="color:#aaa;font-size:18px;margin-top:12px;">v0.2.4 hook test</text>
      <view style="margin-top:32px;padding:14px 28px;background:#FF4757;border-radius:24px;">
        <text style="color:#FFF;font-size:18px;">点我 {count}</text>
      </view>
    </view>
  );
}

root.render(<App />);

console.log('[LUMI_BOOT_OK]', new Date().toISOString());