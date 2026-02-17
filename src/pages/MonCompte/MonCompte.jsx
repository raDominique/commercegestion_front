
import { useState } from 'react';
import usePageTitle from '../../utils/usePageTitle.jsx';
import { Card } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/tabs';
import { useAuth } from '../../context/AuthContext';
import { toast } from 'sonner';
import { Switch } from '../../components/ui/switch';
import { Person as UserIcon, Security as ShieldIcon, Notifications as BellIcon } from '@mui/icons-material';

export default function MonCompte() {
  usePageTitle('Mon compte');
  const { user } = useAuth();
  const [name, setName] = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [notifications, setNotifications] = useState({
    email: true,
    transactions: true,
    promotions: false,
  });

  const handleUpdateProfile = (e) => {
    e.preventDefault();
    toast.success('Profil mis à jour avec succès');
  };

  const handleUpdatePassword = (e) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      toast.error('Les mots de passe ne correspondent pas');
      return;
    }
    toast.success('Mot de passe modifié avec succès');
    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl text-neutral-900 mb-2">Mon Compte</h1>
          <p className="text-sm text-neutral-600">
            Gérez vos informations personnelles et préférences
          </p>
        </div>

        {/* Profile Card */}
        <Card className="p-6 border-neutral-200">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-linear-to-br from-violet-600 to-indigo-600 rounded-full flex items-center justify-center">
              <span className="text-2xl text-white">
                {user?.name?.charAt(0)?.toUpperCase()}
              </span>
            </div>
            <div className="flex-1">
              <h2 className="text-lg text-neutral-900">{user?.name}</h2>
              <p className="text-sm text-neutral-600">{user?.email}</p>
              <div className="flex items-center gap-2 mt-2">
                <div className="px-2 py-1 bg-violet-50 text-violet-600 rounded text-xs">
                  {user?.role === 'admin' ? 'Administrateur' : 'Utilisateur'}
                </div>
                <div className="px-2 py-1 bg-green-50 text-green-600 rounded text-xs">
                  Compte vérifié
                </div>
              </div>
            </div>
          </div>
        </Card>

        {/* Tabs */}
        <Tabs defaultValue="profile" className="space-y-6">
          <TabsList className="w-full flex bg-neutral-100 rounded-full px-auto">
            <TabsTrigger value="profile" className="flex-1 rounded-full data-[state=active]:bg-white data-[state=active]:font-semibold data-[state=active]:shadow-none data-[state=active]:text-neutral-900 data-[state=inactive]:text-neutral-700 transition-colors h-9 px-4 py-1 flex items-center justify-center">
              <UserIcon className="w-4 h-4 mr-2" />
              Profil
            </TabsTrigger>
            <TabsTrigger value="security" className="flex-1 rounded-full data-[state=active]:bg-white data-[state=active]:font-semibold data-[state=active]:shadow-none data-[state=active]:text-neutral-900 data-[state=inactive]:text-neutral-700 transition-colors h-9 px-4 py-2 flex items-center justify-center">
              <ShieldIcon className="w-4 h-4 mr-2" />
              Sécurité
            </TabsTrigger>
            <TabsTrigger value="notifications" className="flex-1 rounded-full data-[state=active]:bg-white data-[state=active]:font-semibold data-[state=active]:shadow-none data-[state=active]:text-neutral-900 data-[state=inactive]:text-neutral-700 transition-colors h-9 px-4 py-2 flex items-center justify-center">
              <BellIcon className="w-4 h-4 mr-2" />
              Notifications
            </TabsTrigger>
          </TabsList>

          <TabsContent value="profile">
            <Card className="p-6 border-neutral-200">
              <form onSubmit={handleUpdateProfile} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Nom complet</Label>
                  <Input
                    id="name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="border-neutral-300"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="border-neutral-300"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone">Téléphone</Label>
                  <Input
                    id="phone"
                    type="tel"
                    placeholder="+225 XX XX XX XX XX"
                    className="border-neutral-300"
                  />
                </div>

                <Button type="submit" className="bg-violet-600 hover:bg-violet-700 text-white">
                  Enregistrer les modifications
                </Button>
              </form>
            </Card>
          </TabsContent>

          <TabsContent value="security">
            <Card className="p-6 border-neutral-200">
              <form onSubmit={handleUpdatePassword} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="currentPassword">Mot de passe actuel</Label>
                  <Input
                    id="currentPassword"
                    type="password"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    className="border-neutral-300"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="newPassword">Nouveau mot de passe</Label>
                  <Input
                    id="newPassword"
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="border-neutral-300"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">Confirmer le mot de passe</Label>
                  <Input
                    id="confirmPassword"
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="border-neutral-300"
                  />
                </div>

                <Button type="submit" className="bg-violet-600 hover:bg-violet-700 text-white">
                  Modifier le mot de passe
                </Button>
              </form>

              <div className="mt-6 pt-6 border-t border-neutral-200">
                <h3 className="text-sm text-neutral-900 mb-4">Authentification à deux facteurs</h3>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-neutral-700">Activer 2FA</p>
                    <p className="text-xs text-neutral-500">Ajoutez une couche de sécurité supplémentaire</p>
                  </div>
                  <Switch />
                </div>
              </div>
            </Card>
          </TabsContent>

          <TabsContent value="notifications">
            <Card className="p-6 border-neutral-200">
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-neutral-900">Notifications par email</p>
                    <p className="text-xs text-neutral-500">Recevoir des emails pour les activités importantes</p>
                  </div>
                  <Switch
                    checked={notifications.email}
                    onCheckedChange={(checked) =>
                      setNotifications({ ...notifications, email: checked })
                    }
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-neutral-900">Alertes de transaction</p>
                    <p className="text-xs text-neutral-500">Être notifié de chaque transaction</p>
                  </div>
                  <Switch
                    checked={notifications.transactions}
                    onCheckedChange={(checked) =>
                      setNotifications({ ...notifications, transactions: checked })
                    }
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-neutral-900">Promotions et offres</p>
                    <p className="text-xs text-neutral-500">Recevoir des offres spéciales et promotions</p>
                  </div>
                  <Switch
                    checked={notifications.promotions}
                    onCheckedChange={(checked) =>
                      setNotifications({ ...notifications, promotions: checked })
                    }
                  />
                </div>

                <Button className="bg-violet-600 hover:bg-violet-700 text-white">
                  Enregistrer les préférences
                </Button>
              </div>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
