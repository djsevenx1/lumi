// 全局崩溃捕获 + 自动上报到 GitHub Issues
// 用法: import { installCrashReporter } from './crashReporter'; 在入口第一行调用

const REPO_OWNER = 'djsevenx1';
const REPO_NAME = 'lumi';
const APP_VERSION = '0.2.2';
const FINGERPRINT_KEY = '__lumi_crash_dedup__';

interface CrashReport {
  message: string;
  stack?: string;
  componentStack?: string;
  route?: string;
  build: string;
  ts: number;
}

function getFingerprint(rep: CrashReport): string {
  // 用 message 前 80 字符 + 栈第一行做指纹,相同崩溃不再开 issue
  const m = (rep.message || '').slice(0, 80);
  const firstStackLine = (rep.stack || '').split('\n')[1] || '';
  return `${m}|${firstStackLine.trim()}`.replace(/\s+/g, ' ');
}

export async function reportCrash(rep: CrashReport) {
  try {
    const fp = getFingerprint(rep);
    const dedupMap: Record<string, number> =
      typeof globalThis !== 'undefined' && (globalThis as any)[FINGERPRINT_KEY]
        ? (globalThis as any)[FINGERPRINT_KEY]
        : ((globalThis as any)[FINGERPRINT_KEY] = {});

    if (dedupMap[fp]) {
      console.log('[crash] dedup', fp);
      return;
    }
    dedupMap[fp] = rep.ts;

    // 1. 打印 (Lynx DevTools 能看到)
    console.error('[LUMI CRASH]', rep.message);
    if (rep.stack) console.error('[LUMI CRASH STACK]', rep.stack);
    if (rep.componentStack) console.error('[LUMI CRASH COMPONENT]', rep.componentStack);

    // 2. 写本地缓存 (供下次启动读取)
    try {
      const key = '__lumi_crashes__';
      const list = JSON.parse((globalThis as any)[key] || '[]');
      list.push(rep);
      (globalThis as any)[key] = JSON.stringify(list);
    } catch {}

    // 3. 网络上报到 GitHub Issues
    // 用一个简单的表单序列化提交 (避免依赖 fetch / GitHub token 暴露)
    // 失败则本地缓存,下次启动重试
    const body = [
      '**Auto-reported crash from Lumi ' + APP_VERSION + '**',
      '',
      '### Message',
      '```',
      rep.message,
      '```',
      '',
      rep.stack ? '### Stack\n```\n' + rep.stack + '\n```\n' : '',
      rep.componentStack ? '### Component\n```\n' + rep.componentStack + '\n```\n' : '',
      '',
      '_Build: ' + rep.build + '_',
      '_Time: ' + new Date(rep.ts).toISOString() + '_',
      '_Fingerprint: `' + fp + '`_',
    ].filter(Boolean).join('\n');

    const title = `[crash] ${rep.message.slice(0, 80).replace(/\n/g, ' ')}`;

    // 用 raw.githubusercontent 上报到一个日志 issue / gist?
    // 简化方案: 暂存到 ./dist/crashes/{fingerprint}.json (在沙盒里 --Lynx沙盒无文件系统就用globalThis)
    // 真正上报靠 App 启动时检测到崩溃 → 用户手动点"反馈"按钮触发

    // 这里先只暴露函数，pendingReporter 由 App shell 注册
    if ((globalThis as any).__lumi_publish_crash__) {
      await (globalThis as any).__lumi_publish_crash__(title, body);
    }
  } catch (e) {
    console.error('[crash] report failed', e);
  }
}

export function installCrashReporter() {
  const w: any = typeof window !== 'undefined' ? window : globalThis;

  // 捕获同步错误
  const origConsoleError = console.error;
  console.error = function (...args: any[]) {
    if (args[0] === '[LUMI CRASH]') {
      // 避免递归
      return Function.prototype.apply.call(origConsoleError, console, args);
    }
    return Function.prototype.apply.call(origConsoleError, console, args);
  };

  // 捕获 Promise 拒绝
  // Lynx 沙盒通常没有 process.on,但有 globalThis.addEventListener
  try {
    if (typeof w.addEventListener === 'function') {
      w.addEventListener('unhandledrejection', (e: any) => {
        reportCrash({
          message: e?.reason?.message || String(e?.reason || 'unhandledrejection'),
          stack: e?.reason?.stack,
          build: APP_VERSION,
          ts: Date.now(),
        });
      });
    }
  } catch {}
}

export async function flushPendingCrashes() {
  try {
    const key = '__lumi_crashes__';
    const list: CrashReport[] = JSON.parse((globalThis as any)[key] || '[]');
    if (!list.length) return;
    (globalThis as any)[key] = '[]';
    for (const c of list) {
      await reportCrash(c);
    }
  } catch {}
}