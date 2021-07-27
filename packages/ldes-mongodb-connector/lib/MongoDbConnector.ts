import type { IWritableConnector, IConfigConnector, LdesShape } from '@ldes/types';
import type { Db } from 'mongodb';
import { MongoClient } from 'mongodb';
import slugify from 'slugify';

export interface IConfigMongoDbConnector extends IConfigConnector {
  username: string;
  hostname: string;
  database: string;
  password: string;
  port: number;
}

export class MongoDbConnector implements IWritableConnector {
  private readonly config: IConfigMongoDbConnector;
  private client: MongoClient;
  private db: Db;
  private shape?: LdesShape;
  private columnToFieldPath: Map<string, string> = new Map();

  public constructor(config: IConfigMongoDbConnector, shape: LdesShape, tableName: string) {
    this.config = config;
    this.config.tableName = tableName;
    this.shape = shape;
  }

  /**
   * Writes a version to the corresponding backend system
   * @param member
   */
  public async writeVersion(member: any): Promise<void> {
    const JSONmember = JSON.parse(member);

    // console.log("Member", JSONmember);

    let data: any = {};

    Array.from(this.columnToFieldPath.keys()).forEach(key => {
      // @ts-ignore
      data[key] = JSONmember[this.columnToFieldPath.get(key)];
    });

    data[data] = member;

    const collection = this.db.collection(this.config.tableName);
    await collection.insertOne(data);
  }

  /**
   * Initializes the backend system by creating tables, counters and/or enabling plugins
   */
  public async provision(): Promise<void> {
    const url = this.getURI();

    this.client = new MongoClient(url);

    this.shape?.forEach(field => {
      let slugField = this.extractAndSlug(field.path);
      this.columnToFieldPath.set(slugField, field.path);
    });

    // Connect the client to the server
    await this.client.connect();

    // Establish and verify connection
    this.db = this.client.db(this.config.database);
  }

  private getURI(): string {
    const config = this.config;

    //return `mongodb://${config.username}:${config.password}@${config.hostname}:${config.port}/${config.database}`;
    return 'mongodb://localhost:27017/?readPreference=primary&appname=MongoDB%20Compass&ssl=false';
  }

  private extractAndSlug(value: string): string {
    const reg = /([^#\/]+$)/gm;
    return slugify(value.match(reg)![0], { remove: /[*+~.()'"!:@/]/g, lower: true, replacement: '_' });
  }

  /**
   * Stops asynchronous operations
   */
  public async stop(): Promise<void> {
    await this.client.close();
  }
}
