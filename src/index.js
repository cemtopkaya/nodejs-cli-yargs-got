const got = require("got");
const yargs = require("yargs");

process.env["NODE_TLS_REJECT_UNAUTHORIZED"] = "0";

const optionsCommon = {
  dest: {
    alias: "d",
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

async function patch(host, entity, cert = null) {
  const url = `https://${host}/nrf-settings/v1/${entity}`;
  console.log(">> patch >> url: ", url);
  try {
    const { headers, body } = await got.patch(url, {
      http2: true,
      json: {
        "ClientCount": 110,
        "ClientTimeout": 31000,
        "NumberofServingServerThreads": 6
      },
      responseType: "json",
    });
    console.log(headers);
    console.log(body);
  } catch (error) {
    console.log(error);
  }
}

async function put(host, entity, cert = null) {
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
}

async function get(host, entity, cert = null) {
  const url = `https://${host}/nrf-settings/v1/${entity}`;
  console.log("url: ", url);

  try {
    const { headers, body } = await got(url, { http2: true });
    console.log(headers);
    console.log(body);
  } catch (error) {
    console.log(error);
  }
}

function commandHandle(arg) {
  console.log(arg);
  // console.log(`${mainCommand} komutu çalıştı`);
  switch (arg._[0]) {
    case "get":
      get(arg.dest, arg.entity, arg.cert);
      break;
    case "set":
      put(arg.dest, arg.entity, arg.cert);
      break;
    case "modify":
      patch(arg.dest, arg.entity, arg.cert);
      break;
    default:
      console.error("Bu komutu bilemedim :( ");
      break;
  }
}

function argumentHandle(y) {
  return y
    .positional("entity", {
      describe: "Varlık adı",
      demandOption: true,
      type: "string",
      choices: nefPaths,
    })
    .options(optionsCommon);
}

mainCommands.forEach((mainCommand) => {
  yargs.command(
    `${mainCommand} <entity> ${commonOptionsIncommand}`,
    "Çekmek için",
    argumentHandle,
    commandHandle
  );
});

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
yargs.help().argv;
// console.log(yargs.help().argv);
