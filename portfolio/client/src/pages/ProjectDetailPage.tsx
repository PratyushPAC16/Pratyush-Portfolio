import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getProject, getDirectImageUrl, type Project } from '../api';
import TechIcon from '../components/TechIcon';

export default function ProjectDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    getProject(id)
      .then(setProject)
      .catch(() => setError('Project not found or server unavailable.'))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <div className="space-y-4 animate-pulse">
        <div className="h-8 w-2/3 bg-slate-800 rounded" />
        <div className="h-4 w-1/4 bg-slate-800 rounded" />
        <div className="h-32 bg-slate-800 rounded-xl" />
        <div className="flex gap-2">
          {[1, 2, 3].map((i) => <div key={i} className="h-6 w-16 bg-slate-800 rounded-full" />)}
        </div>
      </div>
    );
  }

  if (error || !project) {
    return (
      <div className="text-center py-20">
        <p className="text-red-400 mb-4">{error ?? 'Project not found.'}</p>
        <Link to="/projects" className="text-violet-400 hover:text-violet-300">
          ← Back to Projects
        </Link>
      </div>
    );
  }

  return (
    <article className="max-w-3xl mx-auto">
      {/* Back link */}
      <Link
        to="/projects"
        className="inline-flex items-center gap-1 text-sm text-slate-400 hover:text-violet-400 transition-colors mb-6"
      >
        ← Back to Projects
      </Link>

      {/* Header */}
      <div className="mb-6">
        {project.featured && (
          <span className="inline-block text-xs text-amber-400">⭐ Featured</span>
        )}
        <h1 className="text-3xl font-bold text-slate-900 dark:text-white mt-1">{project.title}</h1>
        <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">
          {new Date(project.createdAt).toLocaleDateString('en-US', {
            year: 'numeric', month: 'long', day: 'numeric',
          })}
        </p>

        {project.techStack.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-4">
            {project.techStack.map((tech) => (
              <TechIcon key={tech} name={tech} label={tech} />
            ))}
          </div>
        )}
      </div>

      {/* Thumbnail */}
      {project.thumbnail && (
        <img
          src={getDirectImageUrl(project.thumbnail)}
          alt={project.title}
          className="w-full rounded-xl mb-6 object-cover max-h-80"
        />
      )}

      {/* Description */}
      <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-6 mb-6">
        <h2 className="text-sm uppercase tracking-widest text-slate-400 mb-3">Description</h2>
        <p className="text-slate-200 leading-relaxed">{project.description}</p>
      </div>



      {/* Links */}
      <div className="flex flex-wrap gap-3">
        {project.githubUrl && (
          <a
            href={project.githubUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 border border-slate-700 hover:border-slate-600 rounded-lg text-sm text-slate-200 transition-colors"
          >
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 0C5.37 0 0 5.37 0 12c0 5.3 3.438 9.8 8.207 11.387.6.113.793-.263.793-.587v-2.05c-3.338.726-4.042-1.61-4.042-1.61-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.84 1.237 1.84 1.237 1.07 1.835 2.807 1.305 3.492.998.108-.775.418-1.305.762-1.605-2.665-.3-5.467-1.334-5.467-5.932 0-1.31.468-2.381 1.236-3.221-.124-.303-.536-1.524.117-3.176 0 0 1.008-.322 3.3 1.23A11.5 11.5 0 0112 6.803c1.02.005 2.047.138 3.006.404 2.29-1.552 3.297-1.23 3.297-1.23.655 1.653.243 2.874.12 3.176.77.84 1.235 1.911 1.235 3.221 0 4.61-2.807 5.628-5.48 5.922.43.372.814 1.103.814 2.222v3.293c0 .327.19.705.8.586C20.565 21.796 24 17.298 24 12c0-6.63-5.37-12-12-12z"/>
            </svg>
            GitHub
          </a>
        )}
        {project.liveUrl && (
          <a
            href={project.liveUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-4 py-2 bg-violet-600 hover:bg-violet-500 border border-violet-500 rounded-lg text-sm text-white transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
            </svg>
            Live Demo
          </a>
        )}
      </div>
    </article>
  );
}
