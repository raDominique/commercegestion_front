import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext.jsx';
import { publicRoutes, privateRoutes } from '../../routes/routes.js';
import { useRef, useState, useEffect } from 'react';

const Header = () => {
  const { user } = useAuth();
  // Définir les routes à afficher dans le header
  const links = [];
  publicRoutes.forEach(route => {
    if (!['/login', '/register', '/'].includes(route.path)) {
      links.push({ path: route.path, label: route.path.replace('/', '').charAt(0).toUpperCase() + route.path.slice(2) });
    }
  });
  if (user) {
    privateRoutes.forEach(route => {
      if (!route.role || route.role.split(',').map(r => r.trim()).includes(user.role)) {
        if (!links.some(l => l.path === route.path) && route.path !== '/administration') {
          links.push({ path: route.path, label: route.path.replace('/', '').charAt(0).toUpperCase() + route.path.slice(2) });
        }
      }
    });
  }

  // Dropdown avatar
  const { logout } = useAuth();
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef();

  // Fermer le dropdown si clic extérieur
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setOpen(false);
      }
    }
    if (open) document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [open]);

  return (
    <header className="bg-blue-700 text-white py-4 shadow">
      <div className="container mx-auto flex justify-between items-center px-4">
        <h1 className="text-xl font-bold">Etokisana</h1>
        <nav className="flex gap-4 items-center">
          {links.map(link => (
            <Link key={link.path} to={link.path} className="hover:underline">
              {link.label}
            </Link>
          ))}
          {user && (
            <div className="relative ml-4" ref={dropdownRef}>
              <button
                className="w-10 h-10 rounded-full bg-white text-blue-700 flex items-center justify-center font-bold border-2 border-blue-300 hover:border-blue-500 focus:outline-none"
                onClick={() => setOpen(o => !o)}
                aria-label="User menu"
              >
                {user.username.charAt(0).toUpperCase()}
              </button>
              {open && (
                <div className="absolute right-0 mt-2 w-48 bg-white text-gray-800 rounded shadow-lg z-50">
                  <div className="px-4 py-2 border-b font-semibold">{user.username}</div>
                  {user.role === 'admin' && (
                    <Link
                      to="/administration"
                      className="block px-4 py-2 hover:bg-gray-100 border-b"
                      onClick={() => setOpen(false)}
                    >
                      Administration
                    </Link>
                  )}
                  <button
                    className="w-full text-left px-4 py-2 hover:bg-gray-100"
                    onClick={() => { logout(); setOpen(false); }}
                  >
                    Déconnexion
                  </button>
                </div>
              )}
            </div>
          )}
        </nav>
      </div>
    </header>
  );
};

export default Header;
