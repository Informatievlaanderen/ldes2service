import { Readable } from 'stream';

export type LdesShapeField = {
  path: string;
  datatype: string;
  minCount?: number;
  maxCount?: number;
};

export type LdesShape = LdesShapeField[];

export type LdesObjects = {
  [k: string]: {
    url: string;
    name: string;
    stream: Readable;
    shape: LdesShape;
  };
};
