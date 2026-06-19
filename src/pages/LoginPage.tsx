// 登录页
import { useState } from '@lynx-js/react';
import { useConfig, setAuth, getAuth } from '../store';
import { login, register } from '../api/endpoints';
import { getAuthCookie } from '../api/client';
import { back, navigate } from '../lib/router';
import { LoadingView } from '../components/Common';

type Mode = 'login' | 'register';

export function LoginPage() {
  const [config] = useConfig();
  const [mode, setMode] = useState<Mode>('login');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [invite, setInvite] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function onSubmit() {
    if (!config.apiBase) {
      setError('请先在设置里配置 LunaTV 服务地址');
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
        const r = await login(config.apiBase, username.trim(), password);
        if (!r.ok) throw new Error(r.error || r.message || '登录失败');
      } else {
        const r = await register(
          config.apiBase,
          username.trim(),
          password,
          confirmPassword,
          invite.trim() || undefined,
        );
        if (!r.ok) throw new Error(r.error || r.message || '注册失败');
        if (r.needDelay) {
          // upstash 模式需要等待数据同步
          await new Promise((r) => setTimeout(r, 2000));
        }
      }
      // 登录/注册成功后,cookie 已被 client.ts 自动提取存储
      // 通知 store 刷新 auth 状态
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
      <view
        className="app-header"
        style={{ borderBottomWidth: 0, backgroundColor: 'transparent' }}
      >
        <view className="icon-btn" bindtap={() => back()}>
          <text style={{ color: '#FFFFFF', fontSize: 18 }}>‹</text>
        </view>
      </view>
      <view className="form-container col">
        <text className="form-title">
          {mode === 'login' ? '欢迎回来' : '创建账号'}
        </text>
        <text className="form-sub">
          {mode === 'login'
            ? '登录后可同步收藏和播放记录'
            : '使用 LunaTV 服务注册新账号'}
        </text>

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

        {error ? (
          <view
            style={{
              padding: 10,
              borderRadius: 6,
              backgroundColor: 'rgba(239, 68, 68, 0.1)',
            }}
          >
            <text style={{ color: '#EF4444', fontSize: 13 }}>{error}</text>
          </view>
        ) : null}

        <view
          className="btn btn-primary btn-block"
          style={{ marginTop: 12 }}
          bindtap={onSubmit}
        >
          <text>{mode === 'login' ? '登录' : '注册'}</text>
        </view>

        <view
          style={{
            marginTop: 16,
            flexDirection: 'row',
            justifyContent: 'center',
          }}
        >
          <text style={{ color: '#A0A0B8', fontSize: 13 }}>
            {mode === 'login' ? '还没有账号?' : '已有账号?'}{' '}
          </text>
          <text
            style={{ color: '#E50914', fontSize: 13, fontWeight: '600' }}
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
  );
}
