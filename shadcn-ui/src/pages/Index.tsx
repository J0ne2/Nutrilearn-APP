import { useState, useEffect } from 'react';
import { isAuthenticated } from '@/lib/auth';
import AuthForm from '@/components/AuthForm';
import Dashboard from './Dashboard';

export default function Index() {
  const [authenticated, setAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setAuthenticated(isAuthenticated());
    setLoading(false);
  }, []);

  const handleAuthSuccess = () => {
    setAuthenticated(true);
  };

  const handleLogout = () => {
    setAuthenticated(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-blue-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading NutriLearn...</p>
        </div>
      </div>
    );
  }

  if (authenticated) {
    return <Dashboard onLogout={handleLogout} />;
  }

  return <AuthForm onAuthSuccess={handleAuthSuccess} />;
}