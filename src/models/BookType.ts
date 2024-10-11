import mongoose, { Document, Schema } from "mongoose";

export interface IBookType extends Document {
  name: string;
  isActive: boolean;
}

const BookTypeSchema: Schema<IBookType> = new Schema(
  {
    name: { type: String, required: true },
    isActive: { type: Boolean, default: true },
  },
  {
    timestamps: true,
  }
);

const BookType =
  mongoose.models.BookType ||
  mongoose.model<IBookType>("BookType", BookTypeSchema);
export default BookType;
