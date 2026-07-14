// 底部导航栏 - LunaTV 风格
import { theme } from '../lib/theme';

export type Tab = 'home' | 'sources' | 'favorites' | 'me';

interface Item {
  key: Tab;
  label: string;
  icon: string;
}

const TABS: Item[] = [
  { key: 'home', label: '首页', icon: '🏠' },
  { key: 'sources', label: '源', icon: '📡' },
  { key: 'favorites', label: '收藏', icon: '⭐' },
  { key: 'me', label: '我的', icon: '👤' },
];

interface Props {
  active: Tab;
  onChange: (k: Tab) => void;
}

export function BottomNav(props: Props) {
  const c = theme.colors;
  return (
    <view
      style={`height:84px;flex-direction:row;background:#0A0A0A;border-top:1px solid ${c.surfaceVariant};padding-bottom:8px;`}
    >
      {TABS.map((t) => {
        const active = t.key === props.active;
        const color = active ? c.primary : c.textMuted;
        return (
          <view
            key={t.key}
            bindtap={() => props.onChange(t.key)}
            style="flex:1;flex-direction:column;align-items:center;justify-content:center;padding:8px;"
          >
            <text style={`font-size:28px;line-height:32px;${active ? `color:${color};` : ''}`}>
              {t.icon}
            </text>
            <text
              style={`color:${color};font-size:12px;font-weight:${active ? 'bold' : 'normal'};margin-top:4px;line-height:14px;`}
            >
              {t.label}
            </text>
          </view>
        );
      })}
    </view>
  );
}