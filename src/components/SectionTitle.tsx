// 通用渐变色枚举
export type SectionColor = 'amber' | 'blue' | 'pink' | 'purple' | 'green' | 'red';

const COLOR_TABLE: Record<SectionColor, [string, string]> = {
  amber: ['#F59E0B', '#F97316'],
  blue: ['#3B82F6', '#06B6D4'],
  pink: ['#EC4899', '#F43F5E'],
  purple: ['#A855F7', '#EC4899'],
  green: ['#22C55E', '#10B981'],
  red: ['#EF4444', '#F43F5E'],
};

export function getColors(c: SectionColor): [string, string] {
  return COLOR_TABLE[c];
}

interface Props {
  title: string;
  subtitle?: string;
  icon: string;       // emoji 或 unicode, 没图标库就用 emoji
  color: SectionColor;
  moreText?: string;  // 默认"查看全部"
  onMore?: () => void;
}

export function SectionTitle(props: Props) {
  const [g1, g2] = getColors(props.color);
  const c = {
    text: '#E5E7EB',
    textSec: '#9CA3AF',
    primary: '#22C55E',
  };
  return (
    <view style="padding:20px 24px 12px;flex-direction:row;align-items:center;">
      {/* 渐变徽章 */}
      <view
        style={`width:44px;height:44px;background-image:linear-gradient(135deg, ${g1}, ${g2});border-radius:12px;align-items:center;justify-content:center;box-shadow:0 4px 16px ${g1}30;`}
      >
        <text style="color:#FFF;font-size:24px;">{props.icon}</text>
      </view>
      {/* 标题+副标题 */}
      <view style="flex:1;margin-left:14px;">
        <text style={`color:${c.text};font-size:22px;font-weight:bold;line-height:28px;`}>
          {props.title}
        </text>
        {props.subtitle ? (
          <text style={`color:${c.textSec};font-size:14px;margin-top:4px;line-height:18px;`}>
            {props.subtitle}
          </text>
        ) : null}
      </view>
      {/* 查看全部 */}
      {props.onMore ? (
        <view bindtap={props.onMore} style="padding:6px 10px;">
          <text style={`color:${c.primary};font-size:14px;`}>{props.moreText || '查看全部 ›'}</text>
        </view>
      ) : null}
    </view>
  );
}