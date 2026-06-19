// 底部 Tab Bar - Selene iOS 5 项风格
import { useRoute, navigate, TABS, type Route } from '../lib/router';

const TYPE_FOR_TAB: Record<string, string> = {
  电影: 'movie',
  剧集: 'tv',
  动漫: 'anime',
};

export function TabBar() {
  const [route] = useRoute();

  function isActive(tabName: Route['name'], tabLabel: string): boolean {
    // category 分类项的激活态:当前路由是 category 且 type 匹配
    if (tabName === 'category') {
      if (route.name === 'category') {
        return TYPE_FOR_TAB[tabLabel] === (route as any).type;
      }
      return false;
    }
    if (tabName === 'home') {
      return route.name === 'home';
    }
    if (tabName === 'my') {
      return route.name === 'my';
    }
    return route.name === tabName;
  }

  function onTabTap(tabName: Route['name'], tabLabel: string) {
    if (tabName === 'category') {
      const type = TYPE_FOR_TAB[tabLabel] || 'movie';
      navigate({ name: 'category', type } as Route);
    } else {
      navigate({ name: tabName } as Route);
    }
  }

  return (
    <view className="tab-bar">
      {TABS.map((tab) => {
        const active = isActive(tab.name, tab.label);
        return (
          <view
            key={`${tab.name}-${tab.label}`}
            className="tab-item"
            bindtap={() => onTabTap(tab.name, tab.label)}
          >
            <text
              className={active ? 'tab-icon tab-icon-active' : 'tab-icon'}
            >
              {tab.icon}
            </text>
            <text
              className={active ? 'tab-label tab-label-active' : 'tab-label'}
            >
              {tab.label}
            </text>
          </view>
        );
      })}
    </view>
  );
}
