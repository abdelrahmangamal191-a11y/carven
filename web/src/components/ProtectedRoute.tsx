import { type ReactNode } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

export default function ProtectedRoute({ children, adminOnly = false }: { children: ReactNode; adminOnly?: boolean }) {
  const { user, loading } = useAuth();

  if (loading) {
    return <div className="loading-screen">جاري التحميل...</div>;
  }

  if (!user) {
    return <Navigate to="/admin/login" replace />;
  }

  if (adminOnly && user.role !== 'admin') {
    return <div className="error-screen">ليس لديك صلاحية الوصول لهذه الصفحة</div>;
  }

  return <>{children}</>;
}
