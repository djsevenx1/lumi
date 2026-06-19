package com.lunatv.client;

import android.os.Bundle;
import android.view.View;
import android.view.WindowManager;

import androidx.appcompat.app.AppCompatActivity;

import com.lynx.tasm.LynxView;
import com.lynx.tasm.LynxViewBuilder;

/**
 * LunaTV 主 Activity: 通过 LynxView 加载 assets/main.lynx.bundle。
 *
 * Lynx 3.5 推荐用 LynxViewBuilder 构建,比直接 new LynxView(...) 灵活。
 */
public class MainActivity extends AppCompatActivity {
    private LynxView lynxView;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);

        // 全屏沉浸
        getWindow().addFlags(WindowManager.LayoutParams.FLAG_LAYOUT_NO_LIMITS);

        // 构造 LynxView,加载本地 assets 里的 main.lynx.bundle
        LynxViewBuilder builder = new LynxViewBuilder();
        builder.setLocalCacheDir(this.getCacheDir().getAbsolutePath());
        // 从 assets 加载模板文件
        builder.addInternalAsset("main.lynx.bundle");

        lynxView = builder.build(this);
        lynxView.setBackgroundColor(0xFF101010);

        setContentView(lynxView);
    }

    @Override
    protected void onResume() {
        super.onResume();
        if (lynxView != null) {
            lynxView.onResume();
        }
    }

    @Override
    protected void onPause() {
        super.onPause();
        if (lynxView != null) {
            lynxView.onPause();
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
