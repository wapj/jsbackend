import { Model } from 'mongoose';
import { Injectable, Dependencies } from '@nestjs/common';
import { getModelToken } from '@nestjs/mongoose';
import { Board } from '../schemas/board.scheme';

@Injectable()
@Dependencies(getModelToken(Board.title))
export class BoardService {
  constructor(@InjectModel('User') boardModel) {
    this.boardModel = boardModel;
  }
  
  async create(boardDto) {
    const boardModel = new this.boardModel(boardDto);
    return boardModel.save();
  }

  async findAll() {
    return this.boardModel.find().exec();
  }
}
