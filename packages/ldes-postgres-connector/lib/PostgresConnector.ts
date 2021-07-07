import type { IWritableConnector } from '@ldes/types';
import { Pool } from 'pg';

const POSTGRES_USER = process.env.POSTGRES_USER || 'postgres';
const POSTGRES_HOST = process.env.POSTGRES_HOST || 'localhost';
const POSTGRES_NAME = process.env.POSTGRES_NAME || 'postgres';
const POSTGRES_PASSWORD = process.env.POSTGRES_PASSWORD;
const POSTGRES_PORT = Number.parseInt(process.env.POSTGRES_PORT || '5432', 10);

export class PostgresConnector implements IWritableConnector {
  private readonly pool: Pool;

  public constructor() {
    this.pool = new Pool({
      user: POSTGRES_USER,
      host: POSTGRES_HOST,
      database: POSTGRES_NAME,
      password: POSTGRES_PASSWORD,
      port: POSTGRES_PORT,
    });
  }

  /**
   * Writes a version to the corresponding backend system
   * @param member
   */
  public async writeVersion(member: string): Promise<void> {
    const memberObject = JSON.parse(member);
    // LDES client can send us the same member several times, so we only add the ones with a new unique @id.
    const query = 'INSERT INTO "ldes" VALUES ($1, $2, $3, $4, $5) ON CONFLICT ("@id") DO NOTHING;';

    const generatedAtTime = PostgresConnector.getDate(memberObject['http://www.w3.org/ns/prov#generatedAtTime']);

    const values = [
      memberObject['@id'],
      memberObject['@type'],
      memberObject['http://purl.org/dc/terms/isVersionOf']['@id'],
      generatedAtTime,
      memberObject,
    ];
    this.pool.query(query, values, (err, res) => {
      if (err) {
        console.error(err);
      } else {
        console.log('New entry added to the postgres database.');
      }
    });
  }

  /**
   * Initializes the backend system by creating tables, counters and/or enabling plugins
   * Table definition:
   *   "@id" URI representing the event
   *   "@type" URI representing the event type
   *   "http://purl.org/dc/terms/isVersionOf" URI for the main object this snapshot represents
   *   "http://www.w3.org/ns/prov#generatedAtTime" Timestamp generation (value or object[@value])
   *   "content" The rest
   */
  public async provision(): Promise<void> {
    const query = `CREATE TABLE IF NOT EXISTS "ldes"
        ("@id" TEXT PRIMARY KEY,
        "@type" TEXT NOT NULL,
        "isVersionOf" TEXT,
        "generatedAtTime" TIMESTAMP,
        "content" JSONB NOT NULL);`;

    await this.pool.query(query);
  }

  private static getDate(memberProperty: string | { '@id': string }): Date | null {
    let generatedAtTime;
    switch (typeof memberProperty) {
      case 'string':
        generatedAtTime = new Date(memberProperty);
        break;
      case 'object':
        generatedAtTime = new Date(memberProperty['@id']);
        break;
      default:
        generatedAtTime = null;
    }
    return generatedAtTime && !Number.isNaN(generatedAtTime.getTime()) ? generatedAtTime : null;
  }
}
