import { IBucketizer } from '@treecg/ldes-types';
import type * as RDF from '@rdfjs/types';

export class SubjectPageBucketizer extends IBucketizer {
  public propertyPath: string;

  public constructor(propertyPath: string) {
    super(propertyPath);
    this.propertyPath = propertyPath;
  }

  public static build = async (propertyPath: string): Promise<SubjectPageBucketizer> => {
    const bucketizer = new SubjectPageBucketizer(propertyPath);
    await bucketizer.init();
    return bucketizer;
  };

  public bucketize = (quads: RDF.Quad[], memberId: string): void => {
    const propertyPathObject = this.extractPropertyPathObject(quads, memberId);
    console.log(propertyPathObject);

    if (!propertyPathObject) {
      throw new Error(`[SubjectPageBucketizer]: No matches found for property path "${this.propertyPath}"`);
    }

    const buckets = this.createBuckets(propertyPathObject);
    const bucketTriples = buckets.map(bucket => this.createBucketTriple(bucket, memberId));

    quads.push(...bucketTriples);
  };

  public createBuckets = (propertyPathObject: RDF.Term): string[] => {
    const parts = propertyPathObject.value.split('/');
    return [parts[parts.length - 1]];
  };
}
