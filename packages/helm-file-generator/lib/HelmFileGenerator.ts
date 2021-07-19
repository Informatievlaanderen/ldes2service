import type { IGeneratorApiSetup } from '@ldes/types';
import { stringify, parse } from 'yaml';

const format = require('string-format');

interface IHelmFile {
  repositories: Record<string, string>[];
  releases: Record<string, any>[];
}

export class HelmFileGenerator {
  private options: IGeneratorApiSetup[] = [];

  public setup(options: IGeneratorApiSetup[]): void {
    this.options = options;
  }

  public generate(services: Record<string, any>): string {
    const HelmFile: IHelmFile = {
      repositories: [{ name: 'bitnami', url: 'https://charts.bitnami.com/bitnami' }],
      releases: [],
    };

    for (const service of this.options) {
      if (Object.keys(services).includes(service.id)) {
        const formattedService = parse(format(service.helmTemplate, services[service.id].settings));

        HelmFile.releases.push(formattedService);
      }
    }

    return stringify(HelmFile);
  }
}
