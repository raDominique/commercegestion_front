
import { useAuth } from '../context/AuthContext';
import { Navigate } from 'react-router-dom';
import { Squelette } from './ui/skeleton.jsx';

export default function ProtectedRoute({ allowedRoles, children }) {
  const { isAuthenticated, loading, user } = useAuth();
  if (loading) return <Squelette className="w-full h-10 my-8" />;
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (allowedRoles && user && !allowedRoles.includes(user.userAccess)) {
    return <Navigate to="/actifs" replace />;
  }
  return children;
}
