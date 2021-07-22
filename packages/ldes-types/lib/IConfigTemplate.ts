export interface IConfigTemplate {
  name: string;
  image: string;
  fields: IFieldTemplate[];
  composeTemplate: string;
  helmTemplate: string;
}

export interface IFieldTemplate {
  name: string;
  validation: string[];
  value?: string;
}
