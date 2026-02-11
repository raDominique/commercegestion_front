
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
import Category from '@mui/icons-material/Category';

import Home from '../pages/Home/Home.jsx';
import Login from '../pages/Login/Login.jsx';
import Register from '../pages/Register/Register.jsx';
import Depot from '../pages/Depot/Depot.jsx';
import Retrait from '../pages/Retrait/Retrait.jsx';
import Boutique from '../pages/Boutique/Boutique.jsx';
import Actifs from '../pages/Actifs/Actifs.jsx';
import Passifs from '../pages/Passifs/Passifs.jsx';
import Administration from '../pages/Administration/Administration.jsx';
import AdminDashboard from '../pages/Administration/AdminDashboard.jsx';
import AdminUsers from '../pages/Administration/AdminUsers.jsx';
import AdminProducts from '../pages/Administration/AdminProducts.jsx';
import AdminCategories from '../pages/Administration/AdminCategories.jsx';
import MonCompte from '../pages/MonCompte/MonCompte.jsx';
import MesProduits from '../pages/MesProduits/MesProduits.jsx';
import MesTransactions from '../pages/MesTransactions/MesTransactions.jsx';
import MesSites from '../pages/MesSites/MesSites.jsx';

export const publicRoutes = [
    { path: '/login', element: Login },
    { path: '/register', element: Register },
];

export const privateRoutes = [
    { path: '/actifs', element: Actifs, role: 'user, admin', icon: TrendingUp },
    { path: '/passifs', element: Passifs, role: 'user, admin', icon: TrendingDown },
    { path: '/boutique', element: Boutique, role: 'user, admin', icon: Store },
    { path: '/depot', element: Depot, role: 'user, admin', icon: CreditCard },
    { path: '/retrait', element: Retrait, role: 'user, admin', icon: AccountBalanceWallet },
    { path: '/mon-compte', element: MonCompte, role: 'user, admin', icon: Person },
    { path: '/mes-produits', element: MesProduits, role: 'user, admin', icon: Inventory },
    { path: '/mes-transactions', element: MesTransactions, role: 'user, admin', icon: ReceiptLong },
    { path: '/mes-sites', element: MesSites, role: 'user, admin', icon: Public },
    { path: '/administration', element: Administration, role: 'admin' },
    { path: '/admin/dashboard', element: AdminDashboard, role: 'admin', icon: Dashboard },
    { path: '/admin/utilisateurs', element: AdminUsers, role: 'admin', icon: Group },
    { path: '/admin/produits', element: AdminProducts, role: 'admin', icon: Inventory },
    { path: '/admin/categories', element: AdminCategories, role: 'admin', icon: Category },
    // Settings icon for categories
];
