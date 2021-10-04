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
    const propertyPathObject: RDF.Term = this.extractPropertyPathObject(quads, memberId);

    if (!propertyPathObject) {
      throw new Error(`[SubstringBucketizer]: No matches found for property path "${this.propertyPath}"`);
    }

    const buckets = this.createBuckets(propertyPathObject);
    const bucketTriples = buckets.map(bucket => this.createBucketTriple(bucket, memberId));
    quads.push(...bucketTriples);
  };

  public createBuckets = (propertyPathObject: RDF.Term): string[] => {
    const normalizedLiteral = this.normalize(propertyPathObject.value);
    const parts = normalizedLiteral.split(' ');
    const buckets: string[] = [];

    parts.forEach(part => {
      let substring = '';
      [...part].forEach(character => {
        substring += character;
        buckets.push(substring);
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
