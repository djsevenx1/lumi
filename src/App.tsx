// 应用主壳 - 路由分发 + 底部 Tab Bar
import { useRoute, isTabRoute } from './lib/router';
import { TabBar } from './components/TabBar';
import { HomePage } from './pages/HomePage';
import { SearchPage } from './pages/SearchPage';
import { DetailPage } from './pages/DetailPage';
import { PlayerPage } from './pages/PlayerPage';
import { MyPage } from './pages/MyPage';
import { LoginPage } from './pages/LoginPage';
import { SettingsPage } from './pages/SettingsPage';
import { CategoryPage } from './pages/CategoryPage';
import { useConfig } from './store';
import { navigate } from './lib/router';
import { useEffect } from '@lynx-js/react';
import './App.css';

export function App() {
  const [route] = useRoute();
  const [config] = useConfig();

  // 首次启动若未配置,自动跳到设置
  useEffect(() => {
    if (!config.apiBase) {
      navigate({ name: 'settings' });
    }
  }, []);

  function renderRoute() {
    switch (route.name) {
      case 'home':
        return <HomePage />;
      case 'search':
        return <SearchPage />;
      case 'my':
        return <MyPage />;
      case 'settings':
        return <SettingsPage />;
      case 'login':
        return <LoginPage />;
      case 'detail':
        return <DetailPage source={route.source} id={route.id} />;
      case 'play':
        return (
          <PlayerPage
            source={route.source}
            id={route.id}
            episode={route.episode}
            title={route.title}
            poster={route.poster}
          />
        );
      case 'category':
        return <CategoryPage type={route.type} />;
      default:
        return <HomePage />;
    }
  }

  const showTab = isTabRoute(route);

  return (
    <view className="app-root">
      {renderRoute()}
      {showTab ? <TabBar /> : null}
    </view>
  );
}
