export interface IGeneratorApiSetup {
  id: string;
  helmTemplate: string;
  composeTemplate: string;
}

export interface IGeneratorPluginOptions {
  setup: boolean;
  prefix?: string;
}
