import { Logger, Module } from '@nestjs/common';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
import { ConfigModule } from '@nestjs/config';
import appConfig from './configs/app.config';
import { DatabaseModule } from './database/database.module';
import { CustomExceptionFilter } from './common/filters/exception.filter';
import { DealershipModule } from './modules/dealership/dealership.module';
import { CustomerModule } from './modules/customer/customer.module';
import { VehicleModule } from './modules/vehicle/vehicle.module';
import { ServiceTypeModule } from './modules/service-type/service-type.module';
import { APP_FILTER, APP_GUARD, APP_INTERCEPTOR } from '@nestjs/core';
import { ResponseInterceptor } from './common/interceptors/response.interceptor';
import { LoggingInterceptor } from './common/interceptors/logging.interceptor';
import configSchema from './configs/config.schema';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [appConfig],
      validationSchema: configSchema,
    }),
    ThrottlerModule.forRoot({ throttlers: [{ ttl: 1000, limit: 5 }] }),
    DatabaseModule,
    DealershipModule,
    CustomerModule,
    VehicleModule,
    ServiceTypeModule,
  ],
  controllers: [],
  providers: [
    Logger,
    { provide: APP_FILTER, useClass: CustomExceptionFilter },
    { provide: APP_GUARD, useClass: ThrottlerGuard },
    { provide: APP_INTERCEPTOR, useClass: ResponseInterceptor },
    { provide: APP_INTERCEPTOR, useClass: LoggingInterceptor },
  ],
})
export class AppModule {}
