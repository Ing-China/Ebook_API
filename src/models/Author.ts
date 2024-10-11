import mongoose, { Document, Schema } from "mongoose";

export interface IAuthor extends Document {
  name: string;
  age: string;
  bookCount: string;
  bio: string;
  isActive?: boolean;
  image: string;
  bookType: mongoose.Types.ObjectId;
}

const AuthorSchema: Schema<IAuthor> = new Schema(
  {
    name: { type: String, required: true },
    age: { type: String, required: true },
    bookCount: { type: String, required: true },
    bio: { type: String, required: true },
    isActive: { type: Boolean, default: true },
    image: { type: String, required: true },
    bookType: { type: Schema.Types.ObjectId, ref: "BookType", required: true },
  },
  {
    timestamps: true,
  }
);

const Author =
  mongoose.models.Author || mongoose.model<IAuthor>("Author", AuthorSchema);

export default Author;
