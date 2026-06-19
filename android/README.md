# LunaTV Android 壳工程

把 Rspeedy 产出的 [dist/main.lynx.bundle](../../dist/main.lynx.bundle) 打包成 Android APK。

## 架构

```
Lynx bundle (TS/TSX → Rspeedy)  →  dist/main.lynx.bundle
                                       ↓ (gradle copyLynxBundle)
                                 android/app/src/main/assets/main.lynx.bundle
                                       ↓ (LynxView 加载)
                                  Android APK
```

- **LynxView** 是字节跳动 Lynx 引擎提供的原生 View(类似 WebView)
- **LynxEnv** 在 `LynxApplication.onCreate()` 初始化一次
- **Lynx Service**(image/log/http)集成 Fresco + OkHttp

## 编译前置

- JDK 17+
- Android SDK 34(`compileSdk=34`,`minSdk=21`)
- 已配置 `ANDROID_HOME` 或 `ANDROID_SDK_ROOT`
- 项目根目录已经跑过 `pnpm install` + `pnpm run build`,生成 [dist/main.lynx.bundle](../../dist/main.lynx.bundle)

## 首次准备

```bash
# 在 android/ 目录下生成 gradle wrapper(用本机 Gradle 8.7+ 即可)
cd android
gradle wrapper --gradle-version 8.7
```

## 编译 Debug APK

```bash
cd android
./gradlew assembleDebug
# 产物: app/build/outputs/apk/debug/app-debug.apk
```

## 安装到设备

```bash
./gradlew installDebug
# 或: adb install app/build/outputs/apk/debug/app-debug.apk
```

## 编译 Release APK(需要签名)

在 `android/gradle.properties` 或 `~/.gradle/gradle.properties` 配:

```properties
LUNATV_STORE_FILE=/path/to/keystore.jks
LUNATV_STORE_PASSWORD=xxxxx
LUNATV_KEY_ALIAS=lunatv
LUNATV_KEY_PASSWORD=xxxxx
```

在 [app/build.gradle](app/build.gradle) 取消 `signingConfig` 注释。

然后:

```bash
./gradlew assembleRelease
# 产物: app/build/outputs/apk/release/app-release.apk
```

## 重新同步 Lynx Bundle

每次改了 TS/TSX 代码后:

```bash
# 项目根
pnpm run build
# 回到 android/,assembleDebug 之前会自动触发 copyLynxBundle
cd android && ./gradlew assembleDebug
```

也可以手动复制:

```bash
./gradlew copyLynxBundle
```

## CI 编译(可选)

仓库已经配了 [ci.yml](../.github/workflows/ci.yml) 编译 Lynx bundle。
要加上 Android 编译,在 [build.yml](../.github/workflows/build.yml) 加一个新 job,装 Android SDK 后跑 `./gradlew assembleDebug`。
详细脚本见 [Lynx CI 模板](https://github.com/lynx-family/lynx/tree/main/platform/android)。

## 常见问题

### `package org.lynxsdk.lynx does not exist`

确认 `~/.gradle/init.d/` 或 `settings.gradle` 的 repositories 包含 `mavenCentral()`,Lynx 3.5.x 已经发布到 Maven Central。

### 启动白屏

检查 `assets/main.lynx.bundle` 是否存在:

```bash
ls -lh android/app/src/main/assets/main.lynx.bundle
```

如果文件不存在,说明 `pnpm run build` 没跑过,或 `copyLynxBundle` 任务没执行。手动跑 `./gradlew copyLynxBundle`。
