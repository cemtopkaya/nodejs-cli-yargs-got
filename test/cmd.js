const { log } = require('./mocha-setup').logFunctions;
const spawn = require('child_process').spawn;
function createProcess(processPath, args = [], env = null) {

  args = [processPath].concat(args);
  console.log(">>>> cmd > args: ", args)
  console.log(">>>> cmd > args.join: ", args.join(' '));

  return spawn('node', args, {
    env: Object.assign(
      {
        NODE_ENV: 'dev'
      },
      env
    )
  });
}

// const concat = require('mississippi').concat
const concat = require('concat-stream');
function execute(processPath, args = [], opts = {}) {
  log(">>> execute > args: ", args)
  const { env = null } = opts;
  const childProcess = createProcess(processPath, args, env);
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

    childProcess.stderr.pipe(
      concat(err => {
        log(">>>> cmd > stderr err:", err.toString());
        // return reject(errorOut)
      })
    );

    childProcess.stdout.pipe(
      concat(result => {
        log(">>>> cmd > stdout out:" + result);
        // if (errorOut) reject(errorOut); else 
        // return resolve(result.toString());
      })
    );

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
    });

  });

  return promise;
}

module.exports = { execute };