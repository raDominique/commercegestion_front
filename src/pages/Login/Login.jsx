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
      // Récupérer le profil utilisateur après login
      const profile = await getProfile();
      if (profile && allowedRoles.includes(profile.userAccess)) {
        toast.success('Connexion réussie !');
        navigate('/actifs', { replace: true });
      } else {
        toast.error("Votre rôle ne permet pas d'accéder à cette application.");
      }
    } catch (error) {
      // Affiche uniquement l’erreur de l’API loginUser, jamais celle de refreshToken
      let apiMessage = error?.response?.data?.message;
      if (apiMessage) {
        toast.error(apiMessage);
      } else if (error?.message && error?.message !== 'Session expirée') {
        toast.error(error.message);
      } else {
        toast.error('Erreur de connexion');
      }
      console.log('Login error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full bg-linear-to-br from-neutral-50 to-neutral-100 flex items-center justify-center p-0">
      <Card className="w-full h-full max-w-none rounded-none p-0 border-none shadow-none overflow-hidden">
        <div className="flex flex-col md:flex-row w-full h-screen">
          {/* Left column: Branding */}
          <div className="md:w-1/2 bg-violet-50 flex flex-col items-center justify-center p-8 border-b md:border-b-0 md:border-r border-neutral-200">
            <img src={LogoImage} alt="Logo Etokisana" className="h-20 w-auto mb-6" />
            <h1 className="text-3xl font-bold text-violet-700 mb-2">Connexion</h1>
            <p className="text-base text-neutral-700 mb-6 text-center">
              Connectez-vous à votre compte <span className="font-bold text-violet-600">Etokisana</span>
            </p>
          </div>
          {/* Right column: Form */}
          <div className="md:w-1/2 p-8 flex flex-col justify-center">
            <form onSubmit={handleSubmit} className="space-y-4">
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
                className="w-full bg-violet-600 hover:bg-violet-700 text-white"
                disabled={loading}
              >
                {loading ? 'Connexion...' : 'Se connecter'}
              </Button>
            </form>
            <div className="text-center text-sm mt-6">
              <span className="text-neutral-600">Pas encore de compte ? </span>
              <Link to="/register" className="text-violet-600 hover:text-violet-700">
                S'inscrire
              </Link>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}
