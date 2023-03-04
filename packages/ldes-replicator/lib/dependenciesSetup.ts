import type { IConnectorConfig } from '@treecg/ldes-types';
const execa = require('execa');

const LOCAL_LDES_CONNECTORS = new Set(['@treecg/ldes-postgres-connector', '@treecg/ldes-mongodb-connector']);

export async function dependenciesSetup(config: any): Promise<void> {
  const neededConnectors = Object.values(config.connectors).map((con: IConnectorConfig) => con.type);

  for (const con of neededConnectors) {
    console.log(`Adding ${con}...`);
    await execa('npm', ['run', 'lerna', '--', 'add', con, '--scope=@treecg/ldes-replicator']);
  }
  if (neededConnectors.filter(el => !LOCAL_LDES_CONNECTORS.has(el)).length === 0) {
    console.log('Skipping install...');
    return;
  }
  console.log('Installing dependencies...');
  const install = execa('npm', ['i']);
  if (install.stdout) {
    install.stdout.pipe(process.stdout);
  }
  if (install.stderr) {
    install.stderr.pipe(process.stderr);
  }
  await install;
}
