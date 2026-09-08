import { useState, useEffect } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Button } from '../../components/ui/button';
import usePageTitle from '../../utils/usePageTitle.jsx';
import { toast } from 'sonner';
import VisibilityIcon from '@mui/icons-material/Visibility';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import { resetPassword as resetPasswordService } from '../../services/auth.service';
import { Loader } from '../../components/ui/loader';
import { AuthShell, BrandPanel, BrandPoints, FormPanel, AuthHeader } from '../../components/commons/authLayout';

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
    <AuthShell>
      <BrandPanel
        eyebrow="Sécurité"
        title="Choisissez un nouveau mot de passe."
        subtitle="Un mot de passe long et unique protège vos transactions et vos données."
      >
        <BrandPoints
          points={[
            { title: '8 caractères minimum', text: 'Mélangez lettres, chiffres et symboles.' },
            { title: 'Confirmation immédiate', text: 'Vous êtes reconnecté en un clic.' },
          ]}
        />
      </BrandPanel>
      <FormPanel>
        <AuthHeader
          title="Réinitialiser le mot de passe"
          subtitle="Définissez un nouveau mot de passe pour votre compte Etokisana."
        />
        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-2">
            <Label htmlFor="newPassword">Nouveau mot de passe</Label>
            <div className="relative">
              <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400">
                <LockOutlinedIcon fontSize="small" />
              </span>
              <Input
                id="newPassword"
                type={showPassword ? 'text' : 'password'}
                placeholder="••••••••"
                value={newPassword}
                onChange={e => setNewPassword(e.target.value)}
                required
                className="h-11 rounded-md border-neutral-200 bg-neutral-50 pl-10 pr-10 shadow-none focus-visible:border-violet-600 focus-visible:ring-0"
              />
              <button
                type="button"
                className="absolute right-2 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-md text-neutral-400 hover:bg-neutral-100 hover:text-neutral-700"
                onClick={() => setShowPassword(v => !v)}
                aria-label={showPassword ? 'Masquer le mot de passe' : 'Afficher le mot de passe'}
                tabIndex={-1}
              >
                {showPassword ? <VisibilityOffIcon fontSize="small" /> : <VisibilityIcon fontSize="small" />}
              </button>
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="confirmPassword">Confirmer le mot de passe</Label>
            <Input
              id="confirmPassword"
              type={showPassword ? 'text' : 'password'}
              placeholder="••••••••"
              value={confirmPassword}
              onChange={e => setConfirmPassword(e.target.value)}
              required
              className="h-11 rounded-md border-neutral-200 bg-neutral-50 shadow-none focus-visible:border-violet-600 focus-visible:ring-0"
            />
          </div>
          <Button type="submit" status={loading ? "loading" : "active"} className="h-11 w-full rounded-md font-semibold shadow-none" disabled={loading}>
            {loading && <Loader size="sm" className="border-white border-t-transparent shrink-0" />}
            Réinitialiser
          </Button>
        </form>
        <div className="mt-6 border border-neutral-200 bg-neutral-50 px-4 py-3.5 text-center text-sm text-neutral-600">
          Retour à la&nbsp;
          <Link to="/login" className="font-semibold text-violet-700 hover:text-violet-800 hover:underline">connexion</Link>
        </div>
      </FormPanel>
    </AuthShell>
  );
};

export default ResetPassword;
