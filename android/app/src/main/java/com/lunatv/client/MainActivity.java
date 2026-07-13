package com.lunatv.client;

import android.os.Bundle;
import android.util.Log;
import android.view.ViewGroup;
import android.widget.FrameLayout;
import android.widget.TextView;

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
 */
public class MainActivity extends AppCompatActivity {
    private static final String TAG = "LunaTV";
    private LynxView lynxView;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);

        try {
            setupLynx();
        } catch (Throwable t) {
            showError("setupLynx 失败:\n" + stackToString(t));
        }
    }

    private void setupLynx() {
        // 1. 准备 BehaviorBundle
        //    XElementBehaviors 实现了 BehaviorBundle 接口,
        //    它把 <input> / <textarea> 等扩展元件都注册进来。
        //    注意:这里只装"扩展元件"那一类,
        //    我们自己的 <video-player> 单独在 LynxViewBuilder 上注册。
        BehaviorBundle behaviorBundle = new XElementBehaviors();

        // 2. 初始化 LynxEnv
        //    签名:init(Application, INativeLibraryLoader, AbsTemplateProvider, BehaviorBundle)
        //    - LibraryLoader 传 null(用系统默认 loader)
        //    - TemplateProvider 传 null(每个 LynxView 上用 setTemplateProvider 单独挂)
        //    - BehaviorBundle 装 XElement 的扩展元件
        LynxEnv.inst().init(
            getApplication(),
            null,
            null,
            behaviorBundle
        );

        // 3. 构造 LynxView
        LynxViewBuilder builder = new LynxViewBuilder();
        builder.setTemplateProvider(new AssetTemplateProvider(this));
        // 注册我们自己的 <video-player> 行为
        builder.addBehavior(new VideoPlayerBehavior());

        lynxView = builder.build(this);
        lynxView.setBackgroundColor(0xFF101010);

        setContentView(lynxView);

        // 4. 渲染 bundle
        lynxView.renderTemplateUrl("main.lynx.bundle", "");
    }

    private void showError(String message) {
        Log.e(TAG, message);
        // 兜底 UI:不让用户看到空白/黑屏
        TextView tv = new TextView(this);
        tv.setText(message);
        tv.setTextColor(0xFFFFFFFF);
        tv.setBackgroundColor(0xFF101010);
        tv.setPadding(48, 96, 48, 48);
        tv.setTextSize(14);
        tv.setVerticalScrollBarEnabled(true);
        tv.setMovementMethod(android.text.method.ScrollingMovementMethod.getInstance());

        FrameLayout root = new FrameLayout(this);
        root.setBackgroundColor(0xFF101010);
        root.addView(tv, new FrameLayout.LayoutParams(
            ViewGroup.LayoutParams.MATCH_PARENT,
            ViewGroup.LayoutParams.MATCH_PARENT
        ));
        setContentView(root);
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
            lynxView.destroy();
            lynxView = null;
        }
    }
}
