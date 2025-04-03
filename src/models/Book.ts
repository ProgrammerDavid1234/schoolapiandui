
import mongoose, { Document, Schema } from 'mongoose';

export interface IBook extends Document {
  title: string;
  author: string;
  isbn: string;
  genre: string;
  publishedYear: number;
  student: mongoose.Types.ObjectId | null;
  createdAt: Date;
  updatedAt: Date;
}

const BookSchema: Schema = new Schema({
  title: { type: String, required: true },
  author: { type: String, required: true },
  isbn: { type: String, required: true, unique: true },
  genre: { type: String, required: true },
  publishedYear: { type: Number, required: true },
  student: { type: Schema.Types.ObjectId, ref: 'Student', default: null },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

BookSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

export default mongoose.model<IBook>('Book', BookSchema);
