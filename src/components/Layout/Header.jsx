import { Link, useNavigate } from 'react-router-dom';
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
import { Logout, Menu, Close, ShoppingCart, Notifications as BellIcon } from '@mui/icons-material';
import { Popover, PopoverTrigger, PopoverContent } from '../ui/popover';
import { privateRoutes } from '../../routes/routes';
import { useCart } from '../../context/CartContext';
import LogoImage from '../../assets/logo/logo.png';
import { useEffect, useState, useRef } from 'react';
import { initSocket, onSocketEvent, offSocketEvent, disconnectSocket } from '../../services/socket.service';
import { getProfile } from '../../services/auth.service';
import { getFullMediaUrl } from '../../services/media.service';
import { toast } from 'sonner';
import { Sheet, SheetContent, SheetHeader } from '../ui/sheet';
import { Loader } from '../ui/loader';

function Header({ mobileMenuOpen, setMobileMenuOpen, handleLogout, isActive, isDesktop }) {
    const [notifications, setNotifications] = useState([]);
    const [profile, setProfile] = useState(null);
    const { getTotalItems } = useCart();
    const socketInitialized = useRef(false);
    const [logoutDialogOpen, setLogoutDialogOpen] = useState(false);
    const [logoutLoading, setLogoutLoading] = useState(false);

    useEffect(() => {
        let mounted = true;
        getProfile()
            .then((data) => { if (mounted) setProfile(data); })
            .catch(() => { if (mounted) setProfile(null); });
        return () => { mounted = false; };
    }, []);

    useEffect(() => {
        if (!profile || socketInitialized.current) return;
        const socketUrl = import.meta.env.VITE_API_BASE_URL?.replace(/^http/, 'ws');
        if (!socketUrl || !profile._id || !profile.userAccess) return;
        initSocket(socketUrl, { userId: profile._id, userAccess: profile.userAccess });
        socketInitialized.current = true;

        const notifHandler = (data) => {
            setNotifications((prev) => [
                { id: Date.now(), message: data.message, date: new Date().toLocaleDateString() },
                ...prev,
            ]);
        };
        const adminHandler = (data) => {
            setNotifications((prev) => [
                { id: Date.now(), message: data.message, date: new Date().toLocaleDateString() },
                ...prev,
            ]);
        };

        onSocketEvent('notification', notifHandler);
        if (profile.userAccess === 'Admin') onSocketEvent('admin_event', adminHandler);

        return () => {
            offSocketEvent('notification', notifHandler);
            if (profile.userAccess === 'Admin') offSocketEvent('admin_event', adminHandler);
            disconnectSocket();
            socketInitialized.current = false;
        };
    }, [profile]);

    const user = profile;
    const navigate = useNavigate();

    // Build nav lists
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

    // User avatar component (reused in header and sheet)
    const UserAvatar = ({ size = 'sm' }) => {
        const sizeClass = size === 'sm' ? 'w-8 h-8' : 'w-12 h-12';
        const textSize = size === 'sm' ? 'text-xs' : 'text-sm';
        if (user?.userType === 'Entreprise' && user.logo) {
            return <img src={getFullMediaUrl(user.logo)} alt="Logo entreprise" className={`${sizeClass} rounded-full object-cover bg-neutral-200`} />;
        }
        if (user?.userType === 'Particulier' && user.userImage) {
            return <img src={getFullMediaUrl(user.userImage)} alt="Avatar utilisateur" className={`${sizeClass} rounded-full object-cover bg-neutral-200`} />;
        }
        return (
            <div className={`${sizeClass} bg-violet-600 rounded-full flex items-center justify-center`}>
                <span className={`${textSize} text-white`}>
                    {typeof user?.userName === 'string' && user.userName.length > 0 ? user.userName.charAt(0).toUpperCase() : '?'}
                </span>
            </div>
        );
    };

    return (
        <header className="sticky top-0 z-50 bg-white border-b border-neutral-200">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center h-14 sm:h-16">
                    {/* Logo */}
                    <Link to="/" className="flex items-center gap-2 shrink-0">
                        <img src={LogoImage} alt="Logo" className="h-7 sm:h-8 w-auto" />
                    </Link>

                    {user && (
                        <>
                            {/* ===== MOBILE TOP BAR ===== */}
                            {!isDesktop && (
                                <button
                                    className="p-2 rounded-lg hover:bg-neutral-100 transition-colors"
                                    onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                                    aria-label="Menu"
                                >
                                    {mobileMenuOpen ? <Close className="w-6 h-6 text-neutral-700" /> : <Menu className="w-6 h-6 text-neutral-700" />}
                                </button>
                            )}

                            {/* ===== DESKTOP TOP BAR ===== */}
                            {isDesktop && (
                            <div className="flex items-center gap-2">
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
                                                    {notifications.length > 99 ? '99+' : notifications.length}
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

                                <Link to="/panier" aria-label="Panier">
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        className="relative text-neutral-600"
                                    >
                                        <ShoppingCart className="w-5 h-5" />
                                        {getTotalItems() > 0 && (
                                            <span className="absolute -top-1 -right-1 bg-red-600 text-white text-xs rounded-full px-1.5 py-0.5">
                                                {getTotalItems()}
                                            </span>
                                        )}
                                    </Button>
                                </Link>

                                <div className="flex items-center gap-2 cursor-pointer hover:bg-neutral-50 rounded-lg px-2 py-1 transition-colors" onClick={() => navigate('/mon-compte')}>
                                    <UserAvatar size="sm" />
                                    <span className="text-sm text-neutral-700">{typeof user.userName === 'string' ? user.userName : 'Utilisateur'}</span>
                                </div>

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
                                                <Button variant="outline" status="inactive" onClick={() => setLogoutDialogOpen(false)}>
                                                    Annuler
                                                </Button>
                                            </DialogClose>
                                            <Button
                                                variant="destructive"
                                                status={logoutLoading ? "loading" : "active"}
                                                className="bg-red-600 hover:bg-red-700 text-white font-semibold"
                                                onClick={async () => {
                                                    setLogoutLoading(true);
                                                    try {
                                                        setLogoutDialogOpen(false);
                                                        await handleLogout();
                                                        toast.success('Déconnecté avec succès');
                                                    } catch (error) {
                                                        toast.error('Erreur lors de la déconnexion');
                                                    } finally {
                                                        setLogoutLoading(false);
                                                    }
                                                }}
                                            >
                                                {logoutLoading && <Loader size="sm" className="border-white border-t-transparent shrink-0" />}
                                                Se déconnecter
                                            </Button>
                                        </DialogFooter>
                                    </DialogContent>
                                </Dialog>
                            </div>
                            )}
                        </>
                    )}
                </div>
            </div>

            {/* ===== MOBILE SHEET (sidebar) ===== */}
            <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
                <SheetContent side="right" className="bg-white text-neutral-900 p-0 w-[min(85vw,320px)]">
                    {/* User profile card */}
                    <div className="px-5 pt-6 pb-4 bg-gradient-to-b from-violet-50 to-white border-b border-neutral-100">
                        <div className="flex items-center gap-3">
                            <UserAvatar size="lg" />
                            <div className="min-w-0">
                                <div className="font-semibold text-neutral-900 truncate">
                                    {user ? (typeof user.userName === 'string' ? user.userName : 'Utilisateur') : ''}
                                </div>
                                <div className="text-xs text-neutral-500 mt-0.5">{user?.userType || ''}</div>
                            </div>
                        </div>
                    </div>

                    {/* Scrollable navigation */}
                    <div className="flex-1 overflow-y-auto px-3 py-4">
                        <div className="space-y-5">
                            {/* NAVIGATION */}
                            <nav className="space-y-0.5">
                                <p className="text-[10px] font-semibold text-neutral-400 px-3 mb-1.5 uppercase tracking-wider">Navigation</p>
                                {dashboardItem.map((item) => (
                                    <Link
                                        key={item.path}
                                        to={item.path}
                                        onClick={() => setMobileMenuOpen(false)}
                                        className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors ${
                                            isActive(item.path)
                                                ? 'bg-violet-50 text-violet-600 font-medium'
                                                : 'text-neutral-600 hover:bg-neutral-50 active:bg-neutral-100'
                                        }`}
                                    >
                                        {item.icon ? <item.icon className="w-5 h-5 shrink-0" /> : <span className="material-icons text-lg">menu</span>}
                                        <span>{item.label || item.path.replace('/', '').replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())}</span>
                                    </Link>
                                ))}
                                {userNavItems.map((item) => (
                                    <Link
                                        key={item.path}
                                        to={item.path}
                                        onClick={() => setMobileMenuOpen(false)}
                                        className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors ${
                                            isActive(item.path)
                                                ? 'bg-violet-50 text-violet-600 font-medium'
                                                : 'text-neutral-600 hover:bg-neutral-50 active:bg-neutral-100'
                                        }`}
                                    >
                                        {item.icon ? <item.icon className="w-5 h-5 shrink-0" /> : <span className="material-icons text-lg">menu</span>}
                                        <span>{item.label || item.path.replace('/', '').replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())}</span>
                                    </Link>
                                ))}
                            </nav>

                            <Separator className="bg-neutral-100" />

                            {/* COMPTE */}
                            <nav className="space-y-0.5">
                                <p className="text-[10px] font-semibold text-neutral-400 px-3 mb-1.5 uppercase tracking-wider">Compte</p>
                                {accountNavItems.map((item) => (
                                    <Link
                                        key={item.path}
                                        to={item.path}
                                        onClick={() => setMobileMenuOpen(false)}
                                        className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors ${
                                            isActive(item.path)
                                                ? 'bg-violet-50 text-violet-600 font-medium'
                                                : 'text-neutral-600 hover:bg-neutral-50 active:bg-neutral-100'
                                        }`}
                                    >
                                        {item.icon ? <item.icon className="w-5 h-5 shrink-0" /> : <span className="material-icons text-lg">menu</span>}
                                        <span>{item.label || item.path.replace('/', '').replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())}</span>
                                    </Link>
                                ))}
                            </nav>

                            {/* ADMIN */}
                            {user?.userAccess === 'Admin' && (
                                <>
                                    <Separator className="bg-neutral-100" />
                                    <nav className="space-y-0.5">
                                        <p className="text-[10px] font-semibold text-neutral-400 px-3 mb-1.5 uppercase tracking-wider">Administration</p>
                                        {adminNavItems.map((item) => (
                                            <Link
                                                key={item.path}
                                                to={item.path}
                                                onClick={() => setMobileMenuOpen(false)}
                                                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors ${
                                                    isActive(item.path)
                                                        ? 'bg-violet-50 text-violet-600 font-medium'
                                                        : 'text-neutral-600 hover:bg-neutral-50 active:bg-neutral-100'
                                                }`}
                                            >
                                                {item.icon ? <item.icon className="w-5 h-5 shrink-0" /> : <span className="material-icons text-lg">menu</span>}
                                                <span>{item.label || item.path.replace('/', '').replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())}</span>
                                            </Link>
                                        ))}
                                    </nav>
                                </>
                            )}
                        </div>
                    </div>

                    {/* Logout button at bottom */}
                    <div className="px-3 pb-4 pt-2 border-t border-neutral-100">
                        <Button
                            variant="ghost"
                            onClick={() => setLogoutDialogOpen(true)}
                            className="w-full justify-start text-neutral-500 hover:text-red-600 hover:bg-red-50"
                        >
                            <Logout className="w-4 h-4 mr-3" />
                            <span className="text-sm">Déconnexion</span>
                        </Button>
                    </div>
                </SheetContent>
            </Sheet>
        </header>
    );
}

export default Header;
