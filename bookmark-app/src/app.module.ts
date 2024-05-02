import { Module } from '@nestjs/common';
import { BookmarkModule } from './bookmark/bookmark.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';
import { AppController } from './app.controller';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'sqlite',
      database: 'bookmark.db',
      entities: [__dirname + "/**/*.entity{.ts,.js}"],
      synchronize: true
    }),
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '..', 'public'),   // <-- path to the static files
    }),
    BookmarkModule,
  ],
  controllers: [AppController]
})
export class AppModule {}
