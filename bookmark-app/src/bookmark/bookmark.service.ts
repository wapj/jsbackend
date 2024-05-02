import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Bookmark } from './bookmark.entity';
import { Repository } from 'typeorm';
import { nanoid } from 'nanoid';

@Injectable()
export class BookmarkService {
  constructor(
    @InjectRepository(Bookmark)
    private readonly bookmarkRepository: Repository<Bookmark>,
  ) {}

  async create(bookmark:Bookmark): Promise<Bookmark> {
    const shortUrl = nanoid(8);
    const createdBookmark = this.bookmarkRepository.create({
      ...bookmark,
      shortUrl,
    });
    return this.bookmarkRepository.save(createdBookmark);
  }

  async findAll(): Promise<Bookmark[]> {
    return this.bookmarkRepository.find();
  }

  async findByShortUrl(shortUrl: string): Promise<Bookmark> {
    return this.bookmarkRepository.findOne({ where: { shortUrl } });
  }

  async update(id: number, bookmark: Partial<Bookmark>): Promise<Bookmark> {
    await this.bookmarkRepository.update(id, bookmark);
    return await this.bookmarkRepository.findOne({ where: { id } });
  }

  async delete(id: number): Promise<void> {
    await this.bookmarkRepository.delete(id);
  }
}