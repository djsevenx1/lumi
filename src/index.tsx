// v0.2.3 入口 - 极致简化
import { root } from '@lynx-js/react';
import { Hello } from './App';

root.render(<Hello />);

console.log('[LUMI_BOOT_OK]', new Date().toISOString());