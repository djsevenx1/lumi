package com.lunatv.client;

import android.os.Bundle;

import androidx.appcompat.app.AppCompatActivity;

import com.lynx.tasm.LynxView;
import com.lynx.tasm.LynxViewBuilder;

/**
 * LunaTV 主 Activity: 通过 LynxView 加载 assets/main.lynx.bundle。
 *
 * Lynx 3.5 推荐方式:用 LynxViewBuilder 构建 LynxView,然后通过 file:// URL
 * 从 assets 加载本地 Lynx bundle。
 */
public class MainActivity extends AppCompatActivity {
    private LynxView lynxView;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);

        // 构造 LynxView
        LynxViewBuilder builder = new LynxViewBuilder();
        lynxView = builder.build(this);
        lynxView.setBackgroundColor(0xFF101010);

        setContentView(lynxView);

        // 从 assets 加载本地 Lynx bundle
        // file:///android_asset/ 路径是 Android 标准 assets 访问方式
        String url = "file:///android_asset/main.lynx.bundle";
        lynxView.loadFromUrl(url);
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
