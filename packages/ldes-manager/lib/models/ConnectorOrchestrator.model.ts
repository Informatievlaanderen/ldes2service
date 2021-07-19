import { Column, ForeignKey, Model, Table } from 'sequelize-typescript';
import { Connector } from './Connector.model';
import { Orchestrator } from './Orchestrator.model';

@Table({
  timestamps: false,
})
export class ConnectorOrchestrator extends Model {
  @ForeignKey(() => Connector)
  @Column
  connectorId: number;

  @ForeignKey(() => Orchestrator)
  @Column
  orchestratorId: number;
}
