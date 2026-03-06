import { useState, useEffect } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { Card } from '../../components/ui/card';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Button } from '../../components/ui/button';
import usePageTitle from '../../utils/usePageTitle.jsx';
import { toast } from 'sonner';
import LogoImage from '../../assets/logo/logo.png';
import VisibilityIcon from '@mui/icons-material/Visibility';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import { resetPassword as resetPasswordService } from '../../services/auth.service';

function useQuery() {
  return new URLSearchParams(useLocation().search);
}

const ResetPassword = () => {
  usePageTitle('Réinitialiser le mot de passe');
  const query = useQuery();
  const navigate = useNavigate();
  const [token, setToken] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    const t = query.get('token') || '';
    setToken(t);
  }, [query]);

  const validate = () => {
    if (!token) {
      toast.error('Token manquant. Vérifiez le lien reçu par email.');
      return false;
    }
    if (!newPassword || newPassword.length < 8) {
      toast.error('Le mot de passe doit contenir au moins 8 caractères.');
      return false;
    }
    if (newPassword !== confirmPassword) {
      toast.error('Les mots de passe ne correspondent pas.');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    try {
      await resetPasswordService({ resetToken: token, newPassword, confirmPassword });
      toast.success('Mot de passe réinitialisé. Vous pouvez vous connecter.');
      navigate('/login');
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Erreur lors de la réinitialisation.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full bg-linear-to-br from-gray-200 to-gray-300 flex flex-col items-center justify-center p-4">
      <Card className="w-full max-w-md p-8 rounded-xl border border-neutral-200 bg-neutral-100">
        <div className="flex flex-col items-center mb-6">
          <img src={LogoImage} alt="Logo Etokisana" className="h-20 w-auto mb-4" />
          <h1 className="text-3xl font-bold text-violet-700 mb-1">Réinitialiser le mot de passe</h1>
          <p className="text-base text-neutral-700 text-center">Choisissez un nouveau mot de passe pour votre compte.</p>
        </div>
        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-2">
            <Label htmlFor="newPassword">Nouveau mot de passe</Label>
            <div className="relative">
              <Input id="newPassword" type={showPassword ? 'text' : 'password'} placeholder="••••••••" value={newPassword} onChange={e => setNewPassword(e.target.value)} required className="border-neutral-300 pr-10" />
              <button type="button" tabIndex={-1} className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground" onClick={() => setShowPassword(v => !v)} aria-label={showPassword ? 'Masquer le mot de passe' : 'Afficher le mot de passe'}>
                {showPassword ? <VisibilityOffIcon fontSize="small" /> : <VisibilityIcon fontSize="small" />}
              </button>
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="confirmPassword">Confirmer le mot de passe</Label>
            <Input id="confirmPassword" type={showPassword ? 'text' : 'password'} placeholder="••••••••" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} required className="border-neutral-300" />
          </div>
          <Button type="submit" className="w-full bg-violet-600 hover:bg-violet-700 text-white" disabled={loading}>
            {loading ? 'Envoi...' : 'Réinitialiser'}
          </Button>
        </form>
        <div className="text-center text-sm mt-6">
          <span className="text-neutral-600">Retour à la&nbsp;</span>
          <Link to="/login" className="text-violet-600 hover:text-violet-700">connexion</Link>
        </div>
      </Card>
    </div>
  );
};

export default ResetPassword;
