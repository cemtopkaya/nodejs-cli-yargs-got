#!/usr/bin/env node

function init1() {
    var { argv } = require("yargs")
        .scriptName("cli-yargs")
        .usage("Usage: $0 -w num -h num")
        .example(
            "$0 -w 5 -h 6",
            "Returns the area (30) by multiplying the width with the height."
        )
        .option("w", {
            alias: "width",
            describe: "The width of the area.",
            demandOption: "The width is required.",
            type: "number",
            nargs: 1,
        })
        .option("h", {
            alias: "height",
            describe: "The height of the area.",
            demandOption: "The height is required.",
            type: "number",
            nargs: 1,
        })
        .help("h")
}
// init1()

// console.log(argv);

function init2() {
    var { argv } = require("yargs")
        .command(
            'get <source> [proxy]',
            'make a get HTTP request',
            (yargs) => {
                yargs.positional('source', {
                    describe: 'URL to fetch content from',
                    type: 'string',
                    demand: "The width is required.",
                    // default: 'http://www.google.com'
                }).positional('proxy', {
                    describe: 'optional proxy URL'
                })
            }
        )
        .help()
}
// init2()


function init3() {
    require("yargs")
        .command('get <source> [proxy]', 'make a get HTTP request')
        .help()
        .argv
}
// init3()


function init4() {
    var { argv } = require("yargs")
        .scriptName("cli-yargs")
        .usage("Usage: $0 <cmd> <nested> [options]")
        .example(
            "$0 -w 5 -h 6",
            "Returns the area (30) by multiplying the width with the height."
        )
        .demandCommand(1, 'en az 1 komut yaz')
        .command({
            command: '<cmd> <nested> [width] [height]',
            choices: ['alan', 'cevre'],
            describe: 'açıklama',
            builder: y =>
                y.positional('nested', {
                    describe: 'iç komut açıklama',
                    choices: ['major', 'minor'],
                    type: 'string'
                }).option("w", {
                    alias: "width",
                    describe: "The width of the area.",
                    demandOption: "The width is required.",
                    type: "number",
                    nargs: 1,
                }).option("h", {
                    alias: "height",
                    describe: "The height of the area.",
                    demandOption: "The height is required.",
                    type: "number",
                    nargs: 1,
                })
        })
        .help("h")
}
init4()