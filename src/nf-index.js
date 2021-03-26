const yargs = require("yargs");
const fs = require('fs');

exports.cli = function cli(_scriptName, _urlParam1, _paths, _mainCommands) {

    var { log, yargsOptions } = require('./constants').consts
    var { patch, get, post, put, Delete } = require('./httpGot')(log)

    const yargsModule = {
        commonOptionsIncommand: () => {
            return Object.keys(yargsOptions)
                .map((c) => "[" + c + "]")
                .join(" ")
        },
        httpModule: {
            get: get
            , delete: Delete
            , put: put
            , post: post
            , patch: patch
        },
        argumentHandle: function (y) {
            let options = { ...yargsOptions };
            log.appDebug(`Argüman handle: %o`, y.argv);
            let mainCommand = y.argv._[0],
                entity = y.argv._[1]

            switch (entity) {
                case 'nfprofile':
                case 'general':
                case 'security':
                case 'logging':
                case 'nrf':
                case 'db':
                    break;
                case 'nf-put-log-priority':
                    _urlParam1 = 'log'
                    break;
                case 'nsiprofiles':
                case 'nssrules':
                case 'configurednssai':
                    _urlParam1 = 'nssf-configuration'
                    break;
                default:
                    break;
            }

            switch (mainCommand) {
                case "get":
                    delete options.file;
                    delete options.data;
                    break;
                case "set":
                    break;
                case "post":
                case "put":
                case "modify":
                    options.data.demandOption = !!!y.argv.f
                    break;
                case "delete":
                    options.data.demandOption = !!!y.argv.f
                    break;
                default:
                    console.error("Bu argümanı bilemedim :( ");
                    break;
            }

            log.appDebug(`${mainCommand}: options: %o : argv: %o`, options, y.argv);


            const containsMainCommand = (_entity) => {
                // "nfprofile": ['get', 'set', 'put', 'patch']
                // set içeriyporsa put, post içeriyorsa TRUE döner
                return yargMainCommands.some(cmd => {
                    console.log(">>>> _paths: %o, [_entity]: %o ", _paths, _entity)
                    _paths[_entity].indexOf(cmd) > -1
                })
            }
            const getCommandEntities = (_cmd) => {
                var entityNames = Object.keys(_paths)
                var r = entityNames.filter(entity => {
                    var entityCommands = _paths[entity]
                    var containsCommand = entityCommands.some(cmd => cmd == _cmd)
                    log.appDebug(">>>> prop: ", entity, _paths[entity], " > containsCommand: ", containsCommand);
                    return containsCommand
                })
                log.appDebug("getCommandEntities > entityNames: %o > _cmd: %o > result: %o", entityNames, _cmd, r);
                return r
            }

            return y.positional("entity", {
                describe: "Varlık adı",
                demandOption: true,
                type: "string",
                choices: getCommandEntities(mainCommand)
            }).options(options);


        },
        commandHandle: async function (argv) {
            let result = null
            let data = null
            let cert = {
                cert: argv.cert
                , key: argv.key
                , cacert: argv.cacert
                , pfx: argv.pfx
                , passphrase: argv.passphrase
                , rejectUnauthorized: argv.rejectUnauthorized
            }
            let mainCommand = argv._[0]
            let entity = argv.entity

            log.appDebug(`>>> commandHandle > mainCommand: %o > argv: %o`, mainCommand, argv);
            switch (mainCommand) {
                case "get":
                    result = await yargsModule.httpModule.get(argv.dest, _urlParam1, argv.entity, cert);
                    break;
                // case "set":
                //     data = argv.data ? argv.data : await yargsModule.readData(argv)
                //     result = await yargsModule.httpModule.put(argv.dest, argv.entity, data, cert);
                //     log.appDebug(`>>> set: result: %o : argv: %o`, result, argv);
                //     break;
                case "set":
                    data = argv.data ? argv.data : await yargsModule.readData(argv)
                    log.appDebug(`>>> set > entity: %o > _paths: %o`, entity, _paths);
                    if (_paths[entity].indexOf('post') > -1) {
                        log.appDebug(`>>> post > entity: %o > argv: %o`, entity, argv);
                        result = await yargsModule.httpModule.post(argv.dest, _urlParam1, argv.entity, data, cert);
                    }
                    else if (_paths[entity].indexOf('put') > -1) {
                        log.appDebug(`>>> put > entity: %o > argv: %o`, entity, argv);
                        result = await yargsModule.httpModule.put(argv.dest, _urlParam1, argv.entity, data, cert);
                    }
                    else {
                        const msg = `${entity} Adlı varlık elemanı için veri girmeye uygun metot yok!`
                        log.appError(msg)
                        throw new Error(msg)
                    }
                    break;
                case "modify":
                    const isPatchArray = (_data) => {
                        log.appDebug("commandHandle >> isPatchArray >> _data: %o", _data)
                        const dataClone = typeof (_data) == 'string' ? JSON.parse(_data) : _data
                        log.appDebug("commandHandle >> isPatchArray >> dataClone: %o", dataClone)
                        return Array.isArray(dataClone)
                            && dataClone.some(item => item.hasOwnProperty('op'))
                            && dataClone.some(item => item.hasOwnProperty('path'))
                            && dataClone.some(item => item.hasOwnProperty('value'))
                    }
                    data = argv.data ? argv.data : await yargsModule.readData(argv)
                    const httpMethodNameForUpdate = isPatchArray(data) ? 'patch' : 'put'

                    result = await yargsModule.httpModule[httpMethodNameForUpdate](argv.dest, _urlParam1, argv.entity, data, cert);
                    break;
                case "delete":
                    data = argv.data
                    result = await yargsModule.httpModule.delete(argv.dest, _urlParam1, argv.entity, data, cert);
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
                log.appDebug("%O", argv)
                if (argv.file) {
                    let file = argv.file

                    const parseData = str => {
                        log.appDebug('str: %s', str);
                        log.appDebug('0 argv: %o', argv);
                        log.appDebug('1 argv.data: %o', argv.data);
                        try {
                            data = JSON.parse(str + '')
                            return res(data)
                        } catch (error) {
                            rej(error)
                            throw error
                        }
                    }

                    if (argv.data) {
                        return parseData(argv.data)
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

        Object.keys(_mainCommands).forEach((mainCommand) => {
            yargs.command(
                // `${mainCommand} <entity> ${yargsModule.commonOptionsIncommand()}`,
                `${mainCommand} <entity> [options]`,
                `${_mainCommands[mainCommand].desc}`,
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
                const mainCommand = argv._[0]
                // const entity = argv._[1]
                log.appDebug("yargs check > argv: %o", argv)

                switch (mainCommand) {
                    case 'set':
                    case 'modify':
                    case 'delete':
                        log.appDebug("set,modify,delete komutları veri gelmezse çalıştırılmaz kontrolü yapılacak...")
                        let fileOrDataExist = (!!argv.data || !!argv.dt || !!argv.file || !!argv.f)
                        log.appDebug("> !!argv.data: %o > !!argv.data: %o >!!argv.file: %o > || !!argv.f: %o", !!argv.data, !!argv.data, !!argv.file, !!argv.f)
                        log.appDebug("(!!argv.data || !!argv.dt || !!argv.file || !!argv.f) %s", fileOrDataExist)
                        if (fileOrDataExist == false) {
                            throw new Error('Eklemek istenilen veri file veya data argümanlarıyla sağlanmalıdır!')
                        }
                        break;
                    default:
                        break
                }

                if (argv.data && mainCommand != "delete") {
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
                    //  TODO: sertifika dosyaları (key, cert, cacert) mvcut mu?
                    // if (fs.existsSync(argv.cert) == false)
                    //     return `"${argv.cert}" Sertifika dosyası sistemde bulunamadı!`
                }

                process.env.PRETTY_PRINT = (argv.p || !!argv.printPretty)
                
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

