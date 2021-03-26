
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
        , [DEBUG_LABEL.APP_DEBUG]: 'info' // 20
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
process.env.LOG_LEVEL = argv.q ? 'nolog' : (argv.loglevel || 'info')
// process.env.DEBUG = process.env.DEBUG || '*'
process.env["NODE_TLS_REJECT_UNAUTHORIZED"] = "0";
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
    let printOpts = {
        colorize: require('chalk').supportsColor,
        singleLine: true,
        // levelFirst: true, // INFO [2021-03-25 09:25:13.481] (7363 on CEM-TOPKAYA-PC): {"body":{"LogLevel":"INFO"},"ns":"app:info"}
        // levelFirst: false, // INFO [2021-03-25 09:25:13.481] (7363 on CEM-TOPKAYA-PC): {"body":{"LogLevel":"INFO"},"ns":"app:info"}
        levelFirst: true,
        translateTime: 'yyyy-mm-dd HH:MM:ss.l'
    }
    let pinoOptions = {}

    const isPrintPretty = (argv.prettyPrint == 'true') || (argv.p == 'true') || (process.env.PRETTY_PRINT == 'true')
    if (isPrintPretty) {
        pinoOptions.prettyPrint = printOpts
    }
    const pino = require('pino')(pinoOptions);

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
    log.appDebug('constants > process.env.DEBUG: ' + process.env.DEBUG)
}

const yargsOptions = {
    dest: {
        alias: "d",
        demandOption: true,
        // default: "localhost:8009",
        describe: "hedef sunucu adresi",
        type: "string",
        nargs: 1,
    },
    rejectUnauthorized: {
        alias: 'r',
        demandOption: false,
        default: false,
        type: "boolean",
        desc: "Sunucu sertifikası geçersiz ise iletişimi kapatır"
    },
    cacert: {
        alias: "ca",
        demandOption: false,
        // default: "./localhost.crt",
        describe: "Sunucu sertifikasının doğrulanması için otorite sertifikası",
        type: "string",
        nargs: 1,
    },
    cert: {
        demandOption: false,
        // default: './certificates/client-crt.pem',
        describe: "İstemcinin kendini tanıttığı açık anahtar",
        type: "string",
        nargs: 1,
    },
    key: {
        demandOption: false,
        // default: './certificates/client-key.pem',
        describe: "İstemcinin kendini tanıttığı gizli anahtar",
        type: "string",
        nargs: 1,
    },
    passphrase: {
        demandOption: false,
        // default: './certificates/client-key.pem',
        describe: "İstemci sertifikasının parolası",
        type: "string",
        nargs: 1,
    },
    pfx: {
        demandOption: false,
        // default: './certificates/client.pfx',
        describe: "İstemcinin kendini tanıttığı PKCS formatında sertifika",
        type: "string",
        nargs: 1,
    },
    data: {
        demandOption: false,
        describe: "Eklenecek/Güncellenecek/Silinecek veri",
        type: "string",
        nargs: 1,
    },
    file: {
        alias: 'f',
        demandOption: false,
        type: "string",
        desc: "Veriyi dosyadan girmek için dosya yolu, stdIn ile girmek için - kullanın",
        nargs: 1,
    },
    out: {
        alias: 'o',
        demandOption: false,
        type: "string",
        desc: "Sonucu dosyaya yazdırmamak için dosya yolu atanmalı",
        nargs: 1,
    },
    quite: {
        alias: 'q',
        demandOption: true,
        default: false,
        type: "boolean",
        desc: "Sonucu ekrana yazdırmamak için parametre olarak değer atamadan kullanılmalı"
    },
    prettyPrint: {
        demandOption: true,
        default: false,
        type: "boolean",
        desc: "Sonucu ekrana formatlı yazdırmak için true değeri atanmalıdır"
    }
}

const mainCommands = {
    get: {
        desc: 'Verileri çekmek için',
        options: ['dest', 'cert']
    },
    set: {
        desc: 'Değer atamak için',
        options: ['dest', 'cert', 'file', 'data']
    },
    delete: {
        desc: 'Veri silmek için',
        options: ['dest', 'cert', 'file', 'data']
    },
    modify: {
        desc: 'Verileri güncellemek için',
        options: ['dest', 'cert', 'file', 'data']
    },
}

exports.consts = {
    DEBUG_LABEL
    , pinoDebugOptions
    , log
    , yargsOptions
    , setLogger
    , mainCommands
}