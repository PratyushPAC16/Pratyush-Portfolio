import mongoose, { Schema, Document } from 'mongoose';

export interface IImage extends Document {
  filename: string;
  contentType: string;
  data: Buffer;
  createdAt: Date;
}

const ImageSchema: Schema = new Schema(
  {
    filename: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    contentType: {
      type: String,
      required: true,
    },
    data: {
      type: Buffer,
      required: true,
    },
  },
  {
    timestamps: { createdAt: true, updatedAt: false },
  }
);

export default mongoose.model<IImage>('Image', ImageSchema);
