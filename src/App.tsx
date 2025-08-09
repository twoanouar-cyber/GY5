import React, { useState, useEffect, useCallback } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

// Contexts
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { GymProvider } from './contexts/GymContext';

// Components
import LoginPage from './components/auth/LoginPage';
import Dashboard from './components/dashboard/Dashboard';
import Layout from './components/layout/Layout';
import LoadingSpinner from './components/common/LoadingSpinner';
import QuickSaleModal from './components/sales/QuickSaleModal';

// Styles
import './styles/arabic.css';

function AppContent() {
  const { user, loading } = useAuth();
  const [showQuickSale, setShowQuickSale] = useState(false);

  const handleOpenQuickSale = useCallback(() => {
    setShowQuickSale(true);
  }, []);

  useEffect(() => {
    if (!user) {
      setShowQuickSale(false);
      return;
    }

    window.addEventListener('openQuickSale', handleOpenQuickSale);
    return () => {
      window.removeEventListener('openQuickSale', handleOpenQuickSale);
    };
  }, [user, handleOpenQuickSale]);

  if (loading) {
    return (
      <div className="app-loading" dir="rtl">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div className="app" dir="rtl">
      <Routes>
        <Route
          path="/login"
          element={user ? <Navigate to="/dashboard" replace /> : <LoginPage />}
        />

        <Route
          path="/dashboard/*"
          element={
            user ? (
              <Layout>
                <Dashboard />
              </Layout>
            ) : (
              <Navigate to="/login" replace />
            )
          }
        />

        <Route path="/" element={<Navigate to="/dashboard" replace />} />
      </Routes>

      {user && (
        <QuickSaleModal
          isOpen={showQuickSale}
          onClose={() => setShowQuickSale(false)}
        />
      )}
    </div>
  );
}

// هذا الجزء لضمان أن GymProvider لا يشتغل إلا عند وجود مستخدم
function AppWithGym() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="app-loading" dir="rtl">
        <LoadingSpinner />
      </div>
    );
  }

  if (!user) {
    // المستخدم غير مسجل دخول → نعرض المحتوى بدون GymProvider
    return <AppContent />;
  }

  // المستخدم مسجل دخول → نلف المحتوى بـ GymProvider
  return (
    <GymProvider>
      <AppContent />
    </GymProvider>
  );
}

export default function App() {
  return (
    <Router>
      <AuthProvider>
        <AppWithGym />
      </AuthProvider>
    </Router>
  );
}
