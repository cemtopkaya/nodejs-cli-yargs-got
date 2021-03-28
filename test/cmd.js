const spawn = require('child_process').spawn;
function createProcess(processPath, args = [], env = null) {

  args = [processPath].concat(args);
  console.log(">>>> cmd > args: ", args, "  > args.join: ", args.join(' '));

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
    childProcess.stderr.once('data', err => {
      console.log(">>>> cmd > stderr err:", err.toString());
      reject(err.toString());
    });

    childProcess.on('error', reject);

    childProcess.stdout.pipe(
      concat(result => {
        console.log(">>>> cmd > stdout result:", result);
        resolve(result.toString());
      })
    );
  });
  return promise;
}

module.exports = { execute };