
import mongoose, { Document, Schema } from 'mongoose';

export interface ITeacher extends Document {
  name: string;
  email: string;
  subject: string;
  students: mongoose.Types.ObjectId[];
  createdAt: Date;
  updatedAt: Date;
}

const TeacherSchema: Schema = new Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  subject: { type: String, required: true },
  students: [{ type: Schema.Types.ObjectId, ref: 'Student' }],
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

TeacherSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

export default mongoose.model<ITeacher>('Teacher', TeacherSchema);
