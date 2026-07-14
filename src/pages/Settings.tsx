// 设置页 - 视频源配置
import { useState, useEffect } from '@lynx-js/react';
import { loadSources, addSource, removeSource, toggleSource } from '../lib/storage';
import type { VideoSource } from '../lib/types';
import { TopBar } from '../components/TopBar';

interface Props {
  onNav: (route: { name: 'home' | 'settings' | 'about' }) => void;
}

export function Settings(props: Props) {
  const [list, setList] = useState<VideoSource[]>([]);
  const [name, setName] = useState('');
  const [url, setUrl] = useState('');
  const [msg, setMsg] = useState('');

  function refresh() {
    setList(loadSources());
  }

  useEffect(() => {
    refresh();
  }, []);

  function submit() {
    const r = addSource(name, url);
    if (r.ok) {
      setName('');
      setUrl('');
      setMsg('✓ 已添加');
      refresh();
    } else {
      setMsg('✗ ' + (r.msg || '失败'));
    }
    // 3s 后清掉提示
    setTimeout(() => setMsg(''), 3000);
  }

  return (
    <view style="flex:1;background:#0a0a0a;">
      <TopBar title="设置 · 视频源" canBack={true} onBack={() => props.onNav({ name: 'home' })} />

      <view style="padding:24px;flex:1;">

        <text style="color:#aaa;font-size:22px;">添加视频源</text>
        <text style="color:#666;font-size:18px;margin-top:6px;">名称随便写, URL 必须 http(s):// 开头</text>

        <view style="height:16px;" />

        <text style="color:#888;font-size:18px;margin-bottom:8px;">名称</text>
        <view style="background:#1a1a1a;padding:18px;border-radius:10px;border:1px solid #2a2a2a;">
          <input
            // @ts-ignore - lynx input 由 xelement 提供, props 类型由运行时决定
            value={name}
            placeholder="我的 4K 源"
            bindinput={(e: any) => setName(e.detail.value)}
            style="color:#fff;font-size:22px;width:100%;background:transparent;"
          />
        </view>

        <view style="height:14px;" />

        <text style="color:#888;font-size:18px;margin-bottom:8px;">URL</text>
        <view style="background:#1a1a1a;padding:18px;border-radius:10px;border:1px solid #2a2a2a;">
          <input
            // @ts-ignore
            value={url}
            placeholder="https://example.com/api/source.json"
            bindinput={(e: any) => setUrl(e.detail.value)}
            style="color:#fff;font-size:20px;width:100%;background:transparent;"
          />
        </view>

        <view style="height:18px;" />

        {msg ? (
          <text style="color:#42b883;font-size:20px;margin-bottom:16px;">{msg}</text>
        ) : null}

        <view
          bindtap={submit}
          style="padding:22px;background:#42b883;border-radius:14px;align-items:center;margin-bottom:24px;"
        >
          <text style="color:#0a0a0a;font-size:26px;font-weight:bold;">+ 添加</text>
        </view>

        <view style="height:8px;" />

        <text style="color:#aaa;font-size:22px;">已配置 ({list.length})</text>

        <view style="height:14px;" />

        {list.length === 0 ? (
          <view style="padding:32px;align-items:center;background:#131313;border-radius:14px;">
            <text style="color:#666;font-size:22px;">还没有添加任何源</text>
          </view>
        ) : (
          list.map((s) => (
            <view
              key={s.id}
              style="background:#131313;padding:18px 20px;border-radius:12px;margin-bottom:12px;flex-direction:row;align-items:center;"
            >
              <view
                bindtap={() => {
                  toggleSource(s.id);
                  refresh();
                }}
                style={s.enabled
                  ? "padding:8px 14px;background:#42b883;border-radius:8px;"
                  : "padding:8px 14px;background:#555;border-radius:8px;"}
              >
                <text style={s.enabled ? "color:#0a0a0a;font-size:18px;font-weight:bold;" : "color:#888;font-size:18px;"}>
                  {s.enabled ? '开启' : '关闭'}
                </text>
              </view>
              <view style="flex:1;margin-left:14px;">
                <text style="color:#fff;font-size:22px;font-weight:bold;">{s.name}</text>
                <text style="color:#888;font-size:18px;margin-top:6px;">{s.url}</text>
              </view>
              <view
                bindtap={() => {
                  removeSource(s.id);
                  refresh();
                }}
                style="padding:8px 14px;background:#FF4757;border-radius:8px;"
              >
                <text style="color:#fff;font-size:18px;font-weight:bold;">删</text>
              </view>
            </view>
          ))
        )}

      </view>
    </view>
  );
}