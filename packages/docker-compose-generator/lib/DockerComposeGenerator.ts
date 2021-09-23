import type { IGeneratorApiSetup } from '@ldes/types';
import { parse, stringify } from 'yaml';

const composer = require('docker-composer');
const format = require('string-format');

interface IComposeFile {
  version: string;
  services: Record<string, any>;
}

export class DockerComposeGenerator {
  private options: IGeneratorApiSetup[] = [];

  public setup(options: IGeneratorApiSetup[]): void {
    this.options = options;
  }

  public generate(services: Record<string, any>, replicator: Record<string, any>): string {
    let dockerFile: IComposeFile = {
      version: '3.9',
      services: {},
    };

    for (const service of this.options) {
      if (Object.keys(services).includes(service.id)) {
        const formattedService = parse(format(service.composeTemplate, services[service.id].settings));

        Object.assign(dockerFile.services, formattedService);
      }
    }
    dockerFile = DockerComposeGenerator.replicatorSetup(dockerFile, services, replicator);
    composer.generate(dockerFile);

    return stringify(dockerFile);
  }

  /**
   * Once all the services have been added, this method sets up a replicator service configured
   * to connect to said services.
   * @param dockerFile the compose file 'object"
   * @param services the services added and their settings
   * @param replicator the replicator settings
   * @private
   */
  private static replicatorSetup(
    dockerFile: IComposeFile,
    services: Record<string, any>,
    replicator: Record<string, any>,
  ): IComposeFile {
    if (replicator.redis) {
      replicator.state = {
        id: 'replicator',
        host: 'redis',
        port: 6_379,
      };

      Object.assign(dockerFile.services, {
        redis: {
          image: 'redis:6',
          command: 'redis-server --appendonly yes',
        },
      });
    }

    const ldesReplicator: Record<string, any> = {
      replicator: {
        image: 'ghcr.io/osoc21/ldes-replicator',
        environment: {
          URLS: replicator.urls,
          STATE_CONFIG: JSON.stringify(replicator.state),
          POLL_INTERVAL: replicator.polling_interval || '5000',
        },
      },
    };

    const CONNECTORS = Object.keys(services);
    ldesReplicator.replicator.environment.CONNECTORS = JSON.stringify(CONNECTORS);

    for (const con of CONNECTORS) {
      ldesReplicator.replicator.environment[`CONNECTOR_${con}_TYPE`] = services[con].type;
      ldesReplicator.replicator.environment[`CONNECTOR_${con}_CONFIG`] = JSON.stringify(
        services[con].settings,
      );
    }

    Object.assign(dockerFile.services, ldesReplicator);

    return dockerFile;
  }
}
