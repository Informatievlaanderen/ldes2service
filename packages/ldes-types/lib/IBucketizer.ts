import type * as RDF from '@rdfjs/types';

export interface IBucketizer {
  /**
   * Adds an extra triple to the array of quads indicating
   * the bucket in which the version object must be placed
   */
  bucketize: (quads: RDF.Quad[], versionId: string) => void;
}
