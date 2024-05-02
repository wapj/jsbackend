import { Body, Controller, Get, Param, Put, Delete, Post } from '@nestjs/common';
import { BookmarkService } from './bookmark.service';
import { Bookmark } from './bookmark.entity';

@Controller('bookmarks')
export class BookmarkController {
  constructor(private readonly bookmarkService: BookmarkService) {}


  @Put(':id')
  async update(@Param('id') id: number, @Body() bookmark: Partial<Bookmark>): Promise<Bookmark> {
    return this.bookmarkService.update(id, bookmark);
  }

  @Delete(':id')
  async delete(@Param('id') id: number): Promise<void> {
    return this.bookmarkService.delete(id);
  }

  @Post()
  async create(@Body() bookmark: Bookmark): Promise<Bookmark> {
    return this.bookmarkService.create(bookmark);
  }

  @Get("/all")
  async findAll(): Promise<Bookmark[]> {
    console.log("findAll")
    return this.bookmarkService.findAll();
  }

}