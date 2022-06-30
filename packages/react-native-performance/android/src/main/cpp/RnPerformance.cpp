#include <jni.h>
#include <react/jni/NativeTime.h>

extern "C" JNIEXPORT jlong JNICALL
Java_com_oblador_performance_StartTimeProvider_rnPerformanceNow(
        JNIEnv* env,
        jobject /* this */) {
    return facebook::react::reactAndroidNativePerformanceNowHook();
}