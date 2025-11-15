import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import Sidebar from './components/common/Sidebar';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import POS from './pages/POS';
import Inventory from './pages/Inventory';
import Reports from './pages/Reports';
import Users from './pages/Users';
import LoadingSpinner from './components/common/LoadingSpinner';

// Protected Route Component
const ProtectedRoute = ({ children, adminOnly = false }) => {
  const { user, loading, isAdmin } = useAuth();

  if (loading) return <LoadingSpinner fullScreen />;
  if (!user) return <Navigate to="/login" />;
  if (adminOnly && !isAdmin()) return <Navigate to="/dashboard" />;

  return (
    <div className="flex">
      <Sidebar />
      <main className="ml-64 flex-1 min-h-screen bg-background">
        {children}
      </main>
    </div>
  );
};

function AppRoutes() {
  const { user, loading } = useAuth();

  if (loading) return <LoadingSpinner fullScreen />;

  return (
    <Routes>
      <Route 
        path="/login" 
        element={user ? <Navigate to="/dashboard" /> : <Login />} 
      />
      
      <Route path="/dashboard" element={
        <ProtectedRoute>
          <Dashboard />
        </ProtectedRoute>
      } />
      
      <Route path="/pos" element={
        <ProtectedRoute>
          <POS />
        </ProtectedRoute>
      } />
      
      <Route path="/inventory" element={
        <ProtectedRoute adminOnly>
          <Inventory />
        </ProtectedRoute>
      } />
      
      <Route path="/reports" element={
        <ProtectedRoute adminOnly>
          <Reports />
        </ProtectedRoute>
      } />
      
      <Route path="/users" element={
        <ProtectedRoute adminOnly>
          <Users />
        </ProtectedRoute>
      } />
      
      <Route path="/" element={<Navigate to="/dashboard" />} />
      <Route path="*" element={<Navigate to="/dashboard" />} />
    </Routes>
  );
}

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;