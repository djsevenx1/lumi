// 搜索栏 - 对齐 LunaTV 搜索框风格
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
      <text style={{ fontSize: 18, color: '#6b7280' }}>🔍</text>
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
          style={{
            width: 28,
            height: 28,
            borderRadius: 14,
            backgroundColor: 'rgba(255,255,255,0.1)',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <text style={{ color: '#6b7280', fontSize: 14 }}>✕</text>
        </view>
      ) : null}
    </view>
  );
}
