// 胶囊开关 - LunaTV Web 同款
// 3 段渐变指示器(蓝紫粉 from-blue-500 via-purple-500 to-pink-500)
// 滑动指示器 + 渐变激活背景
import { useEffect, useRef, useState } from '@lynx-js/react';

interface CapsuleSwitchProps {
  options: Array<{ label: string; value: string }>;
  active: string;
  onChange: (value: string) => void;
}

export function CapsuleSwitch({ options, active, onChange }: CapsuleSwitchProps) {
  const containerRef = useRef<any>(null);
  const [activeIdx, setActiveIdx] = useState(
    Math.max(
      0,
      options.findIndex((o) => o.value === active),
    ),
  );
  const [count, setCount] = useState(options.length);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const idx = Math.max(0, options.findIndex((o) => o.value === active));
    setActiveIdx(idx);
  }, [active, options]);

  useEffect(() => {
    setCount(options.length);
    // 等布局稳定再显示指示器
    const t = setTimeout(() => setReady(true), 50);
    return () => clearTimeout(t);
  }, [options]);

  // 指示器宽度:容器均分,左偏移按段数
  const widthPct = 100 / count;
  const leftPct = activeIdx * widthPct;

  return (
    <view className="capsule-switch">
      <view
        ref={containerRef}
        className="capsule-switch-inner"
      >
        {ready ? (
          <view
            className="capsule-switch-indicator"
            style={{
              width: `${widthPct}%`,
              left: `${leftPct}%`,
            }}
          />
        ) : null}
        {options.map((opt, i) => {
          const isActive = i === activeIdx;
          return (
            <view
              key={opt.value}
              className="capsule-switch-item"
              bindtap={() => onChange(opt.value)}
            >
              <text
                className={
                  isActive
                    ? 'capsule-switch-text capsule-switch-text-active'
                    : 'capsule-switch-text'
                }
              >
                {opt.label}
              </text>
            </view>
          );
        })}
      </view>
    </view>
  );
}
