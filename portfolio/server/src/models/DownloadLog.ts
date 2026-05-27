import mongoose, { Schema, Document } from 'mongoose';

export interface IDownloadLog extends Document {
  downloadedAt: Date;
  userAgent?: string;
  ip?: string;
}

const DownloadLogSchema: Schema = new Schema({
  downloadedAt: {
    type: Date,
    default: Date.now,
    required: true,
  },
  userAgent: {
    type: String,
  },
  ip: {
    type: String,
  },
});

export default mongoose.model<IDownloadLog>('DownloadLog', DownloadLogSchema);
