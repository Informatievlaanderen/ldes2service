import { mkdir, access, writeFile, appendFile } from 'fs/promises';
import { BasicBucketizer } from '@treecg/ldes-basic-bucketizer';
import { AzureExtension } from '@treecg/ldes-local-archive-azure-extension';
import { SubjectPageBucketizer } from '@treecg/ldes-subject-page-bucketizer';
import { SubstringBucketizer } from '@treecg/ldes-substring-bucketizer';
import type { IArchiveExtension, IBucketizer } from '@treecg/ldes-types';
import { formatISO } from 'date-fns';
import type { IExtensionOptions } from '../Archive';

export class Helpers {
  // User should be able to define a path outside this package
  public createDirectory(path: string): Promise<string | undefined> {
    return mkdir(path, { recursive: true });
  }

  public appendToBucket(path: string, data: any): Promise<void> {
    return appendFile(path, data);
  }

  public directoryExists(path: string): Promise<void> {
    return access(path);
  }

  public formatDate(date: Date): string {
    const basicISO = formatISO(date, { format: 'basic' });
    return basicISO.split('+')[0];
  }

  public writeToFile(path: string, data: any): Promise<void> {
    return writeFile(path, data);
  }

  public getExtension = (
    extension: string,
    outputDirectory: string,
    extensionOptions: IExtensionOptions,
  ): IArchiveExtension => {
    switch (extension) {
      case 'azure':
        return new AzureExtension(
          extensionOptions.connectionString,
          extensionOptions.containerName,
          outputDirectory,
        );
      default:
        throw new Error(`[Archiver]: Please provide a valid extension.`);
    }
  };

  public getBucketizer = (
    bucketizer: string,
    propertyPath: string,
    pageSize: number,
  ): Promise<IBucketizer> => {
    switch (bucketizer) {
      case 'substring':
        return new Promise(resolve => resolve(SubstringBucketizer.build(propertyPath, pageSize)));
      case 'subject-page':
        return new Promise(resolve => resolve(SubjectPageBucketizer.build(propertyPath)));
      case 'basic':
      default:
        return new Promise(resolve => resolve(BasicBucketizer.build(pageSize)));
    }
  };
}

export const helpers = new Helpers();
