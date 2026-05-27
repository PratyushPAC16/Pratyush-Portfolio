import { Router, Request, Response } from 'express';
import DownloadLog from '../models/DownloadLog';
import { protect } from '../middleware/auth';

const router = Router();

// ─── GET /api/analytics/resume-download (public) ─────────────────────────────
router.get('/resume-download', async (req: Request, res: Response): Promise<void> => {
  try {
    const userAgent = req.headers['user-agent'] || '';
    const ip = (req.headers['x-forwarded-for'] as string) || req.ip || req.socket.remoteAddress || '';

    await DownloadLog.create({
      userAgent,
      ip,
    });

    res.status(200).json({ success: true });
  } catch (error) {
    console.error('Error logging resume download:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// ─── GET /api/analytics/stats (protected — admin) ────────────────────────────
router.get('/stats', protect, async (_req: Request, res: Response): Promise<void> => {
  try {
    const totalDownloads = await DownloadLog.countDocuments();

    // Generate list of last 7 days (YYYY-MM-DD in server local time)
    const last7Days: { date: string; count: number }[] = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const year = d.getFullYear();
      const month = String(d.getMonth() + 1).padStart(2, '0');
      const day = String(d.getDate()).padStart(2, '0');
      const dateStr = `${year}-${month}-${day}`;
      last7Days.push({ date: dateStr, count: 0 });
    }

    // Get logs in the last 7 days
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setHours(0, 0, 0, 0);
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 6);

    const logs = await DownloadLog.find({
      downloadedAt: { $gte: sevenDaysAgo },
    });

    // Count downloads per day
    const countsMap: Record<string, number> = {};
    logs.forEach((log) => {
      const dateObj = new Date(log.downloadedAt);
      const year = dateObj.getFullYear();
      const month = String(dateObj.getMonth() + 1).padStart(2, '0');
      const day = String(dateObj.getDate()).padStart(2, '0');
      const dateStr = `${year}-${month}-${day}`;
      countsMap[dateStr] = (countsMap[dateStr] || 0) + 1;
    });

    const downloadsPerDay = last7Days.map((dayObj) => ({
      date: dayObj.date,
      count: countsMap[dayObj.date] || 0,
    }));

    res.json({
      totalDownloads,
      downloadsPerDay,
    });
  } catch (error) {
    console.error('Error fetching analytics stats:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

export default router;
