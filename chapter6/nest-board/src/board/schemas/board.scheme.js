import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

@Schema()
export class Board {
  @Prop({type: String, default: ""})
  title;

  @Prop({type: String, default: ""})
  name = "";

  @Prop({type: String, default: "" })
  content;

  @Prop({ type : Date, default: Date.now })
  createdDt;
}

export const BoardSchema = SchemaFactory.createForClass(Board);