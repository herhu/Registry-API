import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { RegistryModule } from './registry/registry.module';
import { RedisModule } from '@liaoliaots/nestjs-redis';
import { WinstonModule } from 'nest-winston';
import * as winston from 'winston';

@Module({
  imports: [
    RedisModule.forRoot({
      readyLog: true,
      config: {
        host: 'localhost',
        port: 6379,
        password: 'bitnami'
      }
    }),
    WinstonModule.forRoot({
      transports: [
        new winston.transports.Console({
          format: winston.format.combine(
            winston.format.timestamp(),
            winston.format.ms(),
            winston.format.prettyPrint(),
            winston.format.colorize(),
            winston.format.simple(),
          ),
        }),
      ],
    }),
    RegistryModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}