const got = require("got");
const yargs = require("yargs");
const fs = require('fs');

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
        , '*': 'trace'
    }
}
let debug
    , appInfo
    , appTrace
    , appDebug
    , appWarn
    , appError
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
        // console.log(">>>> clonePinoDebugOptions.map: ", clonePinoDebugOptions.map)
    }

    return clonePinoDebugOptions
}

function setLogger(_loglevel = process.env.LOG_LEVEL) {
    const pino = require('pino')({
        prettyPrint: true
        // , level: process.env.LOG_LEVEL || 'info'
    });

    const pinoDebug = require('pino-debug')
    let filteredPinoDebugOptions = getPinoDebugOptions(_loglevel)
    // console.log(">>> filteredPinoDebugOptions: ", filteredPinoDebugOptions);
    pinoDebug(pino, filteredPinoDebugOptions)
    const debug = require('debug');

    appInfo = debug(DEBUG_LABEL.APP_INFO)
    appTrace = debug(DEBUG_LABEL.APP_TRACE)
    // appTrace = debug(DEBUG_LABEL.APP_TRACE)
    appDebug = debug(DEBUG_LABEL.APP_DEBUG)
    appWarn = debug(DEBUG_LABEL.APP_WARN)
    appError = debug(DEBUG_LABEL.APP_ERROR)
}

