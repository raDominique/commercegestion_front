import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { getProfile } from '../../services/auth.service';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { toast } from 'sonner';
import usePageTitle from '../../utils/usePageTitle';
import VisibilityIcon from '@mui/icons-material/Visibility';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import MailOutlinedIcon from '@mui/icons-material/MailOutlined';
import { Loader } from '../../components/ui/loader';
import { AuthShell, BrandPanel, BrandPoints, FormPanel, AuthHeader } from '../../components/commons/authLayout';

const inputClass =
  'h-11 rounded-md border-neutral-200 bg-neutral-50 pl-10 text-[15px] shadow-none focus-visible:border-violet-600 focus-visible:ring-0';

export default function Login() {
  usePageTitle('Connexion');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const allowedRoles = ['Utilisateur', 'Moderateur', 'Admin'];
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await login(email, password);
      const profile = await getProfile();
      if (profile && allowedRoles.includes(profile.userAccess)) {
        toast.success('Connexion réussie !');
        navigate('/dashboard', { replace: true });
      } else {
        toast.error("Votre rôle ne permet pas d'accéder à cette application.");
      }
    } catch (error) {
      console.error('Erreur de connexion:', error);
      const apiMessage = error?.response?.data?.message;
      const url = error?.config?.url;
      if (url?.includes('/auth/login')) {
        if (apiMessage) {
          toast.error(apiMessage);
        } else {
          toast.error('Identifiants invalides. Veuillez vérifier votre e-mail et votre mot de passe puis réessayer.');
        }
      } else if (apiMessage) {
        toast.error(apiMessage);
      } else if (error?.message && error?.message !== 'Session expirée') {
        toast.error(error.message);
      } else {
        toast.error('Erreur de connexion');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthShell>
      <BrandPanel
        eyebrow="Espace membre"
        title="Gérez votre commerce en toute simplicité."
        subtitle="Retrouvez vos produits, transactions, sites et parrainages dans un espace unique et sécurisé."
      >
        <BrandPoints
          points={[
            { title: 'Tableau de bord clair', text: 'Actifs, passifs et opérations en un coup d’œil.' },
            { title: 'Transactions suivies', text: 'Dépôts, retraits et échanges tracés étape par étape.' },
            { title: 'Accès sécurisé', text: 'Votre compte protégé, vos données restent à vous.' },
          ]}
        />
        <p className="mt-6 border-t border-white/20 pt-4 text-xs tracking-wide text-violet-200">
          © Etokisana — Plateforme de commerce et gestion
        </p>
      </BrandPanel>

      <FormPanel>
        <AuthHeader
          title="Bon retour parmi nous"
          subtitle={
            <>
              Connectez-vous à votre compte <span className="font-semibold text-violet-700">Etokisana</span> pour reprendre votre activité.
            </>
          }
        />

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-2">
            <Label htmlFor="email">Adresse e-mail</Label>
            <div className="relative">
              <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400">
                <MailOutlinedIcon fontSize="small" />
              </span>
              <Input
                id="email"
                type="email"
                placeholder="votre@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete="email"
                className={inputClass}
              />
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="password">Mot de passe</Label>
              <Link to="/forgot-password" className="text-xs font-semibold text-violet-700 hover:text-violet-800 hover:underline">
                Mot de passe oublié ?
              </Link>
            </div>
            <div className="relative">
              <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400">
                <LockOutlinedIcon fontSize="small" />
              </span>
              <Input
                id="password"
                name="password"
                type={showPassword ? 'text' : 'password'}
                onChange={(e) => setPassword(e.target.value)}
                required
                autoComplete="current-password"
                className={`${inputClass} pr-10`}
                placeholder="••••••••"
                value={password}
              />
              <button
                type="button"
                className="absolute right-2 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-md text-neutral-400 hover:bg-neutral-100 hover:text-neutral-700"
                tabIndex={-1}
                onClick={() => setShowPassword((v) => !v)}
                aria-label={showPassword ? 'Masquer le mot de passe' : 'Afficher le mot de passe'}
              >
                {showPassword ? <VisibilityOffIcon fontSize="small" /> : <VisibilityIcon fontSize="small" />}
              </button>
            </div>
          </div>

          <Button
            type="submit"
            status={loading ? 'loading' : 'active'}
            className="h-11 w-full rounded-md text-[15px] font-semibold shadow-none"
            disabled={loading}
          >
            {loading && <Loader size="sm" className="border-white border-t-transparent shrink-0" />}
            Se connecter
          </Button>
        </form>

        <div className="mt-6 flex items-center gap-3" aria-hidden="true">
          <span className="h-px flex-1 bg-neutral-200" />
          <span className="text-[11px] font-semibold uppercase tracking-[0.14em] text-neutral-400">Nouveau ici</span>
          <span className="h-px flex-1 bg-neutral-200" />
        </div>

        <div className="mt-6 border border-neutral-200 bg-neutral-50 px-4 py-4 text-center">
          <p className="text-sm text-neutral-600">
            Pas encore de compte ?{' '}
            <Link to="/register" className="font-semibold text-violet-700 hover:text-violet-800 hover:underline">
              Créer un compte
            </Link>
          </p>
          <p className="mt-1 text-xs text-neutral-400">Inscription en 3 étapes, sans engagement.</p>
        </div>

        <p className="mt-6 text-center text-xs text-neutral-400">
          En vous connectant, vous acceptez nos conditions d’utilisation.
        </p>
      </FormPanel>
    </AuthShell>
  );
}
