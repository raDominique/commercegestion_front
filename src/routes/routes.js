// src/routes/routes.js

import Home from '../pages/Home/Home.jsx';
import Login from '../pages/Login/Login.jsx';
import Register from '../pages/Register/Register.jsx';
import Depot from '../pages/Depot/Depot.jsx';
import Retrait from '../pages/Retrait/Retrait.jsx';
import Boutique from '../pages/Boutique/Boutique.jsx';
import Actifs from '../pages/Actifs/Actifs.jsx';
import Passifs from '../pages/Passifs/Passifs.jsx';
import Administration from '../pages/Administration/Administration.jsx';

export const publicRoutes = [
    { path: '/', element: Home },
    { path: '/login', element: Login },
    { path: '/register', element: Register },
];

export const privateRoutes = [
    { path: '/actifs', element: Actifs, role: 'user, admin' },
    { path: '/passifs', element: Passifs, role: 'user, admin' },
    { path: '/boutique', element: Boutique, role: 'user, admin' },
    { path: '/depot', element: Depot, role: 'user, admin' },
    { path: '/retrait', element: Retrait, role: 'user, admin' },
    { path: '/administration', element: Administration, role: 'admin' },
];
