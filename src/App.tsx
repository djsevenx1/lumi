// v0.2.3 主壳 - 极度简化,只测 Lynx 引擎能否起来
import { root } from '@lynx-js/react';

export function Hello() {
  return (
    <view style="flex:1;background:#0a0a0a;justify-content:center;align-items:center;">
      <text style="color:#42b883;font-size:36px;font-weight:bold;">Lumi OK</text>
      <text style="color:#888;font-size:18px;margin-top:18px;">v0.2.3 boot</text>
    </view>
  );
}

root.render(<Hello />);