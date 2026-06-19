package com.lunatv.client;

import android.app.Application;
import android.util.Log;

import com.lynx.tasm.LynxEnv;

/**
 * LunaTV Android Application: 初始化 Lynx 引擎环境。
 * 必须在任何 LynxView 创建前调用 LynxEnv.inst().init(...)。
 */
public class LynxApplication extends Application {
    private static final String TAG = "LunaTVApp";

    @Override
    public void onCreate() {
        super.onCreate();
        try {
            // 第二个参数(LynxResourceProvider) 传 null 使用默认从 assets 加载
            // 第三个/第四个参数分别是 custom LynxResourceProvider 和 group。
            LynxEnv.inst().init(this, null, null, null);
            Log.i(TAG, "LynxEnv initialized");
        } catch (Throwable t) {
            Log.e(TAG, "LynxEnv init failed", t);
        }
    }
}
