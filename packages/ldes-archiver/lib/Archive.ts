import { readdir } from 'fs/promises';
import type { IWritableConnector, IArchiveExtension } from '@ldes/types';
import { toRDF } from 'jsonld';
import { helpers } from './utils/Helpers';

const BYTE_THRESHOLD = 50_000;

export class Archive implements IWritableConnector {
  private readonly outputDirectory: string;
  private readonly extension: IArchiveExtension;

  private byteCounter: number;
  private numberOfNoWrites: number;
  private wroteToFileInInterval: boolean;

  public constructor(outputDirectory: string, extension?: IArchiveExtension | undefined) {
    this.outputDirectory = outputDirectory;
    this.byteCounter = 0;
    this.numberOfNoWrites = 0;
    this.wroteToFileInInterval = false;

    if (extension) {
      this.extension = extension!;
      this.startInterval();
    }
  }

  public async writeVersion(member: any): Promise<void> {
    const json = JSON.parse(member);
    const timestamp = this.getTimestamp(json);
    const entityId = this.getEntityId(json);
    const rdf = await toRDF(json, { format: 'application/n-quads' });

    await this.writeToDirectory(entityId, timestamp, rdf);
    this.wroteToFileInInterval = true;
  }

  public async provision(): Promise<void> {
    try {
      await Promise.all([
        helpers.createDirectory(this.outputDirectory),
        this.extension.provision(),
      ]);
    } catch (error: unknown) {
      console.error(error);
    }
  }

  private startInterval(): void {
    setInterval(async() => {
      if (this.byteCounter >= BYTE_THRESHOLD || this.numberOfNoWrites >= 10) {
        const files = await readdir(this.outputDirectory);

        if (files.length > 0) {
          const tasks: Promise<void>[] = [];

          files.forEach(file => {
            tasks.push(this.extension.pushToStorage(file));
          });

          await Promise.all(tasks);

          if (tasks.length > 0) {
            console.log(`[Archive]: All files in ${this.outputDirectory} were uploaded to extension.`);
          }
        }

        this.reset();
      }

      if (!this.wroteToFileInInterval) {
        console.log(`[Archive]: No version received during this interval.`);
        this.numberOfNoWrites++;
      }
      this.wroteToFileInInterval = false;
    }, 10_000);
  }

  private reset(): void {
    console.log(`[Archive]: Resetting byte counter and number of no writes counter.`);
    this.byteCounter = 0;
    this.numberOfNoWrites = 0;
  }

  private async writeToDirectory(entity: string, timestamp: string, data: any): Promise<void> {
    const entityPath = `${this.outputDirectory}/${entity}`;
    const versionPath = `${entityPath}/${timestamp}.ttl`;

    try {
      await helpers.directoryExists(entityPath);
    } catch {
      console.log(`[Archive]: Directory for entity ${entity} does not exist yet and will be created.`);
      await helpers.createDirectory(entityPath);
    }

    const bytes = Buffer.from(data.toString()).byteLength;
    this.byteCounter += bytes;

    await helpers.writeToFile(versionPath, data);
  }

  private getTimestamp(data: any): string {
    const time = data['http://www.w3.org/ns/prov#generatedAtTime'];
    let timestamp: string = typeof time === 'string' ? time : time['@value'];
    timestamp = timestamp.replace(/[:-]/gu, '');
    return timestamp.replace(/[.]/gu, '_');
  }

  private getEntityId(data: any): string {
    const uri: string = data['http://purl.org/dc/terms/isVersionOf']['@id'];
    const parts = uri.split('/');
    return parts[parts.length - 1];
  }
}
