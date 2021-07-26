const execa = require('execa');

const CONNECTORS = JSON.parse(process.env.CONNECTORS || '[]');

const LDES_CONNECTORS = ['@ldes/ldes-postgres-connector', '@ldes/ldes-mongodb-connector'];

const neededConnectors = [];

async function run() {
  for (const con of CONNECTORS) {
    const cmd = process.env[`CONNECTOR_${con}_TYPE`];
    console.log(`Adding ${cmd}...`);
    neededConnectors.push(cmd);
    await execa('lerna', ['add', cmd, '--scope=@ldes/replicator']);
  }
  if (neededConnectors.filter(el => !LDES_CONNECTORS.contains(el)).length === 0) {
    console.log('Skipping install...');
    return;
  }
  console.log('Installing dependencies...');
  const install = execa('npm', ['i']);
  install.stdout.pipe(process.stdout);
  install.stderr.pipe(process.stderr);
  await install;
}

run().catch(error => console.error(error))
