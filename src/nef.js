#!/usr/bin/env node
let paths = {
    "nfprofile": ['get', 'put', 'patch'],
    "general": ['get', 'put', 'patch'],
    "security": ['get', 'put', 'patch'],
    "logging": ['get', 'put', 'patch'],
    "nrf": ['get', 'put', 'patch'],
    "db": ['get', 'put', 'patch'],
    "nf-put-log-priority": ['put'],
}


let mainCommands = {...require('./constants').consts.mainCommands}
const { cli } = require('./nf-index')
cli('cnrnef-cli', 'nef-settings', paths, mainCommands)