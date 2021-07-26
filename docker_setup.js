const execa = require('execa');

const CONNECTORS = JSON.parse(process.env.CONNECTORS || '[]');

async function run() {
  for (const con of CONNECTORS) {
    const cmd = process.env[`CONNECTOR_${con}_TYPE`]
    console.log(`Adding ${cmd}...`);
    await execa('lerna', ['add', cmd, '--scope=@ldes/replicator']);
  }
  console.log('Installing dependencies...');
  const install = execa('npm', ['i']);
  install.stdout.pipe(process.stdout);
  install.stderr.pipe(process.stderr);
  await install;
}

run().catch(error => console.error(error))
