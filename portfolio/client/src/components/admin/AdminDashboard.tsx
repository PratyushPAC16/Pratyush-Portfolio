import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getProjects, getPosts, getMessages, getDownloadStats, type DownloadStats } from '../../api';
import { BarChart, Bar, ResponsiveContainer, XAxis, YAxis, Tooltip } from 'recharts';

interface Stat {
  label: string;
  value: number | string;
  icon: React.ReactNode;
  accent: string;
  sub?: string;
  link: string;
  chart?: React.ReactNode;
}

function StatCard({ label, value, icon, accent, sub, link, chart }: Stat) {
  const content = (
    <>
      <div className="flex items-start justify-between mb-4">
        <div
          className="w-10 h-10 rounded-xl flex items-center justify-center"
          style={{ background: `${accent}18`, border: `1px solid ${accent}30` }}
        >
          <span style={{ color: accent }}>{icon}</span>
        </div>
        {link !== '#' && (
          <span className="text-[10px] font-mono text-slate-500 uppercase tracking-widest mt-1">
            view →
          </span>
        )}
      </div>
      <p className="text-3xl font-black text-white mb-1">{value}</p>
      <p className="text-sm font-medium text-slate-400">{label}</p>
      {sub && <p className="text-xs text-slate-600 mt-0.5">{sub}</p>}
      {chart}
    </>
  );

  const cardStyle = {
    background: 'rgba(15,23,42,0.6)',
    border: '1px solid rgba(255,255,255,0.07)',
    backdropFilter: 'blur(12px)',
  };

  if (link === '#') {
    return (
      <div className="rounded-2xl p-5" style={cardStyle}>
        {content}
      </div>
    );
  }

  return (
    <Link
      to={link}
      className="block rounded-2xl p-5 transition-all hover:scale-[1.01]"
      style={cardStyle}
    >
      {content}
    </Link>
  );
}

export default function AdminDashboard() {
  const [projects, setProjects] = useState(0);
  const [posts, setPosts] = useState(0);
  const [unread, setUnread] = useState(0);
  const [totalMessages, setTotalMessages] = useState(0);
  const [downloadStats, setDownloadStats] = useState<DownloadStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([getProjects(), getPosts(), getMessages(), getDownloadStats()])
      .then(([proj, post, msgs, dlStats]) => {
        setProjects(proj.length);
        setPosts(post.length);
        setTotalMessages(msgs.length);
        setUnread(msgs.filter((m) => !m.read).length);
        setDownloadStats(dlStats);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const stats: Stat[] = [
    {
      label: 'Total Projects',
      value: loading ? '—' : projects,
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8}
            d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
        </svg>
      ),
      accent: '#a78bfa',
      sub: 'Across IoT · ML · AI · Web',
      link: '/admin/projects',
    },
    {
      label: 'Published Posts',
      value: loading ? '—' : posts,
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8}
            d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
        </svg>
      ),
      accent: '#38bdf8',
      sub: 'Technical blog articles',
      link: '/admin/posts',
    },
    {
      label: 'Unread Messages',
      value: loading ? '—' : unread,
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8}
            d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
        </svg>
      ),
      accent: '#63ffd2',
      sub: loading ? '' : `${totalMessages} total received`,
      link: '/admin/messages',
    },
    {
      label: 'Resume Downloads',
      value: loading ? '—' : (downloadStats?.totalDownloads ?? 0),
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8}
            d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
        </svg>
      ),
      accent: '#fb923c',
      sub: 'Last 7 days activity',
      link: '#',
      chart: !loading && downloadStats && (
        <div className="h-12 w-full mt-4">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={downloadStats.downloadsPerDay}>
              <XAxis dataKey="date" hide />
              <YAxis hide />
              <Tooltip
                contentStyle={{
                  background: '#0f172a',
                  border: '1px solid rgba(255,255,255,0.1)',
                  borderRadius: '8px',
                  fontSize: '10px',
                  color: '#fff',
                }}
                labelStyle={{ color: '#94a3b8' }}
                cursor={{ fill: 'rgba(255,255,255,0.05)' }}
                labelFormatter={(label) => {
                  if (typeof label === 'string') {
                    const parts = label.split('-');
                    if (parts.length === 3) {
                      const dateObj = new Date(Number(parts[0]), Number(parts[1]) - 1, Number(parts[2]));
                      return dateObj.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
                    }
                  }
                  return label;
                }}
              />
              <Bar dataKey="count" fill="#fb923c" radius={[2, 2, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      ),
    },
  ];

  return (
    <div>
      <div className="mb-7">
        <h1 className="text-xl font-bold text-white">Dashboard</h1>
        <p className="text-sm text-slate-500 mt-0.5">Overview of your portfolio content</p>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {stats.map((s) => <StatCard key={s.label} {...s} />)}
      </div>

      {/* Quick links */}
      <div
        className="rounded-2xl p-5"
        style={{ background: 'rgba(15,23,42,0.6)', border: '1px solid rgba(255,255,255,0.07)' }}
      >
        <h2 className="text-sm font-semibold text-white mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {[
            { label: 'Add Project', to: '/admin/projects', color: '#a78bfa' },
            { label: 'Write Post', to: '/admin/posts', color: '#38bdf8' },
            { label: 'Read Messages', to: '/admin/messages', color: '#63ffd2' },
          ].map(({ label, to, color }) => (
            <Link
              key={to}
              to={to}
              className="flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-medium transition-all hover:opacity-90 hover:scale-[1.02] active:scale-95"
              style={{ background: `${color}14`, border: `1px solid ${color}28`, color }}
            >
              <span>+</span> {label}
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
