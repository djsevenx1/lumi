package com.lunatv.client;

import android.app.Application;
import android.content.Context;
import android.widget.Toast;

import com.lynx.service.http.LynxHttpService;
import com.lynx.service.image.LynxImageService;
import com.lynx.service.log.LynxLogService;
import com.lynx.tasm.service.LynxServiceCenter;

/**
 * LunaTV 自定义 Application。
 *
 * v0.2.3:
 * - 不让 Android Toast 限制节奏, 改用静态 "生命最后一帧 LABEL" 标签
 * - 在每个关键节点立即把文字覆写到一个静态字段
 * - 主 Activity 启动后第一件事读取这个字段并显示
 */
public class LynxApplication extends Application {

    // 这个静态字段在 process 死亡前是所有 Activity 共享的;
    // 如果 App 在显示首屏前死在 native, 这个写入可能 moot;
    // 但死在 Java uncaught 线程足够把这个字段更新好.
    public static volatile String lastBootStep = "BOOT_INIT";

    @Override
    public void onCreate() {
        super.onCreate();
        AppLogger.init(this);
        lastBootStep = "STEP_1_SVC";
        try {
            initLynxService();
            lastBootStep = "STEP_2_LYNX_OK";
        } catch (Throwable t) {
            lastBootStep = "STEP_2_LYNX_FAIL: " + t.getClass().getName();
            AppLogger.e("Lumi", "service failed", t);
        }
        // Logger 留个底 - Toast 太长就掉, 静态字段是 final 防线
        AppLogger.i("Lumi", "App.onCreate done. lastBootStep=" + lastBootStep);
    }

    private void initLynxService() {
        LynxServiceCenter.inst().registerService(LynxHttpService.INSTANCE);
        LynxServiceCenter.inst().registerService(LynxLogService.INSTANCE);
        LynxServiceCenter.inst().registerService(LynxImageService.getInstance());
    }
}