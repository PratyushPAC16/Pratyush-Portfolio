import { Router, Request, Response } from 'express';
import { body } from 'express-validator';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import nodemailer from 'nodemailer';
import User from '../models/User';
import PasswordReset from '../models/PasswordReset';
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

// ─── PUT /api/auth/change-password (protected) ──────────────────────────────

const changePasswordValidators = [
  body('currentPassword').notEmpty().withMessage('Current password is required'),
  body('newPassword')
    .isLength({ min: 8 })
    .withMessage('New password must be at least 8 characters'),
];

router.put(
  '/change-password',
  protect,
  changePasswordValidators,
  validate,
  async (req: Request, res: Response): Promise<void> => {
    const { currentPassword, newPassword } = req.body as {
      currentPassword: string;
      newPassword: string;
    };

    try {
      // Re-fetch the user with passwordHash (protect middleware strips it)
      const user = await User.findById(req.user!._id);
      if (!user) {
        res.status(404).json({ message: 'User not found' });
        return;
      }

      // Verify the current password
      const isMatch = await bcrypt.compare(currentPassword, user.passwordHash);
      if (!isMatch) {
        res.status(401).json({ message: 'Current password is incorrect' });
        return;
      }

      // Prevent reuse of the same password
      const isSame = await bcrypt.compare(newPassword, user.passwordHash);
      if (isSame) {
        res.status(400).json({ message: 'New password must differ from the current one' });
        return;
      }

      // Hash and save the new password
      user.passwordHash = await bcrypt.hash(newPassword, 12);
      await user.save();

      res.json({ message: 'Password changed successfully' });
    } catch (error) {
      console.error('Change password error:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  }
);

// ─── Nodemailer transporter (reuse SMTP config from contact route) ────────────

function createTransporter() {
  return nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT) || 587,
    secure: Number(process.env.SMTP_PORT) === 465,
    auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
  });
}

// ─── POST /api/auth/forgot-password ─────────────────────────────────────────
// Always returns 200 — never reveal whether an email exists in the system.

router.post(
  '/forgot-password',
  [body('email').isEmail().withMessage('A valid email is required').normalizeEmail()],
  validate,
  async (req: Request, res: Response): Promise<void> => {
    const { email } = req.body as { email: string };
    const ALWAYS_OK = { message: 'If that email exists, a reset link has been sent.' };

    try {
      const user = await User.findOne({ email });
      if (!user) {
        // Don't reveal that the email doesn't exist
        res.json(ALWAYS_OK);
        return;
      }

      // Invalidate any previous unused tokens for this email
      await PasswordReset.deleteMany({ email });

      // Generate a cryptographically secure 32-byte token
      const rawToken = crypto.randomBytes(32).toString('hex');
      const tokenHash = crypto.createHash('sha256').update(rawToken).digest('hex');

      await PasswordReset.create({
        email,
        tokenHash,
        expiresAt: new Date(Date.now() + 60 * 60 * 1000), // 1 hour
      });

      // Build the reset URL (client-side route)
      const clientUrl = (process.env.CLIENT_URL ?? 'http://localhost:5173').replace(/\/$/, '');
      const resetUrl = `${clientUrl}/admin/reset-password?token=${rawToken}&email=${encodeURIComponent(email)}`;

      // Send the email (fire-and-forget — don't block on email errors)
      if (process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS) {
        const transporter = createTransporter();
        transporter.sendMail({
          from: `"Pratyush Portfolio Admin" <${process.env.SMTP_USER}>`,
          to: email,
          subject: 'Admin Password Reset Request',
          text: `You requested a password reset.\n\nReset link (valid for 1 hour):\n${resetUrl}\n\nIf you did not request this, ignore this email.`,
          html: `
            <div style="font-family:sans-serif;max-width:480px;margin:0 auto;background:#050815;color:#e2e8f0;padding:32px;border-radius:12px;border:1px solid rgba(99,255,210,0.15)">
              <h2 style="color:#63ffd2;margin-top:0">Password Reset</h2>
              <p>You requested a password reset for your portfolio admin account.</p>
              <p>Click the button below — the link expires in <strong>1 hour</strong>.</p>
              <a href="${resetUrl}" style="display:inline-block;margin:16px 0;padding:12px 28px;background:linear-gradient(135deg,rgba(99,255,210,0.2),rgba(139,92,246,0.2));border:1px solid rgba(99,255,210,0.35);color:#63ffd2;text-decoration:none;border-radius:10px;font-weight:600">
                Reset Password
              </a>
              <p style="font-size:12px;color:#64748b;margin-top:24px">
                If you did not request this, you can safely ignore this email.<br>
                Do not share this link with anyone.
              </p>
            </div>
          `,
        }).catch((err) => console.error('Password reset email failed:', err));
      } else {
        console.warn('[forgot-password] SMTP not configured — reset URL:', resetUrl);
      }

      res.json(ALWAYS_OK);
    } catch (error) {
      console.error('Forgot password error:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  }
);

// ─── POST /api/auth/reset-password ──────────────────────────────────────────

router.post(
  '/reset-password',
  [
    body('email').isEmail().normalizeEmail(),
    body('token').notEmpty().withMessage('Token is required'),
    body('newPassword').isLength({ min: 8 }).withMessage('Password must be at least 8 characters'),
  ],
  validate,
  async (req: Request, res: Response): Promise<void> => {
    const { email, token, newPassword } = req.body as {
      email: string;
      token: string;
      newPassword: string;
    };

    try {
      const tokenHash = crypto.createHash('sha256').update(token).digest('hex');

      const record = await PasswordReset.findOne({
        email,
        tokenHash,
        used: false,
        expiresAt: { $gt: new Date() },
      });

      if (!record) {
        res.status(400).json({ message: 'Reset link is invalid or has expired.' });
        return;
      }

      const user = await User.findOne({ email });
      if (!user) {
        res.status(400).json({ message: 'User not found.' });
        return;
      }

      user.passwordHash = await bcrypt.hash(newPassword, 12);
      await user.save();

      // Mark token as used
      record.used = true;
      await record.save();

      res.json({ message: 'Password reset successfully. You can now log in.' });
    } catch (error) {
      console.error('Reset password error:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  }
);

export default router;
