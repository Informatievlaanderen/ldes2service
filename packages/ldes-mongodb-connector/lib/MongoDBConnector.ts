import type { IWritableConnector } from '@ldes/types';
import type { Db } from 'mongodb';
import { MongoClient } from 'mongodb';

interface IMongoDBConnectorConfig {
  amountOfVersions: number;
}

export class MongoDBConnector implements IWritableConnector {
  private readonly config: IMongoDBConnectorConfig;
  private db: Db;

  public constructor(config: IMongoDBConnectorConfig) {
    this.config = config;
  }

  /**
   * Writes a version to the corresponding backend system
   * @param member
   */
  public async writeVersion(member: any): Promise<void> {
    let JSONmember;
    try {
      JSONmember = JSON.parse(member);
    } catch {
      console.log(member);
    }

    const collection = this.db.collection('ldes');

    const id = JSONmember['@id'];
    const type = JSONmember['@type'];
    const time = JSONmember['http://www.w3.org/ns/prov#generatedAtTime'];

    // This needs to become more generic:
    // @see https://github.com/osoc21/ldes2service/issues/20
    const isVersionOf = JSONmember['http://purl.org/dc/terms/isVersionOf']['@id'];

    // Insert anyway
    await collection.insertOne({
      id,
      date: time,
      type,
      isVersionOf,
      data: member,
    });

    // Do we need to delete the others?
    if (this.config.amountOfVersions > 0) {
      // Count amount of versions
      const results = await collection
        .find({
          isVersionOf,
        })
        .sort({ date: -1 })
        .toArray();

      // If more than amountOfVersions
      // delete te oldest
      const numberToDelete = results.length - this.config.amountOfVersions;

      if (numberToDelete > 0) {
        console.log('number to delete:', numberToDelete);

        const idsToRemove = results.slice(0, numberToDelete).map((value: any) => value._id);
        console.debug('ids :', idsToRemove);

        await collection.deleteMany({ _id: { $in: idsToRemove } });
      }
    }
  }

  /**
   * Initializes the backend system by creating tables, counters and/or enabling plugins
   */
  public async provision(): Promise<void> {
    const url = 'mongodb://localhost:27017';

    const client = new MongoClient(url);

    try {
      // Connect the client to the server
      await client.connect();

      // Establish and verify connection
      this.db = client.db('ldes');
      console.log('Connected successfully to server');
    } catch (error: unknown) {
      console.log(error);
    }
  }
}
