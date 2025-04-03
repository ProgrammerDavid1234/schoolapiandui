
import mongoose, { Document, Schema } from 'mongoose';

export interface IStudent extends Document {
  name: string;
  email: string;
  grade: string;
  teachers: mongoose.Types.ObjectId[];
  books: mongoose.Types.ObjectId[];
  createdAt: Date;
  updatedAt: Date;
}

const StudentSchema: Schema = new Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  grade: { type: String, required: true },
  teachers: [{ type: Schema.Types.ObjectId, ref: 'Teacher' }],
  books: [{ type: Schema.Types.ObjectId, ref: 'Book' }],
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

StudentSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

export default mongoose.model<IStudent>('Student', StudentSchema);
