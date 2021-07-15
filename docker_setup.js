const { exec } = require('child_process');

//Promise interface to execute commands
function execShellCommand(cmd) {
  return new Promise((resolve, reject) => {
    exec(cmd, { maxBuffer: 1024 * 500 }, (error, stdout, stderr) => {
      if (error) {
        console.warn(error);
      } else if (stdout) {
        console.log(stdout);
      } else {
        console.log(stderr);
      }
      resolve(!!stdout);
    });
  });
}

const CONNECTORS = JSON.parse(process.env.CONNECTORS || '[]');

async function run() {
  for (const con of CONNECTORS) {
    const cmd = process.env[`CONNECTOR_${con}_TYPE`]
    console.log(cmd);
    await execShellCommand(`lerna add ${cmd} --scope=@ldes/replicator`);
  }
  await execShellCommand('npm i');
}

run().catch(error => console.error(error))