exports.cli = function cli(_scriptName, _urlParam1, _paths, _commands) {

    const yargsModule = {
        optionsCommon: {
            dest: {
                alias: "d",
                demandOption: true,
                default: "localhost:8009",
                describe: "hedef sunucu adresi",
                type: "string",
                nargs: 1,
            },
            cacert: {
                alias: "ca",
                demandOption: false,
                default: "./localhost.crt",
                describe: "Sunucunun otorite sertifikası",
                type: "string",
                nargs: 1,
            },
            cert: {
                demandOption: false,
                default: './certificates/client-crt.pem',
                describe: "İstemcinin kendini tanıttığı açık anahtar",
                type: "string",
                nargs: 1,
            },
            key: {
                demandOption: false,
                default: './certificates/client-key.pem',
                describe: "İstemcinin kendini tanıttığı gizli anahtar",
                type: "string",
                nargs: 1,
            },
            pfx: {
                demandOption: false,
                default: './certificates/client.pfx',
                describe: "İstemcinin kendini tanıttığı PKCS formatında sertifika",
                type: "string",
                nargs: 1,
            },
            data: {
                alias: "dt",
                demandOption: true,
                describe: "Güncellenecek veri",
                // type: "string",
                string: true, //always parse the address argument as a string
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
            }
        },
        commonOptionsIncommand: () => {
            return Object.keys(yargsModule.optionsCommon)
                .map((c) => "[" + c + "]")
                .join(" ")
        },
        httpModule: {
            httpsConfig: {
                certificate: yargs.argv.cert ? fs.readFileSync(yargs.argv.cert) : ''
                // certificate: fs.readFileSync('./certificates/client1-crt.pem')
                , certificateAuthority: yargs.argv.cacert ? fs.readFileSync(yargs.argv.cacert) : ''
                , key: yargs.argv.key ? fs.readFileSync(yargs.argv.key) : ''
                , pfx: yargs.argv.pfx ? fs.readFileSync(yargs.argv.pfx) : ''
                // passphrase: 'passphrase',
                , rejectUnauthorized: false // only for local dev. would be true in prod
            },
            get: async function (host, entity, cert = null) {
                const url = `https://${host}/${_urlParam1}/v1/${entity}`;
                appTrace(">> get >> url: %s", url);

                try {
                    const { headers, body } = await got(url, {
                        https: yargsModule.httpModule.httpsConfig,
                        http2: true,
                        responseType: "json"
                    });
                    appTrace({ headers, body })
                    appInfo({ body })
                    return body
                } catch (error) {
                    appError(error);
                    throw error
                }
            },

            put: async function (host, entity, data, cert = null) {
                const url = `https://${host}/${_urlParam1}/v1/${entity}`;
                appTrace(">> put >> url: %s >> data: %o", url, data);

                try {
                    const { headers, body } = await got.put(url, {
                        https: yargsModule.httpModule.httpsConfig,
                        http2: true,
                        json: typeof (data) == 'string' ? JSON.parse(data) : data,
                        responseType: "json",
                    });

                    appTrace({ headers, body })
                    appInfo({ body })
                    return body
                } catch (error) {
                    appError(error);
                    throw error
                }
            },

            patch: async function (host, entity, data, cert = null) {
                const url = `https://${host}/${_urlParam1}/v1/${entity}`;
                appTrace(">> patch >> url: %s >> data: %o", url, data);

                try {
                    const { headers, body } = await got.patch(url, {
                        https: yargsModule.httpModule.httpsConfig,
                        http2: true,
                        json: typeof (data) == 'string' ? JSON.parse(data) : data,
                        responseType: "json",
                    });
                    appTrace({ headers, body })
                    appInfo({ body })
                    return body
                } catch (error) {
                    appError(error);
                    throw error
                }
            },
        },
        argumentHandle: function (y) {
            let options = { ...yargsModule.optionsCommon };
            switch (y.argv._[0]) {
                case "get":
                    delete options.file;
                    delete options.data;
                    break;
                case "set":
                case "modify":
                    options.data.demandOption = !!!y.argv.f
                    break;
                case "delete":
                    options.data.demandOption = !!!y.argv.f
                    break;
                default:
                    console.error("Bu komutu bilemedim :( ");
                    break;
            }

            appTrace(`${y.argv._[0]}: options: %o : argv: %o`, options, y.argv);

            if (Object.keys(_paths).filter(key => _paths[key].indexOf(y.argv._[0]) > -1).length == 0) {
                appError("Uygun bir uç noktya yok!")
                return false
            }

            // yargsModule.httpModule.httpsConfig = {
            //     certificate: fs.readFileSync(y.argv.cert)
            //     // certificate: fs.readFileSync('./certificates/client1-crt.pem')
            //     // , certificateAuthority: fs.readFileSync('./certificates/ca-crt.pem')
            //     , key: fs.readFileSync(y.argv.key)
            //     // passphrase: 'passphrase',
            //     , rejectUnauthorized: false // only for local dev. would be true in prod
            // }

            return y.positional("entity", {
                describe: "Varlık adı",
                // demandOption: true,
                type: "string",
                choices: Object.keys(_paths).filter(key => _paths[key].indexOf(y.argv._[0]) > -1),
            }).options(options);
        },
        commandHandle: async function (argv) {
            let result = null
            let data = null

            switch (argv._[0]) {
                case "get":
                    result = await yargsModule.httpModule.get(argv.dest, argv.entity, argv.cert);
                    break;
                case "set":
                    data = argv.data ? argv.data : await yargsModule.readData(argv)
                    result = await yargsModule.httpModule.put(argv.dest, argv.entity, data, argv.cert);
                    appTrace(`>>> set: result: %o : argv: %o`, result, argv);
                    break;
                case "modify":
                    data = argv.data ? argv.data : await yargsModule.readData(argv)
                    result = await yargsModule.httpModule.patch(argv.dest, argv.entity, data, argv.cert);
                    break;
                default:
                    appError("Bu komutu bilemedim :( ");
                    break;
            }

            if (!argv.quite) {
                console.log(result)
            }

            if (!!argv.out) {
                fs.writeFileSync(argv.out, JSON.stringify(result, null, 4))
            }
        },
        readData: function (argv, cb) {
            return new Promise((res, rej) => {

                const log = appDebug('yargsModule:readData:d')
                appTrace("%O", argv)
                if (argv.file) {
                    let file = argv.file

                    const parseData = str => {
                        appTrace('str: %s', str);
                        appTrace('0 argv: %o', argv);
                        appTrace('1 argv.data: %o', argv.data);
                        try {
                            data = JSON.parse(str + '')
                            res(data)
                        } catch (error) {
                            rej(error)
                            throw error
                        }
                    }

                    if (file === '-') {
                        appTrace('from stdin.pipe');
                        process.stdin.pipe(require('mississippi').concat(parseData));
                    } else {
                        appTrace("from file: %s", file)
                        try {
                            parseData(fs.readFileSync(file).toString())
                        } catch (err) {
                            throw err;
                        }
                    }
                }

            })
        }
    }

    function initYargs() {
        yargs.scriptName(_scriptName)
            .wrap(120)
            .usage(`$0 <command> <entity> --dest --cert [file] [data]`)
            .option('loglevel', {
                alias: 'l',
                choices: ['trace', 'debug', 'info', 'warn', 'error', 'fatal'],
                default: 'info'
            })

        Object.keys(_commands).forEach((mainCommand) => {
            yargs.command(
                // `${mainCommand} <entity> ${yargsModule.commonOptionsIncommand()}`,
                `${mainCommand} <entity> [options]`,
                `${_commands[mainCommand].desc}`,
                yargsModule.argumentHandle,
                yargsModule.commandHandle
            )
        });

        let { argv } = yargs
            //   .example(`$0 ${mainCommand} <entity> --dest localhost:8009 --cert ./localhost.crt ${mainCommand == "get" ? "--file ./data_put" : ""}`, `${commandDescs[mainCommand].desc}`)
            //   .example(`$0 ${mainCommand} <entity> -t localhost:8009 -c ./localhost.crt -f ./data_put`, `${commandDescs[mainCommand].desc}`)
            //   .example(`cat ./data_put | $0 ${mainCommand} <entity> -t localhost:8009 -c ./localhost.crt -f -`, `${commandDescs[mainCommand].desc}`)
            .demandCommand(2, 2, 'Devam edebilmek için en az 2 komut yazmalısınız!')
            .check(argv => {

                if (argv.data) {
                    try {
                        JSON.parse(argv.data)
                    } catch (err) {
                        return `"${argv.data}" Veri JSON'a dönüştürülebilmelidir!`
                    }
                }

                if (argv.file && argv.file != '-') {
                    if (fs.existsSync(argv.file) == false)
                        return `"${argv.file}" Dosyası sistemde bulunamadı!`
                }


                if (argv.cert) {
                    // if (fs.existsSync(argv.cert) == false)
                    //     return `"${argv.cert}" Sertifika dosyası sistemde bulunamadı!`
                }

                return true
            })

    }

    function init() {
        setLogger()
        initYargs()
    }
    init()
}

