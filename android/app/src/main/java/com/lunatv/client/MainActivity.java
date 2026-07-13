package com.lunatv.client;

import android.os.Bundle;
import android.util.Log;
import android.view.ViewGroup;
import android.widget.FrameLayout;
import android.widget.TextView;

import androidx.appcompat.app.AppCompatActivity;

import com.lynx.tasm.BehaviorBundle;
import com.lynx.tasm.LynxEnv;
import com.lynx.tasm.LynxView;
import com.lynx.tasm.LynxViewBuilder;
import com.lynx.tasm.behavior.Behavior;
import com.lynx.xelement.XElementBehaviors;
import com.sigx.video.VideoPlayerBehavior;

import java.io.PrintWriter;
import java.io.StringWriter;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;

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

    private void setupLynx() throws Exception {
        // 1. 准备 behaviors 包(用 BehaviorBundle,init 签名要求)
        BehaviorBundle behaviorBundle = new BehaviorBundle() {
            @Override
            public List<Behavior> create() {
                List<Behavior> list = new ArrayList<>();
                // XElement:<input>/<textarea> 等扩展元素
                list.addAll(Arrays.asList(new XElementBehaviors().create()));
                // sigx/lynx-video:<video-player>
                list.add(new VideoPlayerBehavior());
                return list;
            }
        };

        // 2. 初始化 LynxEnv
        //    签名:init(Application, INativeLibraryLoader, AbsTemplateProvider, BehaviorBundle)
        //    - LibraryLoader 传 null(用系统默认 loader)
        //    - TemplateProvider 在 view 层 setTemplateProvider,这里传 null
        //    - BehaviorBundle 上注册所有 native 元素
        LynxEnv.inst().init(
            getApplication(),
            null,
            null,
            behaviorBundle
        );

        // 3. 构造 LynxView
        LynxViewBuilder builder = new LynxViewBuilder();
        builder.setTemplateProvider(new AssetTemplateProvider(this));
        // 即使在 BehaviorBundle 里注册了,view 层也注册一下保险
        builder.addBehavior(new VideoPlayerBehavior());
        builder.addBehaviors(new XElementBehaviors().create());

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
