// 入口文件 - 崩溃捕获 + ErrorBoundary
import { root } from '@lynx-js/react';
import { App } from './App';
import { ErrorBoundary } from './components/ErrorBoundary';
import { installCrashReporter, reportCrash, flushPendingCrashes } from './lib/crashReporter';

// 第一件事: 安装崩溃捕获
installCrashReporter();

// 启动时尝试上报之前未发出的崩溃日志
flushPendingCrashes();

// 顶层包一层 ErrorBoundary, 任何子组件崩了都捕获
root.render(
  <ErrorBoundary>
    <App />
  </ErrorBoundary>
);

// 给 Lynx DevTools 看的全局错误兜底
try {
  (globalThis as any).__lumi_track_error__ = (msg: string, stack?: string) => {
    reportCrash({
      message: msg,
      stack,
      build: '0.2.2',
      ts: Date.now(),
    });
  };
} catch {}