import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import usePageTitle from '../../utils/usePageTitle.jsx';
import { useAuth } from '../../context/AuthContext.jsx';
import { Button } from '../../components/ui/button.jsx';
import { Card } from '../../components/ui/card.jsx';
import { Input } from '../../components/ui/input.jsx';
import { Label } from '../../components/ui/label.jsx';
import { toast } from 'sonner';
import LogoImage from '../../assets/logo/logo.png';

const Register = () => {
  usePageTitle('Inscription');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      toast.error('Les mots de passe ne correspondent pas');
      return;
    }

    setLoading(true);

    try {
      await register(email, password, name);
      toast.success('Inscription réussie !');
      navigate('/actifs');
    } catch (error) {
      toast.error("Erreur lors de l'inscription");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-linear-to-br from-neutral-50 to-neutral-100 flex items-center justify-center p-4">
      <Card className="w-full max-w-md p-8 border-neutral-200">
        <div className="space-y-6">
          <div className="space-y-2 text-center">
            <div className="flex justify-center mb-4">
              <img src={LogoImage} alt="Logo Etokisana" className="h-16 w-auto" />
            </div>
            <h1 className="text-2xl text-neutral-900">Créer un compte</h1>
            <p className="text-sm text-neutral-600">
              Rejoignez <span className="font-bold text-violet-600">Etokisana</span> dès aujourd'hui
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nom complet</Label>
              <Input
                id="name"
                type="text"
                placeholder="Jean Dupont"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="border-neutral-300"
              />
            </div>

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

            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirmer le mot de passe</Label>
              <Input
                id="confirmPassword"
                type="password"
                placeholder="••••••••"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                className="border-neutral-300"
              />
            </div>

            <Button
              type="submit"
              className="w-full bg-violet-600 hover:bg-violet-700 text-white"
              disabled={loading}
            >
              {loading ? 'Inscription...' : "S'inscrire"}
            </Button>
          </form>

          <div className="text-center text-sm">
            <span className="text-neutral-600">Déjà un compte ? </span>
            <Link to="/login" className="text-violet-600 hover:text-violet-700">
              Se connecter
            </Link>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default Register;
