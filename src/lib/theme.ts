// LunaTV 风格设计常量
export const theme = {
  // 颜色
  colors: {
    primary: '#22C55E',           // 主色绿(Tailwind green-500)
    primaryLight: '#4ADE80',
    primaryDark: '#16A34A',

    // 暗色主题
    bg: '#000000',
    surface: '#111111',
    surfaceVariant: '#1E1E1E',
    card: '#1E1E1E',
    border: '#374151',
    text: '#E5E7EB',
    textSec: '#9CA3AF',
    textMuted: '#6B7280',

    // 状态色
    danger: '#EF4444',
    warn: '#F59E0B',
    rating: '#EC4899',

    // 渐变色组 (与 section 对应)
    grads: {
      amber: ['#F59E0B', '#F97316'],   // 电影
      blue: ['#3B82F6', '#06B6D4'],    // 剧集
      pink: ['#EC4899', '#F43F5E'],    // 番剧
      purple: ['#A855F7', '#EC4899'],  // 综艺
      green: ['#22C55E', '#10B981'],   // 即将上映
      red: ['#EF4444', '#F43F5E'],     // 短剧
    },
  },

  // 圆角
  radius: {
    xs: '6px',
    sm: '8px',
    md: '10px',
    lg: '12px',
    xl: '16px',
    pill: '999px',
  },

  // 间距
  space: {
    x1: '4px',
    x2: '8px',
    x3: '12px',
    x4: '16px',
    x5: '20px',
    x6: '24px',
    x8: '32px',
  },

  // 字体
  font: {
    h1: '40px',
    h2: '32px',
    h3: '24px',
    title: '20px',
    body: '16px',
    caption: '14px',
    small: '12px',
  },
};
