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

const commands = {
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


const { cli } = require('./nf-index')
cli('cnrnef-cli', 'nef-settings', paths, commands)