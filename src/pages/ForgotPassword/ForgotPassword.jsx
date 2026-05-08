import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Card } from '../../components/ui/card';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Button } from '../../components/ui/button';
import usePageTitle from '../../utils/usePageTitle.jsx';
import { toast } from 'sonner';
import LogoImage from '../../assets/logo/logo.png';
import { forgotPassword } from '../../services/auth.service';

const ForgotPassword = () => {
    usePageTitle('Mot de passe oublié');
    const [userEmail, setUserEmail] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!userEmail || userEmail.trim().length === 0) {
            toast.error('Veuillez saisir votre email ou code utilisateur');
            return;
        }
        setLoading(true);
        try {
            // Try calling backend; payload key may vary depending on backend
            await forgotPassword({ userEmail: userEmail.trim() });
            toast.success("Si l'email/code est enregistré, un lien de réinitialisation a été envoyé.");
            setUserEmail('');
        } catch (err) {
            toast.error(err?.response?.data?.message || 'Erreur lors de la demande.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen w-full bg-linear-to-br from-gray-200 to-gray-300 flex flex-col items-center justify-center p-4">
            <Card className="w-full max-w-md p-8 rounded-xl border border-neutral-200 bg-neutral-100">
                <div className="flex flex-col items-center mb-6">
                    <img src={LogoImage} alt="Logo Etokisana" className="h-20 w-auto mb-4" />
                    <h1 className="text-3xl font-bold text-violet-700 mb-1">Mot de passe oublié</h1>
                    <p className="text-base text-neutral-700 text-center">Entrez votre email ou code utilisateur pour recevoir les instructions de réinitialisation.</p>
                </div>
                <form onSubmit={handleSubmit} className="space-y-5">
                    <div className="space-y-2">
                        <Label htmlFor="userEmail">Email ou code utilisateur</Label>
                        <Input id="userEmail" type="text" placeholder="votre@email.com ou code" value={userEmail} onChange={e => setUserEmail   (e.target.value)} required className="border-neutral-300" />
                    </div>
                    <Button
                        type="submit"
                        status={loading ? "loading" : "active"}
                        color="default"
                        className="w-full flex items-center justify-center"
                        disabled={loading}
                    >
                        {loading ? (
                            <span className="w-5 h-5 mr-2 animate-spin border-2 border-white border-t-violet-600 rounded-full"></span>
                        ) : null}
                        {loading ? 'Envoi...' : 'Envoyer'}
                    </Button>
                </form>
                <div className="text-center text-sm mt-6">
                    <span className="text-neutral-600">Retour à la page&nbsp;</span>
                    <Link to="/login" className="text-violet-600 hover:text-violet-700">Connexion</Link>
                </div>
            </Card>
        </div>
    );
};

export default ForgotPassword;
