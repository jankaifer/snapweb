import { useEffect } from "react"


type CastContext = unknown
type CastApi = Record<string, any>
// This property is provided by cast_receiver_framework.js script
declare global {
    interface Window { cast: CastApi | undefined; }
}

const setupCastContext = (castApi: CastApi): CastContext=> {
    const context = castApi.framework.CastReceiverContext.getInstance();
    const options = new castApi.framework.CastReceiverOptions();

    options.maxInactivity = 3600; // Development only

    // We need to do this initialization. Google will kill our app after a few seconds if we don't do this
    context.start(options);
    return context;
}

const initializeChromecastSupport = (castApi: CastApi) => {
 const castContext = setupCastContext(castApi)
 void castContext
 // TODO: integrate setupCastContext with snapcast client to connect volume controls and pause/play features.
 // We should also forward some metadata about currently played stream so that google apps can display that info
}

export const useChromecastSupport = () => {
    useEffect(() => {
        // This seems to be the only way to distinguish chromecast device from other browsers: https://issuetracker.google.com/issues/36189456
        const userAgent = window.navigator.userAgent
        if (!userAgent.includes("CrKey")) return

        // We need to load some google library to talk with chromecast runtime
        const newScript = document.createElement("script");
        newScript.setAttribute('type', 'text/javascript');
        newScript.setAttribute('src', '//www.gstatic.com/cast/sdk/libs/caf_receiver/v3/cast_receiver_framework.js');
        document.head.appendChild(newScript);
        newScript.addEventListener('load', () => {
            const castApi = window.cast
            if (castApi == null) return

            initializeChromecastSupport(castApi)
        }, false)
    }, [])

}