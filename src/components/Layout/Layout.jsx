

import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { privateRoutes } from '../../routes/routes';

import Sidebar from './Sidebar';

import Header from './Header';

import Content from './Content';

// Main Layout Component
export function Layout({ children }) {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  // Génération dynamique des items de navigation à partir des routes
  const userNavItems = privateRoutes.filter(r => ['user', 'admin'].some(role => r.role && r.role.includes(role)) && [
    '/actifs', '/passifs', '/boutique', '/depot', '/retrait'
  ].includes(r.path)).map(r => ({ path: r.path, label: r.path.replace('/', '').replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase()), element: r.element }));

  const accountNavItems = privateRoutes.filter(r => ['user', 'admin'].some(role => r.role && r.role.includes(role)) && [
    '/mon-compte', '/mes-produits', '/mes-transactions', '/mes-sites'
  ].includes(r.path)).map(r => ({ path: r.path, label: r.path.replace('/', '').replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase()), element: r.element }));

  const adminNavItems = privateRoutes.filter(r => r.role && r.role.includes('admin') && [
    '/admin/dashboard', '/admin/utilisateurs', '/admin/produits', '/admin/categories'
  ].includes(r.path)).map(r => ({ path: r.path, label: r.path.replace('/', '').replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase()), element: r.element }));

  const isActive = (path) => location.pathname === path;

  return (
    <div className="min-h-screen bg-neutral-50">
      <Header
        user={user}
        mobileMenuOpen={mobileMenuOpen}
        setMobileMenuOpen={setMobileMenuOpen}
        handleLogout={handleLogout}
        userNavItems={userNavItems}
        accountNavItems={accountNavItems}
        adminNavItems={adminNavItems}
        isActive={isActive}
      />
      {user ? (
        <div className="flex min-h-[calc(100vh-4rem)]">
          <Sidebar
            userNavItems={userNavItems}
            accountNavItems={accountNavItems}
            adminNavItems={adminNavItems}
            isActive={isActive}
            user={user}
          />
          <Content>{children}</Content>
        </div>
      ) : (
        <Content>{children}</Content>
      )}

    </div>
  );
}
