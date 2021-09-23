import { readdir } from 'fs/promises';
import type { IWritableConnector, IArchiveExtension } from '@ldes/types';
import type * as RDF from '@rdfjs/types';
import * as N3 from 'n3';
import { DataFactory } from 'rdf-data-factory';
import { helpers } from './utils/Helpers';

const BYTE_THRESHOLD = 50_000;
const factory = new DataFactory();

const timestampProperty: RDF.NamedNode = factory.namedNode('http://www.w3.org/ns/prov#generatedAtTime');
const versionOfProperty: RDF.NamedNode = factory.namedNode('http://purl.org/dc/terms/isVersionOf');

export interface IArchiveOptions {
  outputDirectory: string;
  url: string;
  extension?: string;
}

export interface IExtensionOptions {
  connectionString: string;
  containerName: string;
}

// TODO: check if this still works for the extensions
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

  public stop = async (): Promise<void> => {
    // eslint-disable-next-line unicorn/no-process-exit
    process.exit(1);
  };

  public async provision(): Promise<void> {
    try {
      await Promise.all([helpers.createDirectory(this.outputDirectory), this.extension?.provision()]);
    } catch (error: unknown) {
      console.error(error);
    }
  }

  public async writeVersion(member: any): Promise<void> {
    const [timestamp, entityIdentifier] = this.processQuads(member.quads);

    if (!timestamp || !entityIdentifier) {
      console.error(`[Archiver]: timestamp or entityIdentifier is not present.`);
      // eslint-disable-next-line unicorn/no-process-exit
      process.exit(1);
    }

    await this.writeToDirectory(entityIdentifier, timestamp, member.quads);
    this.wroteToFileInInterval = true;
  }

  private async writeToDirectory(entity: string, timestamp: string, quads: RDF.Quad[]): Promise<void> {
    const entityPath = `${this.outputDirectory}/${entity}`;
    const versionPath = `${entityPath}/${timestamp}.ttl`;

    try {
      await helpers.directoryExists(entityPath);
    } catch {
      console.log(`[Archive]: Directory for entity ${entity} does not exist yet and will be created.`);
      await helpers.createDirectory(entityPath);
    }

    const writer = new N3.Writer();
    writer.addQuads(quads);
    writer.end(async (error, result) => {
      if (error) {
        console.log(error);
      }

      // TODO: check if this still works for the extensions
      const bytes = Buffer.from(result.toString()).byteLength;
      this.byteCounter += bytes;
      await helpers.writeToFile(versionPath, result);
    });
  }

  private readonly processQuads = (quads: RDF.Quad[]): string[] => {
    let timestamp;
    let entityIdentifier;

    quads.forEach((quad: RDF.Quad) => {
      if (quad.predicate.equals(timestampProperty)) {
        timestamp = this.getTimestampForFilename(quad);
      }

      if (quad.predicate.equals(versionOfProperty)) {
        entityIdentifier = this.getEntityId(quad);
        console.log(entityIdentifier);
      }
    });

    return [timestamp || '', entityIdentifier || ''];
  };

  private startInterval(): void {
    setInterval(async () => {
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

  private getTimestampForFilename(quad: RDF.Quad): string {
    const time = quad.object.value;
    const timestamp = time.replace(/[:-]/gu, '');
    return timestamp.replace(/[.]/gu, '_');
  }

  private getEntityId(quad: RDF.Quad): string {
    const uri: string = quad.object.value;
    const parts = uri.split('/');
    return parts[parts.length - 1];
  }
}
