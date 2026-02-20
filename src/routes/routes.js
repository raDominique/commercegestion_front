
// Material Icons
import TrendingUp from '@mui/icons-material/TrendingUp';
import TrendingDown from '@mui/icons-material/TrendingDown';
import Store from '@mui/icons-material/Store';
import CreditCard from '@mui/icons-material/CreditCard';
import AccountBalanceWallet from '@mui/icons-material/AccountBalanceWallet';
import Person from '@mui/icons-material/Person';
import Inventory from '@mui/icons-material/Inventory';
import ReceiptLong from '@mui/icons-material/ReceiptLong';
import Public from '@mui/icons-material/Public';
import Dashboard from '@mui/icons-material/Dashboard';
import Group from '@mui/icons-material/Group';
// import Category from '@mui/icons-material/Category';
import ShoppingBag from '@mui/icons-material/ShoppingBag';
import QrCodeIcon from '@mui/icons-material/QrCode';

import Login from '../pages/Login/Login.jsx';
import Register from '../pages/Register/Register.jsx';
import Depot from '../pages/Depot/Depot.jsx';
import Retrait from '../pages/Retrait/Retrait.jsx';
import Boutique from '../pages/Boutique/Boutique.jsx';
import Actifs from '../pages/Actifs/Actifs.jsx';
import Passifs from '../pages/Passifs/Passifs.jsx';
import Panier from '../pages/Panier/Panier.jsx';
import AdminDashboard from '../pages/Administration/AdminDashboard.jsx';
import AdminUsers from '../pages/Administration/AdminUsers.jsx';
import AdminProducts from '../pages/Administration/AdminProducts.jsx';
// import AdminCategories from '../pages/Administration/AdminCategories.jsx';
import AdminCpc from '../pages/Administration/AdminCpc.jsx';
import MonCompte from '../pages/MonCompte/MonCompte.jsx';
import MesProduits from '../pages/MesProduits/MesProduits.jsx';
import MesTransactions from '../pages/MesTransactions/MesTransactions.jsx';
import MesSites from '../pages/MesSites/MesSites.jsx';

export const publicRoutes = [
    { path: '/login', element: Login },
    { path: '/register', element: Register },
];

export const privateRoutes = [
    // Routes accessibles à Utilisateur et Moderateur et Admin
    { path: '/actifs', element: Actifs, role: 'Utilisateur,Admin', icon: TrendingUp },
    { path: '/passifs', element: Passifs, role: 'Utilisateur,Admin', icon: TrendingDown },
    { path: '/boutique', element: Boutique, role: 'Utilisateur,Admin', icon: Store },
    { path: '/depot', element: Depot, role: 'Utilisateur,Admin', icon: CreditCard },
    { path: '/retrait', element: Retrait, role: 'Utilisateur,Admin', icon: AccountBalanceWallet },
    { path: '/panier', element: Panier, role: 'Utilisateur,Admin', icon: ShoppingBag },
    { path: '/mon-compte', element: MonCompte, role: 'Utilisateur,Admin', icon: Person },
    { path: '/mes-produits', element: MesProduits, role: 'Utilisateur,Admin', icon: Inventory },
    { path: '/mes-transactions', element: MesTransactions, role: 'Utilisateur,Admin', icon: ReceiptLong },
    { path: '/mes-sites', element: MesSites, role: 'Utilisateur,Admin', icon: Public },
    // Routes strictement admin
    { path: '/admin/dashboard', element: AdminDashboard, role: 'Admin', icon: Dashboard, label: 'Tableau de bord' },
    { path: '/admin/utilisateurs', element: AdminUsers, role: 'Admin', icon: Group, label: 'Utilisateurs' },
    { path: '/admin/produits', element: AdminProducts, role: 'Admin', icon: Inventory, label: 'Produits' },
    // { path: '/admin/categories', element: AdminCategories, role: 'Admin', icon: Category, label: 'Catégories' },
    { path: '/admin/cpc', element: AdminCpc, role: 'Admin', icon: QrCodeIcon, label: 'CPC' },
    // Settings icon for categories
];
