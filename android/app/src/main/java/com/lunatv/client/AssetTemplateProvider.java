package com.lunatv.client;

import android.content.Context;

import com.lynx.tasm.provider.AbsTemplateProvider;

import java.io.ByteArrayOutputStream;
import java.io.InputStream;

/**
 * 从 Android assets 加载 Lynx bundle 模板的 TemplateProvider。
 *
 * LynxView 通过 renderTemplateUrl(uri, "") 调用,uri 作为本类的 key,
 * 我们从 assets/{uri} 读出 byte[] 返回。
 */
public class AssetTemplateProvider extends AbsTemplateProvider {
    private final Context appContext;

    public AssetTemplateProvider(Context context) {
        this.appContext = context.getApplicationContext();
    }

    @Override
    public void loadTemplate(String uri, Callback callback) {
        try {
            InputStream is = appContext.getAssets().open(uri);
            ByteArrayOutputStream bos = new ByteArrayOutputStream();
            byte[] buf = new byte[8192];
            int n;
            while ((n = is.read(buf)) != -1) {
                bos.write(buf, 0, n);
            }
            is.close();
            callback.onSuccess(bos.toByteArray());
        } catch (Exception e) {
            // onFailed 签名因 Lynx 版本而异,反射或吞掉异常
            try {
                callback.onFailed(e);
            } catch (Throwable t) {
                // 兜底
            }
        }
    }
}
