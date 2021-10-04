import type * as RDF from '@rdfjs/types';
import { IBucketizer } from '@treecg/ldes-types';

export class SubstringBucketizer extends IBucketizer {
  public propertyPath: string;

  public constructor(propertyPath: string) {
    super(propertyPath);
    this.propertyPath = propertyPath;
  }

  public static build = async (propertyPath: string): Promise<SubstringBucketizer> => {
    const bucketizer = new SubstringBucketizer(propertyPath);
    await bucketizer.init();
    return bucketizer;
  };

  public bucketize = (quads: RDF.Quad[], memberId: string): void => {
    const propertyPathObjects: RDF.Term[] = this.extractPropertyPathObject(quads, memberId);

    if (propertyPathObjects.length <= 0) {
      throw new Error(`[SubstringBucketizer]: No matches found for property path "${this.propertyPath}"`);
    }

    const buckets = this.createBuckets(propertyPathObjects);
    const bucketTriples = buckets.map(bucket => this.createBucketTriple(bucket, memberId));
    quads.push(...bucketTriples);
  };

  public createBuckets = (propertyPathObjects: RDF.Term[]): string[] => {
    const buckets: string[] = [];
    propertyPathObjects.forEach(propertyPathObject => {
      const normalizedLiteral = this.normalize(propertyPathObject.value);
      const parts = normalizedLiteral.split(' ');

      parts.forEach(part => {
        let substring = '';
        [...part].forEach(character => {
          substring += character;
          buckets.push(substring);
        });
      });
    });

    return [...new Set(buckets)];
  };

  /**
   * Normalizes a string by removing diacritics and comma's,
   * replaces hyphens with spaces
   * and finally transforms the string to lowercase
   * @param literal object value from an RDF.Quad
   * @returns the normalized object value
   */
  private readonly normalize = (literal: string): string =>
    literal.normalize('NFKD')
      .replace(/\p{Diacritic}/gu, '')
      .replace(/[,']/gu, '')
      .replace(/[-]/gu, ' ')
      .toLowerCase();
}
