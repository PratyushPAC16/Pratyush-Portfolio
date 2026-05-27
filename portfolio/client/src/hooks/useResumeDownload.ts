import { useState, useCallback } from 'react';
import { logResumeDownload } from '../api';

export function useResumeDownload() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const download = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      await logResumeDownload();
    } catch (err) {
      console.error('Failed to log resume download:', err);
      setError('Logging failed, opening resume anyway.');
    } finally {
      // Trigger opening/downloading the PDF
      const link = document.createElement('a');
      link.href = '/resume.pdf';
      link.download = 'Pratyush_Resume.pdf';
      link.target = '_blank';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      setIsLoading(false);
    }
  }, []);

  return { download, isLoading, error };
}
