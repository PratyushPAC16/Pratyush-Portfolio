import { useState, type FormEvent } from 'react';
import axios from 'axios';
import { submitContact } from '../api';

type FormState = 'idle' | 'submitting' | 'success' | 'error';

export default function ContactPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [formState, setFormState] = useState<FormState>('idle');
  const [serverError, setServerError] = useState<string | null>(null);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setFormState('submitting');
    setServerError(null);

    try {
      await submitContact({ name, email, message });
      setFormState('success');
      setName('');
      setEmail('');
      setMessage('');
    } catch (err: unknown) {
      setFormState('error');
      let msg = 'Something went wrong. Please try again.';
      if (axios.isAxiosError(err) && err.response?.data) {
        const data = err.response.data as { message?: string; errors?: Array<{ msg: string }> };
        if (data.errors && data.errors.length > 0) {
          msg = data.errors.map((e) => e.msg).join(', ');
        } else if (data.message) {
          msg = data.message;
        }
      } else if (err instanceof Error) {
        msg = err.message;
      }
      setServerError(msg);
    }
  }

  return (
    <section className="max-w-2xl mx-auto">
      <h1 className="text-3xl font-bold text-white mb-2">Get in Touch</h1>
      <p className="text-slate-400 mb-8">
        Have a project idea, question, or just want to say hi? I'll get back to you promptly.
      </p>

      {formState === 'success' ? (
        <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-xl px-6 py-8 text-center">
          <svg className="w-12 h-12 text-emerald-400 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <h2 className="text-lg font-semibold text-emerald-300 mb-1">Message Sent!</h2>
          <p className="text-slate-400 text-sm">Thanks for reaching out. I'll reply as soon as possible.</p>
          <button
            onClick={() => setFormState('idle')}
            className="mt-5 text-sm text-violet-400 hover:text-violet-300 transition-colors"
          >
            Send another message
          </button>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-5" noValidate>
          {/* Name */}
          <div>
            <label htmlFor="contact-name" className="block text-sm font-medium text-slate-300 mb-1.5">
              Name <span className="text-red-400">*</span>
            </label>
            <input
              id="contact-name"
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Your name"
              className="w-full bg-slate-800 border border-slate-700 hover:border-slate-600 focus:border-violet-500 focus:ring-1 focus:ring-violet-500/50 rounded-lg px-4 py-2.5 text-slate-200 placeholder-slate-500 outline-none transition-colors"
            />
          </div>

          {/* Email */}
          <div>
            <label htmlFor="contact-email" className="block text-sm font-medium text-slate-300 mb-1.5">
              Email <span className="text-red-400">*</span>
            </label>
            <input
              id="contact-email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              className="w-full bg-slate-800 border border-slate-700 hover:border-slate-600 focus:border-violet-500 focus:ring-1 focus:ring-violet-500/50 rounded-lg px-4 py-2.5 text-slate-200 placeholder-slate-500 outline-none transition-colors"
            />
          </div>

          {/* Message */}
          <div>
            <label htmlFor="contact-message" className="block text-sm font-medium text-slate-300 mb-1.5">
              Message <span className="text-red-400">*</span>
            </label>
            <textarea
              id="contact-message"
              required
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows={5}
              placeholder="Your message…"
              className="w-full bg-slate-800 border border-slate-700 hover:border-slate-600 focus:border-violet-500 focus:ring-1 focus:ring-violet-500/50 rounded-lg px-4 py-2.5 text-slate-200 placeholder-slate-500 outline-none transition-colors resize-y"
            />
          </div>

          {/* Error banner */}
          {formState === 'error' && serverError && (
            <p className="text-red-400 text-sm bg-red-400/10 border border-red-400/20 rounded-lg px-4 py-2.5">
              {serverError}
            </p>
          )}

          <button
            type="submit"
            disabled={formState === 'submitting'}
            className="w-full py-2.5 bg-violet-600 hover:bg-violet-500 disabled:bg-violet-600/50 disabled:cursor-not-allowed rounded-lg text-sm font-semibold text-white transition-colors"
          >
            {formState === 'submitting' ? 'Sending…' : 'Send Message'}
          </button>
        </form>
      )}
    </section>
  );
}
