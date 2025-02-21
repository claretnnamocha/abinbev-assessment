import * as pg from 'pg';
import { SyncOptions } from 'sequelize';
import { Sequelize, SequelizeOptions } from 'sequelize-typescript';
import { logger } from '../common';
import { config } from '../common/config';
import * as models from './models';

export class DatabaseProvider {
  public static readonly provide = 'SEQUELIZE';

  public static db = async () => {
    const sequelizeOptions: SequelizeOptions = {
      dialect: 'postgres',
      logging: false,
      models: Object.values(models),
      dialectModule: pg,
    };

    return new Sequelize(config.DB_URL, sequelizeOptions);
  };

  public static async useFactory(): Promise<Sequelize> {
    try {
      const syncOptions: SyncOptions = { alter: true };

      const db = await DatabaseProvider.db();
      await db.sync(syncOptions);

      return db;
    } catch (error) {
      logger.error('DB Error:', error.message);
    } finally {
    }
  }
}
