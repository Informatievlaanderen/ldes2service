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
    '-s, --substringBucketSize <size>',
    'The page size for buckets when page size is set to "substring". Default 50.',
    '50',
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

  // If bucketizer option is not set, fall back to basic bucketizer
  const bucketizer = await helpers.getBucketizer(
    _options.bucketizer,
    _options.propertyPath,
    _options.substringBucketSize,
  );

  const LDESClient = newEngine();
  const archive = new Archive(archiveOptions);
  await archive.provision();

  const ldes = LDESClient.createReadStream(archiveOptions.url, ldesOptions);
  const tasks: any[] = [];

  ldes.on('data', member => {
    bucketizer.bucketize(member.quads, member.id);
    tasks.push(archive.writeVersion(member.quads));
  });

  ldes.on('end', async () => {
    await Promise.all(tasks);
    await archive.flush();
  });
};

run(options).catch(error => console.log(error.stack));
