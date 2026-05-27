import { Router, Request, Response } from 'express';
import { body } from 'express-validator';
import nodemailer from 'nodemailer';
import Message from '../models/Message';
import { protect } from '../middleware/auth';
import { validate } from '../middleware/validate';

const router = Router();

// ─── Validators ─────────────────────────────────────────────────────────────

const contactValidators = [
  body('name').notEmpty().withMessage('Name is required').trim(),
  body('email')
    .isEmail()
    .withMessage('A valid email address is required')
    .normalizeEmail(),
  body('message')
    .notEmpty()
    .withMessage('Message is required')
    .isLength({ min: 10 })
    .withMessage('Message must be at least 10 characters'),
];

// ─── Build reusable Nodemailer transporter ───────────────────────────────────

function createTransporter() {
  return nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT) || 587,
    secure: Number(process.env.SMTP_PORT) === 465,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });
}

// ─── POST /api/contact ───────────────────────────────────────────────────────

router.post(
  '/',
  contactValidators,
  validate,
  async (req: Request, res: Response): Promise<void> => {
    const { name, email, message } = req.body as {
      name: string;
      email: string;
      message: string;
    };

    try {
      const saved = await Message.create({ name, email, message });

      const notifyEmail = process.env.NOTIFY_EMAIL;
      if (notifyEmail && process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS) {
        const transporter = createTransporter();
        transporter
          .sendMail({
            from: `"Portfolio Contact Form" <${process.env.SMTP_USER}>`,
            to: notifyEmail,
            replyTo: email,
            subject: `New contact message from ${name}`,
            text: `You received a new message via your portfolio contact form.\n\nName:    ${name}\nEmail:   ${email}\nMessage:\n${message}`,
            html: `
              <h2>New Portfolio Contact Message</h2>
              <table cellpadding="6" style="border-collapse:collapse">
                <tr><td><strong>Name</strong></td><td>${name}</td></tr>
                <tr><td><strong>Email</strong></td><td><a href="mailto:${email}">${email}</a></td></tr>
              </table>
              <h3>Message</h3>
              <p style="white-space:pre-wrap">${message}</p>
            `,
          })
          .catch((err) =>
            console.error('Email notification failed (message was still saved):', err)
          );
      } else {
        console.warn('SMTP not configured — skipping email notification');
      }

      res.status(201).json({
        message: 'Your message has been received. I will get back to you shortly!',
        id: saved._id,
      });
    } catch (error) {
      console.error('POST /api/contact error:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  }
);

// ─── GET /api/contact/messages (protected — admin) ───────────────────────────

router.get(
  '/messages',
  protect,
  async (_req: Request, res: Response): Promise<void> => {
    try {
      const messages = await Message.find().sort({ receivedAt: -1 });
      res.json(messages);
    } catch (error) {
      console.error('GET /api/contact/messages error:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  }
);

// ─── PATCH /api/contact/messages/:id (protected — mark as read) ──────────────

router.patch(
  '/messages/:id',
  protect,
  async (req: Request, res: Response): Promise<void> => {
    try {
      const msg = await Message.findByIdAndUpdate(
        req.params.id,
        { $set: { read: true } },
        { new: true }
      );
      if (!msg) {
        res.status(404).json({ message: 'Message not found' });
        return;
      }
      res.json(msg);
    } catch (error) {
      console.error('PATCH /api/contact/messages/:id error:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  }
);

export default router;
