#!/usr/bin/env node
let paths = {
    "nfprofile": ['get', 'set', 'modify', 'put', 'patch'],
    "general": ['get', 'set', 'modify', 'put', 'patch'],
    "security": ['get', 'set', 'modify', 'put', 'patch'],
    "logging": ['get', 'set', 'modify', 'put', 'patch'],
    "nrf": ['get', 'set', 'modify', 'put', 'patch'],
    "db": ['get', 'set', 'modify', 'put', 'patch'],
    "nf-put-log-priority": ['set', 'put'],
}


let mainCommands = { ...require('./constants').consts.mainCommands }
const { cli } = require('./nf-index')
cli('cnrnef-cli', 'nef-settings', paths, mainCommands)