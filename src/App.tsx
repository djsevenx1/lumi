// App 主壳 - 切换三个页面
import { useState } from '@lynx-js/react';
import { Home } from './pages/Home';
import { Settings } from './pages/Settings';
import { About } from './pages/About';

export function App() {
  const [route, setRoute] = useState<{ name: 'home' | 'settings' | 'about' }>({ name: 'home' });

  return (
    <view style="flex:1;background:#0a0a0a;">
      {route.name === 'home' && <Home onNav={setRoute} />}
      {route.name === 'settings' && <Settings onNav={setRoute} />}
      {route.name === 'about' && <About onNav={setRoute} />}
    </view>
  );
}