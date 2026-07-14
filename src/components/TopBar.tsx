// 顶部标题栏
interface Props {
  title: string;
  canBack: boolean;
  onBack?: () => void;
  right?: string;
  onRight?: () => void;
}

export function TopBar(props: Props) {
  return (
    <view style="height:80px;flex-direction:row;align-items:center;justify-content:space-between;padding:24px 28px;background:#0a0a0a;">
      <view
        bindtap={props.canBack && props.onBack ? props.onBack : undefined}
        style={props.canBack ? "padding:8px 12px;background:#222;border-radius:8px;" : "width:0;"}
      >
        <text style="color:#42b883;font-size:28px;">{props.canBack ? '← 返回' : ''}</text>
      </view>
      <text style="color:#fff;font-size:32px;font-weight:bold;flex:1;text-align:center;">{props.title}</text>
      <view
        bindtap={props.onRight}
        style={props.onRight ? "padding:8px 14px;background:#222;border-radius:8px;" : "width:0;"}
      >
        <text style="color:#42b883;font-size:26px;">{props.right || ''}</text>
      </view>
    </view>
  );
}