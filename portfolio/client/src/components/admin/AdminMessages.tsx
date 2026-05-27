import { useState, useEffect, useCallback } from 'react';
import { getMessages, markMessageRead, type Message } from '../../api';

export default function AdminMessages() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [markingId, setMarkingId] = useState<string | null>(null);

  const refresh = useCallback(() => {
    setLoading(true);
    getMessages()
      .then(setMessages)
      .catch(() => setError('Failed to load messages'))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => { refresh(); }, [refresh]);

  const handleMarkRead = useCallback(
    async (e: React.MouseEvent, id: string) => {
      e.stopPropagation();
      setMarkingId(id);
      try {
        const updated = await markMessageRead(id);
        setMessages((prev) => prev.map((m) => (m._id === id ? updated : m)));
      } catch {
        // silently fail; refresh will get correct state
      } finally {
        setMarkingId(null);
      }
    },
    []
  );

  const unread = messages.filter((m) => !m.read).length;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-bold text-white">Messages</h1>
          <p className="text-sm text-slate-500 mt-0.5">
            {messages.length} total
            {unread > 0 && (
              <span className="ml-2 px-2 py-0.5 text-[10px] font-bold rounded-full bg-teal-400/15 text-teal-400 border border-teal-400/25">
                {unread} unread
              </span>
            )}
          </p>
        </div>
        <button
          onClick={refresh}
          className="px-3 py-2 text-xs text-slate-400 hover:text-slate-200 border border-white/10 hover:border-white/20 rounded-lg transition-colors"
        >
          Refresh
        </button>
      </div>

      {loading ? (
        <div className="space-y-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-16 rounded-xl animate-pulse" style={{ background: 'rgba(255,255,255,0.04)' }} />
          ))}
        </div>
      ) : error ? (
        <div
          className="rounded-2xl p-8 text-center text-red-400 text-sm"
          style={{ background: 'rgba(15,23,42,0.6)', border: '1px solid rgba(255,255,255,0.07)' }}
        >
          {error}
        </div>
      ) : messages.length === 0 ? (
        <div
          className="rounded-2xl p-8 text-center text-slate-500 text-sm"
          style={{ background: 'rgba(15,23,42,0.6)', border: '1px solid rgba(255,255,255,0.07)' }}
        >
          No messages yet.
        </div>
      ) : (
        <div className="space-y-2">
          {messages.map((msg) => {
            const isExpanded = expandedId === msg._id;
            const isUnread = !msg.read;

            return (
              <div
                key={msg._id}
                onClick={() => setExpandedId(isExpanded ? null : msg._id)}
                className="rounded-xl cursor-pointer transition-all"
                style={{
                  background: isUnread ? 'rgba(99,255,210,0.04)' : 'rgba(15,23,42,0.5)',
                  border: isUnread
                    ? '1px solid rgba(99,255,210,0.18)'
                    : '1px solid rgba(255,255,255,0.07)',
                }}
              >
                {/* Row */}
                <div className="flex items-center gap-4 px-5 py-4">
                  {/* Unread dot */}
                  <div className="shrink-0 w-2 h-2 rounded-full mt-0.5"
                    style={{ background: isUnread ? '#63ffd2' : 'transparent', boxShadow: isUnread ? '0 0 6px #63ffd2' : 'none' }}
                  />

                  {/* Avatar */}
                  <div
                    className="shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold uppercase"
                    style={{ background: 'rgba(99,255,210,0.1)', color: '#63ffd2', border: '1px solid rgba(99,255,210,0.2)' }}
                  >
                    {msg.name.charAt(0)}
                  </div>

                  {/* Content preview */}
                  <div className="flex-grow min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <span className={`text-sm font-semibold ${isUnread ? 'text-white' : 'text-slate-300'}`}>
                        {msg.name}
                      </span>
                      <span className="text-xs text-slate-500">{msg.email}</span>
                    </div>
                    <p className={`text-xs truncate ${isUnread ? 'text-slate-300' : 'text-slate-500'}`}>
                      {msg.message}
                    </p>
                  </div>

                  {/* Date + actions */}
                  <div className="shrink-0 flex items-center gap-3">
                    <time className="text-xs text-slate-600 hidden sm:block">
                      {new Date(msg.receivedAt).toLocaleDateString('en-US', {
                        month: 'short', day: 'numeric', year: 'numeric',
                      })}
                    </time>
                    {isUnread && (
                      <button
                        onClick={(e) => handleMarkRead(e, msg._id)}
                        disabled={markingId === msg._id}
                        className="px-3 py-1.5 text-[10px] font-semibold rounded-lg transition-colors disabled:opacity-50"
                        style={{ background: 'rgba(99,255,210,0.1)', border: '1px solid rgba(99,255,210,0.25)', color: '#63ffd2' }}
                      >
                        {markingId === msg._id ? '…' : 'Mark Read'}
                      </button>
                    )}
                    <svg
                      className={`w-4 h-4 text-slate-600 transition-transform ${isExpanded ? 'rotate-180' : ''}`}
                      fill="none" stroke="currentColor" viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                </div>

                {/* Expanded content */}
                {isExpanded && (
                  <div className="px-5 pb-5 border-t border-white/6 pt-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-3 text-xs text-slate-500">
                      <div>
                        <span className="uppercase tracking-wider">From</span>
                        <p className="text-slate-200 mt-0.5">{msg.name}</p>
                      </div>
                      <div>
                        <span className="uppercase tracking-wider">Email</span>
                        <a
                          href={`mailto:${msg.email}`}
                          className="block text-teal-400 hover:text-teal-300 mt-0.5"
                          onClick={(e) => e.stopPropagation()}
                        >
                          {msg.email}
                        </a>
                      </div>
                      <div>
                        <span className="uppercase tracking-wider">Received</span>
                        <p className="text-slate-200 mt-0.5">
                          {new Date(msg.receivedAt).toLocaleString('en-US', {
                            weekday: 'short', month: 'short', day: 'numeric',
                            year: 'numeric', hour: '2-digit', minute: '2-digit',
                          })}
                        </p>
                      </div>
                      <div>
                        <span className="uppercase tracking-wider">Status</span>
                        <p className={`mt-0.5 ${msg.read ? 'text-slate-500' : 'text-teal-400'}`}>
                          {msg.read ? 'Read' : 'Unread'}
                        </p>
                      </div>
                    </div>

                    <div>
                      <span className="text-xs text-slate-500 uppercase tracking-wider">Message</span>
                      <p className="mt-2 text-sm text-slate-200 leading-relaxed whitespace-pre-wrap bg-black/20 rounded-lg p-3 border border-white/5">
                        {msg.message}
                      </p>
                    </div>

                    <div className="flex gap-3 mt-4">
                      <a
                        href={`mailto:${msg.email}`}
                        onClick={(e) => e.stopPropagation()}
                        className="px-4 py-2 text-xs font-medium rounded-lg transition-colors"
                        style={{ background: 'rgba(99,255,210,0.08)', border: '1px solid rgba(99,255,210,0.2)', color: '#63ffd2' }}
                      >
                        Reply via Email
                      </a>
                      {!msg.read && (
                        <button
                          onClick={(e) => handleMarkRead(e, msg._id)}
                          disabled={markingId === msg._id}
                          className="px-4 py-2 text-xs font-medium text-slate-400 border border-white/10 rounded-lg hover:text-slate-200 hover:border-white/20 transition-colors disabled:opacity-50"
                        >
                          {markingId === msg._id ? 'Marking…' : 'Mark as Read'}
                        </button>
                      )}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
