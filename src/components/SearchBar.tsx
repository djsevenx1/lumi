import { createElement } from '@lynx-js/react';
import { theme } from '../lib/theme';

interface Props {
  placeholder?: string;
  value?: string;
  onInput?: (v: string) => void;
  onSubmit?: (v: string) => void;
}

export function SearchBar(props: Props) {
  const c = theme.colors;
  return (
    <view style="padding:16px 24px 8px;">
      <view
        style={`height:56px;background:${c.surfaceVariant};border-radius:14px;border:1px solid ${c.border};flex-direction:row;align-items:center;padding:0 16px;`}
      >
        <text style="font-size:24px;margin-right:10px;">🔍</text>
        {createElement(
          'input',
          {
            value: props.value || '',
            placeholder: props.placeholder || '搜索...',
            bindinput: (e: any) => props.onInput?.(e.detail.value || ''),
            bindconfirm: (e: any) => props.onSubmit?.(e.detail.value || ''),
            style: `flex:1;color:${c.text};font-size:18px;background:transparent;`,
          } as any
        )}
      </view>
    </view>
  );
}