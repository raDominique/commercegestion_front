import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { publicRoutes, privateRoutes } from './routes';
import { Layout } from '../components/Layout/Layout.jsx';
import { useAuth } from '../context/AuthContext.jsx';


const ProtectedRoute = ({ allowedRoles, children }) => {
    const { user } = useAuth();
    if (!user) return <Navigate to="/login" />;
    if (allowedRoles && !allowedRoles.includes(user.userAccess)) {
        return <Navigate to="/actifs" replace />;
    }
    return children;
};


const AppRoutes = () => {
    const { user } = useAuth();

    return (
        <Router>
            <Routes>
                {/* Redirection par défaut selon l'état d'authentification */}
                <Route
                    path="/"
                    element={user ? <Navigate to="/actifs" replace /> : <Navigate to="/login" replace />}
                />
                {/* Routes publiques (login/register sans layout, autres avec layout) */}
                {publicRoutes.map(({ path, element }, idx) => {
                    if (path === '/login' || path === '/register') {
                        return (
                            <Route
                                key={idx}
                                path={path}
                                element={user ? <Navigate to="/actifs" replace /> : React.createElement(element)}
                            />
                        );
                    }
                    if (path === '/') return null; // route Home supprimée
                    return (
                        <Route
                            key={idx}
                            path={path}
                            element={<Layout>{React.createElement(element)}</Layout>}
                        />
                    );
                })}
                {/* Routes privées avec gestion des rôles */}
                {privateRoutes.map(({ path, element, role }, idx) => (
                    <Route
                        key={idx}
                        path={path}
                        element={
                            <ProtectedRoute allowedRoles={role ? role.split(',').map(r => r.trim()) : undefined}>
                                <Layout>{React.createElement(element)}</Layout>
                            </ProtectedRoute>
                        }
                    />
                ))}
            </Routes>
        </Router>
    );
}

export default AppRoutes;