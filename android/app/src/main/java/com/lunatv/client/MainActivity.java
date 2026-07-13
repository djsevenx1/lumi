package com.lunatv.client;

import android.os.Bundle;
import android.util.Log;

import androidx.appcompat.app.AppCompatActivity;

import com.lynx.tasm.LynxEnv;
import com.lynx.tasm.LynxView;
import com.lynx.tasm.LynxViewBuilder;
import com.lynx.xelement.XElementBehaviors;
import com.sigx.video.VideoPlayerBehavior;

/**
 * LunaTV 主 Activity: 通过 LynxView 加载 assets/main.lynx.bundle。
 *
 * 流程:
 *   1. LynxEnv.inst().init 初始化全局 Lynx 引擎环境
 *   2. LynxViewBuilder 注入 AssetTemplateProvider
 *   3. 注册 XElementBehaviors(<input>/<textarea> 等扩展元素需要)
 *   4. 注册 VideoPlayerBehavior(<video-player> 由 @sigx/lynx-video 提供)
 *   5. builder.build() 构造 LynxView
 *   6. lynxView.renderTemplateUrl("main.lynx.bundle", "") 触发加载
 *   7. AssetTemplateProvider 从 assets 读出 bundle bytes 返回
 */
public class MainActivity extends AppCompatActivity {
    private static final String TAG = "LunaTV";
    private LynxView lynxView;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);

        try {
            // 初始化 Lynx 全局环境,只需一次。Lynx 官方文档示例即在 MainActivity 调用。
            // init 第一个参数需要 Application,所以传 getApplication() 而不是 this。
            LynxEnv.inst().init(getApplication(), null, null, null);

            LynxViewBuilder builder = new LynxViewBuilder();
            builder.setTemplateProvider(new AssetTemplateProvider(this));
            // 注册 XElement: <input>/<textarea> 等扩展元素必须注册后才能使用
            builder.addBehaviors(new XElementBehaviors().create());
            // 注册 sigx/lynx-video:<video-player> 元素(由 @sigx/lynx-video 提供)
            builder.addBehavior(new VideoPlayerBehavior());

            lynxView = builder.build(this);
            lynxView.setBackgroundColor(0xFF101010);

            setContentView(lynxView);

            // 触发加载:uri 作为 key,TemplateProvider 负责读出 bytes
            lynxView.renderTemplateUrl("main.lynx.bundle", "");
        } catch (Throwable t) {
            // 任何启动期异常都打 logcat,方便调试闪退
            Log.e(TAG, "Failed to init LynxView", t);
            throw t;
        }
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
