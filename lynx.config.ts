import { defineConfig } from '@lynx-js/rspeedy'

import { pluginQRCode } from '@lynx-js/qrcode-rsbuild-plugin'
import { pluginReactLynx } from '@lynx-js/react-rsbuild-plugin'
import { pluginTypeCheck } from '@rsbuild/plugin-type-check'

export default defineConfig({
  plugins: [
    pluginQRCode({
      schema(url) {
        // We use `?fullscreen=true` to open the page in LynxExplorer in full screen mode
        return `${url}?fullscreen=true`
      },
    }),
    pluginReactLynx({
      // Lynx 默认不继承普通 CSS 属性(color/font-size/font-weight 等),
      // 必须显式开启,否则父元素设的文字样式不会传递给子 text 元素,
      // 导致大面积样式失效、布局错位。
      enableCSSInheritance: true,
    }),
    pluginTypeCheck(),
  ],
})
