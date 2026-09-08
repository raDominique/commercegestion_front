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
import { useState } from 'react';
import { useNotificationsContext } from '../../context/NotificationsContext';
import { formatNotifCount } from '../../utils/notificationTarget';
import { getFullMediaUrl } from '../../services/media.service';
import { toast } from 'sonner';
import { Sheet, SheetContent, SheetHeader } from '../ui/sheet';
import { Loader } from '../ui/loader';

function UnreadDot() {
    return <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-violet-600" aria-label="Non lue" />;
}

function NotificationItem({ notif, formatRelative, onOpen }) {
    return (
        <button
            type="button"
            onClick={() => onOpen(notif)}
            className={`w-full py-3 px-4 flex gap-2.5 text-left hover:bg-violet-50 cursor-pointer transition rounded-lg ${notif.isRead ? '' : 'bg-violet-50/50'}`}
        >
            {!notif.isRead && <UnreadDot />}
            <span className="min-w-0 flex-1">
                {notif.title && (
                    <span className="block truncate text-sm font-semibold text-neutral-900">{notif.title}</span>
                )}
                <span className="mt-0.5 block text-sm leading-snug text-neutral-600 line-clamp-2">{notif.message}</span>
                <span className="mt-1 block text-xs text-neutral-400">{formatRelative(notif.createdAt)}</span>
            </span>
        </button>
    );
}

function NotificationBell({ notifications, unreadCount, loadingHistory, markAllRead, formatRelative, onOpen, align = 'end' }) {
    const [open, setOpen] = useState(false);
    const handleOpen = (notif) => {
        onOpen(notif);
        setOpen(false);
    };
    return (
        <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
                <Button
                    variant="ghost"
                    size="sm"
                    className="relative text-neutral-600"
                    aria-label="Notifications"
                >
                    <BellIcon className="w-5 h-5" />
                    {unreadCount > 0 && (
                        <span className="absolute -top-1 -right-1 bg-red-600 text-white text-xs rounded-full px-1.5 py-0.5">
                            {formatNotifCount(unreadCount)}
                        </span>
                    )}
                </Button>
            </PopoverTrigger>
            <PopoverContent align={align} className="w-80 p-0 bg-white rounded-xl shadow-xl border border-neutral-100">
                <div className="px-4 py-3 border-b border-neutral-100 flex items-center justify-between rounded-t-xl">
                    <span className="font-semibold text-neutral-800 text-base">Notifications</span>
                    {unreadCount > 0 && (
                        <button
                            type="button"
                            onClick={markAllRead}
                            className="text-xs font-semibold text-violet-600 hover:text-violet-700 hover:underline"
                        >
                            Tout marquer lu
                        </button>
                    )}
                </div>
                <div className="divide-y divide-neutral-200 max-h-80 overflow-y-auto">
                    {loadingHistory ? (
                        <div className="py-4 text-center text-neutral-500">Chargement…</div>
                    ) : notifications.length === 0 ? (
                        <div className="py-4 text-center text-neutral-500">Aucune notification</div>
                    ) : notifications.map((notif) => (
                        <NotificationItem key={notif._id} notif={notif} formatRelative={formatRelative} onOpen={handleOpen} />
                    ))}
                </div>
            </PopoverContent>
        </Popover>
    );
}

