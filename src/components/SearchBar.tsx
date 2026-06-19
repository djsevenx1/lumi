// 搜索栏
import { useState, useCallback } from '@lynx-js/react';

interface Props {
  value: string;
  onChange: (v: string) => void;
  onSubmit: (v: string) => void;
  placeholder?: string;
  autoFocus?: boolean;
}

export function SearchBar({
  value,
  onChange,
  onSubmit,
  placeholder = '搜索影视...',
  autoFocus,
}: Props) {
  // 用 key 强制重置 input(因为 Lynx input 没有 value 属性)
  const [resetKey, setResetKey] = useState(0);
  return (
    <view className="search-bar">
      <text style={{ fontSize: 18 }}>🔍</text>
      <input
        key={`search-${resetKey}`}
        className="search-input"
        placeholder={placeholder}
        placeholder-class="input-placeholder"
        confirm-type="search"
        auto-focus={autoFocus}
        bindinput={(e: any) => onChange(e.detail.value)}
        bindconfirm={(e: any) => onSubmit(e.detail.value)}
      />
      {value ? (
        <view
          bindtap={() => {
            onChange('');
            setResetKey((k) => k + 1);
          }}
        >
          <text style={{ color: '#A0A0B8', fontSize: 16, padding: 4 }}>✕</text>
        </view>
      ) : null}
    </view>
  );
}
