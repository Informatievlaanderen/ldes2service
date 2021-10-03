import type { IBucketizer } from '@ldes/types';
import { newEngine } from '@treecg/actor-init-ldes-client';
import type { OptionValues } from 'commander';
import { Command } from 'commander';
import type { IArchiveOptions, IExtensionOptions } from '../lib/Archive';
import { Archive } from '../lib/Archive';
import { helpers } from '../lib/utils/Helpers';

const N3 = require('n3');

const program = new Command();

program
  .requiredOption('--url <url>', 'URL of the Linked Data Event Stream')
  .requiredOption('--outputDir <dir>', 'Directory to write the (temporary) output to')
  .option('-b, --bucketizer <strategy>', 'Strategy on how to bucketize the LDES')
  .option(
    '-p, --propertyPath <path>',
    'The property path the must be used in the bucktizer',
  )
  .option(
    '--extension <extension>',
    'Set the name of the extension. For the moment only "azure" is supported',
  )
  .option('--connectionString <cs>', 'Azure connection string to connect to the storage account')
  .option('--container <name>', 'Name of the Azure Storage Container where data will be written to')
  .parse();

const options = program.opts();

const run = async (_options: OptionValues): Promise<void> => {
  const ldesOptions = {
    emitMemberOnce: true,
    disablePolling: true,
    representation: 'Quad',
  };

  const archiveOptions: IArchiveOptions = {
    url: _options.url,
    outputDirectory: _options.outputDir,
  };

  if (_options.extension) {
    if (!_options.connectionString || !_options.container) {
      throw new Error(`[Archiver]: Please provide a connection string and a container name to connect to.`);
    } else {
      const extensionOptions: IExtensionOptions = {
        connectionString: _options.connectionString,
        containerName: _options.containerName,
      };
      archiveOptions.extension =
        helpers.getExtension(_options.extension, archiveOptions.outputDirectory, extensionOptions);
    }
  }

  let bucketizer: IBucketizer;
  if (_options.bucketizer) {
    bucketizer = await helpers.getBucketizer(_options.bucketizer, _options.propertyPath);
  }

  const LDESClient = newEngine();
  const archive = new Archive(archiveOptions);
  await archive.provision();

  const ldes = LDESClient.createReadStream(archiveOptions.url, ldesOptions);
  ldes.on('data', async member => {
    if (bucketizer) {
      bucketizer.bucketize(member.quads, member.id);
    }

    await archive.writeVersion(member.quads);
  });

  ldes.on('end', async () => {
    await archive.flush();
    process.exit(1);
  });
};

run(options).catch(error => console.log(error.stack));
