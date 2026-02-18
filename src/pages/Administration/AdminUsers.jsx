import { useState } from 'react';
import { Card } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Badge } from '../../components/ui/badge';
import { Switch } from '../../components/ui/switch';
import SearchIcon from '@mui/icons-material/Search';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import EditIcon from '@mui/icons-material/Edit';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import ShieldOutlinedIcon from '@mui/icons-material/ShieldOutlined';
import PersonIcon from '@mui/icons-material/Person';
import { toast } from 'sonner';

export default function AdminUsers() {
  const [searchTerm, setSearchTerm] = useState('');
  const [users, setUsers] = useState([
    {
      id: 1,
      name: 'Jean Dupont',
      email: 'jean.dupont@email.com',
      role: 'user',
      balance: 125000,
      status: 'Actif',
      createdAt: '2024-01-15',
    },
    {
      id: 2,
      name: 'Marie Martin',
      email: 'marie.martin@email.com',
      role: 'user',
      balance: 85000,
      status: 'Actif',
      createdAt: '2024-01-20',
    },
    {
      id: 3,
      name: 'Admin Principal',
      email: 'admin@commercehub.com',
      role: 'admin',
      balance: 0,
      status: 'Actif',
      createdAt: '2023-12-01',
    },
    {
      id: 4,
      name: 'Pierre Durand',
      email: 'pierre.durand@email.com',
      role: 'user',
      balance: 0,
      status: 'Suspendu',
      createdAt: '2024-02-01',
    },
  ]);

  const filteredUsers = users.filter(
    (user) =>
      user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleDeleteUser = (id) => {
    setUsers(users.filter((u) => u.id !== id));
    toast.success('Utilisateur supprimé');
  };

  const handleToggleRole = (id) => {
    setUsers(
      users.map((u) =>
        u.id === id
          ? { ...u, role: u.role === 'admin' ? 'user' : 'admin' }
          : u
      )
    );
    toast.success('Rôle mis à jour');
  };

  const handleToggleStatus = (id) => {
    setUsers(
      users.map((u) =>
        u.id === id
          ? { ...u, status: u.status === 'Actif' ? 'Suspendu' : 'Actif' }
          : u
      )
    );
    toast.success('Statut mis à jour');
  };

  const totalUsers = users.length;
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
          <Button className="bg-violet-600 hover:bg-violet-700 text-white">
            <PersonAddIcon className="w-4 h-4 mr-2" />
            Ajouter un utilisateur
          </Button>
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

        {/* Search */}
        <div className="relative">
          <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-neutral-400" />
          <Input
            placeholder="Rechercher un utilisateur..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 border-neutral-300"
          />
        </div>

        {/* Users Table */}
        <Card className="border-neutral-200">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-neutral-50 border-b border-neutral-200">
                <tr>
                  <th className="text-left p-4 text-xs text-neutral-600">Utilisateur</th>
                  <th className="text-left p-4 text-xs text-neutral-600">Email</th>
                  <th className="text-left p-4 text-xs text-neutral-600">Rôle</th>
                  <th className="text-left p-4 text-xs text-neutral-600">Solde</th>
                  <th className="text-left p-4 text-xs text-neutral-600">Statut</th>
                  <th className="text-left p-4 text-xs text-neutral-600">Date création</th>
                  <th className="text-right p-4 text-xs text-neutral-600">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.map((user) => (
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
                    <td className="p-4">
                      <Badge
                        variant={user.role === 'admin' ? 'default' : 'secondary'}
                        className="text-xs cursor-pointer"
                        onClick={() => handleToggleRole(user.id)}
                      >
                        {user.role === 'admin' ? 'Admin' : 'Utilisateur'}
                      </Badge>
                    </td>
                    <td className="p-4 text-sm text-neutral-900">
                      {user.balance.toLocaleString()} FCFA
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-2">
                        <Switch
                          checked={user.status === 'Actif'}
                          onCheckedChange={() => handleToggleStatus(user.id)}
                        />
                        <Badge
                          variant={user.status === 'Actif' ? 'default' : 'secondary'}
                          className={`text-xs ${user.status !== 'Actif' ? 'bg-neutral-500 text-white border-none' : ''}`}
                        >
                          {user.status}
                        </Badge>
                      </div>
                    </td>
                    <td className="p-4 text-sm text-neutral-600">
                      {new Date(user.createdAt).toLocaleDateString()}
                    </td>
                    <td className="p-4">
                      <div className="flex items-center justify-end gap-2">
                        <Button variant="ghost" size="sm">
                          <EditIcon className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteUser(user.id)}
                        >
                          <DeleteOutlineIcon className="w-4 h-4 text-red-600" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>

        {filteredUsers.length === 0 && (
          <Card className="p-12 text-center border-neutral-200">
            <p className="text-neutral-500">Aucun utilisateur trouvé</p>
          </Card>
        )}
      </div>
    </div>
  );
}
