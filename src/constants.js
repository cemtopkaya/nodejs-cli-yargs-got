
const DEBUG_LABEL = {
    APP_TRACE: 'app:trace', // 10
    APP_DEBUG: 'app:debug', // 20
    APP_INFO: 'app:info',  // 30
    APP_WARN: 'app:warn', // 40
    APP_ERROR: 'app:error', // 50
    APP_FATAL: 'app:fatal', // 50
}
let pinoDebugOptions = {
    auto: true, // default
    map: {
        [DEBUG_LABEL.APP_TRACE]: 'trace' // 10
        , [DEBUG_LABEL.APP_DEBUG]: 'debug' // 20
        , [DEBUG_LABEL.APP_INFO]: 'info'   // 30
        , [DEBUG_LABEL.APP_WARN]: 'warn'   // 40
        , [DEBUG_LABEL.APP_ERROR]: 'error' // 50
        , [DEBUG_LABEL.APP_FATAL]: 'error' // 50
    }
}
const log = {
     appInfo: null
    , appTrace: null
    , appDebug: null
    , appWarn: null
    , appError: null
}
// ,appFatal

var argv = require('minimist')(process.argv.slice(2));
// console.log('>>> argv: ', argv)
process.env.LOG_LEVEL = argv.q ? 'nolog' : (argv.loglevel || 'info')
// process.env.DEBUG = process.env.DEBUG || '*'
// process.env["NODE_TLS_REJECT_UNAUTHORIZED"] = "0";
process.env["NODE_NO_WARNINGS"] = "1";
// console.log('>>> process.env: ',process.env)


function getPinoDebugOptions(_logLevel = process.env.LOG_LEVEL) {
    var clonePinoDebugOptions = { ...pinoDebugOptions }
    if (process.env.LOG_LEVEL == 'nolog') {
        clonePinoDebugOptions.map = {}
    } else {
        for (var key in clonePinoDebugOptions.map) {
            const isVerboseLabel = key.indexOf(_logLevel) > -1
            if (!isVerboseLabel) {
                delete clonePinoDebugOptions.map[key]
            }
        }
    }

    return clonePinoDebugOptions
}

function setLogger(_loglevel = process.env.LOG_LEVEL) {
    const pino = require('pino')({
        // prettyPrint: true
        prettyPrint: {
            colorize: require('chalk').supportsColor,
            singleLine: true,
            // levelFirst: true, // INFO [2021-03-25 09:25:13.481] (7363 on CEM-TOPKAYA-PC): {"body":{"LogLevel":"INFO"},"ns":"app:info"}
            // levelFirst: false, // INFO [2021-03-25 09:25:13.481] (7363 on CEM-TOPKAYA-PC): {"body":{"LogLevel":"INFO"},"ns":"app:info"}
            levelFirst: true,
            translateTime: 'yyyy-mm-dd HH:MM:ss.l'
        },
        // prettifier: require('pino-pretty')
        // prettifier: require('pino-inspector')
        // , level: process.env.LOG_LEVEL || 'info'
    });

    const pinoDebug = require('pino-debug')
    let filteredPinoDebugOptions = getPinoDebugOptions(_loglevel)
    // console.log(">>> filteredPinoDebugOptions: ", filteredPinoDebugOptions);
    pinoDebug(pino, filteredPinoDebugOptions)
    debug = require('debug');

    log.appInfo = debug(DEBUG_LABEL.APP_INFO)
    log.appTrace = debug(DEBUG_LABEL.APP_TRACE)
    log.appDebug = debug(DEBUG_LABEL.APP_DEBUG)
    log.appWarn = debug(DEBUG_LABEL.APP_WARN)
    log.appError = debug(DEBUG_LABEL.APP_ERROR)
    console.log('>>> process.env.DEBUG: ' + process.env.DEBUG)
}

exports.consts = {
    DEBUG_LABEL
    , pinoDebugOptions
    , log
    , setLogger
}