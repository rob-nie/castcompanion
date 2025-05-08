
import { lazy, Suspense } from 'react';
import { Routes, Route } from 'react-router-dom';
import { useIsMobile } from './hooks/use-mobile';
import { Toaster } from './components/ui/toaster';
import { useUpdateProfile } from './hooks/useUpdateProfile';
import { AuthProvider } from './context/AuthProvider';
import { AnimatedBackground } from './components/AnimatedBackground';

// Lazy-loaded pages
const Index = lazy(() => import('./pages/Index'));
const Auth = lazy(() => import('./pages/Auth'));
const Projects = lazy(() => import('./pages/Projects'));
const ProjectDashboard = lazy(() => import('./pages/ProjectDashboard'));
const Settings = lazy(() => import('./pages/Settings'));
const NotFound = lazy(() => import('./pages/NotFound'));

function App() {
  useUpdateProfile();  // Use the hook to ensure profile data is updated
  
  const isMobile = useIsMobile();

  return (
    <AuthProvider>
      <AnimatedBackground />
      <div className="relative z-10">
        <Suspense fallback={<div className="min-h-screen flex items-center justify-center bg-transparent">Loading...</div>}>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/auth/*" element={<Auth />} />
            <Route path="/projects" element={<Projects />} />
            <Route path="/project/:projectId" element={<ProjectDashboard />} />
            <Route path="/settings" element={<Settings />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </Suspense>
      </div>
      <Toaster />
    </AuthProvider>
  );
}

export default App;
