const got = require("got");
const yargs = require("yargs");

process.env["NODE_TLS_REJECT_UNAUTHORIZED"] = "0";

const optionsCommon = {
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
};
const commonOptionsIncommand = Object.keys(optionsCommon)
  .map((c) => "[" + c + "]")
  .join(" ");

const mainCommands = [
  "set",
  "get",
  "modify",
  // "delete",
  // "list-kpi",
  // "query-kpi",
];

const nefPaths = ["nfprofile", "general", "security", "logging", "nrf", "db"];

var httpModule = {
  patch: async function (host, entity, data, cert = null) {
    const url = `https://${host}/nrf-settings/v1/${entity}`;
    console.log(`>> patch >> ${data} <<`);
    console.log("\n\n>> typeof >> data: ", typeof(data));
    var oo = JSON.parse(data)
    console.log("\n\n>> parsed >> data: ", oo);
    console.log(">> patch >> url: ", url);
    try {
      const {HttpsProxyAgent} = require('hpagent');
      const tunnel = require('tunnel');
      const { headers, body } = await got.patch(url, {
        // agent: {
        //   https: new HttpsProxyAgent({
        //     keepAlive: true,
        //     keepAliveMsecs: 1000,
        //     maxSockets: 256,
        //     maxFreeSockets: 256,
        //     scheduling: 'lifo',
        //     proxy: 'https://localhost:8888'
        //   })
        // },
        agent: {
          https: tunnel.httpsOverHttp({
            proxy: {
              host: 'localhost:62535'
            }
          })
        },
        http2: true,
        json: JSON.parse(data),
        responseType: "json",
      });
      console.log(headers);
      console.log(body);
    } catch (error) {
      console.log(error);
    }
  },

  put: async function (host, entity, cert = null) {
    const url = `https://${host}/nrf-settings/v1/${entity}`;
    console.log("url: ", url);
    try {
      const { headers, body } = await got.put(url, {
        http2: true,
        json: { hello: "world" },
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
};

var yargsModule = {
  argumentHandle: function (y) {
    console.log("****--------------> ", y.argv)
    let options = { ...optionsCommon };
    console.log(y.argv) 
    switch (y.argv._[0]) {
      case "get":
        delete options.data;
        break;
      case "set":
        // options = { ...options };
        break;
      case "modify":
        // options = { ...options };
        break;
      default:
        console.error("Bu komutu bilemedim :( ");
        break;
    }

    return y
      .positional("entity", {
        describe: "Varlık adı",
        demandOption: true,
        type: "string",
        choices: nefPaths,
      })
      .options(options);
  },
  commandHandle: function (arg) {
    console.log("--------------> ", arg.data)
    switch (arg._[0]) {
      case "get":
        httpModule.get(arg.dest, arg.entity, arg.cert);
        break;
      case "set":
        httpModule.put(arg.dest, arg.entity, arg.cert);
        break;
      case "modify":
        httpModule.patch(arg.dest, arg.entity, arg.data, arg.cert);
        break;
      default:
        console.error("Bu komutu bilemedim :( ");
        break;
    }
  },
};

mainCommands.forEach((mainCommand) => {
  yargs.command(
    `${mainCommand} <entity> ${commonOptionsIncommand}`,
    "Çekmek için",
    yargsModule.argumentHandle,
    yargsModule.commandHandle
  );
});

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
yargs
.help()
.alias('help', 'h')
.argv;
// console.log(yargs.help().argv);
