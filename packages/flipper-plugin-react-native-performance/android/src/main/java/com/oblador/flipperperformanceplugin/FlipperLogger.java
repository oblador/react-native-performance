package com.oblador.flipperperformanceplugin;

import com.facebook.flipper.core.FlipperObject;

public interface FlipperLogger {
    void send(String method, FlipperObject object);
}
