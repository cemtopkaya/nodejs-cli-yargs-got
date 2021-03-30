#!/usr/bin/env node

// console.log(process.argv);

// console.log(process.env.LOG_LEVEL);
// TODO: yaml içinden endpointleri her NF için dinamik çek ve buradan geçir
// TODO: her endpoint için metot tipi (GET, PUT, PATCH) yamldan dinamik çekilsin
let paths = {
    "nfprofile": ['get', 'set', 'modify', 'put', 'patch']
    , "general": ['get', 'set', 'modify', 'put', 'patch']
    , "security": ['get', 'set', 'modify', 'put', 'patch']
    , "logging": ['get', 'set', 'modify', 'put', 'patch']
    , "nrf": ['get', 'set', 'modify', 'put', 'patch']
    , "db": ['get', 'set', 'modify', 'put', 'patch']
    , "nf-put-log-priority": ['set', 'put']
    , "additional-services": ['get', 'set', 'modify', 'put', 'patch']
    , "service-settings": ['get', 'set', 'modify', 'put', 'patch']
}

let mainCommands = {...require('./constants').consts.mainCommands}
const { cli } = require('./nf-index')
cli('cnrnrf-cli', 'nrf-settings', paths, mainCommands)