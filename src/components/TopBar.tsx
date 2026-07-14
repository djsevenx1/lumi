// 顶部标题栏 - LunaTV 风格
import { theme } from '../lib/theme';

interface Props {
  title: string;
  canBack: boolean;
  onBack?: () => void;
  right?: { label: string; onClick: () => void };
}

export function TopBar(props: Props) {
  const c = theme.colors;
  const r = theme.radius;
  return (
    <view
      style="height:96px;flex-direction:row;align-items:center;justify-content:space-between;padding:24px 24px;background:#000;"
    >
      <view
        bindtap={props.canBack && props.onBack ? props.onBack : undefined}
        style={props.canBack
          ? `padding:10px 16px;background:${c.surfaceVariant};border-radius:${r.md};border:1px solid ${c.border};`
          : 'width:48px;'
        }
      >
        <text style={`color:${c.text};font-size:${theme.font.body};font-weight:700;`}>
          {props.canBack ? '← 返回' : ''}
        </text>
      </view>
      <text
        style={`color:${c.text};font-size:${theme.font.h3};font-weight:bold;flex:1;text-align:center;`}
      >
        {props.title}
      </text>
      {props.right ? (
        <view
          bindtap={props.right.onClick}
          style={`padding:10px 16px;background:${c.surfaceVariant};border-radius:${r.md};border:1px solid ${c.border};`}
        >
          <text style={`color:${c.primary};font-size:${theme.font.body};font-weight:700;`}>
            {props.right.label}
          </text>
        </view>
      ) : (
        <view style="width:48px;" />
      )}
    </view>
  );
}