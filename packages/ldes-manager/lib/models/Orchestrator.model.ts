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
  Comment,
  ForeignKey,
  IsUrl,
  AutoIncrement,
} from 'sequelize-typescript';
import { Connector } from './Connector.model';

@Table
export class Orchestrator extends Model {
  @AutoIncrement
  @PrimaryKey
  @Column(DataType.BIGINT)
  id: Number;

  @IsUrl
  @AllowNull(false)
  @Column
  ldes_uri: String;

  @AllowNull(false)
  @Column(DataType.INTEGER)
  polling_interval: Number;

  @AllowNull(false)
  @Column
  name: String;

  @Unique
  @AllowNull(false)
  @Comment('Should be equal to @name with spaces replaced by - and lower cases')
  @Column
  slug: String;

  @AllowNull(false)
  @ForeignKey(() => Connector)
  @Column(DataType.BIGINT)
  connectorId: Number;

  @CreatedAt
  createdAt: Date;

  @UpdatedAt
  updatedAt: Date;
}
