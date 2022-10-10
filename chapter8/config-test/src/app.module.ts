import { Module } from '@nestjs/common';
import { ConfigModule, ConfigObject } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { WeatherModule } from './weather/weather.module';

console.log('env : ' + process.env.NODE_ENV);
console.log('current working directory : ' + process.cwd());

import config from './configs/config';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: `${process.cwd()}/envs/${process.env.NODE_ENV}.env`,
      load: [config],
      cache: true,    
      expandVariables: true,

    }),
    WeatherModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
