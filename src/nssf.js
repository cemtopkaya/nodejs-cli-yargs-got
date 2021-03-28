#!/usr/bin/env node
let paths = {
    "nfprofile": ['get', 'set', 'modify', 'put', 'patch']
    , "general": ['get', 'set', 'modify', 'put', 'patch']
    , "security": ['get', 'set', 'modify', 'put', 'patch']
    , "logging": ['get', 'set', 'modify', 'put', 'patch']
    , "nrf": ['get', 'set', 'modify', 'put', 'patch']
    , "db": ['get', 'set', 'modify', 'put', 'patch']
    , "nf-put-log-priority": ['modify', 'put']
    , "nsiprofiles": ['get', 'set', 'post', 'delete']
    , "nssrules": ['get', 'set', 'post', 'delete']
    , "configurednssai": ['get', 'set', 'post', 'delete']
}

let mainCommands = { ...require('./constants').consts.mainCommands }
const { cli } = require('./nf-index')
cli('cnrnssf-cli', 'nssf-settings', paths, mainCommands)

module.exports = {
    paths,
    mainCommands,
    cli
}