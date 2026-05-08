import { useState, useEffect } from 'react';
import { Card } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from '../../components/ui/select';
import { Badge } from '../../components/ui/badge';
import { Switch } from '../../components/ui/switch';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '../../components/ui/table';
import useScreenType from '../../utils/useScreenType';
import formatBirthDate from '../../utils/formatBirthDate';
import useDateFormat from '../../utils/useDateFormat';
import SearchIcon from '@mui/icons-material/Search';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import InfoIcon from '@mui/icons-material/Info';
import DeleteIcon from '@mui/icons-material/Delete';
import ShieldOutlinedIcon from '@mui/icons-material/ShieldOutlined';
import PersonIcon from '@mui/icons-material/Person';
import { toast } from 'sonner';
import { getUsers, deleteUser, toggleUserRole, activateUser, getUserById } from '../../services/user.service';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogClose, DialogDescription } from '../../components/ui/dialog';
import { getFullMediaUrl } from '../../services/media.service';
import PaginationControls from '../../components/commons/PaginationControls.jsx';

export default function AdminUsers() {
    const [searchTerm, setSearchTerm] = useState('');
    const dateFormat = useDateFormat();
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(false);
    const [page, setPage] = useState(1);
    const [limit, setLimit] = useState(10);
    const [total, setTotal] = useState(0);
    const [totalUserActif, setTotalUserActif] = useState(0);
    const [totalAdmin, setTotalAdmin] = useState(0);
    // Filtres avancés
    const [isVerified, setIsVerified] = useState('');
    const [isActive, setIsActive] = useState('');
    const [userType, setUserType] = useState('');

    // Mappe les données API vers le format attendu par le tableau
    const mapApiUser = (apiUser) => ({
        id: apiUser._id,
        name: apiUser.userName + (apiUser.userFirstname ? ' ' + apiUser.userFirstname : ''),
        email: apiUser.userEmail,
        role: apiUser.userAccess && apiUser.userAccess.toLowerCase() === 'admin' ? 'admin' : 'user',
        status: apiUser.deletedAt ? 'Suspendu' : (apiUser.userValidated ? 'Actif' : 'Non validé'),
        createdAt: apiUser.createdAt,
        updatedAt: apiUser.updatedAt,
        emailVerified: apiUser.userEmailVerified,
        raw: apiUser,
        referralCode: apiUser.userId, // code de parrainage / identifiant court
    });

    // Récupère les utilisateurs depuis l'API
    const fetchUsers = async () => {
        setLoading(true);
        try {
            const params = {
                search: searchTerm || undefined,
                limit,
                page,
                isVerified: isVerified === '' ? undefined : isVerified === 'true',
                isActive: isActive === '' ? undefined : isActive === 'true',
                userType: userType || undefined,
            };
            const res = await getUsers(params);
            setUsers(Array.isArray(res.data) ? res.data.map(mapApiUser) : []);
            setTotal(res.total || 0);
            setTotalUserActif(typeof res.totalUserActif !== 'undefined' ? res.totalUserActif : 0);
            setTotalAdmin(typeof res.totalAdmin !== 'undefined' ? res.totalAdmin : 0);
        } catch (err) {
            toast.error('Erreur lors du chargement des utilisateurs');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchUsers();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [searchTerm, page, limit, isVerified, isActive, userType]);

    // Les filtres sont maintenant côté API, donc on affiche users directement
    const filteredUsers = users;

    // Gestion modals
    const [modalUserId, setModalUserId] = useState(null);
    const [modalAction, setModalAction] = useState(null); // 'delete' | 'role' | 'activate'
    const [modalOpen, setModalOpen] = useState(false);
    const [actionLoading, setActionLoading] = useState(false);

    // Token à récupérer selon votre logique d'auth (ex: localStorage)
    const token = localStorage.getItem('token');

    // API actions
    const handleDeleteUser = async (id) => {
        setActionLoading(true);
        try {
            await deleteUser(id, token);
            toast.success('Utilisateur supprimé');
            fetchUsers();
        } catch (err) {
            toast.error("Erreur lors de la suppression");
            console.log("Erreur de suppression:", err);
        } finally {
            setActionLoading(false);
            setModalOpen(false);
        }
    };

    const handleToggleRole = async (id) => {
        setActionLoading(true);
        try {
            await toggleUserRole(id, token);
            toast.success('Rôle mis à jour');
            fetchUsers();
        } catch (err) {
            toast.error("Erreur lors du changement de rôle");
            console.log("Erreur de changement de rôle:", err);
        } finally {
            setActionLoading(false);
            setModalOpen(false);
        }
    };

    const handleActivateUser = async (id) => {
        setActionLoading(true);
        try {
            await activateUser(id);
            toast.success('Utilisateur activé');
            fetchUsers();
        } catch (err) {
            toast.error("Erreur lors de l'activation");
            console.log("Erreur d'activation:", err);
        } finally {
            setActionLoading(false);
            setModalOpen(false);
        }
    };

    const handleShowUserDetail = async (userId) => {
        setDetailLoading(true);
        setDetailOpen(true);
        try {
            const res = await getUserById(userId);
            const user = Array.isArray(res.data) ? res.data[0] : res.data;
            setDetailUser(user);
        } catch (err) {
            setDetailUser(null);
            toast.error('Erreur lors de la récupération du détail utilisateur');
        } finally {
            setDetailLoading(false);
        }
    };

    const [detailUser, setDetailUser] = useState(null);
    const [detailOpen, setDetailOpen] = useState(false);
    const [detailLoading, setDetailLoading] = useState(false);

    const totalUsers = total;
    const activeUsers = totalUserActif;
    const adminUsers = totalAdmin;

    return (
        <div className="px-6 mx-auto">
            <div className="space-y-6">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                    <div>
                        <h1 className="text-2xl text-neutral-900 mb-2">Gestion des utilisateurs</h1>
                        <p className="text-sm text-neutral-600">Gérez les comptes et permissions utilisateurs</p>
                    </div>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Card className="p-4 border-neutral-200 bg-white">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-violet-50 rounded-lg flex items-center justify-center">
                                <PersonIcon className="w-5 h-5 text-violet-600" />
                            </div>
                            <div>
                                <p className="text-sm text-neutral-600">Total utilisateurs</p>
                                <p className="text-lg text-neutral-900">{totalUsers}</p>
                            </div>
                        </div>
                    </Card>

                    <Card className="p-4 border-neutral-200 bg-white">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-green-50 rounded-lg flex items-center justify-center">
                                <PersonIcon className="w-5 h-5 text-green-600" />
                            </div>
                            <div>
                                <p className="text-sm text-neutral-600">Utilisateurs actifs</p>
                                <p className="text-lg text-neutral-900">{activeUsers}</p>
                            </div>
                        </div>
                    </Card>

                    <Card className="p-4 border-neutral-200 bg-white">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-amber-50 rounded-lg flex items-center justify-center">
                                <ShieldOutlinedIcon className="w-5 h-5 text-amber-600" />
                            </div>
                            <div>
                                <p className="text-sm text-neutral-600">Administrateurs</p>
                                <p className="text-lg text-neutral-900">{adminUsers}</p>
                            </div>
                        </div>
                    </Card>
                </div>

                {/* Filtres avancés + Search */}
                <div className="flex flex-col md:flex-row md:items-center md:gap-4 gap-2">
                    <div className="relative flex-1 min-w-0">
                        <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-neutral-400" />
                        <Input
                            placeholder="Rechercher un utilisateur..."
                            value={searchTerm}
                            onChange={(e) => {
                                setPage(1);
                                setSearchTerm(e.target.value);
                            }}
                            className="pl-10 border-black bg-white w-full"
                        />
                    </div>
                    <div className="flex flex-wrap gap-2 w-auto">
                        <Select value={isVerified === '' ? 'all' : isVerified} onValueChange={v => { setPage(1); setIsVerified(v === 'all' ? '' : v); }}>
                            <SelectTrigger className="bg-white border border-neutral-300 rounded px-3 py-2 text-sm text-neutral-700 w-auto min-w-0">
                                <SelectValue placeholder="Email vérifié ?" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">Email vérifié ?</SelectItem>
                                <SelectItem value="true">Oui</SelectItem>
                                <SelectItem value="false">Non</SelectItem>
                            </SelectContent>
                        </Select>
                        <Select value={isActive === '' ? 'all' : isActive} onValueChange={v => { setPage(1); setIsActive(v === 'all' ? '' : v); }}>
                            <SelectTrigger className="bg-white border border-neutral-300 rounded px-3 py-2 text-sm text-neutral-700 w-auto min-w-0">
                                <SelectValue placeholder="Statut" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">Statut</SelectItem>
                                <SelectItem value="true">Actif</SelectItem>
                                <SelectItem value="false">Suspendu</SelectItem>
                            </SelectContent>
                        </Select>
                        <Select value={userType === '' ? 'all' : userType} onValueChange={v => { setPage(1); setUserType(v === 'all' ? '' : v); }}>
                            <SelectTrigger className="bg-white border border-neutral-300 rounded px-3 py-2 text-sm text-neutral-700 w-auto min-w-0">
                                <SelectValue placeholder="Type d'utilisateur" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">Type d'utilisateur</SelectItem>
                                <SelectItem value="Particulier">Particulier</SelectItem>
                                <SelectItem value="Entreprise">Entreprise</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </div>

                {/* Users Table / List (responsive) */}
                <Card className="border-neutral-200 bg-white">
                    <UsersTableOrList
                        loading={loading}
                        users={filteredUsers}
                        setModalUserId={setModalUserId}
                        setModalAction={setModalAction}
                        setModalOpen={setModalOpen}
                        handleShowUserDetail={handleShowUserDetail}
                    />
                </Card>

                {/* Modals de validation */}
                <Dialog open={modalOpen} onOpenChange={setModalOpen}>
                    <DialogContent >
                        <DialogHeader>
                            <DialogTitle>
                                {modalAction === 'delete' && 'Confirmer la suppression'}
                                {modalAction === 'role' && 'Confirmer le changement de rôle'}
                                {modalAction === 'activate' && 'Confirmer l’activation/suspension'}
                            </DialogTitle>
                            <DialogDescription>
                                {modalAction === 'delete' && 'Voulez-vous vraiment supprimer cet utilisateur ? Cette action est irréversible.'}
                                {modalAction === 'role' && 'Voulez-vous vraiment changer le rôle de cet utilisateur ?'}
                                {modalAction === 'activate' && 'Voulez-vous vraiment activer ou suspendre cet utilisateur ?'}
                            </DialogDescription>
                        </DialogHeader>
                        <div className="flex justify-end gap-2 mt-4">
                            <DialogClose asChild>
                                <Button variant="outline" status="inactive">Annuler</Button>
                            </DialogClose>
                            <Button
                                variant="default"
                                status={actionLoading ? "loading" : "active"}
                                className="bg-violet-600 text-white hover:bg-violet-700"
                                disabled={actionLoading}
                                onClick={() => {
                                    if (modalUserId && modalAction) {
                                        if (modalAction === 'delete') handleDeleteUser(modalUserId);
                                        if (modalAction === 'role') handleToggleRole(modalUserId);
                                        if (modalAction === 'activate') handleActivateUser(modalUserId);
                                    }
                                }}
                            >
                                {actionLoading ? 'Traitement...' : 'Confirmer'}
                            </Button>
                        </div>
                    </DialogContent>
                </Dialog>

                {/* Détail utilisateur */}
                <Dialog open={detailOpen} onOpenChange={setDetailOpen}>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Détail utilisateur</DialogTitle>
                        </DialogHeader>
                        {detailLoading ? (
                            <div className="p-8 text-center text-neutral-400">Chargement...</div>
                        ) : detailUser ? (
                            <div>
                                <div className="space-y-2 text-sm">
                                    <div className="flex items-center gap-4 mb-4">
                                        <img
                                            src={getFullMediaUrl(detailUser.userType === 'Entreprise' ? (detailUser.logo || detailUser.userImage) : (detailUser.userImage || detailUser.logo))}
                                            alt={detailUser.userNickName}
                                            className={detailUser.userType === 'Entreprise' ? 'w-20 h-20 object-contain rounded border' : 'w-16 h-16 object-cover rounded-full border'}
                                        />
                                        <div>
                                            <div className="font-bold text-lg text-neutral-900">{detailUser.userName} {detailUser.userFirstname}</div>
                                            <div className="text-xs text-neutral-500">{detailUser.userType} - {detailUser.userAccess}</div>
                                        </div>
                                    </div>
                                    <div><b>Email :</b> {detailUser.userEmail}</div>
                                    {detailUser.userType === 'Entreprise' ? (
                                        <div><b>Date de création de l'entreprise :</b> {formatBirthDate(detailUser.userDateOfBirth)}</div>
                                    ) : (
                                        <div><b>Date de naissance:</b> {formatBirthDate(detailUser.userDateOfBirth)}</div>
                                    )}
                                    <div><b>Téléphone :</b> {detailUser.userPhone}</div>
                                    <div><b>Adresse :</b> {detailUser.userAddress}</div>
                                    <div><b>Longitude :</b> {detailUser.userMainLng}</div>
                                    <div><b>Latitude :</b> {detailUser.userMainLat}</div>
                                    <div><b>Validé :</b> {detailUser.userValidated ? 'Oui' : 'Non'}</div>
                                    <div><b>Email vérifié :</b> {detailUser.userEmailVerified ? 'Oui' : 'Non'}</div>
                                    <div><b>Numéro Parrain 1 :</b> {detailUser.parrain1ID}</div>
                                    <div><b>Numéro Parrain 2 :</b> {detailUser.parrain2ID}</div>
                                    <div><b>Type document :</b> {detailUser.documentType}</div>
                                    <div><b>Numéro document :</b> {detailUser.identityCardNumber}</div>
                                    <div><b>Manager :</b> {detailUser.managerName} ({detailUser.managerEmail})</div>
                                    <div><b>Date création :</b> {detailUser.createdAt ? dateFormat(detailUser.createdAt) : '-'}</div>

                                    {/* Téléchargement documents selon le type d'utilisateur */}
                                    {Array.isArray(detailUser.identityDocument) && detailUser.identityDocument.length > 0 && (
                                        <div className="mt-2">
                                            <b>Documents d'identité :</b>
                                            <ul className="list-disc ml-6">
                                                {detailUser.identityDocument.map((file, idx) => (
                                                    <li key={idx}>
                                                        <a href={getFullMediaUrl(file)} download target="_blank" rel="noopener noreferrer" className="text-violet-600 underline">Télécharger document {idx + 1}</a>
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>
                                    )}

                                    {/* Pour les entreprises, afficher carteStat et carteFiscal */}
                                    {detailUser.userType === 'Entreprise' && (
                                        <>
                                            {Array.isArray(detailUser.carteStat) && detailUser.carteStat.length > 0 && (
                                                <div className="mt-2">
                                                    <b>Carte Stat :</b>
                                                    <ul className="list-disc ml-6">
                                                        {detailUser.carteStat.map((file, idx) => (
                                                            <li key={idx}>
                                                                <a href={getFullMediaUrl(file)} download target="_blank" rel="noopener noreferrer" className="text-violet-600 underline">Télécharger fichier {idx + 1}</a>
                                                            </li>
                                                        ))}
                                                    </ul>
                                                </div>
                                            )}
                                            {Array.isArray(detailUser.carteFiscal) && detailUser.carteFiscal.length > 0 && (
                                                <div className="mt-2">
                                                    <b>Carte Fiscal :</b>
                                                    <ul className="list-disc ml-6">
                                                        {detailUser.carteFiscal.map((file, idx) => (
                                                            <li key={idx}>
                                                                <a href={getFullMediaUrl(file)} download target="_blank" rel="noopener noreferrer" className="text-violet-600 underline">Télécharger fichier {idx + 1}</a>
                                                            </li>
                                                        ))}
                                                    </ul>
                                                </div>
                                            )}
                                        </>
                                    )}
                                </div>

                                <div className="flex justify-end gap-2 mt-4">
                                    <DialogClose asChild>
                                        <Button variant="outline">Fermer</Button>
                                    </DialogClose>
                                    <Button
                                        variant="default"
                                        className="bg-green-600 text-white hover:bg-green-700"
                                        disabled={actionLoading || detailUser.userValidated}
                                        onClick={async () => {
                                            if (detailUser && (detailUser._id || detailUser.id || detailUser.userId)) {
                                                await handleActivateUser(detailUser._id || detailUser.id || detailUser.userId);
                                                setDetailOpen(false);
                                            }
                                        }}
                                    >
                                        {detailUser.userValidated ? 'Déjà approuvé' : (actionLoading ? 'Traitement...' : 'Approuver')}
                                    </Button>
                                </div>
                            </div>
                        ) : (
                            <div className="p-8 text-center text-neutral-400">Aucune donnée</div>
                        )}
                    </DialogContent>
                </Dialog>

                <PaginationControls page={page} total={total} limit={limit} loading={loading} onPageChange={setPage} className="mt-4" />
            </div>
        </div>
    );
}

function UsersTableOrList({ loading, users, setModalUserId, setModalAction, setModalOpen, handleShowUserDetail }) {
    const { isDesktop } = useScreenType();
    const dateFormat = useDateFormat();

    if (loading) {
        return <div className="p-8 text-center text-neutral-400">Chargement...</div>;
    }

    if (!users || users.length === 0) {
        return <div className="p-8 text-center text-neutral-400">Aucun utilisateur trouvé</div>;
    }

    if (isDesktop) {
        return (
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead className="text-xs text-neutral-600">N° membre</TableHead>
                        <TableHead className="text-xs text-neutral-600">Utilisateur</TableHead>
                        <TableHead className="text-xs text-neutral-600">Email</TableHead>
                        <TableHead className="text-xs text-neutral-600">Vérification e-mail</TableHead>
                        <TableHead className="text-xs text-neutral-600">Date d'inscription</TableHead>
                        <TableHead className="text-xs text-neutral-600">Date de validation</TableHead>
                        <TableHead className="text-xs text-neutral-600">Rôle</TableHead>
                        <TableHead className="text-xs text-neutral-600">Statut</TableHead>
                        <TableHead className="text-xs text-neutral-600 text-right">Actions</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {users.map((user) => (
                        <TableRow key={user.id}>
                            <TableCell>
                                <div className="flex items-center gap-2">
                                    <Badge variant="outline" className="text-xs">{user.referralCode || 'N/A'}</Badge>
                                    {user.referralCode && (
                                        <Button type="button" size="icon" variant="ghost" className="p-1 h-6 w-6 text-neutral-500 hover:text-violet-600" onClick={() => { navigator.clipboard.writeText(user.referralCode); toast.success('ID copié dans le presse-papier'); }} aria-label="Copier l'ID utilisateur">
                                            <ContentCopyIcon fontSize="small" />
                                        </Button>
                                    )}
                                </div>
                            </TableCell>
                            <TableCell><p className={`text-sm ${user.status === 'Actif' ? 'text-neutral-900' : 'text-neutral-400'}`}>{user.name}</p></TableCell>
                            <TableCell className={`text-sm ${user.status === 'Actif' ? 'text-neutral-600' : 'text-neutral-400'}`}>{user.email}</TableCell>
                            <TableCell>
                                <Badge variant={user.emailVerified ? 'default' : 'secondary'} className={user.emailVerified ? 'bg-green-100 text-green-700 border-green-200' : 'bg-neutral-200 text-neutral-500 border-neutral-200'}>{user.emailVerified ? 'Vérifié' : 'Non vérifié'}</Badge>
                            </TableCell>
                            <TableCell className="text-sm text-neutral-900">{user.createdAt ? dateFormat(user.createdAt) : '-'}</TableCell>
                            <TableCell className="text-sm text-neutral-900">{user.status !== 'Non validé' && user.updatedAt ? dateFormat(user.updatedAt) : '-'}</TableCell>
                            <TableCell>
                                <div className="flex items-center gap-2">
                                    <Switch aria-label="Basculer rôle admin" checked={user.role === 'admin'} onCheckedChange={() => { setModalUserId(user.id); setModalAction('role'); setModalOpen(true); }} />
                                    <Badge variant={user.role === 'admin' ? 'default' : 'secondary'} className="text-xs">{user.role === 'admin' ? 'Admin' : 'Utilisateur'}</Badge>
                                </div>
                            </TableCell>
                            <TableCell>
                                <div className="flex items-center gap-2">
                                    <Switch aria-label="Basculer statut actif" checked={user.status === 'Actif'} onCheckedChange={() => { setModalUserId(user.id); setModalAction('activate'); setModalOpen(true); }} />
                                    <Badge variant={user.status === 'Actif' ? 'default' : 'secondary'} className={`text-xs ${user.status !== 'Actif' ? 'bg-neutral-500 text-white border-none' : ''}`}>{user.status}</Badge>
                                </div>
                            </TableCell>
                            <TableCell>
                                <div className="flex items-center justify-end gap-2">
                                    <Button variant="ghost" size="sm" onClick={() => handleShowUserDetail(user.id)}><InfoIcon className="w-5 h-5 text-violet-600" /></Button>
                                    <Button variant="ghost" size="sm" onClick={() => { setModalUserId(user.id); setModalAction('delete'); setModalOpen(true); }}><DeleteIcon className="w-4 h-4 text-red-600" /></Button>
                                </div>
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        );
    }

    // Mobile: cards list
    return (
        <div className="space-y-3 p-4">
            {users.map((user) => (
                <Card key={user.id} className="p-4">
                    <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                            <div className="flex items-center gap-3">
                                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${user.status === 'Actif' ? 'bg-violet-600 text-white' : 'bg-neutral-300 text-neutral-700'}`}>{user.name && user.name.charAt(0).toUpperCase()}</div>
                                <div>
                                    <div className="font-medium text-neutral-900">{user.name}</div>
                                    <div className="text-xs text-neutral-500">{user.email}</div>
                                </div>
                            </div>
                            <div className="mt-3 flex flex-wrap gap-2 items-center">
                                <Badge variant="outline" className="text-xs">{user.referralCode || 'N/A'}</Badge>
                                <Badge variant={user.emailVerified ? 'default' : 'secondary'} className="text-xs">{user.emailVerified ? 'Vérifié' : 'Non vérifié'}</Badge>
                                <Badge variant={user.role === 'admin' ? 'default' : 'secondary'} className="text-xs">{user.role === 'admin' ? 'Admin' : 'Utilisateur'}</Badge>
                                <Badge variant={user.status === 'Actif' ? 'default' : 'secondary'} className="text-xs">{user.status}</Badge>
                            </div>
                        </div>
                        <div className="flex flex-col items-end gap-2">
                            <div className="flex gap-2">
                                <Button variant="ghost" size="sm" onClick={() => handleShowUserDetail(user.id)}><InfoIcon className="w-5 h-5 text-violet-600" /></Button>
                                <Button variant="ghost" size="sm" onClick={() => { setModalUserId(user.id); setModalAction('delete'); setModalOpen(true); }}><DeleteIcon className="w-4 h-4 text-red-600" /></Button>
                            </div>
                            <div className="flex flex-col items-end gap-2">
                                <div className="flex items-center gap-2">
                                    <Switch aria-label="Basculer rôle admin" checked={user.role === 'admin'} onCheckedChange={() => { setModalUserId(user.id); setModalAction('role'); setModalOpen(true); }} />
                                    <span className="text-xs text-neutral-600">{user.role === 'admin' ? 'Admin' : 'Utilisateur'}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Switch aria-label="Basculer statut actif" checked={user.status === 'Actif'} onCheckedChange={() => { setModalUserId(user.id); setModalAction('activate'); setModalOpen(true); }} />
                                    <span className="text-xs text-neutral-600">{user.status}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </Card>
            ))}
        </div>
    );
}
