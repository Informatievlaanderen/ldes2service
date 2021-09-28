import type { IBucketizer } from '@ldes/types';
import type * as RDF from '@rdfjs/types';
import { DataFactory } from 'rdf-data-factory';

export class SubstringBucketizer implements IBucketizer {
  public factory: RDF.DataFactory;
  public targetNode: RDF.NamedNode;

  public constructor(targetPredicate: string) {
    this.factory = new DataFactory();
    this.targetNode = this.factory.namedNode(targetPredicate);
  }

  public bucketize = (quads: RDF.Quad[], versionIdentifier: string): void => {
    const buckets = this.getBuckets(quads);
    const bucketTriples = buckets.map(bucket => this.createBucketTriple(bucket, versionIdentifier));

    quads.push(...bucketTriples);
  };

  private readonly createBucketTriple = (bucket: string, versionIdentifier: string): RDF.Quad =>
    this.factory.quad(
      this.factory.namedNode(versionIdentifier),
      this.factory.namedNode('https://w3id.org/ldes#bucket'),
      this.factory.literal(bucket, this.factory.namedNode('http://www.w3.org/2001/XMLSchema#string')),
    );

  private readonly getBuckets = (quads: RDF.Quad[]): string[] => {
    const targetQuad = quads.find(quad => quad.predicate.equals(this.targetNode));

    if (!targetQuad) {
      throw new Error(`[SubstringBucketizer]: No triple with predicate ${this.targetNode.value} found.`);
    }

    const normalizedLiteral = this.normalize(targetQuad.object.value);
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
