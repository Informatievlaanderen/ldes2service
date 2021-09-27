import type { IBucketizer } from '@ldes/types';
import type * as RDF from '@rdfjs/types';
import { DataFactory } from 'rdf-data-factory';

// TODO: what with version materialized triples and if the graph is set?

export class SubjectPageBucketizer implements IBucketizer {
  public factory: RDF.DataFactory;
  public versionOfProperty: RDF.NamedNode;

  public constructor(versionOfPredicate: string) {
    this.factory = new DataFactory();
    this.versionOfProperty = this.factory.namedNode(versionOfPredicate);
  }

  public bucketize = (quads: RDF.Quad[]): void => {
    const [entityIdentifier, versionIdentifier] = this.getIdentifiers(quads);
    const bucketTriple = this.createBucketTriple(entityIdentifier, versionIdentifier);
    quads.push(bucketTriple);
  };

  private readonly createBucketTriple = (entityIdentifier: string, versionIdentifier: string): RDF.Quad => {
    const bucket = this.getBucket(entityIdentifier);

    return this.factory.quad(
      this.factory.namedNode(versionIdentifier),
      this.factory.namedNode('https://w3id.org/ldes#bucket'),
      this.factory.literal(bucket, this.factory.namedNode('http://www.w3.org/2001/XMLSchema#string')),
    );
  };

  private readonly getIdentifiers = (quads: RDF.Quad[]): string[] => {
    let entityIdentifier = '';
    let versionIdentifier = '';

    quads.forEach(quad => {
      if (quad.predicate.equals(this.versionOfProperty)) {
        entityIdentifier = quad.object.value;
        versionIdentifier = quad.subject.value;
      }
    });

    if (!entityIdentifier || !versionIdentifier) {
      throw new Error(`[SubjectPageBucketizer]: One or more identifiers (entity or version) was not found.`);
    }

    return [entityIdentifier, versionIdentifier];
  };

  private readonly getBucket = (entityIdentifier: string): string => {
    const parts = entityIdentifier.split('/');
    return parts[parts.length - 1];
  };
}