function Header({ mobileMenuOpen, setMobileMenuOpen, handleLogout, isActive, isDesktop }) {
    const { profile, notifications, unreadCount, unreadByRoute, loadingHistory, markAllRead, openNotification, formatRelative } = useNotificationsContext();
    const { getTotalItems } = useCart();
    const [logoutDialogOpen, setLogoutDialogOpen] = useState(false);
    const [logoutLoading, setLogoutLoading] = useState(false);

    const user = profile;
    const navigate = useNavigate();
    const badgeFor = (path) => unreadByRoute[path] || 0;

    const handleOpenNotification = (notif) => {
        const target = openNotification(notif);
        if (target) navigate(target.path);
    };

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

    const MobileNavLink = ({ item }) => {
        const count = badgeFor(item.path);
        return (
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
                <span className="flex-1">{item.label || item.path.replace('/', '').replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())}</span>
                {count > 0 && (
                    <span className="min-w-5 h-5 px-1.5 flex items-center justify-center rounded-full bg-violet-600 text-white text-[11px] font-bold">
                        {formatNotifCount(count)}
                    </span>
                )}
            </Link>
        );
    };

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

    const recentMobile = notifications.slice(0, 8);

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
                            {/* ===== MOBILE TOP BAR : cloche + menu ===== */}
                            {!isDesktop && (
                                <div className="flex items-center gap-1">
                                    <NotificationBell
                                        notifications={notifications}
                                        unreadCount={unreadCount}
                                        loadingHistory={loadingHistory}
                                        markAllRead={markAllRead}
                                        formatRelative={formatRelative}
                                        onOpen={handleOpenNotification}
                                        align="end"
                                    />
                                    <button
                                        className="p-2 rounded-lg hover:bg-neutral-100 transition-colors"
                                        onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                                        aria-label="Menu"
                                    >
                                        {mobileMenuOpen ? <Close className="w-6 h-6 text-neutral-700" /> : <Menu className="w-6 h-6 text-neutral-700" />}
                                    </button>
                                </div>
                            )}

                            {/* ===== DESKTOP TOP BAR ===== */}
                            {isDesktop && (
                            <div className="flex items-center gap-2">
                                <NotificationBell
                                    notifications={notifications}
                                    unreadCount={unreadCount}
                                    loadingHistory={loadingHistory}
                                    markAllRead={markAllRead}
                                    formatRelative={formatRelative}
                                    onOpen={handleOpenNotification}
                                    align="end"
                                />

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
                            {/* NOTIFICATIONS récentes */}
                            <nav className="space-y-0.5">
                                <div className="flex items-center justify-between px-3 mb-1.5">
                                    <p className="text-[10px] font-semibold text-neutral-400 uppercase tracking-wider">Notifications</p>
                                    {unreadCount > 0 && (
                                        <button
                                            type="button"
                                            onClick={markAllRead}
                                            className="text-[11px] font-semibold text-violet-600 hover:text-violet-700 hover:underline"
                                        >
                                            Tout marquer lu
                                        </button>
                                    )}
                                </div>
                                {recentMobile.length === 0 ? (
                                    <p className="px-3 py-2 text-xs text-neutral-400">Aucune notification</p>
                                ) : recentMobile.map((notif) => (
                                    <button
                                        key={notif._id}
                                        type="button"
                                        onClick={() => { setMobileMenuOpen(false); handleOpenNotification(notif); }}
                                        className={`w-full flex gap-2.5 px-3 py-2.5 rounded-lg text-left transition-colors ${
                                            notif.isRead ? 'text-neutral-600 hover:bg-neutral-50' : 'bg-violet-50 text-neutral-800 hover:bg-violet-100'
                                        }`}
                                    >
                                        {!notif.isRead && <UnreadDot />}
                                        <span className="min-w-0 flex-1">
                                            {notif.title && <span className="block truncate text-[13px] font-semibold">{notif.title}</span>}
                                            <span className="block text-xs leading-snug line-clamp-2">{notif.message}</span>
                                            <span className="mt-0.5 block text-[11px] text-neutral-400">{formatRelative(notif.createdAt)}</span>
                                        </span>
                                    </button>
                                ))}
                            </nav>

                            <Separator className="bg-neutral-100" />

                            {/* NAVIGATION */}
                            <nav className="space-y-0.5">
                                <p className="text-[10px] font-semibold text-neutral-400 px-3 mb-1.5 uppercase tracking-wider">Navigation</p>
                                {dashboardItem.map((item) => (
                                    <MobileNavLink key={item.path} item={item} />
                                ))}
                                {userNavItems.map((item) => (
                                    <MobileNavLink key={item.path} item={item} />
                                ))}
                            </nav>

                            <Separator className="bg-neutral-100" />

                            {/* COMPTE */}
                            <nav className="space-y-0.5">
                                <p className="text-[10px] font-semibold text-neutral-400 px-3 mb-1.5 uppercase tracking-wider">Compte</p>
                                {accountNavItems.map((item) => (
                                    <MobileNavLink key={item.path} item={item} />
                                ))}
                            </nav>

                            {/* ADMIN */}
                            {user?.userAccess === 'Admin' && (
                                <>
                                    <Separator className="bg-neutral-100" />
                                    <nav className="space-y-0.5">
                                        <p className="text-[10px] font-semibold text-neutral-400 px-3 mb-1.5 uppercase tracking-wider">Administration</p>
                                        {adminNavItems.map((item) => (
                                            <MobileNavLink key={item.path} item={item} />
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
