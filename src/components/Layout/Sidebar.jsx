import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Separator } from '../ui/separator';
import { privateRoutes } from '../../routes/routes';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';

// Composant wrapper pour les groupes collapsibles avec animation smooth
function CollapsibleGroup({ title, isOpen, onToggle, children }) {
  return (
    <nav className="space-y-1">
      <button
        onClick={onToggle}
        className="w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs text-neutral-100 mb-0 hover:bg-neutral-800 transition-colors"
      >
        <span>{title}</span>
        <ExpandMoreIcon 
          className={`w-4 h-4 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`}
        />
      </button>
      <div
        className={`overflow-hidden transition-all duration-300 ease-in-out ${
          isOpen ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
        }`}
      >
        <div className="space-y-1">
          {children}
        </div>
      </div>
    </nav>
  );
}

function Sidebar({ user, isDesktop = true }) {
  const location = useLocation();
  const [expandedGroup, setExpandedGroup] = useState('navigation');
  
  if (!user) return null;

  // Helper to check active route
  const isActive = (path) => location.pathname === path;

  // Toggle group expansion (close others when opening one)
  const toggleGroup = (groupName) => {
    setExpandedGroup(expandedGroup === groupName ? null : groupName);
  };

  // Filter navigation items from routes.js
  const dashboardItem = privateRoutes.filter(r => r.path === '/dashboard');
  
  const userNavItems = privateRoutes.filter(r => ['Utilisateur', 'Admin'].some(role => r.role && r.role.includes(role)) && [
    '/actifs', '/passifs', '/boutique', '/depot', '/retrait', '/panier'
  ].includes(r.path));

  const accountNavItems = privateRoutes.filter(r => ['Utilisateur', 'Admin'].some(role => r.role && r.role.includes(role)) && [
    '/mon-compte', '/mes-produits', '/mes-transactions', '/operations-a-valider', '/mes-sites', '/parrainages'
  ].includes(r.path));

  const adminNavItems = privateRoutes.filter(
    r => r.role && r.role.includes('Admin') && [
      '/admin/produits',
      '/admin/utilisateurs',
      // '/admin/categories',
      '/admin/cpc'
    ].includes(r.path)
  );

  return (
    <aside className={`${isDesktop ? 'block w-64' : 'hidden'} bg-gray-900 border-r border-neutral-200 sticky top-16`}>
      <div className="p-4 space-y-1">
        {/* Navigation Group */}
        <CollapsibleGroup
          title="NAVIGATION"
          isOpen={expandedGroup === 'navigation'}
          onToggle={() => toggleGroup('navigation')}
        >
          {dashboardItem.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${isActive(item.path)
                ? 'bg-violet-600 text-violet-50'
                : 'text-neutral-100 hover:bg-neutral-100 hover:text-neutral-900'
                }`}
            >
              {item.icon ? (
                <item.icon className="w-5 h-5" />
              ) : (
                <span className="material-icons">menu</span>
              )}
              <span className="text-sm">{item.label || item.path.replace('/', '').replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())}</span>
            </Link>
          ))}
          {userNavItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${isActive(item.path)
                ? 'bg-violet-600 text-violet-50'
                : 'text-neutral-100 hover:bg-neutral-100 hover:text-neutral-900'
                }`}
            >
              {item.icon ? (
                <item.icon className="w-5 h-5" />
              ) : (
                <span className="material-icons">menu</span>
              )}
              <span className="text-sm">{item.label || item.path.replace('/', '').replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())}</span>
            </Link>
          ))}
        </CollapsibleGroup>
        <Separator />

        {/* Compte Group */}
        <CollapsibleGroup
          title="COMPTE"
          isOpen={expandedGroup === 'compte'}
          onToggle={() => toggleGroup('compte')}
        >
          {accountNavItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${isActive(item.path)
                ? 'bg-violet-600 text-violet-50'
                : 'text-neutral-100 hover:bg-neutral-100 hover:text-neutral-900'
                }`}
            >
              {item.icon ? (
                <item.icon className="w-5 h-5" />
              ) : (
                <span className="material-icons">menu</span>
              )}
              <span className="text-sm">{item.label || item.path.replace('/', '').replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())}</span>
            </Link>
          ))}
        </CollapsibleGroup>

        {user.userAccess === 'Admin' && (
          <>
            <Separator />
            <CollapsibleGroup
              title="ADMINISTRATION"
              isOpen={expandedGroup === 'admin'}
              onToggle={() => toggleGroup('admin')}
            >
              {adminNavItems.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${isActive(item.path)
                    ? 'bg-violet-600 text-violet-50'
                    : 'text-neutral-100 hover:bg-neutral-100 hover:text-neutral-900'
                    }`}
                >
                  {item.icon ? (
                    <item.icon className="w-5 h-5" />
                  ) : (
                    <span className="material-icons">menu</span>
                  )}
                  <span className="text-sm">{item.label || item.path.replace('/', '').replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())}</span>
                </Link>
              ))}
            </CollapsibleGroup>
          </>
        )}
      </div>
    </aside>
  );
}

export default Sidebar;