#!/usr/bin/env node

// console.log(process.argv);

// console.log(process.env.LOG_LEVEL);
// TODO: yaml içinden endpointleri her NF için dinamik çek ve buradan geçir
// TODO: her endpoint için metot tipi (GET, PUT, PATCH) yamldan dinamik çekilsin
let paths = {
    "nfprofile": ['get', 'put', 'patch'],
    "general": ['get', 'put', 'patch'],
    "additional-services": ['get', 'put', 'patch'],
    "healthcheck": ['get', 'put', 'patch'],
    "security": ['get', 'put', 'patch'],
    "logging": ['get', 'put', 'patch'],
    "nrf": ['get', 'put', 'patch'],
    "db": ['get', 'put', 'patch'],
    "additional-services": ['get', 'put', 'patch'],
    "service-settings": ['get', 'put', 'patch']
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
cli('cnrnrf-cli', 'nrf-settings', paths, commands)