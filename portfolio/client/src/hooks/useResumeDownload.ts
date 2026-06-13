import { useState, useCallback } from 'react';
import { logResumeDownload, getResumeDownloadUrl } from '../api';

export function useResumeDownload() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const download = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      // Log the download event (fire-and-forget; don't block on it)
      logResumeDownload().catch(() => {});
    } catch {
      // non-fatal
    }

    // Determine where to get the PDF:
    // If the server has a resume, use the API URL; otherwise fall back to
    // the static /resume.pdf bundled in public/
    const serverUrl = getResumeDownloadUrl();

    try {
      // Check if the server has a resume by doing a quick HEAD-like fetch
      const head = await fetch(serverUrl, { method: 'HEAD' });
      const href = head.ok ? serverUrl : '/resume.pdf';

      const link = document.createElement('a');
      link.href = href;
      link.download = 'Pratyush_Resume.pdf';
      link.target = '_blank';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch {
      // Network error — fall back to static
      const link = document.createElement('a');
      link.href = '/resume.pdf';
      link.download = 'Pratyush_Resume.pdf';
      link.target = '_blank';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }

    setIsLoading(false);
  }, []);

  return { download, isLoading, error };
}
