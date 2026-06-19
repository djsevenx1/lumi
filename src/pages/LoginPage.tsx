// 登录页 - Selene 浅色风格
import { useState } from '@lynx-js/react';
import { useConfig, setConfig, setAuth } from '../store';
import { login, register } from '../api/endpoints';
import { getAuthCookie } from '../api/client';
import { back, navigate } from '../lib/router';
import { LoadingView } from '../components/Common';

type Mode = 'login' | 'register';

export function LoginPage() {
  const [config] = useConfig();
  const [mode, setMode] = useState<Mode>('login');
  const [apiBase, setApiBase] = useState(config.apiBase || '');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [invite, setInvite] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function onSubmit() {
    const base = apiBase.trim();
    if (!base) {
      setError('请先填写 LunaTV 服务地址');
      return;
    }
    if (base !== config.apiBase) {
      setConfig({ ...config, apiBase: base });
    }
    if (!username.trim() || !password) {
      setError('请输入用户名和密码');
      return;
    }
    if (mode === 'register' && password !== confirmPassword) {
      setError('两次输入的密码不一致');
      return;
    }
    setLoading(true);
    setError('');
    try {
      if (mode === 'login') {
        const r = await login(base, username.trim(), password);
        if (!r.ok) throw new Error(r.error || r.message || '登录失败');
      } else {
        const r = await register(
          base,
          username.trim(),
          password,
          confirmPassword,
          invite.trim() || undefined,
        );
        if (!r.ok) throw new Error(r.error || r.message || '注册失败');
        if (r.needDelay) {
          await new Promise((r) => setTimeout(r, 2000));
        }
      }
      const cookie = getAuthCookie();
      setAuth(cookie);
      back();
    } catch (e: any) {
      setError(e?.message || '操作失败');
    } finally {
      setLoading(false);
    }
  }

  if (loading) return <LoadingView text={mode === 'login' ? '登录中...' : '注册中...'} />;

  return (
    <view className="page page-no-tabbar">
      {/* 顶栏:返回 + 跳过 */}
      <view
        className="app-header"
        style={{ borderBottomWidth: 0, backgroundColor: 'transparent' }}
      >
        <view className="icon-btn" bindtap={() => back()}>
          <text className="icon-btn-text">‹</text>
        </view>
        <view
          className="icon-btn"
          bindtap={() => navigate({ name: 'home' })}
        >
          <text className="icon-btn-text">✕</text>
        </view>
      </view>

      <view className="form-container col">
        {/* 大标题 */}
        <text className="form-title">
          {mode === 'login' ? '欢迎回来 👋' : '创建账号 ✨'}
        </text>
        <text className="form-sub">
          {mode === 'login'
            ? '登录后可同步收藏和播放记录,跨设备无缝续播'
            : '使用 LunaTV 服务注册新账号,支持邀请码'}
        </text>

        {/* segmented 切换登录/注册 */}
        <view className="segmented segmented-nomargin">
          <view
            className={
              mode === 'login'
                ? 'segmented-item segmented-item-active'
                : 'segmented-item'
            }
            bindtap={() => { setMode('login'); setError(''); }}
          >
            <text
              className={
                mode === 'login'
                  ? 'segmented-item-text segmented-item-text-active'
                  : 'segmented-item-text'
              }
            >
              登录
            </text>
          </view>
          <view
            className={
              mode === 'register'
                ? 'segmented-item segmented-item-active'
                : 'segmented-item'
            }
            bindtap={() => { setMode('register'); setError(''); }}
          >
            <text
              className={
                mode === 'register'
                  ? 'segmented-item-text segmented-item-text-active'
                  : 'segmented-item-text'
              }
            >
              注册
            </text>
          </view>
        </view>

        <input
          key="input-apibase"
          className="input"
          placeholder="服务地址(如 https://luna.tv)"
          placeholder-class="input-placeholder"
          bindinput={(e: any) => setApiBase(e.detail.value)}
        />
        <input
          key="input-username"
          className="input"
          placeholder="用户名"
          placeholder-class="input-placeholder"
          bindinput={(e: any) => setUsername(e.detail.value)}
        />
        <input
          key="input-password"
          className="input"
          type="password"
          placeholder="密码"
          placeholder-class="input-placeholder"
          bindinput={(e: any) => setPassword(e.detail.value)}
        />
        {mode === 'register' ? (
          <>
            <input
              key="input-confirm"
              className="input"
              type="password"
              placeholder="确认密码"
              placeholder-class="input-placeholder"
              bindinput={(e: any) => setConfirmPassword(e.detail.value)}
            />
            <input
              key="input-invite"
              className="input"
              placeholder="邀请码(可选)"
              placeholder-class="input-placeholder"
              bindinput={(e: any) => setInvite(e.detail.value)}
            />
          </>
        ) : null}

        {/* 错误提示 */}
        {error ? (
          <view className="error-box">
            <text className="error-text">{error}</text>
          </view>
        ) : null}

        {/* 主按钮 */}
        <view
          className="btn btn-primary btn-block"
          style={{ marginTop: 8 }}
          bindtap={onSubmit}
        >
          <text className="btn-primary-text">{mode === 'login' ? '登录' : '注册'}</text>
        </view>

        {/* 提示 + 后端设置入口 */}
        <view className="form-link-row">
          <text className="form-link-text">
            {mode === 'login' ? '还没有账号?' : '已有账号?'}{' '}
          </text>
          <text
            className="form-link-action"
            bindtap={() => {
              setError('');
              setMode(mode === 'login' ? 'register' : 'login');
            }}
          >
            {mode === 'login' ? '立即注册' : '前往登录'}
          </text>
        </view>

        {/* 跳转完整设置 */}
        <view className="form-link-row">
          <text
            className="form-link-action"
            bindtap={() => navigate({ name: 'settings' })}
          >
            高级设置 →
          </text>
        </view>
      </view>
    </view>
  );
}
