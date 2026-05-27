import { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider, useAuth } from './hooks/useAuth';
import { ThemeProvider } from './hooks/useTheme';
import AntiGravityLoader from './components/AntiGravityLoader';
import LiquidGlassNav from './components/LiquidGlassNav';
import GridParticles from './components/GridParticles';
import BackToTop from './components/BackToTop';
import HomePage from './pages/HomePage';
import ProjectsPage from './pages/ProjectsPage';
import ProjectDetailPage from './pages/ProjectDetailPage';
import BlogPage from './pages/BlogPage';
import BlogPostPage from './pages/BlogPostPage';
import ContactPage from './pages/ContactPage';
import AdminPage from './pages/AdminPage';

function MainAppContent() {
  const { isLoading } = useAuth();
  const [simulatedLoading, setSimulatedLoading] = useState(true);

  // Keep loader visible for 2.6s on initial load for the boot-telemetry animation to run
  useEffect(() => {
    const timer = setTimeout(() => {
      setSimulatedLoading(false);
    }, 2600);
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
