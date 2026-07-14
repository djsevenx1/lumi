// App 主壳 - 4 个 tab 切换
import { useState } from '@lynx-js/react';
import { Home } from './pages/Home';
import { Sources } from './pages/Sources';
import { Favorites } from './pages/Favorites';
import { Me } from './pages/Me';
import type { Tab } from './components/BottomNav';

export function App() {
  const [tab, setTab] = useState<Tab>('home');

  return (
    <view style="flex:1;background:#000;">
      {tab === 'home' && <Home active={tab} onTab={setTab} />}
      {tab === 'sources' && <Sources active={tab} onTab={setTab} />}
      {tab === 'favorites' && <Favorites active={tab} onTab={setTab} />}
      {tab === 'me' && <Me active={tab} onTab={setTab} />}
    </view>
  );
}