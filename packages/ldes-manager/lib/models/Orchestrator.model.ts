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
  BelongsToMany,
} from 'sequelize-typescript';
import { Connector } from './Connector.model';
import { ConnectorOrchestrator } from './ConnectorOrchestrator.model';

@Table
export class Orchestrator extends Model {
  @AutoIncrement
  @PrimaryKey
  @Column(DataType.BIGINT)
  declare id: Number;

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

  @BelongsToMany(() => Connector, () => ConnectorOrchestrator)
  connectors: Connector[];

  @CreatedAt
  declare createdAt: Date;

  @UpdatedAt
  declare updatedAt: Date;
}
