import type { IWritableConnector } from '@ldes/types';
// import mongoose, { Schema } from 'mongoose';
import { MongoClient } from 'mongodb';

export class MongoDBConnector implements IWritableConnector {
  private readonly config: any;
  private db: any;

  public constructor(config:any) {
    this.config = config;
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

    //insert anyway
    const result = await collection.insertOne({
      id: id,
      date: time,
      type: type,
      isVersionOf: isVersionOf,
      data: member,
    });

    // do we need to delete the others?
    if(this.config.amountOfVersions > 0){
      // count amount of versions
      const results = await collection.find({
        isVersionOf: isVersionOf,
      })
      .sort({date : -1})
      .toArray();

      //console.log(results);

      // if more than amountOfVersions
      // delete te oldest
      const numberToDelete = results.length - this.config.amountOfVersions;

      
      if(numberToDelete > 0) {
        console.log('number to delete:', numberToDelete);

        //get the oldest to keep, and delete every after this one

        const idsToRemove = results.slice(0, numberToDelete).map((value : any) => value._id);
        console.debug('ids :', idsToRemove);
 
        const deleted = await collection.deleteMany({_id: {$in: idsToRemove}});
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
