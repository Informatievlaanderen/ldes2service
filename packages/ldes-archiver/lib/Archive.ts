import type { IWritableConnector, IArchiveExtension } from '@ldes/types';
import { toRDF } from 'jsonld';
import { helpers } from './utils/Helpers';

export class Archive implements IWritableConnector {
  private readonly outputDirectory: string;
  private readonly extensions: IArchiveExtension[] | undefined;

  public constructor(outputDirectory: string, extensions?: IArchiveExtension[] | undefined) {
    this.outputDirectory = outputDirectory;
    this.extensions = extensions;
  }

  public async writeVersion(member: any): Promise<void> {
    const json = JSON.parse(member);
    const timestamp = this.getTimestamp(json);
    const entityId = this.getEntityId(json);
    const rdf = await toRDF(json, { format: 'application/n-quads' });

    await this.writeToDirectory(entityId, timestamp, rdf);
  }

  public async provision(): Promise<void> {
    try {
      await helpers.createDirectory(this.outputDirectory);
    } catch (error: unknown) {
      console.error(error);
    }
  }

  private async writeToDirectory(entity: string, timestamp: string, data: any): Promise<void> {
    const filename = helpers.formatDate(new Date(timestamp));
    const entityPath = `${this.outputDirectory}/${entity}`;
    const versionPath = `${entityPath}/${filename}.ttl`;

    try {
      await helpers.directoryExists(entityPath);
    } catch {
      console.log(`[Archive]: Directory for entity ${entity} does not exist yet and will be created.`);
      await helpers.createDirectory(entityPath);
    }

    await helpers.writeToFile(versionPath, data);
  }

  // TODO: enable other predicates as well? (e.g. dcterms:created)
  private getTimestamp(data: any): string {
    return data['http://www.w3.org/ns/prov#generatedAtTime'];
  }

  private getEntityId(data: any): string {
    const uri: string = data['http://purl.org/dc/terms/isVersionOf']['@id'];
    const parts = uri.split('/');
    return parts[parts.length - 1];
  }
}
