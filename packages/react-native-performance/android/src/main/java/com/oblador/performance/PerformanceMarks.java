package com.oblador.performance;

import androidx.annotation.NonNull;

import java.util.HashMap;
import java.util.Map;

import io.reactivex.rxjava3.core.Observer;
import io.reactivex.rxjava3.disposables.Disposable;
import io.reactivex.rxjava3.subjects.PublishSubject;
import io.reactivex.rxjava3.subjects.Subject;

public class PerformanceMarks {

    private static PerformanceMarks instance = null;
    private final Map<String, Long> customMarks = new HashMap<>();
    private final Subject<CustomPerformanceMark> publishSubject = PublishSubject.create();
    private Disposable disposable;

    public static PerformanceMarks getInstance() {
        if (instance == null) {
            instance = new PerformanceMarks();
        }

        return instance;
    }

    public Map<String, Long> get() {
        return customMarks;
    }

    public void setMark(String name) {
        long timestamp = System.currentTimeMillis();
        customMarks.put(name, timestamp);
        if (publishSubject.hasObservers()) {
            publishSubject.onNext(new CustomPerformanceMark(name, timestamp));
        }
    }

    protected void setupCustomPerformanceMarkObserver(Callback callback) {
        publishSubject.subscribe(new Observer<CustomPerformanceMark>() {
            @Override
            public void onSubscribe(@NonNull Disposable d) {
                disposable = d;
            }

            @Override
            public void onNext(@NonNull PerformanceMarks.CustomPerformanceMark mark) {
                callback.call(mark);
            }

            @Override
            public void onError(@NonNull Throwable e) {

            }

            @Override
            public void onComplete() {

            }
        });
    }

    protected void dispose() {
        if (!disposable.isDisposed()) {
            disposable.dispose();
        }
    }

    protected static class CustomPerformanceMark {
        private final String mark;
        private final Long timestamp;

        public CustomPerformanceMark(String mark, Long timestamp) {
            this.mark = mark;
            this.timestamp = timestamp;
        }

        public String getMark() {
            return this.mark;
        }

        public Long getTimestamp() {
            return this.timestamp;
        }
    }

    protected interface Callback {
        void call(CustomPerformanceMark mark);
    }
}
