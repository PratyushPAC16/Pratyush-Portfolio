import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { uploadResume, getResumeInfo, getResumeDownloadUrl, type ResumeInfo } from '../../api';

// ─── Icons ────────────────────────────────────────────────────────────────────

function IconUpload() {
  return (
    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8}
        d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
    </svg>
  );
}
function IconPdf() {
  return (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8}
        d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
    </svg>
  );
}
function IconCheck() {
  return (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.2} d="M5 13l4 4L19 7" />
    </svg>
  );
}
function IconDownload() {
  return (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8}
        d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
    </svg>
  );
}
function IconTrash() {
  return (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8}
        d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
    </svg>
  );
}

// ─── Status badge ─────────────────────────────────────────────────────────────

type ToastType = 'success' | 'error' | 'info';
interface Toast { id: number; type: ToastType; message: string }

function ToastItem({ toast, onDone }: { toast: Toast; onDone: (id: number) => void }) {
  useEffect(() => {
    const t = setTimeout(() => onDone(toast.id), 3500);
    return () => clearTimeout(t);
  }, [toast.id, onDone]);

  const colors = {
    success: { bg: 'rgba(16,185,129,0.12)', border: 'rgba(16,185,129,0.35)', text: '#34d399' },
    error:   { bg: 'rgba(239,68,68,0.12)',  border: 'rgba(239,68,68,0.35)',  text: '#f87171' },
    info:    { bg: 'rgba(99,255,210,0.10)', border: 'rgba(99,255,210,0.30)', text: '#63ffd2' },
  }[toast.type];

  return (
    <motion.div
      initial={{ opacity: 0, y: -16, scale: 0.96 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -12, scale: 0.96 }}
      className="flex items-center gap-2.5 px-4 py-3 rounded-xl text-sm font-medium shadow-xl backdrop-blur-md"
      style={{ background: colors.bg, border: `1px solid ${colors.border}`, color: colors.text }}
    >
      {toast.type === 'success' && <IconCheck />}
      {toast.message}
    </motion.div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function AdminResume() {
  const [info, setInfo] = useState<ResumeInfo | null>(null);
  const [infoLoading, setInfoLoading] = useState(true);
  const [dragging, setDragging] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [toasts, setToasts] = useState<Toast[]>([]);
  const toastId = useRef(0);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // ── Fetch current resume metadata ─────────────────────────────────────────
  useEffect(() => {
    getResumeInfo()
      .then((d) => setInfo(d))
      .catch(() => setInfo(null))
      .finally(() => setInfoLoading(false));
  }, []);

  const addToast = useCallback((type: ToastType, message: string) => {
    const id = ++toastId.current;
    setToasts((prev) => [...prev, { id, type, message }]);
  }, []);

  const removeToast = useCallback((id: number) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  // ── File selection helpers ─────────────────────────────────────────────────

  const validateFile = (file: File): boolean => {
    if (file.type !== 'application/pdf') {
      addToast('error', 'Only PDF files are accepted.');
      return false;
    }
    if (file.size > 10 * 1024 * 1024) {
      addToast('error', 'File is too large. Maximum size is 10 MB.');
      return false;
    }
    return true;
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && validateFile(file)) setSelectedFile(file);
    e.target.value = '';
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file && validateFile(file)) setSelectedFile(file);
  };

  // ── Upload ────────────────────────────────────────────────────────────────

  const handleUpload = async () => {
    if (!selectedFile) return;
    setUploading(true);
    setProgress(0);

    // Simulate progress ticks while the real upload happens
    const interval = setInterval(() => {
      setProgress((p) => (p < 85 ? p + Math.floor(Math.random() * 12) + 3 : p));
    }, 250);

    try {
      const result = await uploadResume(selectedFile);
      clearInterval(interval);
      setProgress(100);

      setInfo({
        filename: result.filename,
        uploadedAt: result.uploadedAt,
      });
      setSelectedFile(null);
      addToast('success', 'Resume updated successfully!');
    } catch {
      clearInterval(interval);
      addToast('error', 'Upload failed. Please try again.');
    } finally {
      setUploading(false);
      setTimeout(() => setProgress(0), 800);
    }
  };

  const handleDownloadCurrent = () => {
    const url = getResumeDownloadUrl();
    const link = document.createElement('a');
    link.href = url;
    link.download = info?.filename ?? 'resume.pdf';
    link.target = '_blank';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const formatDate = (iso: string) =>
    new Date(iso).toLocaleString('en-IN', {
      day: 'numeric', month: 'short', year: 'numeric',
      hour: '2-digit', minute: '2-digit',
    });

  const cardStyle = {
    background: 'rgba(15,23,42,0.6)',
    border: '1px solid rgba(255,255,255,0.07)',
    backdropFilter: 'blur(12px)',
  };

  return (
    <div className="relative">
      {/* ── Toast stack ─────────────────────────────────────────────────────── */}
      <div className="fixed top-5 right-5 z-[9999] flex flex-col gap-2 pointer-events-none">
        <AnimatePresence>
          {toasts.map((t) => (
            <ToastItem key={t.id} toast={t} onDone={removeToast} />
          ))}
        </AnimatePresence>
      </div>

      {/* ── Page header ─────────────────────────────────────────────────────── */}
      <div className="mb-7">
        <h1 className="text-xl font-bold text-white">Resume Manager</h1>
        <p className="text-sm text-slate-500 mt-0.5">
          Upload a new PDF to replace the resume shown on your portfolio
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-5">

        {/* ── Left: Upload area (col-span-3) ─────────────────────────────────── */}
        <div className="lg:col-span-3 space-y-4">

          {/* Drop zone */}
          <div
            className="rounded-2xl p-7"
            style={cardStyle}
          >
            <h2 className="text-sm font-semibold text-white mb-5 flex items-center gap-2">
              <span
                className="w-7 h-7 rounded-lg flex items-center justify-center"
                style={{ background: 'rgba(99,255,210,0.12)', border: '1px solid rgba(99,255,210,0.25)', color: '#63ffd2' }}
              >
                <IconUpload />
              </span>
              Upload New Resume
            </h2>

            {/* Drop zone area */}
            <div
              onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
              onDragLeave={() => setDragging(false)}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className="relative rounded-xl border-2 border-dashed cursor-pointer transition-all duration-200 flex flex-col items-center justify-center gap-3 py-12 px-6 select-none"
              style={{
                borderColor: dragging
                  ? 'rgba(99,255,210,0.6)'
                  : selectedFile
                  ? 'rgba(99,255,210,0.4)'
                  : 'rgba(255,255,255,0.1)',
                background: dragging
                  ? 'rgba(99,255,210,0.05)'
                  : selectedFile
                  ? 'rgba(99,255,210,0.04)'
                  : 'rgba(255,255,255,0.02)',
              }}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept="application/pdf"
                className="hidden"
                onChange={handleFileChange}
                id="resume-file-input"
              />

              <motion.div
                animate={{ scale: dragging ? 1.15 : 1 }}
                className="w-14 h-14 rounded-2xl flex items-center justify-center"
                style={{ background: 'rgba(99,255,210,0.1)', border: '1px solid rgba(99,255,210,0.2)', color: '#63ffd2' }}
              >
                <IconUpload />
              </motion.div>

              {selectedFile ? (
                <div className="text-center">
                  <p className="text-sm font-semibold text-white flex items-center justify-center gap-1.5">
                    <span className="text-red-400"><IconPdf /></span>
                    {selectedFile.name}
                  </p>
                  <p className="text-xs text-slate-400 mt-1">
                    {(selectedFile.size / 1024).toFixed(0)} KB &mdash; Click to change
                  </p>
                </div>
              ) : (
                <div className="text-center">
                  <p className="text-sm font-semibold text-white">
                    {dragging ? 'Drop your PDF here' : 'Drag & drop your resume PDF'}
                  </p>
                  <p className="text-xs text-slate-500 mt-1">
                    or click to browse &mdash; PDF only, max 10 MB
                  </p>
                </div>
              )}
            </div>

            {/* Upload progress bar */}
            <AnimatePresence>
              {uploading && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="mt-4 overflow-hidden"
                >
                  <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
                    <span>Uploading…</span>
                    <span>{progress}%</span>
                  </div>
                  <div className="h-1.5 rounded-full bg-white/5 overflow-hidden">
                    <motion.div
                      className="h-full rounded-full"
                      style={{ background: 'linear-gradient(90deg, #63ffd2, #a78bfa)' }}
                      animate={{ width: `${progress}%` }}
                      transition={{ ease: 'easeOut', duration: 0.3 }}
                    />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Action buttons */}
            <div className="flex items-center gap-3 mt-5">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.97 }}
                onClick={handleUpload}
                disabled={!selectedFile || uploading}
                className="flex-1 py-2.5 rounded-xl text-sm font-semibold transition-all disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                style={{
                  background: 'linear-gradient(135deg, rgba(99,255,210,0.2), rgba(139,92,246,0.2))',
                  border: '1px solid rgba(99,255,210,0.3)',
                  color: '#63ffd2',
                  boxShadow: '0 0 20px rgba(99,255,210,0.06)',
                }}
              >
                {uploading ? (
                  <>
                    <span className="w-4 h-4 rounded-full border-2 border-[#63ffd2] border-t-transparent animate-spin" />
                    Uploading…
                  </>
                ) : (
                  <>
                    <IconUpload />
                    Upload Resume
                  </>
                )}
              </motion.button>

              {selectedFile && !uploading && (
                <motion.button
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setSelectedFile(null)}
                  className="p-2.5 rounded-xl text-slate-500 hover:text-red-400 transition-colors"
                  style={{ border: '1px solid rgba(255,255,255,0.08)', background: 'rgba(255,255,255,0.03)' }}
                  title="Discard selected file"
                >
                  <IconTrash />
                </motion.button>
              )}
            </div>
          </div>
        </div>

        {/* ── Right: Current resume status (col-span-2) ─────────────────────── */}
        <div className="lg:col-span-2 space-y-4">

          {/* Current resume card */}
          <div className="rounded-2xl p-6" style={cardStyle}>
            <h2 className="text-sm font-semibold text-white mb-5 flex items-center gap-2">
              <span
                className="w-7 h-7 rounded-lg flex items-center justify-center"
                style={{ background: 'rgba(251,146,60,0.12)', border: '1px solid rgba(251,146,60,0.25)', color: '#fb923c' }}
              >
                <IconPdf />
              </span>
              Current Resume
            </h2>

            {infoLoading ? (
              <div className="space-y-3">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="h-4 rounded-lg animate-pulse bg-white/5" />
                ))}
              </div>
            ) : info ? (
              <div className="space-y-4">
                {/* File name */}
                <div
                  className="flex items-center gap-3 p-3 rounded-xl"
                  style={{ background: 'rgba(239,68,68,0.06)', border: '1px solid rgba(239,68,68,0.15)' }}
                >
                  <span className="text-red-400 shrink-0"><IconPdf /></span>
                  <div className="min-w-0">
                    <p className="text-xs font-semibold text-white truncate">{info.filename}</p>
                    <p className="text-[10px] text-slate-500 font-mono">PDF Document</p>
                  </div>
                </div>

                {/* Metadata */}
                <div className="space-y-2 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500">Last updated</span>
                    <span className="text-slate-300 font-mono text-right">{formatDate(info.uploadedAt)}</span>
                  </div>
                  {info.uploadedBy && (
                    <div className="flex items-center justify-between">
                      <span className="text-slate-500">Uploaded by</span>
                      <span className="text-slate-300 font-mono text-right truncate max-w-[140px]">{info.uploadedBy}</span>
                    </div>
                  )}
                </div>

                {/* Active status badge */}
                <div
                  className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-medium"
                  style={{ background: 'rgba(99,255,210,0.07)', border: '1px solid rgba(99,255,210,0.18)', color: '#63ffd2' }}
                >
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-teal-400 opacity-75" />
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-teal-500" />
                  </span>
                  Active — served from database
                </div>

                {/* Download current */}
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={handleDownloadCurrent}
                  className="w-full py-2.5 rounded-xl text-xs font-semibold flex items-center justify-center gap-2 transition-all"
                  style={{
                    border: '1px solid rgba(255,255,255,0.1)',
                    background: 'rgba(255,255,255,0.04)',
                    color: '#94a3b8',
                  }}
                >
                  <IconDownload />
                  Preview / Download
                </motion.button>
              </div>
            ) : (
              <div className="text-center py-6">
                <div
                  className="w-12 h-12 rounded-xl mx-auto mb-3 flex items-center justify-center"
                  style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}
                >
                  <span className="text-slate-600"><IconPdf /></span>
                </div>
                <p className="text-sm font-medium text-slate-400">No resume uploaded yet</p>
                <p className="text-xs text-slate-600 mt-1">
                  Upload a PDF to replace the default static resume
                </p>
              </div>
            )}
          </div>

          {/* How it works card */}
          <div className="rounded-2xl p-5" style={cardStyle}>
            <p className="text-xs font-semibold text-slate-400 mb-3 uppercase tracking-widest">How it works</p>
            <ol className="space-y-2.5">
              {[
                'Drag & drop or click to pick a PDF (max 10 MB)',
                'Click "Upload Resume" to save it to the database',
                'The portfolio site immediately serves the new file',
                'Visitors who click "Download Resume" get the latest version',
              ].map((step, i) => (
                <li key={i} className="flex items-start gap-2.5 text-[11px] text-slate-500 leading-relaxed">
                  <span
                    className="shrink-0 w-4 h-4 rounded-full text-[9px] font-black flex items-center justify-center mt-0.5"
                    style={{ background: 'rgba(99,255,210,0.12)', color: '#63ffd2' }}
                  >
                    {i + 1}
                  </span>
                  {step}
                </li>
              ))}
            </ol>
          </div>
        </div>
      </div>
    </div>
  );
}
