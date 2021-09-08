import { readdir, unlink } from 'fs/promises';
import path = require('path');
import type { ContainerClient } from '@azure/storage-blob';
import { BlobServiceClient } from '@azure/storage-blob';
import type { IArchiveExtension } from '@ldes/types';

export class AzureExtension implements IArchiveExtension {
  private readonly connectionString: string;
  private readonly containerName: string;
  private readonly temporaryOutputDirectory: string;
  private containerClient: ContainerClient;

  public constructor(connectionString: string, containerName: string, temporaryOutputDirectory: string) {
    this.connectionString = connectionString;
    this.containerName = containerName;
    this.temporaryOutputDirectory = temporaryOutputDirectory;
  }

  public async provision(): Promise<void> {
    const blobServiceClient = BlobServiceClient.fromConnectionString(this.connectionString);
    this.containerClient = blobServiceClient.getContainerClient(this.containerName);

    const exists = await this.containerClient.exists();
    if (!exists) {
      throw new Error(`[AzureExtension]: It seems that the container with name '${this.containerName}' does not exist. Please create it.`);
    }
  }

  public async pushToStorage(entity: string): Promise<void> {
    readdir(`${this.temporaryOutputDirectory}/${entity}`)
      .then(files => {
        files.forEach(async file => {
          const blockBlobClient = this.containerClient.getBlockBlobClient(`${entity}/${file}`);
          const absoluteFilePath = path.resolve(`data/${entity}`, file);
          await blockBlobClient.uploadFile(absoluteFilePath);
          await this.removeFile(absoluteFilePath);
        });
      }).catch(error => {
        throw new Error(error.stack);
      });
  }

  private async removeFile(filePath: string): Promise<void> {
    await unlink(filePath);
  }

  // TODO: move  this to Archive
  /*
    private async getDirectorySize(): Promise<number> {
    return await getFolderSize.loose(this.temporaryOutputDirectory);
  }*/
}
