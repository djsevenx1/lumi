// 入口 - 渲染根组件
import { root } from '@lynx-js/react';
import { App } from './App';

root.render(<App />);

console.log('[LUMI_BOOT_OK]', new Date().toISOString());