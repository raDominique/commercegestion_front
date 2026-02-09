import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { publicRoutes, privateRoutes } from './routes';
import Layout from '../components/Layout/Layout.jsx';
import { useAuth } from '../context/AuthContext.jsx';


const ProtectedRoute = ({ children }) => {
    const { user } = useAuth();
    return user ? children : <Navigate to="/login" />;
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
                            <ProtectedRoute>
                                {role && user && !role.split(',').map(r => r.trim()).includes(user.role) ? (
                                    <Navigate to="/actifs" replace />
                                ) : (
                                    <Layout>{React.createElement(element)}</Layout>
                                )}
                            </ProtectedRoute>
                        }
                    />
                ))}
            </Routes>
        </Router>
    );
}

export default AppRoutes;