import { useState } from 'react';
import { Squelette } from '../../components/ui/skeleton.jsx';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { getProfile } from '../../services/auth.service';
import { Button } from '../../components/ui/button';
import { Card } from '../../components/ui/card';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { toast } from 'sonner';
import usePageTitle from '../../utils/usePageTitle';
import LogoImage from '../../assets/logo/logo.png';


export default function Login() {
  usePageTitle('Connexion');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
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
        navigate('/actifs', { replace: true });
      } else {
        toast.error("Votre rôle ne permet pas d'accéder à cette application.");
      }
    } catch (error) {
      // Si la requête est bien celle du login (et pas du refresh)
      if (error?.config?.url?.includes('/auth/login')) {
        const apiMessage = error?.response?.data?.message;
        if (apiMessage) {
          toast.error(apiMessage);
        } else {
          toast.error('Identifiants invalides. Veuillez vérifier votre e-mail et votre mot de passe puis réessayer.');
        }
      } else if (error?.config?.url?.includes('/auth/refresh')) {
        // Erreur de refresh, ne pas afficher le message login
        toast.error('Session expirée, veuillez vous reconnecter.');
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
    <div className="min-h-screen w-full bg-linear-to-br from-neutral-50 to-neutral-100 flex flex-col items-center justify-center p-4">
      {/* Branding above the card */}
      <div className="flex flex-col items-center mb-8">
        <img src={LogoImage} alt="Logo Etokisana" className="h-20 w-auto mb-4" />
        <h1 className="text-3xl font-bold text-violet-700 mb-1">Connexion</h1>
        <p className="text-base text-neutral-700 text-center">
          Connectez-vous à votre compte <span className="font-bold text-violet-600">Etokisana</span>
        </p>
      </div>
      {/* Card with login form */}
      <Card className="w-full max-w-md p-8 rounded-xl border border-neutral-200 bg-neutral-100">
        <form onSubmit={handleSubmit} className="space-y-5">
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
            <Input
              id="password"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="border-neutral-300"
            />
          </div>
          <Button
            type="submit"
            className="w-full bg-violet-600 hover:bg-violet-700 text-white flex items-center justify-center"
            disabled={loading}
          >
            {loading ? (
              <span className="w-5 h-5 mr-2 animate-spin border-2 border-white border-t-violet-600 rounded-full"></span>
            ) : null}
            Se connecter
          </Button>
        </form>
        <div className="text-center text-sm mt-6">
          <span className="text-neutral-600">Pas encore de compte ? </span>
          <Link to="/register" className="text-violet-600 hover:text-violet-700">
            S'inscrire
          </Link>
        </div>
      </Card>
    </div>
  );
}
