// 首页 - LunaTV 风格
import { useState, useEffect } from '@lynx-js/react';
import { loadSources } from '../lib/storage';
import type { VideoSource } from '../lib/types';
import { theme } from '../lib/theme';
import { SearchBar } from '../components/SearchBar';
import { SectionTitle } from '../components/SectionTitle';
import { VideoCard } from '../components/VideoCard';
import { HorizontalList } from '../components/HorizontalList';
import { BottomNav, type Tab } from '../components/BottomNav';

interface Props {
  onTab: (t: Tab) => void;
  active: Tab;
}

const SAMPLE_HOT = [
  { id: '1', title: '示例 · 4K 影片', source: '默认源', year: '2025', rating: 8.5, badge: 'HD' },
  { id: '2', title: '示例 · 热门剧集', source: '示例源', year: '2024', rating: 7.9 },
  { id: '3', title: '示例 · 连续剧', source: '示例源', year: '2023', rating: 8.1, badge: '1080p' },
];

const SAMPLE_TV = [
  { id: '4', title: '示例 · 国产剧', source: '示例源', year: '2025', rating: 8.3 },
  { id: '5', title: '示例 · 美剧精选', source: '示例源', year: '2024', rating: 9.0, badge: '4K' },
];

const SAMPLE_MOVIE = [
  { id: '6', title: '示例 · 大片', source: '示例源', year: '2024', rating: 8.7, badge: 'HD' },
];

export function Home(props: Props) {
  const [sources, setSources] = useState<VideoSource[]>([]);
  const [q, setQ] = useState('');

  useEffect(() => {
    setSources(loadSources());
  }, []);

  const c = theme.colors;
  const hasSources = sources.length > 0;

  return (
    <view style="flex:1;background:#000;">
      {/* 顶部 AppBar - LunaTV 风格:搜索框 + 用户头像 */}
      <view style={`background:#000;padding:24px 24px 8px;flex-direction:row;align-items:center;`}>
        <text style={`color:${c.primary};font-size:32px;font-weight:bold;`}>Lumi</text>
        <view style="flex:1;" />
        <view
          style={`width:48px;height:48px;background-image:linear-gradient(135deg, ${c.primary}, ${c.primaryLight});border-radius:24px;align-items:center;justify-content:center;`}
        >
          <text style="color:#000;font-size:22px;font-weight:bold;">我</text>
        </view>
      </view>

      <SearchBar
        placeholder="搜电影 / 剧集 / 综艺..."
        value={q}
        onInput={setQ}
        onSubmit={() => {}}
      />

      <scroll-view style="flex:1;">
        {!hasSources ? (
          // 空状态提示
          <view style="padding:32px;align-items:center;">
            <view
              style={`padding:24px;background:${c.surfaceVariant};border-radius:14px;border:1px solid ${c.border};align-items:center;`}
            >
              <text style="font-size:48px;">📡</text>
              <text style={`color:${c.text};font-size:22px;font-weight:bold;margin-top:16px;`}>
                还没有视频源
              </text>
              <text style={`color:${c.textSec};font-size:15px;margin-top:8px;text-align:center;line-height:22px;`}>
                去"源"页面添加一个 HTTP 视频源
              </text>
            </view>
          </view>
        ) : (
          <>
            {/* 热门电影 */}
            <SectionTitle
              title="热门电影"
              subtitle="本月精选影片"
              icon="🎬"
              color="amber"
              onMore={() => {}}
            />
            <HorizontalList>
              {SAMPLE_HOT.map((v) => (
                <VideoCard key={v.id} data={v} />
              ))}
            </HorizontalList>

            {/* 剧集 */}
            <SectionTitle
              title="热门剧集"
              subtitle="国产+海外 · 实时更新"
              icon="📺"
              color="blue"
              onMore={() => {}}
            />
            <HorizontalList>
              {SAMPLE_TV.map((v) => (
                <VideoCard key={v.id} data={v} />
              ))}
            </HorizontalList>

            {/* 综艺 */}
            <SectionTitle
              title="最新综艺"
              subtitle="热门节目"
              icon="🎉"
              color="purple"
              onMore={() => {}}
            />
            <HorizontalList>
              {SAMPLE_MOVIE.map((v) => (
                <VideoCard key={v.id} data={v} />
              ))}
            </HorizontalList>

            {/* 源提示 */}
            <view
              style={`margin:24px;padding:20px;background:${c.surfaceVariant};border-radius:14px;border:1px solid ${c.border};align-items:center;`}
            >
              <text style={`color:${c.text};font-size:16px;line-height:24px;text-align:center;`}>
                已配置 {sources.length} 个源
              </text>
            </view>
          </>
        )}

        <view style="height:24px;" />
      </scroll-view>

      <BottomNav active={props.active} onChange={props.onTab} />
    </view>
  );
}