import { useEffect } from "react"


type CastContext = any
type CastApi = Record<string, any>
// This property is provided by cast_receiver_framework.js script
declare global {
    interface Window { cast: CastApi | undefined; }
}

const LOG_TAG = 'Snapcast_on_Chromecast'

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

    // Enabled logging - do this only in dev
    const castDebugLogger = castApi.debug.CastDebugLogger.getInstance();

    castContext.addEventListener(castApi.framework.system.EventType.READY, () => {
        if (!castDebugLogger.debugOverlayElement_) {
            // Enable debug logger and show a 'DEBUG MODE' overlay at top left corner.
            castDebugLogger.setEnabled(true);
        }
    });

    castDebugLogger.loggerLevelByEvents = {
        'cast.framework.events.category.CORE': castApi.framework.LoggerLevel.INFO,
        'cast.framework.events.EventType.MEDIA_STATUS': castApi.framework.LoggerLevel.DEBUG
    }

    castDebugLogger.debug(LOG_TAG, 'Starting player on chromecast');

    // TODO: integrate setupCastContext with snapcast client to connect volume controls and pause/play features.
    // We should also forward some metadata about currently played stream so that google apps can display that info
}

const addScript = (src: string): Promise<void> => {
    // We need to load some google library to talk with chromecast runtime
    const newScript = document.createElement("script");
    newScript.setAttribute('type', 'text/javascript');
    newScript.setAttribute('src',src);
    document.head.appendChild(newScript);
    return new Promise(resolve => {
        newScript.addEventListener('load', () => resolve(), false)
    })
}

const loadChromecastLibs = async (): Promise<void> => {
    await addScript('//www.gstatic.com/cast/sdk/libs/caf_receiver/v3/cast_receiver_framework.js')
    // Only load this when debugging
    await addScript('//www.gstatic.com/cast/sdk/libs/devtools/debug_layer/caf_receiver_logger.js')
}

export const useChromecastSupport = () => {
    useEffect(() => {
        // This seems to be the only way to distinguish chromecast device from other browsers: https://issuetracker.google.com/issues/36189456
        const userAgent = window.navigator.userAgent
        if (!userAgent.includes("CrKey")) return

        // We need to load some google library to talk with chromecast runtime
        loadChromecastLibs().then(() => {
             const castApi = window.cast
            if (castApi == null) return
            initializeChromecastSupport(castApi)
        })
    }, [])

}