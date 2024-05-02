import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class Bookmark {

  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  title: string;

  @Column()
  url: string;

  @Column()
  shortUrl: string;
}