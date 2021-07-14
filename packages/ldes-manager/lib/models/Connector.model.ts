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
} from 'sequelize-typescript';
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
  type: String;

  @Unique
  @AllowNull(false)
  @Column(DataType.INTEGER)
  port: Number;

  @AllowNull(false)
  @Column(DataType.JSON)
  config: JSON;

  @HasMany(() => Orchestrator)
  orchestrators: Orchestrator[];

  @CreatedAt
  createdAt: Date;

  @UpdatedAt
  updatedAt: Date;
}
