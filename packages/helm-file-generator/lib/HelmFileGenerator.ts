import type { IGeneratorApiSetup } from '@ldes/types';
import { stringify, parse } from 'yaml';

const format = require('string-format');

interface IHelmFile {
  repositories: Record<string, string>[];
  releases: Record<string, any>[];
}

export class HelmFileGenerator {
  private options: IGeneratorApiSetup[];

  public setup(options: IGeneratorApiSetup[]): void {
    this.options = options;
  }

  public generate(services: Record<string, any>, replicator: Record<string, any>): string {
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

    return stringify(HelmFileGenerator.replicatorSetup(HelmFile, services, replicator));
  }

  private static replicatorSetup(
    HelmFile: IHelmFile,
    services: Record<string, any>,
    replicator: Record<string, any>
  ): IHelmFile {
    if (replicator.redis) {
      replicator.state = {
        id: 'replicator',
        host: 'redis-master',
      };
      HelmFile.releases.push({
        name: 'redis',
        chart: 'bitnami/redis',
        namespace: 'ldes',
        createNamespace: true,
        values: [
          {
            'auth.enabled': false,
            'replica.replicaCount': 0,
          },
        ],
      });
    }

    const ldesReplicator: Record<string, any> = {
      name: 'replicator',
      // Until the chart is uploaded somewhere
      chart: './ldes-replicator-helm',
      namespace: 'ldes',
      createNamespace: true,
      values: [
        {
          replicator: {
            urls: replicator.urls,
            state: replicator.state,
          },
          connectors: {},
        },
      ],
    };

    // eslint-disable-next-line no-return-assign
    Object.keys(services).forEach(con => (ldesReplicator.values[0].connectors[con] = services[con]));

    console.log(ldesReplicator.values[0].connectors);

    HelmFile.releases.push(ldesReplicator);

    return HelmFile;
  }
}
