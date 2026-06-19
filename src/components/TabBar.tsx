// 底部 Tab Bar - LunaTV MobileBottomNav 同款
// 8 项:首页/源浏览/电影/剧集/短剧/动漫/综艺/直播
// Netflix 风格:黑底 + 灰白文字(激活态 = 白色)
import { useRoute, navigate, type Route } from '../lib/router';

interface TabDef {
  name: string; // 路由名或特殊 'source-browser' / 'live' / 'shortdrama'
  label: string;
  icon: string;
  // 激活时,根据当前路由 type 匹配激活态
  matchType?: string;
  // 自定义跳转
  to?: Route;
}

const TABS: TabDef[] = [
  { name: 'home', label: '首页', icon: '🏠' },
  { name: 'source', label: '源浏览', icon: '🌐' },
  { name: 'category', label: '电影', icon: '🎬', matchType: 'movie' },
  { name: 'category', label: '剧集', icon: '📺', matchType: 'tv' },
  { name: 'shortdrama', label: '短剧', icon: '🎞' },
  { name: 'category', label: '动漫', icon: '🌸', matchType: 'anime' },
  { name: 'category', label: '综艺', icon: '🎭', matchType: 'variety' },
  { name: 'live', label: '直播', icon: '📡' },
];

export function TabBar() {
  const [route] = useRoute();

  function isActive(tab: TabDef): boolean {
    if (tab.name === 'home' && route.name === 'home') return true;
    if (tab.name === 'source' && (route as any).name === 'source-browser') return true;
    if (tab.name === 'shortdrama' && (route as any).name === 'shortdrama') return true;
    if (tab.name === 'live' && (route as any).name === 'live') return true;
    if (tab.name === 'category' && route.name === 'category') {
      return tab.matchType === (route as any).type;
    }
    return false;
  }

  function onTabTap(tab: TabDef) {
    if (tab.name === 'home') {
      navigate({ name: 'home' });
      return;
    }
    if (tab.name === 'source') {
      // 暂无 source-browser 路由,跳到分类页
      navigate({ name: 'category', type: 'movie' } as Route);
      return;
    }
    if (tab.name === 'category' && tab.matchType) {
      navigate({ name: 'category', type: tab.matchType } as Route);
      return;
    }
    if (tab.name === 'shortdrama') {
      // 暂无 shortdrama 路由,跳到剧集分类
      navigate({ name: 'category', type: 'tv' } as Route);
      return;
    }
    if (tab.name === 'live') {
      // 暂无 live 路由,跳到电影分类
      navigate({ name: 'category', type: 'movie' } as Route);
      return;
    }
  }

  return (
    <scroll-view scroll-x show-scrollbar={false} className="tab-bar-scroll">
      <view className="tab-bar">
        {TABS.map((tab, idx) => {
          const active = isActive(tab);
          return (
            <view
              key={`${tab.name}-${tab.label}-${idx}`}
              className="tab-item"
              bindtap={() => onTabTap(tab)}
            >
              <text className={active ? 'tab-icon tab-icon-active' : 'tab-icon'}>
                {tab.icon}
              </text>
              <text className={active ? 'tab-label tab-label-active' : 'tab-label'}>
                {tab.label}
              </text>
            </view>
          );
        })}
      </view>
    </scroll-view>
  );
}
