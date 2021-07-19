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
  HasMany,
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
  id: Number;

  @Unique
  @AllowNull(false)
  @Column
  name: String;

  @AllowNull(false)
  @Column
  image: String;

  @AllowNull(false)
  @Column
  type: String;

  @Unique
  @AllowNull(false)
  @Column(DataType.INTEGER)
  port: Number;

  @AllowNull(false)
  @Column(DataType.JSON)
  config: JSON;

  @BelongsToMany(() => Orchestrator, () => ConnectorOrchestrator)
  orchestrators: Orchestrator[];

  @CreatedAt
  createdAt: Date;

  @UpdatedAt
  updatedAt: Date;
}
