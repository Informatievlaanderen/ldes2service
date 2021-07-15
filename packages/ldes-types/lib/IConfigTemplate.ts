export interface IConfigTemplate {
  name: string;
  fields: Array<IFieldTemplate>;
}

export interface IFieldTemplate {
  name: string;
  validation: Array<string>;
  value?: string;
}
