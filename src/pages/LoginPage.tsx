// 登录页 - LunaTV Web 同款
// 紫蓝渐变背景 + 白色大圆角卡片 + 绿色 LOMI 按钮
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
    const trimmedBase = apiBase.trim();
    let effectiveBase = config.apiBase;
    if (trimmedBase) {
      let base = trimmedBase;
      if (!/^https?:\/\//i.test(base)) {
        base = 'https://' + base;
      }
      base = base.replace(/\/+$/, '');
      effectiveBase = base;
      if (base !== config.apiBase) {
        setConfig({ ...config, apiBase: base });
      }
    }
    if (!effectiveBase) {
      setError('请先填写服务器地址');
      return;
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
        const r = await login(effectiveBase, username.trim(), password);
        if (!r.ok) throw new Error(r.error || r.message || '登录失败');
      } else {
        const r = await register(
          effectiveBase,
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
    <view className="login-gradient-bg">
      {/* 装饰光晕 - 紫色 */}
      <view className="login-glow login-glow-purple" />
      {/* 装饰光晕 - 蓝色 */}
      <view className="login-glow login-glow-blue" />

      {/* 顶栏:返回 + 设置 */}
      <view className="login-topbar">
        <view className="icon-btn" bindtap={() => back()}>
          <text className="icon-btn-text">‹</text>
        </view>
        <view
          className="icon-btn"
          bindtap={() => navigate({ name: 'settings' })}
        >
          <text className="icon-btn-text">⚙</text>
        </view>
      </view>

      {/* 白色大圆角卡片 */}
      <view className="login-card-wrap">
        <view className="login-card">
          {/* 标题区域 */}
          <view className="login-brand-wrap">
            <view className="login-logo">
              <text className="login-logo-text">✨</text>
            </view>
            <text className="login-brand">LunaTV</text>
            <text className="login-subtitle">
              {mode === 'login' ? '欢迎回来,请登录您的账户' : '创建账号,开启观影之旅'}
            </text>
          </view>

          {/* segmented 切换登录/注册 */}
          <view className="segmented segmented-nomargin login-segmented">
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

          {/* 服务器地址输入框 */}
          <text className="login-field-label">服务器地址</text>
          <view className="login-input-wrap">
            <text className="login-input-icon">🌐</text>
            <input
              className="login-input"

              bindinput={(e: any) => setApiBase(e.detail.value)}
            />
          </view>

          {/* 用户名 */}
          <text className="login-field-label">用户名</text>
          <view className="login-input-wrap">
            <text className="login-input-icon">👤</text>
            <input
              className="login-input"

              bindinput={(e: any) => setUsername(e.detail.value)}
            />
          </view>

          {/* 密码 */}
          <text className="login-field-label">密码</text>
          <view className="login-input-wrap">
            <text className="login-input-icon">🔒</text>
            <input
              className="login-input"
              type="password"
              bindinput={(e: any) => setPassword(e.detail.value)}
            />
          </view>

          {mode === 'register' ? (
            <>
              <text className="login-field-label">确认密码</text>
              <view className="login-input-wrap">
                <text className="login-input-icon">🔒</text>
                <input
                  className="login-input"
                  type="password"
                  bindinput={(e: any) => setConfirmPassword(e.detail.value)}
                />
              </view>
              <text className="login-field-label">邀请码(可选)</text>
              <view className="login-input-wrap">
                <text className="login-input-icon">🎟</text>
                <input
                  className="login-input"
                  bindinput={(e: any) => setInvite(e.detail.value)}
                />
              </view>
            </>
          ) : null}

          {/* 错误提示 */}
          {error ? (
            <view className="login-error-box">
              <text className="login-error-text">{error}</text>
            </view>
          ) : null}

          {/* 主按钮 - 绿色渐变 */}
          <view
            className="login-btn-primary"
            bindtap={onSubmit}
          >
            <text className="login-btn-primary-text">
              {mode === 'login' ? '立即登录' : '立即注册'}
            </text>
          </view>

          {/* 切换模式 */}
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
        </view>
      </view>
    </view>
  );
}
