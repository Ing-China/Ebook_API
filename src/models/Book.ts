import mongoose, { Document, Schema } from "mongoose";

export interface IBook extends Document {
  name: string;
  ratting: string;
  language: string;
  pages: string;
  description: string;
  author: mongoose.Types.ObjectId;
  bookType: mongoose.Types.ObjectId;
  image: string;
  pdf: string;
  isActive: { type: Boolean; default: true };
  isFavorite: { type: Boolean; default: true };
  isRecommended: { type: Boolean; default: true };
  isTrending: { type: Boolean; default: true };
}

const BookSchema: Schema<IBook> = new Schema(
  {
    name: { type: String, required: true },
    ratting: { type: String, required: true },
    language: { type: String, required: true },
    pages: { type: String, required: true },
    description: { type: String, required: true },
    author: { type: Schema.Types.ObjectId, ref: "Author" },
    bookType: { type: Schema.Types.ObjectId, ref: "BookType" },
    image: { type: String, required: true },
    pdf: { type: String, required: true },
    isActive: { type: Boolean, default: true },
    isFavorite: { type: Boolean, default: true },
    isRecommended: { type: Boolean, default: true },
    isTrending: { type: Boolean, default: true },
  },
  {
    timestamps: true,
  }
);

const Book = mongoose.models.Book || mongoose.model<IBook>("Book", BookSchema);

export default Book;
