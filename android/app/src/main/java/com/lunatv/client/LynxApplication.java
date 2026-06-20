package com.lunatv.client;

import android.app.Application;

import com.lynx.service.http.LynxHttpService;
import com.lynx.service.image.LynxImageService;
import com.lynx.service.log.LynxLogService;
import com.lynx.tasm.service.LynxServiceCenter;

/**
 * LunaTV 自定义 Application。
 *
 * 关键职责:在 onCreate 注册 Lynx Service(否则前端 fetch 会报 "Http Service not registered")。
 *
 * Lynx 官方文档:"Lynx Service needs to be actively injected",
 * 必须在 Application#onCreate 注册,不能延后到 Activity。
 */
public class LynxApplication extends Application {

    @Override
    public void onCreate() {
        super.onCreate();
        initLynxService();
    }

    private void initLynxService() {
        // HTTP: 前端 fetch 通过这个服务发请求
        LynxServiceCenter.inst().registerService(LynxHttpService.INSTANCE);
        // Log: Lynx 内部日志通道
        LynxServiceCenter.inst().registerService(LynxLogService.INSTANCE);
        // Image: <image> 元素图片加载服务(默认实现)
        LynxServiceCenter.inst().registerService(LynxImageService.getInstance());
    }
}
