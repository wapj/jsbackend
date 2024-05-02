import { Controller, Get, Param, Res } from "@nestjs/common";
import { BookmarkService } from "./bookmark/bookmark.service";
import { Response } from 'express';

@Controller()
export class AppController {
    constructor(private readonly bookmarkService: BookmarkService) {}
    
  @Get(':shortUrl')
  async redirectToUrl(@Param('shortUrl') shortUrl: string, @Res() res:Response) {
    const bookmark = await this.bookmarkService.findByShortUrl(shortUrl);
    console.log(bookmark);
    if (bookmark) {
      return res.redirect(bookmark.url);
    } else {
      return res.status(404).send('알 수 없는 북마크입니다.');
    }
  }
}