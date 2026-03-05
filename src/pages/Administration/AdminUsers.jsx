import { useState, useEffect } from 'react';
import { Card } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Badge } from '../../components/ui/badge';
import { Switch } from '../../components/ui/switch';
import SearchIcon from '@mui/icons-material/Search';
import InfoIcon from '@mui/icons-material/Info';
import DeleteIcon from '@mui/icons-material/Delete';
import ShieldOutlinedIcon from '@mui/icons-material/ShieldOutlined';
import PersonIcon from '@mui/icons-material/Person';
import { toast } from 'sonner';
import { getUsers, deleteUser, toggleUserRole, activateUser, getUserById } from '../../services/user.service';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogClose, DialogDescription } from '../../components/ui/dialog';
import { getFullMediaUrl } from '../../services/media.service';

export default function AdminUsers() {
  const [searchTerm, setSearchTerm] = useState('');
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [total, setTotal] = useState(0);
  // Filtres avancés
  const [isVerified, setIsVerified] = useState(''); // '', 'true', 'false'
  const [isActive, setIsActive] = useState(''); // '', 'true', 'false'
  const [userType, setUserType] = useState(''); // '', 'Particulier', 'Entreprise', etc.

  // Mappe les données API vers le format attendu par le tableau
  const mapApiUser = (apiUser) => ({
    id: apiUser._id,
    name: apiUser.userName + (apiUser.userFirstname ? ' ' + apiUser.userFirstname : ''),
    email: apiUser.userEmail,
    role: apiUser.userAccess && apiUser.userAccess.toLowerCase() === 'admin' ? 'admin' : 'user',
    balance: apiUser.userTotalSolde || 0,
    status: apiUser.deletedAt ? 'Suspendu' : (apiUser.userValidated ? 'Actif' : 'Non validé'),
    createdAt: apiUser.createdAt,
    emailVerified: apiUser.userEmailVerified,
    raw: apiUser,
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
    } catch (err) {
      toast.error('Erreur lors du chargement des utilisateurs');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchTerm, page, limit]);

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
  const activeUsers = users.filter((u) => u.status === 'Actif').length;
  const adminUsers = users.filter((u) => u.role === 'admin').length;

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-2xl text-neutral-900 mb-2">Gestion des utilisateurs</h1>
            <p className="text-sm text-neutral-600">
              Gérez les comptes et permissions utilisateurs
            </p>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="p-4 border-neutral-200">
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

          <Card className="p-4 border-neutral-200">
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

          <Card className="p-4 border-neutral-200">
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
          <div className="relative flex-1">
            <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-neutral-400" />
            <Input
              placeholder="Rechercher un utilisateur..."
              value={searchTerm}
              onChange={(e) => {
                setPage(1);
                setSearchTerm(e.target.value);
              }}
              className="pl-10 border-neutral-300"
            />
          </div>
          <select
            className="border border-neutral-300 rounded px-3 py-2 text-sm text-neutral-700 bg-white"
            value={isVerified}
            onChange={e => { setPage(1); setIsVerified(e.target.value); }}
          >
            <option value="">Email vérifié ?</option>
            <option value="true">Oui</option>
            <option value="false">Non</option>
          </select>
          <select
            className="border border-neutral-300 rounded px-3 py-2 text-sm text-neutral-700 bg-white"
            value={isActive}
            onChange={e => { setPage(1); setIsActive(e.target.value); }}
          >
            <option value="">Statut</option>
            <option value="true">Actif</option>
            <option value="false">Suspendu</option>
          </select>
          <select
            className="border border-neutral-300 rounded px-3 py-2 text-sm text-neutral-700 bg-white"
            value={userType}
            onChange={e => { setPage(1); setUserType(e.target.value); }}
          >
            <option value="">Type d'utilisateur</option>
            <option value="Particulier">Particulier</option>
            <option value="Entreprise">Entreprise</option>
          </select>
        </div>

        {/* Users Table */}
        <Card className="border-neutral-200">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-neutral-50 border-b border-neutral-200">
                <tr>
                  <th className="text-left p-4 text-xs text-neutral-600">Utilisateur</th>
                  <th className="text-left p-4 text-xs text-neutral-600">Email</th>
                  <th className="text-left p-4 text-xs text-neutral-600">Solde</th>
                  <th className="text-left p-4 text-xs text-neutral-600">Vérification e-mail</th>
                  {/* <th className="text-left p-4 text-xs text-neutral-600">Date création</th> */}
                  <th className="text-left p-4 text-xs text-neutral-600">Rôle</th>
                  <th className="text-left p-4 text-xs text-neutral-600">Statut</th>
                  <th className="text-right p-4 text-xs text-neutral-600" colSpan="2">Actions</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan="8" className="p-8 text-center text-neutral-400">Chargement...</td>
                  </tr>
                ) : filteredUsers.length > 0 ? (
                  filteredUsers.map((user) => (
                    <tr key={user.id} className="border-b border-neutral-200 last:border-0">
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          <div className={`w-10 h-10 rounded-full flex items-center justify-center ${user.status === 'Actif' ? 'bg-violet-600' : 'bg-neutral-300'}`}>
                            <span className="text-white text-sm">
                              {user.name.charAt(0).toUpperCase()}
                            </span>
                          </div>
                          <p className={`text-sm ${user.status === 'Actif' ? 'text-neutral-900' : 'text-neutral-400'}`}>{user.name}</p>
                        </div>
                      </td>
                      <td className={`p-4 text-sm ${user.status === 'Actif' ? 'text-neutral-600' : 'text-neutral-400'}`}>{user.email}</td>
                      <td className="p-4 text-sm text-neutral-900">
                        {user.balance.toLocaleString()} Ariary
                      </td>
                      <td className="p-4 text-sm">
                        <Badge
                          variant={user.emailVerified ? 'default' : 'secondary'}
                          className={user.emailVerified ? 'bg-green-100 text-green-700 border-green-200' : 'bg-neutral-200 text-neutral-500 border-neutral-200'}
                        >
                          {user.emailVerified ? 'Vérifié' : 'Non vérifié'}
                        </Badge>
                      </td>

                      {/* <td className="p-4 text-sm text-neutral-600">
                        {new Date(user.createdAt).toLocaleDateString()}
                      </td> */}
                      <td className="p-4">
                        <div className="flex items-center gap-2">
                          <Switch
                            checked={user.role === 'admin'}
                            onCheckedChange={() => {
                              setModalUserId(user.id);
                              setModalAction('role');
                              setModalOpen(true);
                            }}
                          />
                          <Badge
                            variant={user.role === 'admin' ? 'default' : 'secondary'}
                            className="text-xs"
                          >
                            {user.role === 'admin' ? 'Admin' : 'Utilisateur'}
                          </Badge>
                        </div>
                      </td>
                      <td className="p-4">
                        <div className="flex items-center gap-2">
                          <Switch
                            checked={user.status === 'Actif'}
                            onCheckedChange={() => {
                              setModalUserId(user.id);
                              setModalAction('activate');
                              setModalOpen(true);
                            }}
                          />
                          <Badge
                            variant={user.status === 'Actif' ? 'default' : 'secondary'}
                            className={`text-xs ${user.status !== 'Actif' ? 'bg-neutral-500 text-white border-none' : ''}`}
                          >
                            {user.status}
                          </Badge>
                        </div>
                      </td>
                      <td className="p-4 text-right" colSpan="2">
                        <div className="flex items-center justify-end gap-2">
                          <Button variant="ghost" size="sm" onClick={() => handleShowUserDetail(user.id)}>
                            <InfoIcon className="w-5 h-5 text-violet-600" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              setModalUserId(user.id);
                              setModalAction('delete');
                              setModalOpen(true);
                            }}
                          >
                            <DeleteIcon className="w-4 h-4 text-red-600" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="8" className="p-8 text-center text-neutral-400">Aucun utilisateur trouvé</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
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
                <Button variant="outline">Annuler</Button>
              </DialogClose>
              <Button
                variant="default"
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
              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-4 mb-4">
                  <img src={getFullMediaUrl(detailUser.userImage || detailUser.logo)} alt={detailUser.userNickName} className="w-16 h-16 object-cover rounded-full border" />
                  <div>
                    <div className="font-bold text-lg text-neutral-900">{detailUser.userName} {detailUser.userFirstname}</div>
                    <div className="text-xs text-neutral-500">{detailUser.userType} - {detailUser.userAccess}</div>
                  </div>
                </div>
                <div><b>Email :</b> {detailUser.userEmail}</div>
                <div><b>Téléphone :</b> {detailUser.userPhone}</div>
                <div><b>Adresse :</b> {detailUser.userAddress}</div>
                <div><b>Solde :</b> {detailUser.userTotalSolde} Ariary</div>
                <div><b>Validé :</b> {detailUser.userValidated ? 'Oui' : 'Non'}</div>
                <div><b>Email vérifié :</b> {detailUser.userEmailVerified ? 'Oui' : 'Non'}</div>
                <div><b>Type document :</b> {detailUser.documentType}</div>
                <div><b>Numéro CIN :</b> {detailUser.identityCardNumber}</div>
                <div><b>Manager :</b> {detailUser.managerName} ({detailUser.managerEmail})</div>
                <div><b>Date création :</b> {new Date(detailUser.createdAt).toLocaleString()}</div>
                {/* Téléchargement carteStat */}
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
                {/* Téléchargement identityDocument */}
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
              </div>
            ) : (
              <div className="p-8 text-center text-neutral-400">Aucune donnée</div>
            )}
          </DialogContent>
        </Dialog>

        {/* Pagination simple */}
        <div className="flex justify-end items-center gap-4 mt-4">
          <Button
            variant="outline"
            size="sm"
            disabled={page === 1 || loading}
            onClick={() => setPage((p) => Math.max(1, p - 1))}
          >
            Précédent
          </Button>
          <span className="text-sm text-neutral-600">
            Page {page} / {Math.max(1, Math.ceil(total / limit))}
          </span>
          <Button
            variant="outline"
            size="sm"
            disabled={page >= Math.ceil(total / limit) || loading}
            onClick={() => setPage((p) => p + 1)}
          >
            Suivant
          </Button>
        </div>
      </div>
    </div>
  );
}
