const got = require("got");
const yargs = require("yargs");
const fs = require('fs');

exports.cli = function cli(_scriptName, _urlParam1, _paths, _commands) {

    var { log } = require('./constants').consts

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
                log.appDebug(">> get >> url: %s", url);

                try {
                    const { headers, body } = await got(url, {
                        https: yargsModule.httpModule.httpsConfig,
                        http2: true,
                        responseType: "json"
                    });
                    log.appDebug({ headers, body })
                    log.appInfo({ body })
                    return body
                } catch (error) {
                    log.appError(error);
                    throw error
                }
            },

            put: async function (host, entity, data, cert = null) {
                const url = `https://${host}/${_urlParam1}/v1/${entity}`;
                log.appDebug(">> put >> url: %s >> data: %o", url, data);

                try {
                    const { headers, body } = await got.put(url, {
                        https: yargsModule.httpModule.httpsConfig,
                        http2: true,
                        json: typeof (data) == 'string' ? JSON.parse(data) : data,
                        responseType: "json",
                    });

                    log.appDebug({ headers, body })
                    log.appInfo({ body })
                    return body
                } catch (error) {
                    log.appError(error);
                    throw error
                }
            },

            patch: async function (host, entity, data, cert = null) {
                const url = `https://${host}/${_urlParam1}/v1/${entity}`;
                log.appDebug(">> patch >> url: %s >> data: %o", url, data);

                try {
                    const { headers, body } = await got.patch(url, {
                        https: yargsModule.httpModule.httpsConfig,
                        http2: true,
                        json: typeof (data) == 'string' ? JSON.parse(data) : data,
                        responseType: "json",
                    });
                    log.appDebug({ headers, body })
                    log.appInfo({ body })
                    return body
                } catch (error) {
                    log.appError(error);
                    throw error
                }
            },
        },
        argumentHandle: function (y) {
            let options = { ...yargsModule.optionsCommon };
            log.appDebug(`Argüman handle: %o`, y.argv);
            
            switch (y.argv._[1]) {
                case 'nf-put-log-priority':
                    _urlParam1 = 'log'
                    break;
                default:
                    break;
            }

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

            log.appDebug(`${y.argv._[0]}: options: %o : argv: %o`, options, y.argv);

            let firstCommand = y.argv._[0]
            switch (y.argv._[0]) {
                case 'modify':
                    firstCommand = 'patch'
                    break
                case 'set':
                    firstCommand = 'put'
                    break
            }

            if (Object.keys(_paths).filter(key => _paths[key].indexOf(firstCommand) > -1).length == 0) {
                log.appDebug("Uygun bir uç noktya yok!")
                log.appError("Uygun bir uç noktya yok!")
                return false
            }

            return y.positional("entity", {
                describe: "Varlık adı",
                // demandOption: true,
                type: "string",
                choices: Object.keys(_paths).filter(key => _paths[key].indexOf(firstCommand) > -1),
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
                    log.appDebug(`>>> set: result: %o : argv: %o`, result, argv);
                    break;
                case "modify":
                    data = argv.data ? argv.data : await yargsModule.readData(argv)
                    result = await yargsModule.httpModule.patch(argv.dest, argv.entity, data, argv.cert);
                    break;
                default:
                    log.appError("Bu komutu bilemedim :( ");
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

                const log = log.appDebug('yargsModule:readData:d')
                log.appDebug("%O", argv)
                if (argv.file) {
                    let file = argv.file

                    const parseData = str => {
                        log.appDebug('str: %s', str);
                        log.appDebug('0 argv: %o', argv);
                        log.appDebug('1 argv.data: %o', argv.data);
                        try {
                            data = JSON.parse(str + '')
                            res(data)
                        } catch (error) {
                            rej(error)
                            throw error
                        }
                    }

                    if (file === '-') {
                        log.appDebug('from stdin.pipe');
                        process.stdin.pipe(require('mississippi').concat(parseData));
                    } else {
                        log.appDebug("from file: %s", file)
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

        yargs
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
                    if (fs.existsSync(argv.file) == false) {
                        return `"${argv.file}" Dosyası sistemde bulunamadı!`
                    }
                }

                if (argv.cert) {
                    // if (fs.existsSync(argv.cert) == false)
                    //     return `"${argv.cert}" Sertifika dosyası sistemde bulunamadı!`
                }

                return true
            })
            .argv

    }

    function init() {
        require('./constants').consts.setLogger()
        initYargs()
    }
    init()
}

