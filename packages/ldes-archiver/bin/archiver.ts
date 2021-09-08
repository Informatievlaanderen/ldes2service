import { newEngine } from '@treecg/actor-init-ldes-client';
import { Command } from 'commander';
import { Archive } from '../lib/Archive';

const program = new Command();

program
  .requiredOption('--url <url>', 'URL of the Linked Data Event Stream')
  .requiredOption('--output <dir>', 'Directory to write the (temporary) output to')
  .parse();

const options = program.opts();
const outputDirectory = options.output;
const url = options.url;

const run = async (url: string, outputDirectory: string): Promise<void> => {
  const ldesOptions = {
    emitMemberOnce: true,
    disablePolling: true,
    mimeType: 'application/ld+json',
  };

  const LDESClient = newEngine();

  const archive = new Archive(outputDirectory);
  await archive.provision();

  const ldes = LDESClient.createReadStream(
    url,
    ldesOptions,
  );

  //TODO: change this when new LDES client is available
  ldes.on('data', async data => {
    await archive.writeVersion(data);
  });
};

run(url, outputDirectory).catch(error => console.log(error.stack));
