import mongoose, { Schema, Document } from 'mongoose';

export interface IResume extends Document {
  filename: string;
  contentType: string;
  data: Buffer;
  uploadedAt: Date;
  uploadedBy?: string; // admin email
}

const ResumeSchema = new Schema<IResume>({
  filename: { type: String, required: true },
  contentType: { type: String, required: true },
  data: { type: Buffer, required: true },
  uploadedAt: { type: Date, default: Date.now },
  uploadedBy: { type: String },
});

export default mongoose.model<IResume>('Resume', ResumeSchema);
