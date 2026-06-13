import { useState, useEffect, lazy, Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider, useAuth } from './hooks/useAuth';
import { ThemeProvider } from './hooks/useTheme';
import AntiGravityLoader from './components/AntiGravityLoader';
import LiquidGlassNav from './components/LiquidGlassNav';
import GridParticles from './components/GridParticles';
import BackToTop from './components/BackToTop';

// ── Lazy-loaded pages (code-split per route) ──────────────────────────────────
const HomePage = lazy(() => import('./pages/HomePage'));
const ProjectsPage = lazy(() => import('./pages/ProjectsPage'));
const ProjectDetailPage = lazy(() => import('./pages/ProjectDetailPage'));
const BlogPage = lazy(() => import('./pages/BlogPage'));
const BlogPostPage = lazy(() => import('./pages/BlogPostPage'));
const ContactPage = lazy(() => import('./pages/ContactPage'));
const AdminPage = lazy(() => import('./pages/AdminPage'));

// Thin inline fallback so Suspense never shows a blank flash
function PageFallback() {
  return (
    <div className="flex items-center justify-center min-h-[40vh]">
      <span className="w-5 h-5 rounded-full border-2 border-teal-500 border-t-transparent animate-spin" />
    </div>
  );
}

function MainAppContent() {
  const { isLoading } = useAuth();
  // Reduced from 2600ms → 1200ms. The boot-telemetry animation is still
  // visible while the auth check finishes in parallel.
  const [simulatedLoading, setSimulatedLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setSimulatedLoading(false);
    }, 1200);
    return () => clearTimeout(timer);
  }, []);

  if (isLoading || simulatedLoading) {
    return <AntiGravityLoader />;
  }

  return (
    <Router>
      {/* Particle layer — fixed canvas behind all content */}
      <GridParticles />

      <div className="min-h-screen text-slate-900 dark:text-slate-100 flex flex-col font-sans relative z-10 transition-colors duration-300">
        {/* Liquid Glass Floating Navbar */}
        <LiquidGlassNav />

        {/* Main Content — pt-24 clears the fixed floating navbar */}
        <main className="flex-grow max-w-6xl w-full mx-auto px-4 pt-24 pb-8">
          <Suspense fallback={<PageFallback />}>
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/projects" element={<ProjectsPage />} />
              <Route path="/projects/:id" element={<ProjectDetailPage />} />
              <Route path="/blog" element={<BlogPage />} />
              <Route path="/blog/:slug" element={<BlogPostPage />} />
              <Route path="/contact" element={<ContactPage />} />
              {/* AdminPage self-manages auth and all nested admin views */}
              <Route path="/admin/*" element={<AdminPage />} />
            </Routes>
          </Suspense>
        </main>

        {/* Footer */}
        <footer className="border-t border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-950/20 py-6 text-center text-sm text-slate-500 transition-colors duration-300">
          <div className="max-w-6xl mx-auto px-4">
            <p>
              &copy; {new Date().getFullYear()} Pratyush Portfolio &mdash; React + Vite + Tailwind
            </p>
          </div>
        </footer>
      </div>
      <BackToTop />
    </Router>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <MainAppContent />
      </AuthProvider>
    </ThemeProvider>
  );
}
