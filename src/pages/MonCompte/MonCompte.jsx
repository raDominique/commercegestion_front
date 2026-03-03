import { useState, useEffect } from 'react';
import { Squelette } from '../../components/ui/skeleton.jsx';
import usePageTitle from '../../utils/usePageTitle.jsx';
import { Card } from '../../components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogFooter, DialogTitle, DialogDescription } from '../../components/ui/dialog';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/tabs';
import { useAuth } from '../../context/AuthContext';
import { getProfile, changePassword } from '../../services/auth.service';
import { updateUser } from '../../services/user.service';
import { getFullMediaUrl } from '../../services/media.service';
import { getAccessToken } from '../../services/token.service';
import { toast } from 'sonner';
import { Switch } from '../../components/ui/switch';
import { Person as UserIcon, Security as ShieldIcon, Notifications as BellIcon } from '@mui/icons-material';
import { Badge } from '../../components/ui/badge';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';

export default function MonCompte() {
  usePageTitle('Mon compte');
  const { user: authUser } = useAuth();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Champs éditables
  const [userNickName, setUserNickName] = useState('');
  const [phone, setPhone] = useState('');
  const [avatar, setAvatar] = useState(null);
  const [updating, setUpdating] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [notifications, setNotifications] = useState({
    email: true,
    transactions: true,
    promotions: false,
  });

  useEffect(() => {
    let mounted = true;
    setLoading(true);
    getProfile()
      .then((data) => {
        if (!mounted) return;
        setProfile(data);
        setUserNickName(data.userNickName || '');
        setPhone(data.userPhone || '');
        setError(null);
      })
      .catch((err) => {
        if (!mounted) return;
        setError('Impossible de charger le profil');
      })
      .finally(() => {
        if (mounted) setLoading(false);
      });
    return () => { mounted = false; };
  }, []);

  const handleUpdateProfile = (e) => {
    e.preventDefault();
    setShowConfirm(true);
  };

  const handleConfirmUpdate = async () => {
    const token = getAccessToken();
    const userId = authUser?.sub;
    if (!userId || !token) {
      toast.error('Utilisateur non authentifié');
      setShowConfirm(false);
      return;
    }
    setUpdating(true);
    try {
      const data = {
        userNickName,
        userPhone: phone,
      };
      if (avatar) data.avatar = avatar;
      await updateUser(userId, data, token);
      toast.success('Profil mis à jour avec succès');
      // Rafraîchir le profil localement sans reload global
      const refreshed = await getProfile();
      setProfile(refreshed);
      setAvatar(null);
      setShowConfirm(false);
    } catch (err) {
      toast.error('Erreur lors de la mise à jour du profil');
      setShowConfirm(false);
    } finally {
      setUpdating(false);
    }
  };

  const [changingPassword, setChangingPassword] = useState(false);
  const handleUpdatePassword = async (e) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      toast.error('Les mots de passe ne correspondent pas');
      return;
    }
    setChangingPassword(true);
    try {
      const token = getAccessToken();
      const res = await changePassword({
        currentPassword,
        newPassword,
        confirmPassword
      }, token);
      if (res.status === 'success') {
        toast.success(res.message || 'Mot de passe modifié avec succès');
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
      } else {
        toast.error(res.message || 'Erreur lors du changement de mot de passe');
      }
    } catch (err) {
      if (err?.response?.data?.message) {
        toast.error(err.response.data.message);
      } else if (err?.message) {
        toast.error(err.message);
      } else {
        toast.error('Erreur lors du changement de mot de passe');
      }
    } finally {
      setChangingPassword(false);
    }
  };

  if (loading) {
    return (
      <div className="p-6 max-w-4xl mx-auto">
        <Squelette className="w-full h-32 mb-4" />
        <Squelette className="w-1/2 h-8 mb-2" />
        <Squelette className="w-1/3 h-6" />
      </div>
    );
  }
  if (error) {
    return <div className="p-6 max-w-4xl mx-auto text-red-600">{error}</div>;
  }
  if (!profile) {
    return <div className="p-6 max-w-4xl mx-auto">Aucun profil trouvé.</div>;
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
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
            <div className="w-16 h-16 rounded-full flex items-center justify-center bg-neutral-100 overflow-hidden border border-neutral-200">
              {profile.userImage ? (
                <img
                  src={getFullMediaUrl(profile.userImage)}
                  alt={profile.userNickName || profile.userName || 'Avatar'}
                  className="w-full h-full object-cover"
                />
              ) : (
                <span className="text-2xl text-neutral-500">
                  {profile.userName?.charAt(0)?.toUpperCase()}
                </span>
              )}
            </div>
            <div className="flex-1">
              <h2 className="text-lg text-neutral-900">{profile.userName} {profile.userFirstname}</h2>
              <p className="text-sm text-neutral-600">{profile.userEmail}</p>
              <div className="flex items-center gap-2 mt-2">
                <Badge variant="secondary" className="capitalize bg-violet-50 text-violet-700 border-violet-200">
                  {profile.userAccess === 'Admin' ? 'Administrateur' : (profile.userAccess || 'Utilisateur')}
                </Badge>
                {profile.userEmailVerified ? (
                  <Badge variant="default" className="bg-blue-50 text-blue-700 border-blue-200">
                    Email vérifié
                  </Badge>
                ) : (
                  <Badge variant="destructive" className="bg-red-50 text-red-600 border-red-200">
                    Email non vérifié
                  </Badge>
                )}
                {profile.userValidated ? (
                  <Badge variant="default" className="bg-green-50 text-green-700 border-green-200">
                    Compte vérifié
                  </Badge>
                ) : (
                  <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">
                    Non vérifié
                  </Badge>
                )}
                <div className="flex items-center gap-1">
                  <Badge variant="outline" className="bg-neutral-50 text-neutral-700 border-neutral-200 px-2 py-1 text-xs font-mono">
                    ID: {profile.userId}
                  </Badge>
                  <Button
                    type="button"
                    size="icon"
                    variant="ghost"
                    className="p-1 h-6 w-6 text-neutral-500 hover:text-violet-600"
                    onClick={() => {
                      navigator.clipboard.writeText(profile.userId);
                      toast.success('ID copié dans le presse-papier');
                    }}
                    aria-label="Copier l'ID utilisateur"
                  >
                    <ContentCopyIcon fontSize="small" />
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </Card>

        {/* Tabs */}
        <Tabs defaultValue="profile" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2 bg-muted p-1 rounded-xl">
            <TabsTrigger value="profile" className="data-[state=active]:bg-violet-600 data-[state=active]:text-white">
              <UserIcon className="w-4 h-4 mr-2" />
              Profil
            </TabsTrigger>
            <TabsTrigger value="security" className="data-[state=active]:bg-violet-600 data-[state=active]:text-white">
              <ShieldIcon className="w-4 h-4 mr-2" />
              Sécurité
            </TabsTrigger>
          </TabsList>

          <TabsContent value="profile">
            <Card className="p-6 border-neutral-200">
              <form onSubmit={handleUpdateProfile} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="userNickName">Pseudo</Label>
                  <Input
                    id="userNickName"
                    value={userNickName}
                    onChange={(e) => setUserNickName(e.target.value)}
                    className="border-neutral-300"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="name">Nom</Label>
                  <Input
                    id="name"
                    value={profile.userName || ''}
                    readOnly
                    className="border-neutral-300 bg-neutral-100 cursor-not-allowed"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="firstname">Prénom</Label>
                  <Input
                    id="firstname"
                    value={profile.userFirstname || ''}
                    readOnly
                    className="border-neutral-300 bg-neutral-100 cursor-not-allowed"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="avatar">Avatar (photo de profil)</Label>
                  <Input
                    id="avatar"
                    type="file"
                    accept="image/*"
                    onChange={e => setAvatar(e.target.files[0])}
                    className="border-neutral-300"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={profile.userEmail || ''}
                    readOnly
                    className="border-neutral-300 bg-neutral-100 cursor-not-allowed"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone">Téléphone</Label>
                  <Input
                    id="phone"
                    type="tel"
                    value={phone}
                    onChange={e => setPhone(e.target.value)}
                    className="border-neutral-300"
                  />
                </div>

                <Button type="submit" className="bg-violet-600 hover:bg-violet-700 text-white" disabled={updating}>
                  {updating ? 'Enregistrement...' : 'Enregistrer les modifications'}
                </Button>
                {/* Modal de confirmation */}
                <Dialog open={showConfirm} onOpenChange={setShowConfirm}>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Confirmer la modification</DialogTitle>
                      <DialogDescription>
                        Voulez-vous vraiment enregistrer les modifications de votre profil&nbsp;?
                      </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                      <Button variant="outline" onClick={() => setShowConfirm(false)} disabled={updating}>
                        Annuler
                      </Button>
                      <Button onClick={handleConfirmUpdate} className="bg-violet-600 text-white" disabled={updating}>
                        Confirmer
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
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

                <Button type="submit" className="bg-violet-600 hover:bg-violet-700 text-white flex items-center justify-center" disabled={changingPassword}>
                  {changingPassword ? (
                    <span className="w-4 h-4 mr-2 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                  ) : null}
                  {changingPassword ? 'Modification...' : 'Modifier le mot de passe'}
                </Button>
              </form>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}