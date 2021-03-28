const yargs = require("yargs");
const fs = require('fs');

exports.cli = function cli(_scriptName, _urlParam1, _paths, _mainCommands) {
    var { log, yargsOptions, isPatchArray } = require('./constants').consts
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
            try {
                let options = { ...yargsOptions };
                log.appDebug(`Argüman handle: %o`, y.argv);
                let mainCommand = y.argv._[0]
                let entity = y.argv._[1]

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
                        options.data.demandOption = !!!y.argv.file
                        options.file.demandOption = !!!y.argv.data
                        break;
                    case "delete":
                        options.data.demandOption = !!!y.argv.file
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


            } catch (error) {
                console.error(error);
            }

        },
        commandHandle: async function (argv) {
            try {
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
                log.appDebug(`1. commandHandle > mainCommand: %s > argv: %o > cert: %o`, mainCommand, argv, cert);


                let httpMethodName = undefined
                switch (mainCommand) {
                    case "get":
                        httpMethodName = 'get'; break;
                    case "delete":
                        httpMethodName = 'Delete'; break;
                    case 'modify':
                        httpMethodName = isPatchArray(data) ? 'patch' : 'put'; break;
                    case "set":
                        /**
                         * ['post','put']
                         * Önce post aranır ve eğer varsa 'post' döner
                         * Sonra put yoksa put aranır varsa 'put' döner
                         * post ve put bulunamazsa undefined döner
                         * 
                         * ['post','put'].find(k=>['get', 'set', 'put', 'post', 'delete'].includes(k)) 
                         */
                        httpMethodName = ['post', 'put'].find(q => _paths[entity].includes(q)); break;
                }

                log.appDebug(`2. commandHandle > mainCommand: %s > argv: %o > cert: %o > httpMethodName: %s`, mainCommand, argv, cert, httpMethodName);

                if (httpMethodName == undefined) { // mainCommand == set undefined dönerse burada hata fırlatılacak 
                    throw new Error(`${entity} Adlı varlık elemanı için veri girmeye uygun metot yok!`);
                }

                log.appDebug(`3. commandHandle > mainCommand: %s > argv: %o > cert: %o`, mainCommand, argv, cert);
                
                if (['set', 'modify'].includes(mainCommand)) {
                    data = argv.data ? argv.data : await yargsModule.readData(argv)
                    log.appDebug(`4. commandHandle > httpMethodName: %s > data: %o`,httpMethodName, data);
                }

                result = await yargsModule.httpModule[httpMethodName](argv.dest, _urlParam1, argv.entity, data, cert);

                if (!argv.quite) {
                    console.log(result)
                }

                if (!!argv.out) {
                    fs.writeFileSync(argv.out, result)
                }

            } catch (error) {
                log.appError('>>> commandHandle error: ', error)
                console.error(error);
                throw (error)
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
        },
        check: argv => {
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
                        return 'Eklemek istenilen veri file veya data argümanlarıyla sağlanmalıdır!'
                    }
                    break;
            }

            switch (true) {
                case (argv.cacert && !fs.existsSync(argv.cacert)):
                    return `Sunucu doğrulama sertifikası belirtilen yerde yok!`
                case (argv.key && !fs.existsSync(argv.key)):
                    return `Sunucu sertifikası gizli anahtar dosyası belirtilen yerde yok!`
                case (argv.cert && !fs.existsSync(argv.cert)):
                    return `Sunucu sertifikası açık anahtar dosyası belirtilen yerde yok!`
                case (argv.pfx && !fs.existsSync(argv.pfx)):
                    return `Sunucu açık ve gizli anahtarın yer aldığı pfx dosyası belirtilen yerde yok!`
                case ((argv.file && argv.file != '-') && !fs.existsSync(argv.file)):
                    console.log("----- 4");
                    return `"${argv.file}" Dosyası sistemde bulunamadı!`
            }

            if (argv.data && mainCommand != "delete") {
                try {
                    JSON.parse(argv.data)
                } catch (err) {
                    return `"${argv.data}" Veri JSON'a dönüştürülebilmelidir!`
                }
            }

            // if (argv.file && argv.file != '-') {
            //     if (fs.existsSync(argv.file) == false) {
            //         return `"${argv.file}" Dosyası sistemde bulunamadı!`
            //     }
            // }

            process.env.PRETTY_PRINT = (argv.p || !!argv.printPretty)

            return true
        }
    }

    function initYargs() {
        try {
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
                .check(yargsModule.check)
                .argv

        } catch (error) {
            console.error(error);
        }
    }

    function init() {
        try {
            require('./constants').consts.setLogger()
            initYargs()

        } catch (error) {
            console.error(error);
        }
    }
    init()
}

