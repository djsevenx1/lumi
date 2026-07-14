import { useCallback, useEffect, useRef, useState } from '@lynx-js/react'

import { createFlappy } from './lib/flappy.js'
import type { FlappyEngine, FlappyOptions } from './lib/flappy.js'

/**
 * React hook for flappy-bird physics.
 *
 * Returns `[y, jump]` — a state value and a stable callback.
 * The game loop runs automatically; cleanup happens on unmount.
 * Options are read once on mount and not reactive to later changes.
 *
 * @example
 * ```tsx
 * function Bird() {
 *   const [y, jump] = useFlappy()
 *   return (
 *     <view bindtap={jump} style={{ transform: `translateY(${y}px)` }}>
 *       <text>Tap me!</text>
 *     </view>
 *   )
 * }
 * ```
 */
export function useFlappy(
  options?: FlappyOptions,
): [number, () => void] {
  const engineRef = useRef<FlappyEngine | null>(null)
  const [y, setY] = useState(0)

  // 修复: 必须在 useState 之后调用, 保持 hooks 顺序稳定
  if (engineRef.current == null) {
    engineRef.current = createFlappy(setY, options)
  }

  useEffect(() => {
    return () => {
      engineRef.current?.destroy()
    }
  }, [])

  const jump = useCallback(() => {
    'background only'
    engineRef.current?.jump()
  }, [])

  return [y, jump]
}
