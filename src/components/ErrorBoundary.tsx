// React Error Boundary for Lynx
// 捕获子组件 render 错误,隔离崩溃到单页,不让 App 整体挂

import { Component, type ReactNode } from '@lynx-js/react';
import { reportCrash } from '../lib/crashReporter';

interface Props {
  children: ReactNode;
  fallback?: (err: Error) => ReactNode;
}
interface State {
  err: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  state: State = { err: null };

  static getDerivedStateFromError(err: Error): State {
    return { err };
  }

  componentDidCatch(error: Error, info: any) {
    try {
      reportCrash({
        message: error.message || String(error),
        stack: error.stack,
        componentStack: info?.componentStack || (info as any)?.componentStack,
        build: '0.2.2',
        ts: Date.now(),
      });
    } catch {}
  }

  render() {
    if (this.state.err) {
      if (this.props.fallback) return this.props.fallback(this.state.err);
      return (
        <view className="error-boundary">
          <view style="padding:32px;justify-content:center;align-items:center;background:#0D0D0D;flex:1;">
            <text style="font-size:48px;color:#FF4757;">⚠</text>
            <text style="margin-top:16px;font-size:18px;color:#FF4757;font-weight:600;">启动失败</text>
            <text style="margin-top:12px;font-size:13px;color:#AAAAAA;text-align:center;">{this.state.err.message || '未知错误'}</text>
            <text style="margin-top:24px;font-size:11px;color:#666;text-align:center;">错误已自动上报 ({this.state.err.message?.slice(0, 30) || 'unknown'})</text>
            <view style="margin-top:32px;padding:14px 28px;background:#FF4757;border-radius:24px;" bindtap={() => this.setState({ err: null })}>
              <text style="color:#FFF;font-size:14px;">重新加载</text>
            </view>
          </view>
        </view>
      );
    }
    return this.props.children;
  }
}