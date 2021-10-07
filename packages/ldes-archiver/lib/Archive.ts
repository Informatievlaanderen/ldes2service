import { readdir } from 'fs/promises';
import type * as RDF from '@rdfjs/types';
import type { IWritableConnector, IArchiveExtension } from '@treecg/ldes-types';
import * as N3 from 'n3';
import { DataFactory } from 'rdf-data-factory';
import { helpers } from './utils/Helpers';

export interface IArchiveOptions {
  outputDirectory: string;
  url: string;
  extension?: IArchiveExtension;
}

export interface IExtensionOptions {
  connectionString: string;
  containerName: string;
}

export class Archive implements IWritableConnector {
  public readonly outputDirectory: string;
  public readonly extension: IArchiveExtension;
  public readonly factory: RDF.DataFactory;
  public readonly bucketPredicate: RDF.NamedNode;

  public constructor(options: IArchiveOptions) {
    this.factory = new DataFactory();
    this.outputDirectory = options.outputDirectory;
    this.bucketPredicate = this.factory.namedNode('https://w3id.org/ldes#bucket');

    if (options.extension) {
      this.extension = options.extension!;
    }
  }

  public stop = async (): Promise<void> => {
    throw new Error(`[Archive]: Method not implemented.`);
  };

  public async provision(): Promise<void> {
    try {
      await Promise.all([helpers.createDirectory(this.outputDirectory), this.extension?.provision()]);
    } catch (error: unknown) {
      console.error(error);
    }
  }

  public async writeVersion(quads: RDF.Quad[]): Promise<void> {
    const bucketTriples = this.getBucketTriples(quads);

    const tasks: any = [];
    if (bucketTriples.length > 0) {
      bucketTriples.forEach(async triple => {
        const bucket = triple.object.value;
        const bucketPath = `${this.outputDirectory}/${bucket}.ttl`;
        quads = quads.filter(quad => !bucketTriples.includes(quad));

        tasks.push(this.writeToBucket(bucketPath, quads));
      });
    }

    await Promise.all(tasks);
  }

  public flush = async (): Promise<void> => {
    if (this.extension !== undefined) {
      const files = await readdir(this.outputDirectory);

      if (files.length > 0) {
        const tasks: Promise<void>[] = [];

        files.forEach(file => {
          tasks.push(this.extension.pushToStorage(file));
        });

        await Promise.all(tasks);
      }
    }
  };

  private readonly getBucketTriples = (quads: RDF.Quad[]): RDF.Quad[] =>
    quads.filter(quad => quad.predicate.equals(this.bucketPredicate));

  private readonly writeToBucket = async (bucketPath: string, quads: RDF.Quad[]): Promise<void> => {
    const writer = new N3.Writer();

    writer.addQuads(quads);
    writer.end(async (error, result) => {
      if (error) {
        throw new Error(error.stack);
      }
      await helpers.appendToBucket(bucketPath, result);
    });
  };
}
