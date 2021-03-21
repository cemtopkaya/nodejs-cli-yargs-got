var text = '';
const concat = require('mississippi').concat;

process.stdin.setEncoding('utf8');
process.stdin.on('readable', function () {
    console.log("-----1");
    var chunk = process.stdin.read();
    if (chunk !== null) {
        text += chunk;
    }
});
process.stdin.on('end', function () {
    console.log("-----2");
    console.log(">> text:" + text);
});

const { argv } = require('yargs');
const yargs = require('yargs')
yargs.options({
    file: {
        alias: 'f',
        demandOption: true,
        desc: "biricinsi"
    }
})
    .check((a, o) => {
        console.log(">>> a:", a)
        console.log(">>> o:", o)
        console.log(">>> text:", text)
        return true
    })
    .help()
    .argv

function parse(str) {
    const value = JSON.parse(str);
    console.log(JSON.stringify(value));
}

let file = yargs.argv.file
if (file === '-') {
    process.stdin.pipe(concat(parse));
} else {
    readFile(file, (err, dataBuffer) => {
        if (err) {
            throw err;
        } else {
            parse(dataBuffer.toString());
        }
    });
}

console.log(yargs.argv)