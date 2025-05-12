import { lazy, Suspense } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useIsMobile } from './hooks/use-mobile';
import { Toaster } from './components/ui/toaster';
import { useUpdateProfile } from './hooks/useUpdateProfile';
import { AuthProvider } from './context/AuthProvider';
import { useAuth } from './context/AuthProvider';

// Lazy-loaded pages
const Index = lazy(() => import('./pages/Index'));
const Auth = lazy(() => import('./pages/Auth'));
const Projects = lazy(() => import('./pages/Projects'));
const ProjectDashboard = lazy(() => import('./pages/ProjectDashboard'));
const Settings = lazy(() => import('./pages/Settings'));
const NotFound = lazy(() => import('./pages/NotFound'));

// Wrapper component for the index route to handle authenticated redirects
const IndexRoute = () => {
  const { user, isLoading } = useAuth();
  
  // If still loading auth state, show loading
  if (isLoading) {
    return <div className="min-h-screen flex items-center justify-center bg-background">Loading...</div>;
  }
  
  // If user is authenticated, redirect to projects
  if (user) {
    return <Navigate to="/projects" replace />;
  }
  
  // Otherwise show the landing page
  return <Index />;
};

function App() {
  useUpdateProfile();  // Use the hook to ensure profile data is updated
  
  const isMobile = useIsMobile();

  return (
    <AuthProvider>
      <Suspense fallback={<div className="min-h-screen flex items-center justify-center bg-background">Loading...</div>}>
        <Routes>
          <Route path="/" element={<IndexRoute />} />
          <Route path="/auth/*" element={<Auth />} />
          <Route path="/projects" element={<Projects />} />
          <Route path="/project/:projectId" element={<ProjectDashboard />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Suspense>
      <Toaster />
    </AuthProvider>
  );
}

export default App;
