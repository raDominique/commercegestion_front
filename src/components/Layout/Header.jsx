import { Link } from 'react-router-dom';
import { Button } from '../ui/button';
import { Separator } from '../ui/separator';
import {
    Dialog,
    DialogTrigger,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter,
    DialogClose,
} from '../ui/dialog';
import { Logout, Menu, Close, AccountBalanceWallet, ShoppingCart, Notifications as BellIcon } from '@mui/icons-material';
import { Popover, PopoverTrigger, PopoverContent } from '../ui/popover';
import { privateRoutes } from '../../routes/routes';
import LogoImage from '../../assets/logo/logo.png';
// import { CartSheet } from '../commons/CartSheet';
// import { useCart } from '../../context/CartContext';
import { useEffect, useState, useRef } from 'react';
import { initSocket, onSocketEvent, offSocketEvent, disconnectSocket } from '../../services/socket.service';
import { getProfile } from '../../services/auth.service';
import { getFullMediaUrl } from '../../services/media.service';
import { toast } from 'sonner';


function Header({ mobileMenuOpen, setMobileMenuOpen, handleLogout, isActive }) {
    // Notifications temps réel via socket
    const [notifications, setNotifications] = useState([]);
    const [profile, setProfile] = useState(null);
    const socketInitialized = useRef(false);

    useEffect(() => {
        let mounted = true;
        getProfile()
            .then((data) => { if (mounted) setProfile(data); })
            .catch(() => { if (mounted) setProfile(null); });
        return () => { mounted = false; };
    }, []);

    // Connexion socket.io et écoute des notifications
    useEffect(() => {
        if (!profile || socketInitialized.current) return;
        // Remplacez l'URL par celle de votre backend
        const socketUrl = import.meta.env.VITE_API_BASE_URL?.replace(/^http/, 'ws');
        if (!socketUrl || !profile._id || !profile.userAccess) return;
        initSocket(socketUrl, { userId: profile._id, userAccess: profile.userAccess });
        socketInitialized.current = true;

        // Notifications personnelles
        const notifHandler = (data) => {
            setNotifications((prev) => [
                { id: Date.now(), message: data.message, date: new Date().toLocaleDateString() },
                ...prev
            ]);
        };
        // Alertes admin globales
        const adminHandler = (data) => {
            setNotifications((prev) => [
                { id: Date.now(), message: data.message, date: new Date().toLocaleDateString() },
                ...prev
            ]);
        };
        onSocketEvent(`notification`, notifHandler);
        if (profile.userAccess === 'Admin') {
            onSocketEvent('admin_event', adminHandler);
        }
        return () => {
            offSocketEvent('notification', notifHandler);
            if (profile.userAccess === 'Admin') {
                offSocketEvent('admin_event', adminHandler);
            }
            disconnectSocket();
            socketInitialized.current = false;
        };
    }, [profile]);

    // Modal state for logout confirmation
    const [logoutDialogOpen, setLogoutDialogOpen] = useState(false);
    // const [cartOpen, setCartOpen] = useState(false);
    const user = profile;
    // const { items } = useCart ? useCart() : { items: [] };
    return (
        <header className="sticky top-0 z-50 bg-white border-b border-neutral-200">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center h-16">
                    <div className="flex items-center gap-8">
                        <Link to="/" className="flex items-center gap-2">
                            <img src={LogoImage} alt="Logo" className="h-8 w-auto" />
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
                                {/* Solde */}
                                <div className="flex items-center gap-2 px-3 py-2 bg-neutral-100 rounded-lg">
                                    <AccountBalanceWallet className="w-4 h-4 text-neutral-600" />
                                    <span className="text-sm text-neutral-900">
                                        {typeof user.userTotalSolde === 'number' ? user.userTotalSolde.toLocaleString('fr-MG') : '0'} Ariary
                                    </span>
                                </div>
                                {/* Notifications Dropdown */}
                                <Popover>
                                    <PopoverTrigger asChild>
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            className="relative text-neutral-600"
                                            aria-label="Notifications"
                                        >
                                            <BellIcon className="w-5 h-5" />
                                            {notifications.length > 0 && (
                                                <span className="absolute -top-1 -right-1 bg-red-600 text-white text-xs rounded-full px-1.5 py-0.5">
                                                    {notifications.length}
                                                </span>
                                            )}
                                        </Button>
                                    </PopoverTrigger>
                                    <PopoverContent align="end" className="w-72 p-0 bg-white rounded-xl shadow-xl border border-neutral-100">
                                        <div className="px-4 py-3 border-b border-neutral-100 font-semibold text-neutral-800 text-base rounded-t-xl">Notifications</div>
                                        <div className="divide-y divide-neutral-200 max-h-60 overflow-y-auto">
                                            {notifications.length === 0 ? (
                                                <div className="py-4 text-center text-neutral-500">Aucune notification</div>
                                            ) : notifications.map((notif) => (
                                                <div key={notif.id} className="py-3 px-4 flex flex-col gap-1 hover:bg-violet-50 cursor-pointer transition rounded-lg">
                                                    <span className="text-sm text-neutral-800">{notif.message}</span>
                                                    <span className="text-xs text-neutral-400">{notif.date}</span>
                                                </div>
                                            ))}
                                        </div>
                                    </PopoverContent>
                                </Popover>
                                {/* Panier 
                                <button
                                    className="relative flex items-center justify-center p-2 hover:bg-violet-50 rounded-lg transition-colors"
                                    onClick={() => setCartOpen(true)}
                                    aria-label="Ouvrir le panier"
                                >
                                    <ShoppingCart className="w-6 h-6 text-violet-600" />
                                    {items && items.length > 0 && (
                                        <span className="absolute -top-1 -right-1 bg-violet-600 text-white text-xs rounded-full px-1.5 py-0.5">
                                            {items.length}
                                        </span>
                                    )}
                                </button>
                                <CartSheet open={cartOpen} onOpenChange={setCartOpen} />
                                */}
                                {/* Profil */}
                                <div className="flex items-center gap-2">
                                    {user.userType === 'Entreprise' && user.logo ? (
                                        <img
                                            src={getFullMediaUrl(user.logo)}
                                            alt="Logo entreprise"
                                            className="w-8 h-8 rounded-full object-cover bg-neutral-200"
                                        />
                                    ) : user.userType === 'Particulier' && user.userImage ? (
                                        <img
                                            src={getFullMediaUrl(user.userImage)}
                                            alt="Avatar utilisateur"
                                            className="w-8 h-8 rounded-full object-cover bg-neutral-200"
                                        />
                                    ) : (
                                        <div className="w-8 h-8 bg-violet-600 rounded-full flex items-center justify-center">
                                            <span className="text-xs text-white">
                                                {typeof user.userName === 'string' && user.userName.length > 0 ? user.userName.charAt(0).toUpperCase() : '?'}
                                            </span>
                                        </div>
                                    )}
                                    <span className="text-sm text-neutral-700">{typeof user.userName === 'string' ? user.userName : 'Utilisateur'}</span>
                                </div>
                                {/* Déconnexion */}
                                <Dialog open={logoutDialogOpen} onOpenChange={setLogoutDialogOpen}>
                                    <DialogTrigger asChild>
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => setLogoutDialogOpen(true)}
                                            className="text-neutral-600"
                                        >
                                            <Logout className="w-4 h-4" />
                                        </Button>
                                    </DialogTrigger>
                                    <DialogContent>
                                        <DialogHeader>
                                            <DialogTitle>Confirmer la déconnexion</DialogTitle>
                                            <DialogDescription>
                                                Êtes-vous sûr de vouloir vous déconnecter&nbsp;?
                                            </DialogDescription>
                                        </DialogHeader>
                                        <DialogFooter>
                                            <DialogClose asChild>
                                                <Button variant="outline" onClick={() => setLogoutDialogOpen(false)}>
                                                    Annuler
                                                </Button>
                                            </DialogClose>
                                            <Button
                                                variant="destructive"
                                                className="bg-red-600 hover:bg-red-700 text-white font-semibold"
                                                onClick={() => {
                                                    setLogoutDialogOpen(false);
                                                    handleLogout();
                                                    toast.success('Déconnecté avec succès');
                                                }}
                                            >
                                                Se déconnecter
                                            </Button>
                                        </DialogFooter>
                                    </DialogContent>
                                </Dialog>
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
                                {typeof user.balance === 'number' ? user.balance.toLocaleString() : '0'} Ariary
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
                        {user.userAccess === 'Admin' && (
                            <>
                                <Separator />
                                <nav className="space-y-1">
                                    <p className="text-xs text-neutral-500 px-3 mb-2">ADMINISTRATION</p>
                                    {privateRoutes.filter(r => r.role && r.role.includes('admin') && [
                                        '/admin/dashboard', '/admin/produits', '/admin/utilisateurs', '/admin/categories'
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
                        <Dialog open={logoutDialogOpen} onOpenChange={setLogoutDialogOpen}>
                            <DialogTrigger asChild>
                                <Button
                                    variant="ghost"
                                    onClick={() => setLogoutDialogOpen(true)}
                                    className="w-full justify-start text-neutral-600"
                                >
                                    <Logout className="w-4 h-4 mr-2" />
                                    Déconnexion
                                </Button>
                            </DialogTrigger>
                            <DialogContent>
                                <DialogHeader>
                                    <DialogTitle>Confirmer la déconnexion</DialogTitle>
                                    <DialogDescription>
                                        Êtes-vous sûr de vouloir vous déconnecter&nbsp;?
                                    </DialogDescription>
                                </DialogHeader>
                                <DialogFooter>
                                    <DialogClose asChild>
                                        <Button variant="outline" onClick={() => setLogoutDialogOpen(false)}>
                                            Annuler
                                        </Button>
                                    </DialogClose>
                                    <Button
                                        variant="destructive"
                                        className="bg-red-600 hover:bg-red-700 text-white font-semibold"
                                        onClick={() => {
                                            setLogoutDialogOpen(false);
                                            handleLogout();
                                            setMobileMenuOpen(false);
                                            toast.success('Déconnecté avec succès');
                                        }}
                                    >
                                        Se déconnecter
                                    </Button>
                                </DialogFooter>
                            </DialogContent>
                        </Dialog>
                    </div>
                </div>
            )}
        </header>
    );
}

export default Header;