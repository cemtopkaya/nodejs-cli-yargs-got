
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
        , [DEBUG_LABEL.APP_DEBUG]: process.env.NODE_ENV == 'dev' ? 'info' : 'debug' // 20
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

var argv = require('minimist')(process.argv.slice(2), {
    string: ['lang', 'loglevel'],
    boolean: ['prettyPrint', 'quite'],
    alias: { p: 'prettyPrint', l: 'loglevel', q: 'quite' }
})

// console.log('>>> argv: ', argv)
process.env.LOG_LEVEL = !!argv.q ? 'nolog' : (argv.loglevel || argv.l || 'info')
// process.env.DEBUG = process.env.DEBUG || '*'
// process.env["NODE_TLS_REJECT_UNAUTHORIZED"] = "0";
// process.env["NODE_NO_WARNINGS"] = "1";
// console.log('>>> process.env.LOG_LEVEL: ', process.env.LOG_LEVEL)


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

    const isPrintPretty = argv.prettyPrint || (process.env.PRETTY_PRINT == 'true')
    if (isPrintPretty) {
        pinoOptions.prettyPrint = printOpts
    }
    const pino = require('pino')(pinoOptions);

    const pinoDebug = require('pino-debug')
    let filteredPinoDebugOptions = getPinoDebugOptions(_loglevel)
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
        demandOption: true,
        default: false,
        type: "boolean",
        desc: "Sunucu sertifikas?? ge??ersiz ise ileti??imi kapat??r"
    },
    cacert: {
        alias: "ca",
        demandOption: false,
        // default: "./localhost.crt",
        describe: "Sunucu sertifikas??n??n do??rulanmas?? i??in otorite sertifikas??",
        type: "string",
        nargs: 1,
    },
    cert: {
        demandOption: false,
        // default: './certificates/client-crt.pem',
        describe: "??stemcinin kendini tan??tt?????? a????k anahtar",
        type: "string",
        nargs: 1,
    },
    key: {
        demandOption: false,
        // default: './certificates/client-key.pem',
        describe: "??stemcinin kendini tan??tt?????? gizli anahtar",
        type: "string",
        nargs: 1,
    },
    passphrase: {
        demandOption: false,
        // default: './certificates/client-key.pem',
        describe: "??stemci sertifikas??n??n parolas??",
        type: "string",
        nargs: 1,
    },
    pfx: {
        demandOption: false,
        // default: './certificates/client.pfx',
        describe: "??stemcinin kendini tan??tt?????? PKCS format??nda sertifika",
        type: "string",
        nargs: 1,
    },
    data: {
        demandOption: false,
        describe: "Eklenecek/G??ncellenecek/Silinecek veri",
        type: "string",
        nargs: 1,
    },
    file: {
        alias: 'f',
        demandOption: false,
        type: "string",
        desc: "Veriyi dosyadan girmek i??in dosya yolu, stdIn ile girmek i??in - kullan??n",
        nargs: 1,
    },
    out: {
        alias: 'o',
        demandOption: false,
        type: "string",
        desc: "Sonucu dosyaya yazd??rmamak i??in dosya yolu atanmal??",
        nargs: 1,
    },
    quite: {
        alias: 'q',
        demandOption: true,
        default: false,
        type: "boolean",
        desc: "Sonucu ekrana yazd??rmamak i??in parametre olarak de??er atamadan kullan??lmal??"
    },
    prettyPrint: {
        demandOption: true,
        default: false,
        type: "boolean",
        desc: "Sonucu ekrana formatl?? yazd??rmak i??in true de??eri atanmal??d??r"
    },
    loglevel: {
        alias: 'l',
        choices: ['trace', 'debug', 'info', 'warn', 'error', 'fatal', 'nolog'],
        default: 'info',
        type: 'string'
    }
}

const mainCommands = {
    get: {
        desc: 'Verileri ??ekmek i??in',
        options: ['dest', 'cert']
    },
    set: {
        desc: 'De??er atamak i??in',
        options: ['dest', 'cert', 'file', 'data']
    },
    delete: {
        desc: 'Veri silmek i??in',
        options: ['dest', 'cert', 'file', 'data']
    },
    modify: {
        desc: 'Verileri g??ncellemek i??in',
        options: ['dest', 'cert', 'file', 'data']
    },
}


const isPatchArray = (_data) => {
    log.appDebug("commandHandle >> isPatchArray >> _data: %o", _data)
    const dataClone = typeof (_data) == 'string' ? JSON.parse(_data) : _data
    log.appDebug("commandHandle >> isPatchArray >> dataClone: %o", dataClone)
    return Array.isArray(dataClone)
        && dataClone.some(item => item.hasOwnProperty('op'))
        && dataClone.some(item => item.hasOwnProperty('path'))
        && dataClone.some(item => item.hasOwnProperty('value'))
}

exports.consts = {
    DEBUG_LABEL
    , pinoDebugOptions
    , log
    , yargsOptions
    , setLogger
    , mainCommands
    , isPatchArray
}