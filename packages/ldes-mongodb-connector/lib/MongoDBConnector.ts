import type { IWritableConnector } from '@ldes/types';
// import mongoose, { Schema } from 'mongoose';
import { MongoClient } from 'mongodb';

export class MongoDBConnector implements IWritableConnector {
  private readonly members: any[];
  private db: any;

  public constructor() {
    this.members = [];
  }

  /**
   * Writes a version to the corresponding backend system
   * @param member
   */
  public async writeVersion(member: any): Promise<void> {
    var JSONmember;
    try {
      JSONmember = JSON.parse(member);
    } catch {
      console.log(member);
    }

    const collection = this.db.collection('ldes');

    let id = JSONmember['@id'];
    let type = JSONmember['@type'];
    let time = JSONmember['http://www.w3.org/ns/prov#generatedAtTime'];
    let isVersionOf = JSONmember['http://purl.org/dc/terms/isVersionOf']['@id'];

    const result = await collection.insertOne({
      id: id,
      date: time,
      type: type,
      isVersionOf: isVersionOf,
      data: member,
    });
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
      this.db = await client.db('ldes');
      console.log('Connected successfully to server');
    } catch (err: any) {
      console.log(err);
    } finally {
      // Ensures that the client will close when you finish/error
      //await client.close();
    }
  }
}
