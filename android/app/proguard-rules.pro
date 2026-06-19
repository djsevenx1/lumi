# ====== Lynx / Lynx Service ======
# 官方要求的 ProGuard 规则(反射 + JNI 依赖)

# use @Keep to annotate retained classes
-dontwarn android.support.annotation.Keep
-keep @android.support.annotation.Keep class **
-keep @android.support.annotation.Keep class ** {
    @android.support.annotation.Keep <fields>;
    @android.support.annotation.Keep <methods>;
}
-dontwarn androidx.annotation.Keep
-keep @androidx.annotation.Keep class **
-keep @androidx.annotation.Keep class ** {
    @androidx.annotation.Keep <fields>;
    @androidx.annotation.Keep <methods>;
}

# native method call
-keepclasseswithmembers,includedescriptorclasses class * {
    native <methods>;
}
-keepclasseswithmembers class * {
    @com.lynx.tasm.base.CalledByNative <methods>;
}

# lynx core
-keep class com.lynx.tasm.** { *; }
-keep class com.lynx.jsbridge.** { *; }
-keep class com.lynx.service.** { *; }
-keep class org.lynxsdk.lynx.** { *; }

# primjs
-keep class com.openjavascript.** { *; }
-keep class com.quickjs.** { *; }

# Fresco(lynx-service-image 默认依赖)
-keep class com.facebook.fresco.** { *; }
-keep class com.facebook.imagepipeline.** { *; }
-dontwarn com.facebook.fresco.**

# OkHttp(lynx-service-http 默认依赖)
-dontwarn okhttp3.**
-dontwarn okio.**
-keep class okhttp3.** { *; }
-keep interface okhttp3.** { *; }

# 应用代码
-keep class com.lunatv.client.** { *; }
