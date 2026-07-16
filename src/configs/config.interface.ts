import { SwaggerCustomOptions } from '@nestjs/swagger';
import { TypeOrmModuleOptions } from '@nestjs/typeorm';

export interface SwaggerConfig {
  enabled: boolean;
  title: string;
  description: string;
  version: string;
  path: string;
  swaggerOptions: SwaggerCustomOptions;
}

export interface RuntimeConfig {
  port: number;
  database: TypeOrmModuleOptions;
  swagger: SwaggerConfig;
}
