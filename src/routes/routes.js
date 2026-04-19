
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
import FactCheck from '@mui/icons-material/FactCheck';
// import Category from '@mui/icons-material/Category';
import ShoppingBag from '@mui/icons-material/ShoppingBag';
import QrCodeIcon from '@mui/icons-material/QrCode';

import Login from '../pages/Login/Login.jsx';
import Register from '../pages/Register/Register.jsx';
import ForgotPassword from '../pages/ForgotPassword/ForgotPassword.jsx';
import ResetPassword from '../pages/ResetPassword/ResetPassword.jsx';
import DashboardPage from '../pages/Dashboard/Dashboard.jsx';
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
import Parrainages from '../pages/Parrainages/Parrainages.jsx';
import OperationsAValider from '../pages/OperationsAValider/OperationsAValider.jsx';

export const publicRoutes = [
    { path: '/login', element: Login },
    { path: '/register', element: Register },
    { path: '/forgot-password', element: ForgotPassword },
    { path: '/reset-password', element: ResetPassword },
];

export const privateRoutes = [
    // Route tableau de bord accessible à tous les utilisateurs
    { path: '/dashboard', element: DashboardPage, role: 'Utilisateur,Admin', userValidated: [true, false], icon: Dashboard, label: 'Tableau de bord' },
    // Routes accessibles à Utilisateur et Moderateur et Admin
    { path: '/actifs', element: Actifs, role: 'Utilisateur,Admin', userValidated: true, icon: TrendingUp },
    { path: '/passifs', element: Passifs, role: 'Utilisateur,Admin', userValidated: true, icon: TrendingDown },
    { path: '/boutique', element: Boutique, role: 'Utilisateur,Admin', userValidated: true, icon: Store },
    { path: '/depot', element: Depot, role: 'Utilisateur,Admin', userValidated: true, icon: CreditCard },
    { path: '/retrait', element: Retrait, role: 'Utilisateur,Admin', userValidated: true, icon: AccountBalanceWallet },
    { path: '/panier', element: Panier, role: 'Utilisateur,Admin', userValidated: true, icon: ShoppingBag },
    { path: '/mon-compte', element: MonCompte, role: 'Utilisateur,Admin', userValidated: [true, false], icon: Person },
    { path: '/mes-produits', element: MesProduits, role: 'Utilisateur,Admin', userValidated: true, icon: Inventory },
    { path: '/mes-transactions', element: MesTransactions, role: 'Utilisateur,Admin', userValidated: true, icon: ReceiptLong },
    { path: '/operations-a-valider', element: OperationsAValider, role: 'Utilisateur,Admin', userValidated: true, icon: FactCheck, label: 'Opérations à valider' },
    { path: '/mes-sites', element: MesSites, role: 'Utilisateur,Admin', userValidated: true, icon: Public },
    { path: '/parrainages', element: Parrainages, role: 'Utilisateur,Admin', userValidated: true, icon: Group },
    // Routes strictement admin
    { path: '/admin/dashboard', element: AdminDashboard, role: 'Admin', icon: Dashboard, label: 'Tableau de bord' },
    { path: '/admin/produits', element: AdminProducts, role: 'Admin', icon: Inventory, label: 'Produits' },
    { path: '/admin/cpc', element: AdminCpc, role: 'Admin', icon: QrCodeIcon, label: 'CPC' },
    { path: '/admin/utilisateurs', element: AdminUsers, role: 'Admin', icon: Group, label: 'Utilisateurs' },
    // { path: '/admin/categories', element: AdminCategories, role: 'Admin', icon: Category, label: 'Catégories' },
];
