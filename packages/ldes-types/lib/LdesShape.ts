import type { Readable } from 'stream';

export interface LdesShapeField {
  path: string;
  datatype: string;
  minCount?: number;
  maxCount?: number;
}

export type LdesShape = LdesShapeField[];

export interface LdesObject {
  url: string;
  name: string;
  stream: Readable;
  shape: LdesShape;
}

export type LdesObjects = Record<string, LdesObject>;
