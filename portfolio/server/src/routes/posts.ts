import { Router, Request, Response } from 'express';
import { body, param } from 'express-validator';
import Post from '../models/Post';
import { protect } from '../middleware/auth';
import { validate } from '../middleware/validate';

const router = Router();

// ─── Validators ─────────────────────────────────────────────────────────────

const postValidators = [
  body('title').notEmpty().withMessage('Title is required').trim(),
  body('slug')
    .notEmpty()
    .withMessage('Slug is required')
    .matches(/^[a-z0-9]+(?:-[a-z0-9]+)*$/)
    .withMessage('Slug must be lowercase letters, numbers, and hyphens only'),
  body('content').notEmpty().withMessage('Content is required'),
  body('tags').optional().isArray().withMessage('Tags must be an array'),
];

const slugValidator = [
  param('slug')
    .matches(/^[a-z0-9]+(?:-[a-z0-9]+)*$/)
    .withMessage('Invalid slug format'),
];

// ─── GET /api/posts ──────────────────────────────────────────────────────────

router.get('/', async (_req: Request, res: Response): Promise<void> => {
  try {
    const posts = await Post.find().sort({ publishedAt: -1 }).select('-content');
    res.json(posts);
  } catch (error) {
    console.error('GET /api/posts error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// ─── GET /api/posts/:slug ────────────────────────────────────────────────────

router.get('/:slug', slugValidator, validate, async (req: Request, res: Response): Promise<void> => {
  try {
    const post = await Post.findOne({ slug: req.params.slug });
    if (!post) {
      res.status(404).json({ message: 'Post not found' });
      return;
    }
    res.json(post);
  } catch (error) {
    console.error('GET /api/posts/:slug error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// ─── POST /api/posts (protected) ────────────────────────────────────────────

router.post(
  '/',
  protect,
  postValidators,
  validate,
  async (req: Request, res: Response): Promise<void> => {
    try {
      const { title, slug, content, tags } = req.body as {
        title: string;
        slug: string;
        content: string;
        tags?: string[];
      };

      // Check for duplicate slug
      const existing = await Post.findOne({ slug });
      if (existing) {
        res.status(409).json({ message: `A post with slug "${slug}" already exists` });
        return;
      }

      const post = await Post.create({ title, slug, content, tags });
      res.status(201).json(post);
    } catch (error) {
      console.error('POST /api/posts error:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  }
);

// ─── PUT /api/posts/:slug (protected) ───────────────────────────────────────

router.put(
  '/:slug',
  protect,
  slugValidator,
  validate,
  async (req: Request, res: Response): Promise<void> => {
    try {
      const post = await Post.findOneAndUpdate(
        { slug: req.params.slug },
        { $set: req.body },
        { new: true, runValidators: true }
      );

      if (!post) {
        res.status(404).json({ message: 'Post not found' });
        return;
      }

      res.json(post);
    } catch (error) {
      console.error('PUT /api/posts/:slug error:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  }
);

// ─── DELETE /api/posts/:slug (protected) ────────────────────────────────────

router.delete(
  '/:slug',
  protect,
  slugValidator,
  validate,
  async (req: Request, res: Response): Promise<void> => {
    try {
      const post = await Post.findOneAndDelete({ slug: req.params.slug });

      if (!post) {
        res.status(404).json({ message: 'Post not found' });
        return;
      }

      res.json({ message: 'Post deleted successfully' });
    } catch (error) {
      console.error('DELETE /api/posts/:slug error:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  }
);

export default router;
