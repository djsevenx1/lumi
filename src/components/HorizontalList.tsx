// 垂直滑动列表(横向布局视频海报) - LunaTV section 内容容器
interface Props {
  children: any;
}

export function HorizontalList(props: Props) {
  return (
    <scroll-view
      scroll-orientation="horizontal"
      style="padding:0 24px 16px;white-space:nowrap;"
    >
      {props.children}
    </scroll-view>
  );
}