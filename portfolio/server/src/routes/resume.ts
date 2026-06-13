import { Router, Request, Response, NextFunction } from 'express';
import multer from 'multer';
import path from 'path';
import Resume from '../models/Resume';
import { protect } from '../middleware/auth';

const router = Router();

// ─── Multer: memory storage, PDF only, max 10MB ───────────────────────────────

const storage = multer.memoryStorage();

const fileFilter = (
  _req: Request,
  file: Express.Multer.File,
  cb: multer.FileFilterCallback
) => {
  const ext = path.extname(file.originalname).toLowerCase();
  if (ext === '.pdf' && file.mimetype === 'application/pdf') {
    cb(null, true);
  } else {
    cb(new Error('Only PDF files are allowed'));
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10 MB
});

// ─── GET /api/resume — public: stream current resume ─────────────────────────

router.get('/', async (_req: Request, res: Response): Promise<void> => {
  try {
    // Find the single resume document (most recently uploaded)
    const resume = await Resume.findOne().sort({ uploadedAt: -1 });

    if (!resume) {
      res.status(404).json({ message: 'No resume uploaded yet' });
      return;
    }

    res.set('Content-Type', 'application/pdf');
    res.set('Content-Disposition', `attachment; filename="${resume.filename}"`);
    res.set('Cache-Control', 'no-cache'); // always serve latest
    res.send(resume.data);
  } catch (error) {
    console.error('GET /api/resume error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// ─── GET /api/resume/info — public: metadata only ────────────────────────────

router.get('/info', async (_req: Request, res: Response): Promise<void> => {
  try {
    const resume = await Resume.findOne().sort({ uploadedAt: -1 }).select('-data');

    if (!resume) {
      res.status(404).json({ message: 'No resume uploaded yet' });
      return;
    }

    res.json({
      filename: resume.filename,
      uploadedAt: resume.uploadedAt,
      uploadedBy: resume.uploadedBy,
    });
  } catch (error) {
    console.error('GET /api/resume/info error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// ─── POST /api/resume — protected: upload/replace resume ─────────────────────

router.post(
  '/',
  protect,
  (req: Request, res: Response, next: NextFunction) => {
    upload.single('resume')(req, res, (err) => {
      if (err instanceof multer.MulterError) {
        return res.status(400).json({ message: err.message });
      } else if (err) {
        return res.status(400).json({ message: (err as Error).message });
      }
      next();
    });
  },
  async (req: Request, res: Response): Promise<void> => {
    try {
      if (!req.file) {
        res.status(400).json({ message: 'No file uploaded' });
        return;
      }

      const filename = req.file.originalname || `resume-${Date.now()}.pdf`;

      // Delete old resume(s) and insert the new one (only ever keep one)
      await Resume.deleteMany({});
      const resume = await Resume.create({
        filename,
        contentType: req.file.mimetype,
        data: req.file.buffer,
        uploadedAt: new Date(),
        uploadedBy: (req as any).user?.email,
      });

      res.status(201).json({
        message: 'Resume uploaded successfully',
        filename: resume.filename,
        uploadedAt: resume.uploadedAt,
      });
    } catch (error) {
      console.error('POST /api/resume error:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  }
);

export default router;
