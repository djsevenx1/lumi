package com.lunatv.client;

import android.content.Context;
import android.util.Log;

/** 极简 logger: 同时打 logcat + 把最近 N 条写到全局 RingBuffer(供崩溃后读出) */
public class AppLogger {
    private static Context sCtx;
    private static final String[] LAST_LINES = new String[200];
    private static int idx = 0;

    public static void init(Context ctx) {
        sCtx = ctx;
    }

    public static synchronized void write(String level, String msg) {
        String line = "[" + level + "] " + msg;
        Log.println(Log.INFO, "Lumi", line);
        LAST_LINES[idx++ % LAST_LINES.length] = line;
    }

    public static void i(String tag, String msg) { write("I", tag + ": " + msg); }
    public static void e(String tag, String msg, Throwable t) {
        write("E", tag + ": " + msg);
        if (t != null) {
            for (StackTraceElement el : t.getStackTrace()) {
                write("E", "  at " + el.toString());
            }
        }
    }

    public static synchronized String dump() {
        StringBuilder sb = new StringBuilder();
        int start = (idx < LAST_LINES.length) ? 0 : idx;
        int end = Math.min(idx, LAST_LINES.length);
        for (int i = start; i < end; i++) {
            sb.append(LAST_LINES[i]).append('\n');
        }
        return sb.toString();
    }

    public static Context getContext() { return sCtx; }
}