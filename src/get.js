const yargs = require("yargs");
const { retrieve} = require("./http_get");
const entities = [
  "nfprofile",
  "general",
  "security",
  "logging",
  "nrf",
  "db",
  "additional-services",
  "service-settings",
];

const optionsCommon = {
  dest: {
    alias: "d",
    demandOption: true,
    default: "https://localhost:8009/nrf-settings/v1/",
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

//   yargs.command({
//     command: `get <${entities.join("|")}> ${commonOptionsIncommand}`,
//     describe: "eklemek için add kullan",
//     builder: {
//       id: {
//         demandOption: true,
//       },
//     },
//     handler: (arg) => {
//       console.log("Ekliyoruzzzz");
//     },
//   });

yargs.command(
  `get <entity> ${commonOptionsIncommand}`,
  "Çekmek için",
  (y) =>
    y
      .positional("entity", {
        describe: "Varlık adı",
        demandOption: true,
        type: "string",
        choices: entities,
      })
      .options(optionsCommon),
  (arg) => {
    console.log("Ekliyoruzzzz");
    retrieve(arg.dest, arg.entity);
  }
);

yargs.command(
  `delete <entity> ${commonOptionsIncommand}`,
  "silmek için",
  (y) =>
    y
      .positional("entity", {
        describe: "Varlık adı",
        demandOption: true,
        type: "string",
        choices: entities,
      })
      .options(optionsCommon),
  () => {
    console.log("Ekliyoruzzzz");
  }
);

console.log(yargs.help().argv);
