import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { getProfile } from '../../services/auth.service';
import { Button } from '../../components/ui/button';
import { Card } from '../../components/ui/card';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { toast } from 'sonner';
import usePageTitle from '../../utils/usePageTitle';
import useScreenType from '../../utils/useScreenType';
import LogoImage from '../../assets/logo/logo.png';
import VisibilityIcon from '@mui/icons-material/Visibility';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';


export default function Login() {
  usePageTitle('Connexion');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();
  const { isMobile } = useScreenType();

  const allowedRoles = ['Utilisateur', 'Moderateur', 'Admin'];
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await login(email, password);
      const profile = await getProfile();
      if (profile && allowedRoles.includes(profile.userAccess)) {
        toast.success('Connexion réussie !');
        navigate('/actifs', { replace: true });
      } else {
        toast.error("Votre rôle ne permet pas d'accéder à cette application.");
      }
    } catch (error) {
      // Gestion précise des erreurs API
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
    <div className={`min-h-screen w-full bg-linear-to-br from-gray-200 to-gray-300 flex flex-col items-center ${isMobile ? 'justify-start py-6' : 'justify-center p-4'}`}>
      {/* Card with login form */}
      <Card className={`${isMobile ? 'w-full h-full max-w-none p-6 rounded-none border-none bg-white overflow-auto' : 'w-full max-w-md p-8 rounded-xl border border-neutral-200 bg-neutral-100'}`}>
        {/* Branding above the card */}
        <div className={`flex flex-col items-center ${isMobile ? 'mb-4' : 'mb-8'}`}>
          <img src={LogoImage} alt="Logo Etokisana" className={`${isMobile ? 'h-12' : 'h-20'} w-auto mb-4`} />
          <h1 className={`${isMobile ? 'text-2xl' : 'text-3xl'} font-bold text-violet-700 mb-1`}>Connexion</h1>
          <p className={`${isMobile ? 'text-sm' : 'text-base'} text-neutral-700 text-center`}>
            Connectez-vous à votre compte <span className="font-bold text-violet-600">Etokisana</span>
          </p>
        </div>
        <form onSubmit={handleSubmit} className={`${isMobile ? 'space-y-4' : 'space-y-5'}`}>
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="votre@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="border-neutral-300"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Mot de passe</Label>
            <div className="relative flex-items-center">
              <Input
                id="password"
                name="password"
                type={showPassword ? 'text' : 'password'}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="border-neutral-300 pr-10"
                placeholder="••••••••"
                value={password}
              />
              <button
                type="button"
                className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground"
                tabIndex={-1}
                onClick={() => setShowPassword((v) => !v)}
                aria-label={showPassword ? 'Masquer le mot de passe' : 'Afficher le mot de passe'}
              >
                {showPassword ? <VisibilityOffIcon fontSize="small" /> : <VisibilityIcon fontSize="small" />}
              </button>
            </div>
            <div className="flex justify-end mt-2 text-sm">
              <Link to="/forgot-password" className="text-violet-600 hover:text-violet-700">Mot de passe oublié ?</Link>
            </div>
          </div>
          <Button
            type="submit"
            className={`w-full bg-violet-600 hover:bg-violet-700 text-white flex items-center justify-center`}
            disabled={loading}
          >
            {loading ? (
              <span className="w-5 h-5 mr-2 animate-spin border-2 border-white border-t-violet-600 rounded-full"></span>
            ) : null}
            Se connecter
          </Button>
        </form>
        <div className={`text-center text-sm ${isMobile ? 'mt-4 mb-6' : 'mt-6'}`}>
          <span className="text-neutral-600">Pas encore de compte ? </span>
          <Link to="/register" className="text-violet-600 hover:text-violet-700">
            S'inscrire
          </Link>
        </div>
      </Card>
    </div>
  );
}
