package com.lunatv.client;

import android.os.Bundle;

import androidx.appcompat.app.AppCompatActivity;

import com.lynx.tasm.LynxView;
import com.lynx.tasm.LynxViewBuilder;

/**
 * LunaTV 主 Activity: 通过 LynxView 加载 assets/main.lynx.bundle。
 *
 * 流程:
 *   1. LynxViewBuilder 注入 AssetTemplateProvider
 *   2. builder.build() 构造 LynxView
 *   3. lynxView.renderTemplateUrl("main.lynx.bundle", "") 触发加载
 *   4. AssetTemplateProvider 从 assets 读出 bundle bytes 返回
 */
public class MainActivity extends AppCompatActivity {
    private LynxView lynxView;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);

        LynxViewBuilder builder = new LynxViewBuilder();
        builder.setTemplateProvider(new AssetTemplateProvider(this));

        lynxView = builder.build(this);
        lynxView.setBackgroundColor(0xFF101010);

        setContentView(lynxView);

        // 触发加载:uri 作为 key,TemplateProvider 负责读出 bytes
        lynxView.renderTemplateUrl("main.lynx.bundle", "");
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
