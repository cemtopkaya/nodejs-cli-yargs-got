#!/usr/bin/env node
let paths = {
      "nfprofile": ['get', 'put', 'patch']
    , "general": ['get', 'put', 'patch']
    , "security": ['get', 'put', 'patch']
    , "logging": ['get', 'put', 'patch']
    , "nrf": ['get', 'put', 'patch']
    , "db": ['get', 'put', 'patch']
    , "nf-put-log-priority": ['put']
    , "nsiprofiles": ['get', 'post', 'delete']
    , "nssrules": ['get', 'post', 'delete']
    , "configurednssai": ['get', 'post', 'delete']
}

const commands = {
    get: {
        desc: 'Verileri çekmek için',
        options: ['dest', 'cert']
    },
    // set: {
    //     desc: 'Değer atamak için',
    //     options: ['dest', 'cert', 'file', 'data']
    // },
    post: {
        desc: 'Değer girmek için',
        options: ['dest', 'cert', 'file', 'data']
    },
    put: {
        desc: 'Değer girmek/güncellemek için',
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
cli('cnrnssf-cli', 'nssf-settings', paths, commands)