package com.oblador.flipperperformanceplugin;

import android.os.Process;
import android.os.SystemClock;
import android.system.Os;
import android.system.OsConstants;

import com.facebook.flipper.core.FlipperConnection;
import com.facebook.flipper.core.FlipperObject;
import com.facebook.flipper.core.FlipperPlugin;
import com.facebook.react.ReactInstanceManager;
import com.facebook.react.bridge.ReactMarker;

import java.io.BufferedReader;
import java.io.File;
import java.io.FileReader;
import java.io.IOException;

public class FlipperReactPerformancePlugin implements FlipperPlugin {

    private FlipperConnection connection;
    private long sessionStartTime;
    private long nativeStartupDuration = 0;
    private long scriptDownloadStart = 0;
    private long scriptDownloadEnd = 0;
    private long scriptExecutionStart = 0;
    private long scriptExecutionEnd = 0;
    private long contentAppeared = 0;
    private long bundleSize;
    private final ReactInstanceManager reactInstanceManager;

    public FlipperReactPerformancePlugin(ReactInstanceManager reactInstanceManager) {
        this.reactInstanceManager = reactInstanceManager;

        sessionStartTime = System.currentTimeMillis();

        measureNativeStartupTime();

        addReactMarkers();
    }

    private void measureBundleSize() {
        String jsBundleFile = reactInstanceManager.getDevSupportManager().getDownloadedJSBundleFile();
        File file = new File(jsBundleFile);
        bundleSize = file.length();
    }

    private void measureNativeStartupTime() {
        try {
            long processStartTime = FlipperReactPerformancePlugin.getStartTime(Process.myPid());
            nativeStartupDuration = SystemClock.elapsedRealtime() - processStartTime;
        } catch (IOException e) {
            e.printStackTrace();
        }
    }

    private void addReactMarkers() {
        ReactMarker.addListener(
                (name, tag, instanceKey) -> {
                    switch (name) {
                        case DOWNLOAD_START:
                            scriptDownloadStart = System.currentTimeMillis();
                            break;
                        case DOWNLOAD_END:
                            scriptDownloadEnd = System.currentTimeMillis();
                            sendMeasurements();
                            break;
                        case RUN_JS_BUNDLE_START:
                            scriptExecutionStart = System.currentTimeMillis();
                            break;
                        case RUN_JS_BUNDLE_END:
                            scriptExecutionEnd = System.currentTimeMillis();
                            measureBundleSize();
                            sendMeasurements();
                            break;
                        case CONTENT_APPEARED:
                            contentAppeared = System.currentTimeMillis();
                            sendMeasurements();
                            break;
                        case RELOAD:
                            sessionStartTime = System.currentTimeMillis();
                            scriptDownloadStart = 0;
                            scriptDownloadEnd = 0;
                            scriptExecutionStart = 0;
                            scriptExecutionEnd = 0;
                            contentAppeared = 0;
                            sendMeasurements();
                            break;
                    }
                });
    }

    private static long getStartTime(final int pid) throws IOException {
        final String path = "/proc/" + pid + "/stat";
        final BufferedReader reader = new BufferedReader(new FileReader(path));
        final String stat;
        try {
            stat = reader.readLine();
        } finally {
            reader.close();
        }
        final String field2End = ") ";
        final String fieldSep = " ";
        final int fieldStartTime = 20;
        final int msInSec = 1000;
        try {
            final String[] fields = stat.substring(stat.lastIndexOf(field2End)).split(fieldSep);
            final long t = Long.parseLong(fields[fieldStartTime]);
            final long tck;
            tck = Os.sysconf(OsConstants._SC_CLK_TCK);
            return (t * msInSec) / tck;
        } catch (final Exception e) {
            throw new IOException(e);
        }
    }

    @Override
    public void onConnect(FlipperConnection connection) {
        this.connection = connection;
    }

    private void sendMeasurements() {
        if (this.connection == null) {
            return;
        }
        this.connection.send("measurements", new FlipperObject.Builder()
                .put("sessionStartedAt", sessionStartTime)
                .put("nativeStartup", nativeStartupDuration)
                .put("bundleSize", bundleSize)
                .put("scriptDownload", scriptDownloadEnd - scriptDownloadStart)
                .put("scriptExecution", scriptExecutionEnd - scriptExecutionStart)
                .put("tti", contentAppeared == 0 ? 0 : (contentAppeared - sessionStartTime))
                .build());
    }

    @Override
    public void onDisconnect() {
        this.connection = null;
    }

    @Override
    public String getId() {
        return "flipper-plugin-react-native-performance";
    }

    @Override
    public boolean runInBackground() {
        return true;
    }
}
