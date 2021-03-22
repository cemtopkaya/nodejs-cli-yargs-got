#!/usr/bin/env node

const got = require("got");
const pino = require('pino')({
  prettyPrint: true,
  level: process.env.LOG_LEVEL || 'info'
});

const pinoDebug = require('pino-debug')
pinoDebug(pino, {
  auto: false, // default
  map: {
    // 'yargsModule:argumentHandle:i': 'info',
    // 'yargsModule:commandHandle:i': 'info',
    // 'yargsModule:httpModule:patch:d': 'info',
    '*:httpModule:*:d': 'info',
    '*:i': 'info',
    '*:d': 'info',
    '*:e': 'error',
    '*:w': 'warning',
    '*': 'trace',
    'app:verbose:i': 'info',
    'app:verbose:e': 'error',
  }
})

const debug = require('debug');
const { fstat } = require("fs");
const appInfo = debug('app:verbose:i')
const appError = debug('app:verbose:e')

process.env["NODE_TLS_REJECT_UNAUTHORIZED"] = "0";

const yargsModule = {
  mainCommands: [
    "set",
    "get",
    "modify",
    // "delete",
    // "list-kpi",
    // "query-kpi",
  ],
  nefPaths: ["nfprofile", "general", "security", "logging", "nrf", "db"],
  optionsCommon: {
    dest: {
      alias: "t",
      demandOption: true,
      default: "localhost:8009",
      describe: "hedef sunucu adresi",
      type: "string",
      nargs: 1,
    },
    cert: {
      alias: "c",
      demandOption: true,
      default: "./localhost.crt",
      describe: "İstemcinin kendini tanıttığı sertifika",
      type: "string",
      nargs: 1,
    },
    data: {
      alias: "d",
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
    }
  },
  commonOptionsIncommand: () => {
    return Object.keys(yargsModule.optionsCommon)
      .map((c) => "[" + c + "]")
      .join(" ")
  },
  httpModule: {
    patch: async function (host, entity, data, cert = null) {
      const log = debug('yargsModule:httpModule:patch:d')
      const url = `https://${host}/nrf-settings/v1/${entity}`;
      log(">> patch >> url: %s >> data: %o", url, data);

      try {
        const { headers, body } = await got.patch(url, {
          http2: true,
          json: typeof (data) == 'string' ? JSON.parse(data) : data,
          responseType: "json",
        });
        log({ headers, body })
        appInfo({ body })
      } catch (error) {
        appError(error);
        throw error
      }
    },

    put: async function (host, entity, data, cert = null) {
      const log = debug('yargsModule:httpModule:put:d')
      const url = `https://${host}/nrf-settings/v1/${entity}`;
      log(">> put >> url: %s >> data: %o", url, data);

      try {
        const { headers, body } = await got.put(url, {
          http2: true,
          json: typeof (data) == 'string' ? JSON.parse(data) : data,
          responseType: "json",
        });
        log({ headers, body })
        appInfo({ body })
      } catch (error) {
        appError(error);
        throw error
      }
    },

    get: async function (host, entity, cert = null) {
      const log = debug('yargsModule:httpModule:get:d')
      const url = `https://${host}/nrf-settings/v1/${entity}`;
      log(">> get >> url: %s", url);

      try {
        const { headers, body } = await got(url, {
          http2: true,
          responseType: "json"
        });
        log({ headers, body })
        appInfo({ body })
      } catch (error) {
        appError(error);
        throw error
      }
    },
  },
  argumentHandle: function (y) {
    const log = debug('yargsModule:argumentHandle:d')
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
      default:
        console.error("Bu komutu bilemedim :( ");
        break;
    }

    log(`${y.argv._[0]}: options: %o`, options);

    return y
      .positional("entity", {
        describe: "Varlık adı",
        // demandOption: true,
        type: "string",
        choices: yargsModule.nefPaths,
      })
      // .usage(`$0 ${y.argv._[0]} <entity> --dest --cert [file] [data]`)
      // .example(`$0 ${y.argv._[0]} <entity> --dest localhost:8009 --cert ./localhost.crt --file ./data_put', 'Varlık bilgilerini çek`)
      // .example(`$0 ${y.argv._[0]} <entity> -t localhost:8009 -c ./localhost.crt -f ./data_put', 'Varlık bilgilerini çek`)
      // .example(`cat ./data_put | $0 ${y.argv._[0]} <entity> -t localhost:8009 -c ./localhost.crt -f -', 'Varlık bilgilerini çek`)
      .options(options);
  },
  commandHandle: async function (argv) {
    const log = debug('yargsModule:commandHandle:d')
    let data = null

    switch (argv._[0]) {
      case "get":
        yargsModule.httpModule.get(argv.dest, argv.entity, argv.cert);
        break;
      case "set":
        data = argv.data ? argv.data : await yargsModule.readData(argv)
        await yargsModule.httpModule.put(argv.dest, argv.entity, data, argv.cert);
        break;
      case "modify":
        data = argv.data ? argv.data : await yargsModule.readData(argv)
        await yargsModule.httpModule.patch(argv.dest, argv.entity, data, argv.cert);
        break;
      default:
        appError("Bu komutu bilemedim :( ");
        break;
    }
  },
  readData: function (argv, cb) {
    return new Promise((res, rej) => {

      const log = debug('yargsModule:readData:d')
      log("%O", argv)
      if (argv.file) {
        let file = argv.file

        const parseData = str => {
          log('str: %s', str);
          log('0 argv: %o', argv);
          log('1 argv.data: %o', argv.data);
          try {
            data = JSON.parse(str + '')
            res(data)
          } catch (error) {
            rej(error)
            throw error
          }
        }

        if (file === '-') {
          log('from stdin.pipe');
          process.stdin.pipe(require('mississippi').concat(parseData));
        } else {
          log("from file: %s", file)
          try {
            parseData(require('fs').readFileSync(file).toString())
          } catch (err) {
            throw err;
          }
        }
      }

    })
  }
}

