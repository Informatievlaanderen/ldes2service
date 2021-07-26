# LDES2Service Demo - Deployment documentation

## Services

The LDES2Service Demo requires the following services to be deployed:

### Backend database(s)

LDES2Service requires at least one backend database, this database can be either a
PostgreSQL database or a MongoDB database. For the demo both will be used.

### State

LDES2Service requires a Redis server to store its state.

### LDES Replicator(s)

The LDES2Service backend is a NodeJS container that replicates LDES into the backend database(s).

## Container Images

The LDES Replicator image is built and published with a [Github Action](https://github.com/osoc21/ldes2service/blob/main/.github/workflows/docker-image.yml).

## Deployment

LDES2Service can be deployed on Kubernetes (with Helm and Helmfile) or on Docker (with docker-compose).

Example files:

- [docker-compose.yml](https://github.com/osoc21/ldes2service/blob/main/docker-compose.yml)
- [helmfile.yaml](https://github.com/osoc21/ldes2service/blob/main/helmfile.yaml)

### Full setup (docker-compose)

- Install docker on the server: [Docker documentation](https://docs.docker.com/engine/install/ubuntu/)
- Install docker-compose: [Docker documentation](https://docs.docker.com/compose/install/)

```shell
# Clone the repository
git clone https://github.com/osoc21/ldes2service.git && cd ldes2service
# Use the provided docker-compose file
docker-compose up -d
```
