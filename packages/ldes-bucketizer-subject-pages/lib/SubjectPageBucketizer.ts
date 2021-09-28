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

  public bucketize = (quads: RDF.Quad[], versionIdentifier: string): void => {
    const entityIdentifier = this.getEntityIdentifier(quads);
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

  private readonly getEntityIdentifier = (quads: RDF.Quad[]): string => {
    let entityIdentifier = '';

    quads.forEach(quad => {
      if (quad.predicate.equals(this.versionOfProperty)) {
        entityIdentifier = quad.object.value;
      }
    });

    if (!entityIdentifier) {
      throw new Error(`[SubjectPageBucketizer]: Could not identify entity id because no triple with predicate ${this.versionOfProperty.value} was found.`);
    }

    return entityIdentifier;
  };

  private readonly getBucket = (entityIdentifier: string): string => {
    const parts = entityIdentifier.split('/');
    return parts[parts.length - 1];
  };
}
