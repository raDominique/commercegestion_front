
import { useAuth } from '../context/AuthContext';
import { Navigate } from 'react-router-dom';

export default function ProtectedRoute({ allowedRoles, children }) {
  const { isAuthenticated, loading, user } = useAuth();
  if (loading) return <div>Chargement...</div>;
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (allowedRoles && user && !allowedRoles.includes(user.userAccess)) {
    return <Navigate to="/actifs" replace />;
  }
  return children;
}
