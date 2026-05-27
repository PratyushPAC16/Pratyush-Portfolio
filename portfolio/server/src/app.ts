import path from 'path';
import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import dotenv from 'dotenv';
import { connectDB } from './config/db';

// Import routes
import projectRoutes from './routes/projects';
import postRoutes from './routes/posts';
import contactRoutes from './routes/contact';
import authRoutes from './routes/auth';
import analyticsRoutes from './routes/analytics';
import Image from './models/Image';

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Connect to MongoDB Database
connectDB();

// Middleware
const allowedOrigins = ['http://localhost:5173'];
if (process.env.CLIENT_URL) {
  // Normalize client URL by removing any trailing slash
  allowedOrigins.push(process.env.CLIENT_URL.replace(/\/$/, ''));
}

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin) {
        callback(null, true);
        return;
      }

      // Check if origin matches allowed list or any Vercel preview URL
      const isAllowed = allowedOrigins.includes(origin) || 
                        origin.endsWith('.vercel.app');

      if (isAllowed) {
        callback(null, true);
      } else {
        callback(null, false); // Fail CORS cleanly without throwing a 500 server error
      }
    },
    credentials: true,
  })
);
app.use(express.json());
app.use(morgan('dev'));


// Serve uploaded images from MongoDB (with local fallback for dev)
app.get('/uploads/:filename', async (req, res) => {
  try {
    const image = await Image.findOne({ filename: req.params.filename });
    if (image) {
      res.set('Content-Type', image.contentType);
      res.set('Cache-Control', 'public, max-age=31536000'); // cache for 1 year
      res.send(image.data);
      return;
    }

    // Fallback: try local uploads directory (for existing local dev files)
    const localPath = path.join(__dirname, '../uploads', req.params.filename);
    res.sendFile(localPath, (err) => {
      if (err) {
        res.status(404).json({ message: 'Image not found' });
      }
    });
  } catch (error) {
    console.error('GET /uploads/:filename error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Mount Routes
app.use('/api/projects', projectRoutes);
app.use('/api/posts', postRoutes);
app.use('/api/contact', contactRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/analytics', analyticsRoutes);

// Health Check / Root Endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Portfolio API is running' });
});

// Start Server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

export default app;
