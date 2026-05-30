import { Link, useLocation } from 'react-router-dom';
import { Separator } from '../ui/separator';
import { privateRoutes } from '../../routes/routes';

function Sidebar({ user, isDesktop = true }) {
  const location = useLocation();
  if (!user) return null;

  const isActive = (path) => location.pathname === path;

  const dashboardItem = privateRoutes.filter(r => r.path === '/dashboard');
  
  const userNavItems = privateRoutes.filter(r => ['Utilisateur', 'Admin'].some(role => r.role && r.role.includes(role)) && [
    '/actifs', '/passifs', '/boutique', '/depot', '/retrait', '/virement-droit', '/appel-offre', '/echange-actifs', '/achat-vente'
  ].includes(r.path));

  const accountNavItems = privateRoutes.filter(r => {
    const allowedRole = ['Utilisateur', 'Admin'].some(role => r.role && r.role.includes(role));
    const includedPath = [
      '/mon-compte',
      '/mes-produits',
      '/mes-transactions',
      '/operations-a-valider',
      '/mes-sites',
      '/parrainages',
      '/mon-compte/audit'
    ].includes(r.path);
    const requiresValidation = r.userValidated === true;
    const validatedOk = !(requiresValidation && user && user.userValidated === false);
    return allowedRole && includedPath && validatedOk;
  });

  const adminNavItems = privateRoutes.filter(
    r => r.role && r.role.includes('Admin') && [
      '/admin/produits',
      '/admin/utilisateurs',
      '/admin/cpc'
    ].includes(r.path)
  );

  const NavLink = ({ item }) => (
    <Link
      key={item.path}
      to={item.path}
      className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-all duration-200 ${
        isActive(item.path)
          ? 'bg-violet-600 text-violet-50'
          : 'text-neutral-100 hover:bg-neutral-800'
      }`}
    >
      {item.icon ? (
        <item.icon className="w-5 h-5 shrink-0" />
      ) : (
        <span className="material-icons shrink-0">menu</span>
      )}
      <span className="text-xs whitespace-normal">{item.label || item.path.replace('/', '').replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())}</span>
    </Link>
  );

  return (
    <aside 
      className={`${isDesktop ? 'block' : 'hidden'} w-64 bg-gray-900 border-r border-neutral-700 sticky top-16 self-start h-[calc(100vh-4rem)]`}
    >
      <div className="p-4 space-y-4 h-full overflow-y-auto scrollbar-custom">
        {/* NAVIGATION Group */}
        <div className="space-y-1">
          <div className="text-[10px] font-semibold text-neutral-400 px-3 py-1 uppercase tracking-wider">Navigation</div>
          {dashboardItem.map((item) => (
            <NavLink key={item.path} item={item} />
          ))}
          {userNavItems.map((item) => (
            <NavLink key={item.path} item={item} />
          ))}
        </div>

        <Separator className="bg-neutral-700" />

        {/* COMPTE Group */}
        <div className="space-y-1">
          <div className="text-[10px] font-semibold text-neutral-400 px-3 py-1 uppercase tracking-wider">Compte</div>
          {accountNavItems.map((item) => (
            <NavLink key={item.path} item={item} />
          ))}
        </div>

        {/* ADMIN Group */}
        {user.userAccess === 'Admin' && (
          <>
            <Separator className="bg-neutral-700" />
            <div className="space-y-1">
              <div className="text-[10px] font-semibold text-neutral-400 px-3 py-1 uppercase tracking-wider">Administration</div>
              {adminNavItems.map((item) => (
                <NavLink key={item.path} item={item} />
              ))}
            </div>
          </>
        )}
      </div>
    </aside>
  );
}

export default Sidebar;