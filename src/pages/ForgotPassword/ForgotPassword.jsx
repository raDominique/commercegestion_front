import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Button } from '../../components/ui/button';
import usePageTitle from '../../utils/usePageTitle.jsx';
import { toast } from 'sonner';
import MailOutlinedIcon from '@mui/icons-material/MailOutlined';
import { forgotPassword } from '../../services/auth.service';
import { Loader } from '../../components/ui/loader';
import { AuthShell, BrandPanel, BrandPoints, FormPanel, AuthHeader } from '../../components/commons/authLayout';

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
        <AuthShell>
            <BrandPanel
                eyebrow="Assistance"
                title="Retrouvez l’accès à votre compte."
                subtitle="Saisissez votre e-mail ou votre code utilisateur : nous vous envoyons un lien de réinitialisation sécurisé."
            >
                <BrandPoints
                    points={[
                        { title: 'Lien sécurisé', text: 'Valable une courte durée, à usage unique.' },
                        { title: 'Simple et rapide', text: 'Deux minutes suffisent pour repartir.' },
                    ]}
                />
            </BrandPanel>
            <FormPanel>
                <AuthHeader
                    title="Mot de passe oublié"
                    subtitle="Entrez votre e-mail ou code utilisateur pour recevoir les instructions de réinitialisation."
                />
                <form onSubmit={handleSubmit} className="space-y-5">
                    <div className="space-y-2">
                        <Label htmlFor="userEmail">Email ou code utilisateur</Label>
                        <div className="relative">
                            <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400">
                                <MailOutlinedIcon fontSize="small" />
                            </span>
                            <Input
                                id="userEmail"
                                type="text"
                                placeholder="votre@email.com ou code"
                                value={userEmail}
                                onChange={e => setUserEmail(e.target.value)}
                                required
                                className="h-11 rounded-md border-neutral-200 bg-neutral-50 pl-10 shadow-none focus-visible:border-violet-600 focus-visible:ring-0"
                            />
                        </div>
                    </div>
                    <Button
                        type="submit"
                        status={loading ? "loading" : "active"}
                        className="h-11 w-full rounded-md font-semibold shadow-none"
                        disabled={loading}
                    >
                        {loading && <Loader size="sm" className="border-white border-t-transparent shrink-0" />}
                        Envoyer le lien
                    </Button>
                </form>
                <div className="mt-6 border border-neutral-200 bg-neutral-50 px-4 py-3.5 text-center text-sm text-neutral-600">
                    Retour à la page&nbsp;
                    <Link to="/login" className="font-semibold text-violet-700 hover:text-violet-800 hover:underline">Connexion</Link>
                </div>
            </FormPanel>
        </AuthShell>
    );
};

export default ForgotPassword;
