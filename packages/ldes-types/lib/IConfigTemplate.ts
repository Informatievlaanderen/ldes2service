export interface IConfigTemplate {
  name: string;
  image: string;
  fields: Array<IFieldTemplate>;
}

export interface IFieldTemplate {
  name: string;
  validation: Array<string>;
  value?: string;
}
