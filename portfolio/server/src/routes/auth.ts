import { Router, Request, Response } from 'express';
import { body } from 'express-validator';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import User from '../models/User';
import { protect } from '../middleware/auth';
import { validate } from '../middleware/validate';

const router = Router();

// ─── Validators ─────────────────────────────────────────────────────────────

const loginValidators = [
  body('email')
    .isEmail()
    .withMessage('A valid email address is required')
    .normalizeEmail(),
  body('password')
    .notEmpty()
    .withMessage('Password is required'),
];

// ─── POST /api/auth/login ────────────────────────────────────────────────────

router.post('/login', loginValidators, validate, async (req: Request, res: Response): Promise<void> => {
  const { email, password } = req.body as { email: string; password: string };

  try {
    // Find user by email (include passwordHash for bcrypt comparison)
    const user = await User.findOne({ email });
    if (!user) {
      res.status(401).json({ message: 'Invalid credentials' });
      return;
    }

    // Compare plaintext password against stored hash
    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
      res.status(401).json({ message: 'Invalid credentials' });
      return;
    }

    const secret = process.env.JWT_SECRET;
    if (!secret) {
      res.status(500).json({ message: 'Server configuration error: JWT_SECRET not set' });
      return;
    }

    const expiresIn = (process.env.JWT_EXPIRES_IN ?? '7d') as jwt.SignOptions['expiresIn'];

    const token = jwt.sign(
      { id: user._id, email: user.email, role: user.role },
      secret,
      { expiresIn }
    );

    res.json({
      token,
      user: {
        id: user._id,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// ─── GET /api/auth/me (protected) ───────────────────────────────────────────

router.get('/me', protect, (req: Request, res: Response): void => {
  // req.user is attached by the protect middleware (passwordHash already excluded)
  const { _id, email, role } = req.user!;
  res.json({ id: _id, email, role });
});

export default router;
