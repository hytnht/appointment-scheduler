import { Module } from '@nestjs/common';
import { TypeOrmModule, TypeOrmModuleOptions } from '@nestjs/typeorm';
import { ConfigService } from '@nestjs/config';
import { DataSource } from 'typeorm';
import { addTransactionalDataSource } from 'typeorm-transactional';
import { RuntimeConfig } from 'src/configs/config.interface';

@Module({
  imports: [
    TypeOrmModule.forRootAsync({
      useFactory: (configService: ConfigService<RuntimeConfig>) => {
        const database =
          configService.getOrThrow<TypeOrmModuleOptions>('database');
        return database;
      },
      dataSourceFactory: async (options) => {
        if (!options) throw new Error('Invalid options passed');
        const dataSource = await new DataSource(options).initialize();
        return addTransactionalDataSource(dataSource);
      },
      inject: [ConfigService],
    }),
  ],
  providers: [],
  exports: [],
})
export class DatabaseModule {}
