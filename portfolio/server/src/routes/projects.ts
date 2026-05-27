import { Router, Request, Response } from 'express';
import { body, param } from 'express-validator';
import mongoose from 'mongoose';
import Project from '../models/Project';
import { protect } from '../middleware/auth';
import { validate } from '../middleware/validate';
import multer from 'multer';
import path from 'path';
import fs from 'fs';

const router = Router();

// ─── Multer Config ──────────────────────────────────────────────────────────

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadPath = path.join(__dirname, '../../uploads');
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
    }
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname);
    cb(null, `project-${uniqueSuffix}${ext}`);
  },
});

const fileFilter = (req: Request, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  const allowedTypes = /jpeg|jpg|png|webp|gif/;
  const ext = allowedTypes.test(path.extname(file.originalname).toLowerCase());
  const mime = allowedTypes.test(file.mimetype);
  if (ext && mime) {
    cb(null, true);
  } else {
    cb(new Error('Only images are allowed'));
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
});

// ─── Validators ─────────────────────────────────────────────────────────────

const projectValidators = [
  body('title').notEmpty().withMessage('Title is required').trim(),
  body('description').notEmpty().withMessage('Description is required'),
  body('domain')
    .notEmpty()
    .withMessage('Domain is required')
    .isIn(['IoT', 'ML', 'VLSI', 'Web'])
    .withMessage('Domain must be one of: IoT, ML, VLSI, Web'),
  body('techStack').optional().isArray().withMessage('techStack must be an array'),
  body('githubUrl').optional().isURL().withMessage('githubUrl must be a valid URL'),
  body('liveUrl').optional().isURL().withMessage('liveUrl must be a valid URL'),
  body('featured').optional().isBoolean().withMessage('featured must be a boolean'),
];

const mongoIdValidator = [
  param('id').custom((val) => mongoose.isValidObjectId(val)).withMessage('Invalid project ID'),
];

// ─── GET /api/projects ───────────────────────────────────────────────────────

router.get('/', async (_req: Request, res: Response): Promise<void> => {
  try {
    const projects = await Project.find().sort({ createdAt: -1 });
    res.json(projects);
  } catch (error) {
    console.error('GET /api/projects error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// ─── GET /api/projects/:id ───────────────────────────────────────────────────

router.get('/:id', mongoIdValidator, validate, async (req: Request, res: Response): Promise<void> => {
  try {
    const project = await Project.findById(req.params.id);
    if (!project) {
      res.status(404).json({ message: 'Project not found' });
      return;
    }
    res.json(project);
  } catch (error) {
    console.error('GET /api/projects/:id error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// ─── POST /api/projects/upload (protected) ───────────────────────────────────

router.post(
  '/upload',
  protect,
  (req: Request, res: Response, next: any) => {
    upload.single('image')(req, res, (err) => {
      if (err instanceof multer.MulterError) {
        return res.status(400).json({ message: err.message });
      } else if (err) {
        return res.status(400).json({ message: err.message });
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

      const relativeUrl = `/uploads/${req.file.filename}`;
      res.status(200).json({ url: relativeUrl });
    } catch (error) {
      console.error('POST /api/projects/upload error:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  }
);

// ─── POST /api/projects (protected) ─────────────────────────────────────────

router.post(
  '/',
  protect,
  projectValidators,
  validate,
  async (req: Request, res: Response): Promise<void> => {
    try {
      const { title, description, domain, techStack, githubUrl, liveUrl, thumbnail, featured } = req.body as {
        title: string;
        description: string;
        domain: 'IoT' | 'ML' | 'VLSI' | 'Web';
        techStack?: string[];
        githubUrl?: string;
        liveUrl?: string;
        thumbnail?: string;
        featured?: boolean;
      };

      const project = await Project.create({
        title,
        description,
        domain,
        techStack,
        githubUrl,
        liveUrl,
        thumbnail,
        featured,
      });

      res.status(201).json(project);
    } catch (error) {
      console.error('POST /api/projects error:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  }
);

// ─── PUT /api/projects/:id (protected) ──────────────────────────────────────

router.put(
  '/:id',
  protect,
  mongoIdValidator,
  validate,
  async (req: Request, res: Response): Promise<void> => {
    try {
      const project = await Project.findByIdAndUpdate(
        req.params.id,
        { $set: req.body },
        { new: true, runValidators: true }
      );

      if (!project) {
        res.status(404).json({ message: 'Project not found' });
        return;
      }

      res.json(project);
    } catch (error) {
      console.error('PUT /api/projects/:id error:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  }
);

// ─── DELETE /api/projects/:id (protected) ───────────────────────────────────

router.delete(
  '/:id',
  protect,
  mongoIdValidator,
  validate,
  async (req: Request, res: Response): Promise<void> => {
    try {
      const project = await Project.findByIdAndDelete(req.params.id);

      if (!project) {
        res.status(404).json({ message: 'Project not found' });
        return;
      }

      res.json({ message: 'Project deleted successfully' });
    } catch (error) {
      console.error('DELETE /api/projects/:id error:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  }
);

export default router;
