import { Link, useLocation } from 'react-router-dom';
import { Separator } from '../ui/separator';
import { privateRoutes } from '../../routes/routes';

function Sidebar({ user }) {
  const location = useLocation();
  if (!user) return null;

  // Helper to check active route
  const isActive = (path) => location.pathname === path;

  // Filter navigation items from routes.js
  const userNavItems = privateRoutes.filter(r => ['Utilisateur', 'Admin'].some(role => r.role && r.role.includes(role)) && [
    '/actifs', '/passifs', '/boutique', '/depot', '/retrait'
  ].includes(r.path));

  const accountNavItems = privateRoutes.filter(r => ['Utilisateur', 'Admin'].some(role => r.role && r.role.includes(role)) && [
    '/mon-compte', '/mes-produits', '/mes-transactions', '/mes-sites'
  ].includes(r.path));

  const adminNavItems = privateRoutes.filter(
    r => r.role && r.role.includes('Admin') && [
      '/admin/dashboard',
      '/admin/utilisateurs',
      '/admin/produits',
      // '/admin/categories',
      '/admin/cpc'
    ].includes(r.path)
  );

  return (
    <aside className="hidden md:block w-64 bg-white border-r border-neutral-200 sticky top-16">
      <div className="p-4 space-y-6">
        <nav className="space-y-1">
          <p className="text-xs text-neutral-500 px-3 mb-2">NAVIGATION</p>
          {userNavItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${isActive(item.path)
                ? 'bg-violet-50 text-violet-600'
                : 'text-neutral-700 hover:bg-neutral-100'
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
        </nav>
        <Separator />
        <nav className="space-y-1">
          <p className="text-xs text-neutral-500 px-3 mb-2">COMPTE</p>
          {accountNavItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${isActive(item.path)
                ? 'bg-violet-50 text-violet-600'
                : 'text-neutral-700 hover:bg-neutral-100'
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
        </nav>
        {user.userAccess === 'Admin' && (
          <>
            <Separator />
            <nav className="space-y-1">
              <p className="text-xs text-neutral-500 px-3 mb-2">ADMINISTRATION</p>
              {adminNavItems.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${isActive(item.path)
                    ? 'bg-violet-50 text-violet-600'
                    : 'text-neutral-700 hover:bg-neutral-100'
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
            </nav>
          </>
        )}
      </div>
    </aside>
  );
}

export default Sidebar;