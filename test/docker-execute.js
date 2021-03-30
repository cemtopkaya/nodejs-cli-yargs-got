const { spawn, spawnSync } = require("child_process");
const { log } = require('./mocha-setup').logFunctions;


console.log("1 ----");



function createProcess(executable = 'docker-compose', processPath = './test/docker/', args = [], env = null) {

    console.log(">>>> cmd > createProcess > executable: %s > args: %o", executable, args)
    console.log(">>>> cmd > createProcess > process.env: %o", process.env)
    console.log(">>>> cmd > createProcess > args.join: %o", ([executable].concat(args)).join(' '));

    return spawn(executable, args, {
        cwd: processPath
        , env: Object.assign({ NODE_ENV: 'dev' }, env)
    });
}
// execute('docker-compose', ['up', '--build', 'cnrf_prod', 'cnef_prod', 'cnssf_prod', 'cinardb'])

const concat = require('concat-stream');
function execute(executable = 'docker-compose', processPath, args = [], opts = {}) {
    log(">>> execute > args: ", args)
    const { env = null } = opts;
    const childProcess = createProcess(executable, processPath, args, env);
    childProcess.stdin.setEncoding('utf-8');

    const promise = new Promise((resolve, reject) => {
        var errorOut = ""
        var stdOut = ""

        childProcess.stdout.on('data', out => {
            log(">>>> cmd > stdout.on('data') :", out.toString());
            stdOut += out.toString()
        })

        childProcess.stderr.on('data', err => {
            log(">>>> cmd > stderr.on('data') :", err.toString());
            errorOut += err.toString()
        })

        childProcess.stderr.pipe(concat(err => {
            log(">>>> cmd > stderr err:", err.toString());
            // return reject(errorOut)
        }))

        childProcess.stdout.pipe(concat(result => {
            log(">>>> cmd > stdout out:" + result);
            // if (errorOut) reject(errorOut); else 
            // return resolve(result.toString());
        }))

        // childProcess.stderr.once('data', err => {
        //   console.log(">>>> cmd > stderr err:", err.toString());
        //   reject(err.toString());
        // });

        // childProcess.on('error', reject);
        childProcess.on('exit', (a) => {
            if (!!errorOut) {
                log(">>> exit: %o - reject: %o", a, errorOut);
                reject(errorOut);
            }
            else {
                log(">>> exit: %o - resolve: %o", a, stdOut);
                resolve(stdOut)
            }
        })
    });

    return promise;
}


module.exports = { execute };

