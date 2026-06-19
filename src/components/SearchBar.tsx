// 搜索栏 - Selene 浅色风格
import { useState } from '@lynx-js/react';

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
  const [resetKey, setResetKey] = useState(0);
  return (
    <view className="search-bar">
      <text className="search-bar-icon">🔍</text>
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
          className="search-clear-btn"
        >
          <text className="search-clear-text">✕</text>
        </view>
      ) : null}
    </view>
  );
}
