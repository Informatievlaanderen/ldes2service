import type { IArchiveExtension } from '@ldes/types';
import { newEngine } from '@treecg/actor-init-ldes-client';
import type { OptionValues } from 'commander';
import { Command } from 'commander';
import { AzureExtension } from '../../ldes-archive-azure-extension';
import type { IArchiveOptions, IExtensionOptions } from '../lib/Archive';
import { Archive } from '../lib/Archive';

const program = new Command();

program
  .requiredOption('--url <url>', 'URL of the Linked Data Event Stream')
  .requiredOption('--outputDir <dir>', 'Directory to write the (temporary) output to')
  .option(
    '--extension <extension>',
    'Set the name of the extension. For the moment only "azure" is supported'
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
    extension: _options.extension,
  };

  const extensionOptions: IExtensionOptions = {
    connectionString: _options.connectionString,
    containerName: _options.containerName,
  };

  if (
    archiveOptions.extension &&
    extensionOptions.connectionString === undefined &&
    extensionOptions.containerName === undefined
  ) {
    throw new Error(
      `[Archiver]: Please provide a connection string and container name if your want to use an extension.`
    );
  }

  const extension = getExtension(archiveOptions.extension!, archiveOptions.outputDirectory, extensionOptions);

  const LDESClient = newEngine();
  const archive = new Archive(archiveOptions.outputDirectory);
  await archive.provision();

  const ldes = LDESClient.createReadStream(archiveOptions.url, ldesOptions);
  ldes.on('data', async data => {
    await archive.writeVersion(data);
  });
};

const getExtension = (
  extension: string,
  outputDirectory: string,
  extensionOptions: IExtensionOptions
): IArchiveExtension => {
  switch (extension) {
    case 'azure':
      return new AzureExtension(
        extensionOptions.connectionString,
        extensionOptions.containerName,
        outputDirectory
      );
    default:
      throw new Error(`[Archiver]: Please provide a valid extension.`);
  }
};

run(options).catch(error => console.log(error.stack));
