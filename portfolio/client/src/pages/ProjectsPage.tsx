import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { getProjects, getDirectImageUrl, type Project } from '../api';

const MotionLink = motion(Link);

export default function ProjectsPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    getProjects()
      .then(setProjects)
      .catch(() => setError('Failed to load projects. Is the server running?'))
      .finally(() => setLoading(false));
  }, []);

  return (
    <section>
      <h1 className="text-3xl font-bold text-white mb-2">Projects</h1>
      <p className="text-slate-400 mb-8">A collection of work across hardware, software, and ML.</p>

      {/* States */}
      {loading && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-48 rounded-xl bg-slate-800 animate-pulse" />
          ))}
        </div>
      )}
      {error && <p className="text-red-400 bg-red-400/10 border border-red-400/20 rounded-lg px-4 py-3">{error}</p>}

      {/* Project grid */}
      {!loading && !error && (
        <>
          {projects.length === 0 ? (
            <p className="text-slate-500 text-center py-16">No projects found.</p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {projects.map((project) => (
                <MotionLink
                  key={project._id}
                  to={`/projects/${project._id}`}
                  whileHover={{ y: -6, boxShadow: '0 12px 30px rgba(99, 255, 210, 0.05), 0 0 0 1px rgba(99, 255, 210, 0.18)' }}
                  transition={{ duration: 0.25, ease: 'easeOut' as const }}
                  className="group bg-slate-800/60 border border-slate-700/50 rounded-xl p-5 hover:border-violet-500/50 hover:bg-slate-800 transition-all flex flex-col"
                >
                  {/* Thumbnail container */}
                  <div className="relative aspect-video w-full rounded-lg overflow-hidden mb-4 bg-slate-900/30 border border-slate-700/20 shrink-0">
                    {project.thumbnail ? (
                      <img
                        src={getDirectImageUrl(project.thumbnail)}
                        alt={project.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-slate-900 to-slate-950 relative overflow-hidden">
                        {/* Motherboard blueprint styling */}
                        <div className="absolute inset-0 opacity-10 bg-[linear-gradient(to_right,#808080_1px,transparent_1px),linear-gradient(to_bottom,#808080_1px,transparent_1px)] bg-[size:14px_24px]" />
                        <svg className="w-8 h-8 text-slate-700 group-hover:scale-110 transition-transform duration-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
                        </svg>
                      </div>
                    )}
                  </div>

                  <h2 className="text-base font-semibold text-white group-hover:text-violet-300 transition-colors line-clamp-2 mb-2">
                    {project.title}
                  </h2>
                  <p className="text-slate-400 text-sm line-clamp-3 flex-grow">
                    {project.description}
                  </p>

                  {/* Tech chips */}
                  {project.techStack.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-4">
                      {project.techStack.slice(0, 3).map((t) => (
                        <span key={t} className="text-xs px-2 py-0.5 bg-slate-700/60 text-slate-300 rounded">
                          {t}
                        </span>
                      ))}
                      {project.techStack.length > 3 && (
                        <span className="text-xs px-2 py-0.5 text-slate-500">
                          +{project.techStack.length - 3}
                        </span>
                      )}
                    </div>
                  )}

                  {project.featured && (
                    <span className="mt-3 text-xs text-amber-400">⭐ Featured</span>
                  )}
                </MotionLink>
              ))}
            </div>
          )}
        </>
      )}
    </section>
  );
}
