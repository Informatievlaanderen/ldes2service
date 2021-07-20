import type { IWritableConnector, IConfigConnector } from '@ldes/types';
import type { PoolClient } from 'pg';
import { Pool } from 'pg';

export interface IConfigPostgresConnector extends IConfigConnector {
  username: string;
  hostname: string;
  database: string;
  password: string;
  port: number;
}

export class PostgresConnector implements IWritableConnector {
  private readonly config: IConfigPostgresConnector;
  // TODO: set the type
  private shape?: any;
  private pool: Pool;
  private poolClient: PoolClient;

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

  public setShape(shape?: any) {
    this.shape = shape;
  }

  /**
   * Writes a version to the corresponding backend system
   * @param member
   */
  public async writeVersion(member: string): Promise<void> {
    const JSONmember = JSON.parse(member);

    // This needs to become more generic:
    // @see https://github.com/osoc21/ldes2service/issues/20
    const isVersionOf = JSONmember['http://purl.org/dc/terms/isVersionOf']['@id'];

    const memberObject = {
      id: JSONmember['@id'],
      type: JSONmember['@type'],
      generated_at: PostgresConnector.getDate(JSONmember['http://www.w3.org/ns/prov#generatedAtTime']),
      is_version_of: isVersionOf,
      data: member,
    };

    const query = `INSERT INTO "${this.config.databaseName}" (id, generated_at, type, is_version_of, data) 
      VALUES ($1, $2, $3, $4, $5)
      ON CONFLICT ("id") DO NOTHING;`;

    await this.poolClient.query(query, [
      memberObject.id,
      memberObject.generated_at,
      memberObject.type,
      memberObject.is_version_of,
      memberObject.data,
    ]);

    if (this.config.amountOfVersions > 0) {
      const { rows: results } = await this.poolClient.query(
        `SELECT * FROM "${this.config.databaseName}" WHERE is_version_of = $1 ORDER BY generated_at ASC`,
        [memberObject.is_version_of]
      );

      const numberToDelete = results.length - this.config.amountOfVersions;

      if (numberToDelete > 0) {
        const idsToRemove = results.slice(0, numberToDelete).map((value: any) => `'${value.id}'`);

        await this.pool.query(
          `DELETE FROM "${this.config.databaseName}" WHERE id IN (${idsToRemove.join(', ')})`
        );
      }
    }
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

    await this.pool.query(`CREATE TABLE IF NOT EXISTS "${this.config.databaseName}"
        (id TEXT PRIMARY KEY,
        type TEXT NOT NULL,
        is_version_of TEXT,
        generated_at TIMESTAMP,
        data JSONB NOT NULL);`);

    // We'll probably need to add more indexes to other columns
    // await this.pool.query(`CREATE INDEX ON ${this.config.databaseName} (id)`);
  }

  /**
   * Stops asynchronous operations
   */
  public async stop(): Promise<void> {
    this.poolClient.release();
    return this.pool.end();
  }

  // TODO: port this to other connectors
  private static getDate(dateProperty: string | { '@id': string }): Date | null {
    let generatedAtTime;
    switch (typeof dateProperty) {
      case 'string':
        generatedAtTime = new Date(dateProperty);
        break;
      case 'object':
        generatedAtTime = new Date(dateProperty['@id']);
        break;
      default:
        generatedAtTime = null;
    }
    return generatedAtTime && !Number.isNaN(generatedAtTime.getTime()) ? generatedAtTime : null;
  }
}
