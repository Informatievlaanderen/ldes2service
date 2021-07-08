import type { IWritableConnector } from '@ldes/types';
import { Pool } from 'pg';

const POSTGRES_USER = process.env.POSTGRES_USER || 'postgres';
const POSTGRES_HOST = process.env.POSTGRES_HOST || 'localhost';
const POSTGRES_NAME = process.env.POSTGRES_NAME || 'postgres';
const POSTGRES_PASSWORD = process.env.POSTGRES_PASSWORD;
const POSTGRES_PORT = Number.parseInt(process.env.POSTGRES_PORT || '5432', 10);

export class PostgresConnector implements IWritableConnector {
  private readonly pool: Pool;
  private readonly configuration: Record<string, any>;

  public constructor(configuration: Record<string, any>) {
    this.pool = new Pool({
      user: POSTGRES_USER,
      host: POSTGRES_HOST,
      database: POSTGRES_NAME,
      password: POSTGRES_PASSWORD,
      port: POSTGRES_PORT,
    });

    this.configuration = configuration;
  }

  /**
   * Writes a version to the corresponding backend system
   * @param member
   */
  public async writeVersion(member: string): Promise<void> {
    const memberObject = JSON.parse(member);
    if (this.configuration.amountOfVersions) {
      await this.writeLatestVersions(memberObject, this.configuration.amountOfVersions);
    } else {
      await this.writeEveryVersion(memberObject);
    }
  }

  /**
   * Writes a version to the corresponding backend system, if we store all the versions.
   * @param memberObject
   * @private
   */
  private async writeEveryVersion(memberObject: Record<string, any>): Promise<void> {
    // LDES client can send us the same member several times, so we only add the ones with a new unique @id.
    const query = 'INSERT INTO "ldes" VALUES ($1, $2, $3, $4, $5) ON CONFLICT ("@id") DO NOTHING;';

    const dateProperty = memberObject['http://www.w3.org/ns/prov#generatedAtTime'];
    const generatedAtTime = PostgresConnector.getDate(dateProperty);

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
   * Writes a version to the corresponding backend system, if we only want to keep the X latest versions.
   * @param memberObject
   * @param amountOfVersions
   * @private
   */
  private async writeLatestVersions(
    memberObject: Record<string, any>,
    amountOfVersions: number,
  ): Promise<void> {
    try {
      // 1st request: Check that the new member isn't already in the db.
      const query1 = 'SELECT count(*) as c FROM ldes WHERE "@id"=$1;';
      const res = await this.pool.query(query1, [memberObject['@id']]);
      if (Number.parseInt(res.rows[0].c, 10)) {
        console.log('Member already exists.', memberObject['@id']);
        return;
      }

      // 2nd request: Amount of versions currently in the db.
      const query2 = 'SELECT count("@id") as c FROM ldes WHERE "isVersionOf"=$1;';
      const versions = await this.pool.query(query2, [
        memberObject['http://purl.org/dc/terms/isVersionOf']['@id'],
      ]);
      if (versions.rowCount && Number.parseInt(versions.rows[0].c, 10) < amountOfVersions) {
        console.log('Version limit not reached.', versions.rows[0].c, amountOfVersions);
        return this.writeEveryVersion(memberObject);
      }

      // If == amountOfVersions, we need to get rid of one.
      // 3rd request: Get the timestamp of the oldest version in the DB.
      const query3 = `SELECT "@id", "generatedAtTime" FROM ldes 
          WHERE "isVersionOf"=$1 ORDER BY "generatedAtTime" LIMIT 1;`;
      const oldestVersion = await this.pool.query(query3, [
        memberObject['http://purl.org/dc/terms/isVersionOf']['@id'],
      ]);
      const dbOldestDate = PostgresConnector.getDate(oldestVersion.rows[0].generatedAtTime);
      const memberDate = PostgresConnector.getDate(memberObject['http://www.w3.org/ns/prov#generatedAtTime']);
      if (memberDate && dbOldestDate && memberDate > dbOldestDate) {
        // We get rid of the oldest one, either the new one or the one in the DB. (0 or 2 requests)
        const query4 = 'DELETE FROM ldes WHERE "@id"=$1';
        await this.pool.query(query4, [oldestVersion.rows[0]['@id']]);
        // Add the new member
        console.log('Member replaced older version.');
        return this.writeEveryVersion(memberObject);
      }
      console.log('Member is older than what we currently store.', dbOldestDate, memberDate);
    } catch (error: unknown) {
      console.error(error);
    }
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
