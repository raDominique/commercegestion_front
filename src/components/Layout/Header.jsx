import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '../ui/button';
import { Separator } from '../ui/separator';
import { Logout, Menu, Close, AccountBalanceWallet } from '@mui/icons-material';
import { privateRoutes } from '../../routes/routes';

function Header({ user, mobileMenuOpen, setMobileMenuOpen, handleLogout, userNavItems, accountNavItems, adminNavItems, isActive }) {
    return (
        <header className="sticky top-0 z-50 bg-white border-b border-neutral-200">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center h-16">
                    <div className="flex items-center gap-8">
                        <Link to="/" className="flex items-center gap-2">
                            <div className="w-8 h-8 bg-linear-to-br from-violet-600 to-indigo-600 rounded-lg" />
                            <span className="text-lg text-neutral-900">Etokisana</span>
                        </Link>
                    </div>
                    {user && (
                        <>
                            <button
                                className="md:hidden p-2"
                                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                            >
                                {mobileMenuOpen ? <Close className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
                            </button>
                            <div className="hidden md:flex items-center gap-4">
                                <div className="flex items-center gap-2 px-3 py-2 bg-neutral-100 rounded-lg">
                                    <AccountBalanceWallet className="w-4 h-4 text-neutral-600" />
                                    <span className="text-sm text-neutral-900">
                                        {typeof user.balance === 'number' ? user.balance.toLocaleString() : '0'} FCFA
                                    </span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <div className="w-8 h-8 bg-violet-600 rounded-full flex items-center justify-center">
                                        <span className="text-xs text-white">
                                            {typeof user.name === 'string' && user.name.length > 0 ? user.name.charAt(0).toUpperCase() : '?'}
                                        </span>
                                    </div>
                                    <span className="text-sm text-neutral-700">{typeof user.name === 'string' ? user.name : 'Utilisateur'}</span>
                                </div>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={handleLogout}
                                    className="text-neutral-600"
                                >
                                    <Logout className="w-4 h-4" />
                                </Button>
                            </div>
                        </>
                    )}
                </div>
            </div>
            {/* Mobile menu */}
            {mobileMenuOpen && user && (
                <div className="md:hidden border-t border-neutral-200 bg-white">
                    <div className="px-4 py-4 space-y-4">
                        <div className="flex items-center gap-2 px-3 py-2 bg-neutral-100 rounded-lg">
                            <AccountBalanceWallet className="w-4 h-4 text-neutral-600" />
                            <span className="text-sm text-neutral-900">
                                {typeof user.balance === 'number' ? user.balance.toLocaleString() : '0'} FCFA
                            </span>
                        </div>
                        {/* NAVIGATION */}
                        <nav className="space-y-1">
                            <p className="text-xs text-neutral-500 px-3 mb-2">NAVIGATION</p>
                            {privateRoutes.filter(r => ['user', 'admin'].some(role => r.role && r.role.includes(role)) && [
                                '/actifs', '/passifs', '/boutique', '/depot', '/retrait'
                            ].includes(r.path)).map((item) => (
                                <Link
                                    key={item.path}
                                    to={item.path}
                                    onClick={() => setMobileMenuOpen(false)}
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
                        {/* COMPTE */}
                        <nav className="space-y-1">
                            <p className="text-xs text-neutral-500 px-3 mb-2">COMPTE</p>
                            {privateRoutes.filter(r => ['user', 'admin'].some(role => r.role && r.role.includes(role)) && [
                                '/mon-compte', '/mes-produits', '/mes-transactions', '/mes-sites'
                            ].includes(r.path)).map((item) => (
                                <Link
                                    key={item.path}
                                    to={item.path}
                                    onClick={() => setMobileMenuOpen(false)}
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
                        {/* ADMINISTRATION */}
                        {user.role === 'admin' && (
                            <>
                                <Separator />
                                <nav className="space-y-1">
                                    <p className="text-xs text-neutral-500 px-3 mb-2">ADMINISTRATION</p>
                                    {privateRoutes.filter(r => r.role && r.role.includes('admin') && [
                                        '/admin/dashboard', '/admin/utilisateurs', '/admin/produits', '/admin/categories'
                                    ].includes(r.path)).map((item) => (
                                        <Link
                                            key={item.path}
                                            to={item.path}
                                            onClick={() => setMobileMenuOpen(false)}
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
                        <Button
                            variant="ghost"
                            onClick={() => {
                                handleLogout();
                                setMobileMenuOpen(false);
                            }}
                            className="w-full justify-start text-neutral-600"
                        >
                            <Logout className="w-4 h-4 mr-2" />
                            Déconnexion
                        </Button>
                    </div>
                </div>
            )}
        </header>
    );
}

export default Header;
