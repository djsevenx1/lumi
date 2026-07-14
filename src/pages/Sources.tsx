// 源管理页 - LunaTV 风格
import { useState, useEffect, createElement } from '@lynx-js/react';
import { loadSources, addSource, removeSource, toggleSource } from '../lib/storage';
import type { VideoSource } from '../lib/types';
import { theme } from '../lib/theme';
import { BottomNav, type Tab } from '../components/BottomNav';

interface Props {
  onTab: (t: Tab) => void;
  active: Tab;
}

export function Sources(props: Props) {
  const [list, setList] = useState<VideoSource[]>([]);
  const [name, setName] = useState('');
  const [url, setUrl] = useState('');
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);

  function refresh() {
    setList(loadSources());
  }

  useEffect(() => {
    refresh();
  }, []);

  function submit() {
    const r = addSource(name, url);
    setMsg({ ok: r.ok, text: r.ok ? '✓ 已添加' : '✗ ' + (r.msg || '失败') });
    if (r.ok) {
      setName('');
      setUrl('');
    }
    setTimeout(() => setMsg(null), 2500);
    refresh();
  }

  const c = theme.colors;
  const r = theme.radius;

  return (
    <view style="flex:1;background:#000;">
      {/* 顶 */}
      <view style={`padding:24px 24px 16px;background:#000;flex-direction:row;align-items:center;`}>
        <text style={`color:${c.text};font-size:32px;font-weight:bold;`}>视频源</text>
        <view style="flex:1;" />
        <text style={`color:${c.textSec};font-size:15px;`}>{list.length} 个</text>
      </view>

      <scroll-view style="flex:1;">
        {/* 添加卡片 */}
        <view style={`margin:24px;background:${c.surface};border-radius:18px;padding:24px;border:1px solid ${c.border};`}>
          <text style={`color:${c.text};font-size:22px;font-weight:bold;line-height:28px;`}>
            添加源
          </text>
          <text style={`color:${c.textSec};font-size:14px;margin-top:6px;line-height:18px;`}>
            推荐填写 video 数组的 JSON API
          </text>

          <view style="height:18px;" />

          <text style={`color:${c.textSec};font-size:14px;margin-bottom:8px;`}>名称</text>
          <view style={`height:56px;background:${c.surfaceVariant};border-radius:${r.md};border:1px solid ${c.border};padding:0 16px;justify-content:center;`}>
            {createElement('input', {
              value: name,
              placeholder: '我的视频源',
              bindinput: (e: any) => setName(e.detail.value),
              style: `flex:1;color:${c.text};font-size:17px;background:transparent;padding:0;`,
            } as any)}
          </view>

          <view style="height:14px;" />

          <text style={`color:${c.textSec};font-size:14px;margin-bottom:8px;`}>URL</text>
          <view style={`height:56px;background:${c.surfaceVariant};border-radius:${r.md};border:1px solid ${c.border};padding:0 16px;justify-content:center;`}>
            {createElement('input', {
              value: url,
              placeholder: 'https://example.com/api/source.json',
              bindinput: (e: any) => setUrl(e.detail.value),
              style: `flex:1;color:${c.text};font-size:15px;background:transparent;padding:0;`,
            } as any)}
          </view>

          {msg ? (
            <text style={`color:${msg.ok ? c.primary : c.danger};font-size:15px;margin-top:14px;line-height:20px;`}>
              {msg.text}
            </text>
          ) : null}

          <view style="height:20px;" />

          <view
            bindtap={submit}
            style={`height:54px;background-image:linear-gradient(135deg, ${c.primary}, ${c.primaryLight});border-radius:14px;align-items:center;justify-content:center;box-shadow:0 6px 18px ${c.primary}40;`}
          >
            <text style="color:#000;font-size:18px;font-weight:bold;">+ 添加源</text>
          </view>
        </view>

        {/* 列表标题 */}
        <view style="padding:24px 24px 8px;">
          <text style={`color:${c.text};font-size:22px;font-weight:bold;`}>已配置</text>
        </view>

        {list.length === 0 ? (
          <view style={`margin:0 24px 24px;padding:48px 24px;background:${c.surfaceVariant};border-radius:14px;border:1px solid ${c.border};align-items:center;`}>
            <text style="font-size:48px;">📂</text>
            <text style={`color:${c.textSec};font-size:16px;margin-top:12px;text-align:center;line-height:24px;`}>
              还没有源{'\n'}在上方表单添加一个
            </text>
          </view>
        ) : (
          <view style="padding:0 24px 24px;">
            {list.map((s) => (
              <view
                key={s.id}
                style={`background:${c.surface};border-radius:14px;padding:18px;margin-bottom:12px;border:1px solid ${c.border};`}
              >
                <view style="flex-direction:row;align-items:center;">
                  {/* 状态点 */}
                  <view style={`width:12px;height:12px;background:${s.enabled ? c.primary : c.textMuted};border-radius:6px;margin-right:12px;`} />
                  <view style="flex:1;">
                    <text style={`color:${c.text};font-size:18px;font-weight:bold;line-height:24px;`}>
                      {s.name}
                    </text>
                    <text style={`color:${c.textSec};font-size:14px;margin-top:6px;line-height:18px;`}>
                      {s.url}
                    </text>
                  </view>
                </view>
                <view style="height:14px;" />
                <view style="flex-direction:row;">
                  <view
                    bindtap={() => {
                      toggleSource(s.id);
                      refresh();
                    }}
                    style={`flex:1;height:40px;background:${s.enabled ? c.primary : c.surfaceVariant};border-radius:10px;align-items:center;justify-content:center;margin-right:8px;border:1px solid ${c.border};`}
                  >
                    <text style={`color:#FFF;font-size:14px;font-weight:bold;`}>
                      {s.enabled ? '已开启' : '已关闭'}
                    </text>
                  </view>
                  <view
                    bindtap={() => {
                      removeSource(s.id);
                      refresh();
                    }}
                    style={`flex:1;height:40px;background:${c.danger}30;border-radius:10px;align-items:center;justify-content:center;border:1px solid ${c.danger}50;`}
                  >
                    <text style={`color:${c.danger};font-size:14px;font-weight:bold;`}>
                      删除
                    </text>
                  </view>
                </view>
              </view>
            ))}
          </view>
        )}

        <view style="height:24px;" />
      </scroll-view>

      <BottomNav active={props.active} onChange={props.onTab} />
    </view>
  );
}