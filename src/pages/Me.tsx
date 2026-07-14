// 我的页面 - LunaTV 风格占位
import { theme } from '../lib/theme';
import { BottomNav, type Tab } from '../components/BottomNav';

interface Props {
  onTab: (t: Tab) => void;
  active: Tab;
}

export function Me(props: Props) {
  const c = theme.colors;
  return (
    <view style="flex:1;background:#000;">
      {/* 头部 */}
      <view style={`padding:32px 24px;background-image:linear-gradient(135deg, ${c.primary}30, ${c.primaryDark}10);flex-direction:row;align-items:center;`}>
        <view
          style={`width:72px;height:72px;background-image:linear-gradient(135deg, ${c.primary}, ${c.primaryLight});border-radius:36px;align-items:center;justify-content:center;`}
        >
          <text style="color:#000;font-size:32px;font-weight:bold;">我</text>
        </view>
        <view style="margin-left:18px;">
          <text style={`color:${c.text};font-size:26px;font-weight:bold;`}>Lumi 用户</text>
          <text style={`color:${c.textSec};font-size:14px;margin-top:4px;`}>v0.3.4</text>
        </view>
      </view>

      <view style="flex:1;">
        {/* 功能列表 */}
        <MenuItem icon="🎨" label="外观主题" sub="跟随系统 / 深色 / 浅色" />
        <MenuItem icon="🔔" label="通知" sub="更新提醒 / 推送" />
        <MenuItem icon="🗑" label="清除缓存" sub="释放磁盘空间" />
        <MenuItem icon="ℹ" label="关于 Lumi" sub="v0.3.4 - 用 ReactLynx 编写" />

        <view style="height:32px;" />

        <view style="padding:0 24px;">
          <text style={`color:${c.textMuted};font-size:13px;line-height:18px;text-align:center;`}>
            Lynx · ReactLynx · 本地优先
          </text>
        </view>
      </view>

      <BottomNav active={props.active} onChange={props.onTab} />
    </view>
  );
}

function MenuItem(props: { icon: string; label: string; sub?: string }) {
  const c = theme.colors;
  return (
    <view
      bindtap={() => {}}
      style={`margin:8px 24px;background:${c.surface};border-radius:14px;padding:18px;flex-direction:row;align-items:center;border:1px solid ${c.border};`}
    >
      <text style="font-size:28px;margin-right:16px;">{props.icon}</text>
      <view style="flex:1;">
        <text style={`color:${c.text};font-size:17px;font-weight:bold;`}>{props.label}</text>
        {props.sub ? (
          <text style={`color:${c.textSec};font-size:13px;margin-top:4px;`}>{props.sub}</text>
        ) : null}
      </view>
      <text style={`color:${c.textMuted};font-size:24px;`}>›</text>
    </view>
  );
}