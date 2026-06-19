// 底部 Tab Bar
import { useRoute, navigate, TABS, type Route } from '../lib/router';

export function TabBar() {
  const [route] = useRoute();

  function isActive(name: Route['name']): boolean {
    if (route.name === 'category') return name === 'home';
    return route.name === name;
  }

  return (
    <view className="tab-bar">
      {TABS.map((tab) => {
        const active = isActive(tab.name);
        return (
          <view
            key={tab.name}
            className="tab-item"
            bindtap={() => navigate({ name: tab.name } as Route)}
          >
            <text className="tab-icon">{tab.icon}</text>
            <text className={active ? 'tab-label tab-label-active' : 'tab-label'}>
              {tab.label}
            </text>
          </view>
        );
      })}
    </view>
  );
}
