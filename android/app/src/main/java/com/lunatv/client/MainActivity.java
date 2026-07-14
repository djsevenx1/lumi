package com.lunatv.client;

import android.os.Bundle;
import android.util.Log;
import android.view.ViewGroup;
import android.widget.FrameLayout;
import android.widget.TextView;
import android.widget.Toast;

import androidx.appcompat.app.AppCompatActivity;

import com.lynx.tasm.LynxEnv;
import com.lynx.tasm.LynxView;
import com.lynx.tasm.LynxViewBuilder;
import com.lynx.tasm.behavior.BehaviorBundle;
import com.lynx.xelement.XElementBehaviors;
import com.sigx.video.VideoPlayerBehavior;

import java.io.PrintWriter;
import java.io.StringWriter;

/**
 * LunaTV 主 Activity
 *
 * 任何启动期异常都不让 app 闪退,而是用 TextView 把错误直接显示出来,
 * 方便在设备上直接看到错。
 *
 * v0.2.2 增加:
 * 1. LynxViewClient.onReceivedError 把模板运行时错误吃下来显示到屏幕
 * 2. 全局 Thread.UncaughtExceptionHandler 把 Java 层未捕获崩溃也兜住,不让 app 消失
 */
public class MainActivity extends AppCompatActivity {
    private static final String TAG = "LunaTV";
    private LynxView lynxView;
    private FrameLayout rootContainer;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);

        // 安装全局未捕获异常处理器 - 在 UI 线程崩溃时不闪退,而是把错打在屏幕上
        final Thread.UncaughtExceptionHandler defaultHandler = Thread.getDefaultUncaughtExceptionHandler();
        Thread.setDefaultUncaughtExceptionHandler(new Thread.UncaughtExceptionHandler() {
            @Override
            public void uncaughtException(Thread t, Throwable e) {
                try {
                    Log.e(TAG, "UncaughtException in thread " + t.getName(), e);
                    runOnUiThread(() -> showError("未捕获异常:\n" + stackToString(e)));
                    // 不再调 defaultHandler -> 阻止系统杀进程, 让用户在屏幕上看到错
                } catch (Throwable inner) {
                    Log.e(TAG, "uncaughtException handler failed", inner);
                }
            }
        });

        rootContainer = new FrameLayout(this);
        setContentView(rootContainer);

        try {
            setupLynx();
        } catch (Throwable t) {
            showError("setupLynx 失败:\n" + stackToString(t));
        }
    }

    private void setupLynx() {
        // 1. 准备 BehaviorBundle
        BehaviorBundle behaviorBundle = new XElementBehaviors();

        // 2. 初始化 LynxEnv
        LynxEnv.inst().init(
            getApplication(),
            null,
            null,
            behaviorBundle
        );

        // 3. 构造 LynxView
        LynxViewBuilder builder = new LynxViewBuilder();
        builder.setTemplateProvider(new AssetTemplateProvider(this));
        try {
            builder.addBehavior(new VideoPlayerBehavior());
        } catch (Throwable t) {
            Log.w(TAG, "addBehavior(video-player) failed", t);
        }

        // 错误通过 UncaughtExceptionHandler 在最外层接, 模板内部错误也兜底
        lynxView = builder.build(this);
        lynxView.setBackgroundColor(0xFF101010);

        rootContainer.removeAllViews();
        rootContainer.addView(lynxView, new FrameLayout.LayoutParams(
            ViewGroup.LayoutParams.MATCH_PARENT,
            ViewGroup.LayoutParams.MATCH_PARENT
        ));

        // 4. 渲染 bundle
        try {
            lynxView.renderTemplateUrl("main.lynx.bundle", "");
        } catch (Throwable t) {
            showError("renderTemplateUrl 失败:\n" + stackToString(t));
        }
    }

    private void showError(String text) {
        if (rootContainer == null) return;
        // 清掉之前的错误层
        if (lynxView != null) {
            try {
                rootContainer.removeView(lynxView);
            } catch (Throwable ignore) {}
        }
        TextView tv = new TextView(this);
        tv.setTextSize(12);
        tv.setTextColor(0xFFFF4757);
        tv.setText(text);
        tv.setPadding(40, 60, 40, 40);
        tv.setBackgroundColor(0xFF0D0D0D);
        FrameLayout.LayoutParams lp = new FrameLayout.LayoutParams(
            ViewGroup.LayoutParams.MATCH_PARENT,
            ViewGroup.LayoutParams.MATCH_PARENT
        );
        rootContainer.addView(tv, lp);
    }

    private static String stackToString(Throwable t) {
        StringWriter sw = new StringWriter();
        t.printStackTrace(new PrintWriter(sw));
        return sw.toString();
    }

    @Override
    protected void onDestroy() {
        super.onDestroy();
        if (lynxView != null) {
            try { lynxView.destroy(); } catch (Throwable ignore) {}
        }
    }
}