import { SubjectPageBucketizer } from '@ldes/subject-page-bucketizer';
import type { IArchiveExtension } from '@ldes/types';
import { IBucketizer } from '@ldes/types';
import { newEngine } from '@treecg/actor-init-ldes-client';
import type { OptionValues } from 'commander';
import { Command } from 'commander';
import type { IArchiveOptions, IExtensionOptions } from '../lib/Archive';
import { Archive } from '../lib/Archive';
import { helpers } from '../lib/utils/Helpers';

const program = new Command();

program
  .requiredOption('--url <url>', 'URL of the Linked Data Event Stream')
  .requiredOption('--outputDir <dir>', 'Directory to write the (temporary) output to')
  .option('-b, --bucketizer <strategy>', 'Strategy on how to bucketize the LDES')
  .option(
    '-t, --timestampPredicate <predicate>',
    // eslint-disable-next-line max-len
    'Indicating how you can understand using a timestamp a member precedes another member in the LDES. Default: "http://www.w3.org/ns/prov#generatedAtTime"',
    'http://www.w3.org/ns/prov#generatedAtTime',
  )
  .option(
    '-v, --versionOfPredicate <predicate>',
    'Indicating the non-version object. Default "http://purl.org/dc/terms/isVersionOf"',
    'http://purl.org/dc/terms/isVersionOf'
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
    timestampPredicate: _options.timestampPredicate,
    outputDirectory: _options.outputDir,
  };

  let extension: IArchiveExtension;
  if (_options.extension) {
    if (!_options.connectionString || !_options.container) {
      throw new Error(`[Archiver]: Please provide a connection string and a container name to connect to.`);
    } else {
      const extensionOptions: IExtensionOptions = {
        connectionString: _options.connectionString,
        containerName: _options.containerName,
      };
      extension = helpers.getExtension(_options.extension, archiveOptions.outputDirectory, extensionOptions);
    }
  }

  let bucketizer: IBucketizer;
  if (_options.bucketizer) {
    bucketizer = helpers.getBucketizer(_options.bucketizer, _options.versionOfPredicate);
  }

  const LDESClient = newEngine();
  const archive = new Archive(
    archiveOptions.outputDirectory,
    archiveOptions.timestampPredicate,
  );
  await archive.provision();

  const ldes = LDESClient.createReadStream(archiveOptions.url, ldesOptions);
  ldes.on('data', async member => {
    if (bucketizer) {
      bucketizer.bucketize(member.quads);
    }

    await archive.writeVersion(member.quads);
  });

  ldes.on('end', async () => {
    await archive.flush();
    process.exit(1);
  });
};

run(options).catch(error => console.log(error.stack));
