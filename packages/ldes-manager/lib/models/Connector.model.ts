import {
  Table,
  Model,
  CreatedAt,
  UpdatedAt,
  Column,
  Unique,
  PrimaryKey,
  AllowNull,
  DataType,
  AutoIncrement,
  BelongsToMany,
} from 'sequelize-typescript';
import { ConnectorOrchestrator } from './ConnectorOrchestrator.model';
import { Orchestrator } from './Orchestrator.model';

@Table
export class Connector extends Model {
  @AutoIncrement
  @PrimaryKey
  @Column(DataType.BIGINT)
  declare id: number;

  @Unique
  @AllowNull(false)
  @Column
  name: string;

  @AllowNull(false)
  @Column
  image: string;

  @AllowNull(false)
  @Column
  type: string;

  @Unique
  @AllowNull(false)
  @Column(DataType.INTEGER)
  port: number;

  @AllowNull(false)
  @Column(DataType.JSON)
  config: JSON;

  @BelongsToMany(() => Orchestrator, () => ConnectorOrchestrator)
  orchestrators: Orchestrator[];

  @CreatedAt
  declare createdAt: Date;

  @UpdatedAt
  declare updatedAt: Date;
}
