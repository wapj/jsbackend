import { Module } from '@nestjs/common';
import { BookmarkController } from './bookmark.controller';
import { BookmarkService } from './bookmark.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Bookmark } from './bookmark.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Bookmark]),
  ],
  controllers: [BookmarkController],
  providers: [BookmarkService],
  exports: [BookmarkService] // AppModule내의 AppController에서 사용예정이므로 내보낸다. 
})
export class BookmarkModule {}
