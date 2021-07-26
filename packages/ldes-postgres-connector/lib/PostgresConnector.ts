import type { IWritableConnector, IConfigConnector, LdesObjects, LdesShape } from '@ldes/types';
import type { PoolClient } from 'pg';
import { Pool } from 'pg';
import slugify from 'slugify';

export interface IConfigPostgresConnector extends IConfigConnector {
  username: string;
  hostname: string;
  database: string;
  password: string;
  port: number;
}

enum PostgresDataType {
  TEXT = 'TEXT',
  TIMESTAMP = 'TIMESTAMP',
  JSONB = 'JSONB',
}

const dataTypes = new Map<string, PostgresDataType>([
  ['iri', PostgresDataType.TEXT],
  ['datetime', PostgresDataType.TIMESTAMP],
  ['string', PostgresDataType.TEXT],
  ['langstring', PostgresDataType.TEXT],
  ['concept', PostgresDataType.TEXT],
  ['label', PostgresDataType.TEXT],
]);

export class PostgresConnector implements IWritableConnector {
  private readonly config: IConfigPostgresConnector;
  // TODO: set the type
  private shape?: LdesShape;
  private pool: Pool;
  private poolClient: PoolClient;
  private columnToFieldPath: Map<string, string> = new Map();

  /**
   * Templates for the backend generator.
   */
  public static composeTemplate = `
{hostname}: 
  image: bitnami/postgresql
  restart: always
  environment:
    POSTGRES_USER: {username}
    POSTGRES_PASSWORD: {password}
    POSTGRES_DB: {database}
    POSTGRES_PORT_NUMBER: {port}
  ports:
    - "{port}:{port}"
    `;

  public static helmTemplate = `
name: {hostname}
chart: bitnami/postgresql
namespace: ldes
createNamespace: true
values:
  - postgresqlUsername: "{username}"
  - postgresqlPassword: "{password}"
  - postgresqlDatabase: "{database}"
  - service.nodePort: "{port}"
    `;

  public constructor(config: IConfigPostgresConnector) {
    this.config = config;
  }

  public setShape(shape?: LdesShape) {
    this.shape = shape;
  }

  /**
   * Writes a version to the corresponding backend system
   * @param member
   */
  public async writeVersion(member: string): Promise<void> {
    const JSONmember: object = JSON.parse(member);
    //
    console.debug('Member to write :', JSONmember);

    const columns = Array.from(this.columnToFieldPath.keys());

    let query = `INSERT INTO "${this.config.databaseName}" (`
      .concat(columns.join(', '), ', data) VALUES (')
      .concat(columns.map((_item, index) => `$${index + 1}`).join(', '), `, $${columns.length + 1});`);

    // @ts-ignore
    let values = columns.map(column => this.getField(JSONmember[this.columnToFieldPath.get(column)]));
    values.push(member);

    console.log({ query, values });

    await this.poolClient.query(query, values);
  }

  /**
   * Initializes the backend system by creating tables, counters and/or enabling plugins
   * Table definition:
   *   "id" URI representing the event
   *   "type" URI representing the event type
   *   "is_version_of" URI for the main object this snapshot represents
   *   "generated_at" Timestamp generation (value or object[@value])
   *   "data" The rest
   */
  public async provision(): Promise<void> {
    this.pool = new Pool({
      user: this.config.username,
      host: this.config.hostname,
      database: this.config.database,
      password: this.config.password,
      port: this.config.port,
    });

    this.poolClient = await this.pool.connect();

    let query = `CREATE TABLE IF NOT EXISTS "${this.config.databaseName}" (id SERIAL PRIMARY KEY`;

    this.shape!.forEach(field => {
      let slugField = this.extractAndSlug(field.path);
      this.columnToFieldPath.set(slugField, field.path);
      query = query.concat(`, ${slugField} ${dataTypes.get(this.extractAndSlug(field.datatype) ?? 'TEXT')}`);
    });

    query = query.concat(', data JSONB NOT NULL);');

    console.debug('Creation table query', query);

    await this.pool.query(query);
  }

  private extractAndSlug(value: string): string {
    const reg = /([^#\/]+$)/gm;
    return slugify(value.match(reg)![0], { remove: /[*+~.()'"!:@/]/g, lower: true, replacement: '_' });
  }

  /**
   * Stops asynchronous operations
   */
  public async stop(): Promise<void> {
    this.poolClient.release();
    return this.pool.end();
  }

  // TODO: port this to other connectors

  private getField(property: any, datatype: PostgresDataType): Date | string | null {
    const value: string | undefined = property?.['@value'] ?? property?.['@id'] ?? property;

    if (value === undefined || value === null) {
      return null;
    }

    // if(datatype === PostgresDataType.TIMESTAMP){
    //   return new Date(value)
    // }

    return value;
  }
}
