#include <jni.h>

extern "C" JNIEXPORT jlong JNICALL
Java_com_oblador_performance_PerformanceModule_rnPerformanceNow(
        JNIEnv* env,
        jobject /* this */) {
    return 42;
}