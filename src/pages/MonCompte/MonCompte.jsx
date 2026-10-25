import { useState, useEffect } from 'react';
import usePageTitle from '../../utils/usePageTitle.jsx';
import { Loader } from '../../components/ui/loader';
import { Card } from '../../components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogFooter, DialogTitle, DialogDescription } from '../../components/ui/dialog';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/tabs';
import { useAuth } from '../../context/AuthContext';
import { getProfile, changePassword, disableTwoFactor, enableTwoFactor, verifyTwoFactor } from '../../services/auth.service';
import { updateUser } from '../../services/user.service';
import { getFullMediaUrl } from '../../services/media.service';
import { getAccessToken } from '../../services/token.service';
import { toast } from 'sonner';
import { Person as UserIcon, Security as ShieldIcon } from '@mui/icons-material';
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
  const [twoFactorSetup, setTwoFactorSetup] = useState(null);
  const [twoFactorToken, setTwoFactorToken] = useState('');
  const [twoFactorLoading, setTwoFactorLoading] = useState(false);
  const [backupCodes, setBackupCodes] = useState([]);
  const [showDisableTwoFactor, setShowDisableTwoFactor] = useState(false);

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
      .catch(() => {
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
      toast.success('Profil mis à jour');
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
        toast.success(res.message || 'Mot de passe modifié');
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

  const startTwoFactorSetup = async () => {
    setTwoFactorLoading(true);
    try {
      const data = await enableTwoFactor();
      setTwoFactorSetup(data);
      setTwoFactorToken('');
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Impossible de préparer l’authentification à deux facteurs');
    } finally {
      setTwoFactorLoading(false);
    }
  };

  const confirmTwoFactorSetup = async (event) => {
    event.preventDefault();
    setTwoFactorLoading(true);
    try {
      const data = await verifyTwoFactor(twoFactorToken);
      setProfile((current) => ({ ...current, twoFactorEnabled: true }));
      setBackupCodes(data.backupCodes || data.twoFactorBackupCodes || []);
      setTwoFactorSetup(null);
      setTwoFactorToken('');
      toast.success('Authentification à deux facteurs activée');
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Code d’authentification invalide');
    } finally {
      setTwoFactorLoading(false);
    }
  };

  const confirmDisableTwoFactor = async (event) => {
    event.preventDefault();
    setTwoFactorLoading(true);
    try {
      await disableTwoFactor(twoFactorToken);
      setProfile((current) => ({ ...current, twoFactorEnabled: false }));
      setTwoFactorToken('');
      setShowDisableTwoFactor(false);
      toast.success('Authentification à deux facteurs désactivée');
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Code d’authentification invalide');
    } finally {
      setTwoFactorLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="p-6 max-w-4xl mx-auto flex justify-center">
        <Loader message="Chargement..." />
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
    <div className="px-4 sm:px-6 lg:px-8 mx-auto">
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-2xl text-neutral-900 mb-2">Mon Compte</h1>
            <p className="text-sm text-neutral-600">Vos informations personnelles et préférences</p>
          </div>
        </div>

        {/* Profile Card */}
        <Card className="p-6 border-neutral-200 bg-white">
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4">
            <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full flex items-center justify-center bg-neutral-100 overflow-hidden border border-neutral-200">
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
            <div className="flex-1 text-center sm:text-left">
              <h2 className="text-lg text-neutral-900 wrap-break-word">{profile.userName} {profile.userFirstname}</h2>
              <p className="text-sm text-neutral-600 break-all">{profile.userEmail}</p>
              <div className="flex flex-wrap items-center gap-2 mt-2">
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
                  <Badge variant="default" className="bg-violet-50 text-violet-700 border-violet-200">
                    Compte vérifié
                  </Badge>
                ) : (
                  <Badge variant="outline" className="bg-orange-50 text-orange-700 border-orange-200">
                    Non vérifié
                  </Badge>
                )}
                <div className="flex items-center gap-1 mt-2 sm:mt-0">
                  <Badge variant="outline" className="bg-neutral-50 text-neutral-700 border-neutral-700 px-2 py-1 text-xs font-mono max-w-full truncate">
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
        <Tabs defaultValue="profile">
          <TabsList>
            <TabsTrigger value="profile">
              <UserIcon className="w-4 h-4 mr-2" />
              Profil
            </TabsTrigger>
            <TabsTrigger value="security">
              <ShieldIcon className="w-4 h-4 mr-2" />
              Sécurité
            </TabsTrigger>
          </TabsList>

          <TabsContent value="profile">
            <Card className="p-6 border-neutral-200 bg-white">
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

                <Button type="submit" status={updating ? "loading" : "active"} color="default" className="w-full sm:w-auto" disabled={updating}>
                  {updating && <Loader size="sm" className="border-white border-t-transparent shrink-0" />}
                  Enregistrer les modifications
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
                      <Button variant="outline" status="inactive" onClick={() => setShowConfirm(false)} disabled={updating} className="w-full sm:w-auto">
                        Annuler
                      </Button>
                      <Button onClick={handleConfirmUpdate} status={updating ? "loading" : "active"} color="default" className="w-full sm:w-auto" disabled={updating}>
                        {updating && <Loader size="sm" className="border-white border-t-transparent shrink-0" />}
                        Confirmer
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </form>
            </Card>
          </TabsContent>

          <TabsContent value="security">
            <Card className="p-6 border-neutral-200 bg-white">
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

                <Button type="submit" status={changingPassword ? "loading" : "active"} color="default" className="w-full sm:w-auto flex items-center justify-center" disabled={changingPassword}>
                  {changingPassword && <Loader size="sm" className="border-white border-t-transparent shrink-0" />}
                  Modifier le mot de passe
                </Button>
              </form>

              <div className="mt-8 border-t border-neutral-200 pt-6">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <h3 className="font-medium text-neutral-900">Authentification à deux facteurs</h3>
                    <p className="mt-1 text-sm text-neutral-600">Protégez votre connexion avec un code temporaire généré par votre application d’authentification.</p>
                  </div>
                  {profile.twoFactorEnabled ? (
                    <Button type="button" variant="outline" onClick={() => { setTwoFactorToken(''); setShowDisableTwoFactor(true); }}>
                      Désactiver la 2FA
                    </Button>
                  ) : (
                    <Button type="button" onClick={startTwoFactorSetup} disabled={twoFactorLoading}>
                      {twoFactorLoading && <Loader size="sm" className="border-white border-t-transparent shrink-0" />}
                      Activer la 2FA
                    </Button>
                  )}
                </div>
                <Badge variant={profile.twoFactorEnabled ? 'default' : 'outline'} className="mt-4">
                  {profile.twoFactorEnabled ? '2FA activée' : '2FA désactivée'}
                </Badge>
              </div>

              <Dialog open={Boolean(twoFactorSetup)} onOpenChange={(open) => { if (!open) setTwoFactorSetup(null); }}>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Configurer l’authentification à deux facteurs</DialogTitle>
                    <DialogDescription>Scannez ce QR code avec votre application d’authentification, puis saisissez le code à six chiffres affiché.</DialogDescription>
                  </DialogHeader>
                  {twoFactorSetup?.qrCodeDataUrl && <img src={twoFactorSetup.qrCodeDataUrl} alt="QR code de configuration 2FA" className="mx-auto h-48 w-48" />}
                  {twoFactorSetup?.secret && <p className="break-all rounded bg-neutral-100 p-3 text-center font-mono text-sm">Clé manuelle : {twoFactorSetup.secret}</p>}
                  <form onSubmit={confirmTwoFactorSetup} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="setup-totp-token">Code à 6 chiffres</Label>
                      <Input id="setup-totp-token" value={twoFactorToken} onChange={(e) => setTwoFactorToken(e.target.value.replace(/\D/g, '').slice(0, 6))} inputMode="numeric" autoComplete="one-time-code" pattern="[0-9]{6}" maxLength={6} required className="text-center font-mono text-lg tracking-[0.45em]" />
                    </div>
                    <DialogFooter><Button type="submit" disabled={twoFactorLoading}>{twoFactorLoading && <Loader size="sm" className="border-white border-t-transparent shrink-0" />}Confirmer l’activation</Button></DialogFooter>
                  </form>
                </DialogContent>
              </Dialog>

              <Dialog open={showDisableTwoFactor} onOpenChange={setShowDisableTwoFactor}>
                <DialogContent>
                  <DialogHeader><DialogTitle>Désactiver la 2FA</DialogTitle><DialogDescription>Saisissez un code actuel de votre application d’authentification pour confirmer.</DialogDescription></DialogHeader>
                  <form onSubmit={confirmDisableTwoFactor} className="space-y-4">
                    <Input value={twoFactorToken} onChange={(e) => setTwoFactorToken(e.target.value.replace(/\D/g, '').slice(0, 6))} inputMode="numeric" autoComplete="one-time-code" pattern="[0-9]{6}" maxLength={6} required placeholder="123456" className="text-center font-mono text-lg tracking-[0.45em]" />
                    <DialogFooter><Button type="submit" variant="destructive" disabled={twoFactorLoading}>{twoFactorLoading && <Loader size="sm" className="border-white border-t-transparent shrink-0" />}Désactiver</Button></DialogFooter>
                  </form>
                </DialogContent>
              </Dialog>

              <Dialog open={backupCodes.length > 0} onOpenChange={(open) => { if (!open) setBackupCodes([]); }}>
                <DialogContent>
                  <DialogHeader><DialogTitle>Codes de secours</DialogTitle><DialogDescription>Conservez ces codes dans un endroit sûr. Ils peuvent servir si vous perdez l’accès à votre application d’authentification.</DialogDescription></DialogHeader>
                  <div className="grid grid-cols-2 gap-2 rounded bg-neutral-100 p-4 font-mono text-sm">{backupCodes.map((code) => <span key={code}>{code}</span>)}</div>
                  <DialogFooter><Button type="button" onClick={() => setBackupCodes([])}>J’ai enregistré mes codes</Button></DialogFooter>
                </DialogContent>
              </Dialog>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