const commandDescs = {
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

// .scriptName("cli-yargs")
// .usage("Usage: $0 -w num -h num")
// .example(
//   "$0 -w 5 -h 6",
//   "Returns the area (30) by multiplying the width with the height."
// )
// .option("w", {
//   alias: "width",
//   describe: "The width of the area.",
//   demandOption: "The width is required.",
//   type: "number",
//   nargs: 1,
// })
// .argv

function init() {
  var yargs = require("yargs")
    .wrap(120)
    .usage(`$0 <command> <entity> --dest --cert [file] [data]`)

  yargsModule.mainCommands.forEach((mainCommand) => {
    // yargs
    //   .example(`$0 ${mainCommand} <entity> --dest localhost:8009 --cert ./localhost.crt ${mainCommand == "get" ? "--file ./data_put" : ""}`, `${commandDescs[mainCommand].desc}`)
    //   .example(`$0 ${mainCommand} <entity> -t localhost:8009 -c ./localhost.crt -f ./data_put`, `${commandDescs[mainCommand].desc}`)
    //   .example(`cat ./data_put | $0 ${mainCommand} <entity> -t localhost:8009 -c ./localhost.crt -f -`, `${commandDescs[mainCommand].desc}`)
  })

  yargsModule.mainCommands.forEach((mainCommand) => {
    yargs
      .command(
        // `${mainCommand} <entity> ${yargsModule.commonOptionsIncommand()}`,
        `${mainCommand} <entity> [options]`,
        `${commandDescs[mainCommand].desc}`,
        yargsModule.argumentHandle,
        yargsModule.commandHandle
      )
  });

  yargs
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
        if (require('fs').existsSync(argv.file) == false)
          return `"${argv.file}" Dosyası sistemde bulunamadı!`
      }


      if (argv.cert) {
        if (require('fs').existsSync(argv.cert) == false)
          return `"${argv.cert}" Sertifika dosyası sistemde bulunamadı!`
      }

      return true
    })
    .argv
}

init()

function ornek() {
  require("yargs")
    .scriptName("cli-yargs")
    .usage("Usage: $0 -w num -h num")
    .example(
      "$0 -w 5 -h 6",
      "Returns the area (30) by multiplying the width with the height."
    )
    .option("w", {
      alias: "width",
      describe: "The width of the area.",
      demandOption: "The width is required.",
      type: "number",
      nargs: 1,
    })
    .argv
}
// ornek()


/**
 * KOMUT ÖRNEKLERİ
 * PATCH DB
DEBUG=*:* node ./src/index.js modify db --data '[{ "op": "replace", "path": "/ConnectionPoolSize", "value": 6}]'


 */