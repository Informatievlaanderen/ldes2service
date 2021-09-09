import type { IArchiveExtension } from '@ldes/types';
import { newEngine } from '@treecg/actor-init-ldes-client';
import { Command } from 'commander';
import { AzureExtension } from '../../ldes-archive-azure-extension';
import { Archive } from '../lib/Archive';

const program = new Command();

program
  .requiredOption('--url <url>', 'URL of the Linked Data Event Stream')
  .requiredOption('--output <dir>', 'Directory to write the (temporary) output to')
  .option('--extension <extension>', 'Set the name of the extension. For the moment only "azure" is supported')
  .option('--connectionString <cs>', 'Azure connection string to connect to the storage account')
  .option('--container <name>', 'Name of the Azure Storage Container where data will be written to')
  .parse();

const options = program.opts();

const archiveOptions: IArchiveOptions = {
  outputDirectory: options.output,
  url: options.url,
  extension: options.extension,
  connectionString: options.connectionString,
  containerName: options.container,
};

const run = async(_archiveOptions: IArchiveOptions): Promise<void> => {
  const ldesOptions = {
    emitMemberOnce: true,
    disablePolling: true,
    mimeType: 'application/ld+json',
  };

  if (_archiveOptions.extension &&
    _archiveOptions.connectionString === undefined &&
    _archiveOptions.containerName === undefined) {
    throw new Error(`[Archiver]: Please provide a connection string and container name if your want to use an extension`);
  }

  let extension: IArchiveExtension | undefined;
  if (_archiveOptions.extension) {
    if (_archiveOptions.connectionString === undefined && _archiveOptions.containerName === undefined) {
      throw new Error(`[Archiver]: Please provide a connection string and container name if your want to use an extension`);
    }

    extension = getExtension(_archiveOptions);
  }

  const LDESClient = newEngine();
  const archive = new Archive(_archiveOptions.outputDirectory);
  await archive.provision();

  const ldes = LDESClient.createReadStream(
    _archiveOptions.url,
    ldesOptions,
  );

  // TODO: change this when new LDES client is available
  ldes.on('data', async data => {
    await archive.writeVersion(data);
  });
};

export interface IArchiveOptions {
  outputDirectory: string;
  url: string;
  extension?: string;
  connectionString?: string;
  containerName?: string;
}

const getExtension = (_archiveOptions: IArchiveOptions): IArchiveExtension => {
  switch (_archiveOptions.extension) {
    case 'azure':
      return new AzureExtension(
        _archiveOptions.connectionString!,
        _archiveOptions.containerName!,
        _archiveOptions.outputDirectory,
      );
    default:
      throw new Error(`[Archiver]: Please provide a valid extension.`);
  }
};

run(archiveOptions).catch(error => console.log(error.stack));
