#!/usr/bin/env node

const got = require("got");
const yargs = require("yargs");

const pinoDebug = require('pino-debug')
pinoDebug(logger, {
  prettyPrint: true,
  level: process.env.LOG_LEVEL || 'info',
  auto: true, // default
  map: {
    'example:server': 'info',
    'express:router': 'debug',
    '*': 'trace' // everything else - trace
  }
})

const pino = require('pino');
const logger = pino({
  prettyPrint: true,
  level: process.env.LOG_LEVEL || 'info'
});

process.env["NODE_TLS_REJECT_UNAUTHORIZED"] = "0";

const LOG_LEVEL = {
  TYPE1: 'VERBOSE',
  TYPE1: 'DEBUG',
  TYPE2: 'INFO',
  TYPE3: 'QUITE'
}

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
    },
    cred: {
      alias: "c",
      demandOption: true,
      default: "./localhost.crt",
      describe: "İstemcinin kendini tanıttığı sertifika",
      type: "string",
    },
    data: {
      alias: "d",
      demandOption: true,
      describe: "Güncellenecek veri",
      // type: "string",
      string: true//always parse the address argument as a string
    },
    file: {
      alias: 'f',
      demandOption: false,
      type: "string",
      desc: "Veriyi dosyadan girmek için dosya yolu, stdIn ile girmek için - kullanın"
    }
  },
  commonOptionsIncommand: () => {
    return Object.keys(yargsModule.optionsCommon)
      .map((c) => "[" + c + "]")
      .join(" ")
  },
  httpModule: {
    patch: async function (host, entity, data, cert = null) {

      const log = logger.child({ method: 'yargsModule.patch' })
      const url = `https://${host}/nrf-settings/v1/${entity}`;

      try {
        const { headers, body } = await got.patch(url, {
          http2: true,
          json: typeof (data) == 'string' ? JSON.parse(data) : data,
          responseType: "json",
        });
        log.debug('%o',headers);
        log.debug(body);
      } catch (error) {
        console.log(error);
      }
      log.debug('url: %s', url);
      log.debug('typeof(data): %s', typeof (data));
      log.debug('data: %o', data);
    },

    put: async function (host, entity, data, cert = null) {
      const url = `https://${host}/nrf-settings/v1/${entity}`;
      console.log(">> patch >> url: ", url, JSON.parse(data));
      try {
        const { headers, body } = await got.put(url, {
          http2: true,
          json: data,
          responseType: "json",
        });
        console.log(headers);
        console.log(body);
      } catch (error) {
        console.log(error);
      }
    },

    get: async function (host, entity, cert = null) {
      const url = `https://${host}/nrf-settings/v1/${entity}`;
      console.log("url: ", url);

      try {
        const { headers, body } = await got(url, { http2: true });
        console.log(headers);
        console.log(body);
      } catch (error) {
        console.log(error);
      }
    },
  },
  argumentHandle: function (y) {
    let options = { ...yargsModule.optionsCommon };
    switch (y.argv._[0]) {
      case "get":
        delete options.file;
        delete options.data;
        logger.debug('>> argumentHandle: get: options: %o', options);
        break;
      case "set":
        // options = { ...options };
        logger.debug('>> argumentHandle: set: options: %o', options);
        break;
      case "modify":
        if (y.argv.f) {
          options.data.demandOption = false
        }
        logger.debug('>> argumentHandle: modify: options: %o', options);
        break;
      default:
        console.error("Bu komutu bilemedim :( ");
        break;
    }

    return y.positional("entity", {
      describe: "Varlık adı",
      demandOption: true,
      type: "string",
      choices: yargsModule.nefPaths,
    }).options(options);
  },
  commandHandle: function (arg) {
    console.log("* commandHandle --------------> ", arg)
    switch (arg._[0]) {
      case "get":
        yargsModule.httpModule.get(arg.dest, arg.entity, arg.cert);
        break;
      case "set":
        yargsModule.httpModule.put(arg.dest, arg.entity, arg.cert);
        break;
      case "modify":
        yargsModule.readData(arg)
        yargsModule.httpModule.patch(arg.dest, arg.entity, arg.data, arg.cert);
        break;
      default:
        console.error("Bu komutu bilemedim :( ");
        break;
    }
  },
  readData: function (argv) {
    logger.debug('>> readData: argv: %o', argv);
    if (argv.file) {
      let file = argv.file
      const parseData = str => {
        logger.debug('>> readData: parseData: str: %s', str);
        argv.data = JSON.parse(str + '')
        logger.debug('>> readData: parseData: argv.data: %o', argv.data);
      }

      if (file === '-') {
        logger.debug('>> readData: from stdin.pipe');
        const concat = require('mississippi').concat;
        process.stdin.pipe(concat(parseData));
      } else {
        logger.debug('>> readData: from file: ', file);
        require('fs').readFile(file, (err, dataBuffer) => {
          if (err) {
            throw err;
          } else {
            parseData(dataBuffer.toString());
          }
        });
      }
    }

  }
}



yargsModule.mainCommands.forEach((mainCommand) => {
  yargs.command(
    `${mainCommand} <entity> ${yargsModule.commonOptionsIncommand()}`,
    "Çekmek için",
    yargsModule.argumentHandle,
    yargsModule.commandHandle
  );
});

let argv = yargs
  .usage(`$0 komut <entity> ${yargsModule.commonOptionsIncommand()}`)
  .help()
  .alias('help', 'h')
  .argv;


/**
 node .\src\index.js get security

 node .\src\index.js set security -d '{"JWTAuthenticate":false,"MutualAuthenticate":false,"OAuth2":{"PrivateKey":"certificate/jwt.key","PublicKey":"certificate/jwt.pub"},"TLS":{"PrivateKey":"certificate/localhost.key"}}'

 node src/index.js modify security -d '[{ "op": "replace", "path": "/JWTAuthenticate", "value": true },{ "op": "replace", "path": "/MutualAuthenticate", "value": false },{ "op": "replace", "path": "/OAuth2/PrivateKey", "value": "certificate/jwt.key" },{ "op": "replace", "path": "/OAuth2/PublicKey", "value": "certificate/jwt.pub" },{ "op": "replace", "path": "/TLS/PrivateKey", "value": "certificate/localhost.key" }]'

 node src/index.js modify security -d='[{"op":"replace","path":"/JWTAuthenticate","value":true},{"op":"replace","path":"/MutualAuthenticate","value":false},{"op":"replace","path":"/OAuth2/PrivateKey","value":"certificate/jwt.key"},{"op":"replace","path":"/OAuth2/PublicKey","value":"certificate/jwt.pub"},{"op":"replace","path":"/TLS/PrivateKey","value":"certificate/localhost.key"}]'
*/

//   yargs.command(
//     `get <entity> ${commonOptionsIncommand}`,
//     "Çekmek için",
//     (y) =>
//       y
//         .positional("entity", {
//           describe: "Varlık adı",
//           demandOption: true,
//           type: "string",
//           choices: entities,
//         })
//         .options(optionsCommon),
//     (arg) => {
//       console.log("Ekliyoruzzzz");
//       retrieve(arg.dest, arg.entity);
//     }
//   );

// yargs.command({
//   command: "ADDget",
//   describe: "get command",

//   handler: () => {
//     console.log("Ekliyoruzzzz");
//   },
// });

// yargs.command({
//   command: "REMOVE <PAGE|COMMENT> [id] [name]",
//   describe: "silmek için remove kullan",

//   handler: () => {
//     console.log("Siliyoruzzz");
//   },
// });
// console.log(yargs.help().argv);
