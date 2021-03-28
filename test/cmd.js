const spawn = require('child_process').spawn;
function createProcess(processPath, args = [], env = null) {

  args = [processPath].concat(args);
  console.log(">>>> cmd > args: ", args)
  console.log(">>>> cmd > args.join: ", args.join(' '));

  return spawn('node', args, {
    env: Object.assign(
      {
        NODE_ENV: 'test'
      },
      env
    )
  });
}

// const concat = require('mississippi').concat
const concat = require('concat-stream');
function execute(processPath, args = [], opts = {}) {
  console.log(">>> execute > args: ", args)
  const { env = null } = opts;
  const childProcess = createProcess(processPath, args, env);
  childProcess.stdin.setEncoding('utf-8');

  const promise = new Promise((resolve, reject) => {
    var errorOut = ""
    childProcess.stderr.on('data', err => {
      errorOut += err.toString()
      // console.log(">>>> cmd > stderr on'err' :", err.toString());
    })

    childProcess.stderr.pipe(
      concat(err => {
        // console.log(">>>> cmd > stderr err:", err);
        reject(errorOut)
      })
    )

    // childProcess.stderr.once('data', err => {
    //   console.log(">>>> cmd > stderr err:", err.toString());
    //   reject(err.toString());
    // });

    // childProcess.on('error', reject);
    // childProcess.on('exit', (a) => {
    //   console.log(">>> exit: ", a, errorOut);
    //   reject(errorOut)
    // });

    childProcess.stdout.pipe(
      concat(result => {
        console.log(">>>> cmd > stdout result:", result);
        if (errorOut) reject(errorOut);
        else resolve(result.toString());
      })
    );
  });
  return promise;
}

module.exports = { execute };