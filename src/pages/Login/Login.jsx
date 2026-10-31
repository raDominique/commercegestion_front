import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { enableTwoFactor, requestEmailOtp, verifyTwoFactor } from '../../services/auth.service';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Checkbox } from '../../components/ui/checkbox';
import { toast } from 'sonner';
import usePageTitle from '../../utils/usePageTitle';
import VisibilityIcon from '@mui/icons-material/Visibility';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import MailOutlinedIcon from '@mui/icons-material/MailOutlined';
import { MailCheck, ShieldCheck } from 'lucide-react';
import { Loader } from '../../components/ui/loader';
import { AuthShell, BrandPanel, BrandPoints, FormPanel, AuthHeader } from '../../components/commons/authLayout';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '../../components/ui/dialog';
import { InputOTP, InputOTPGroup, InputOTPSlot } from '../../components/ui/input-otp';

const inputClass =
  'h-11 rounded-md border-neutral-200 bg-neutral-50 pl-10 text-[15px] shadow-none focus-visible:border-violet-600 focus-visible:ring-0';
const EMAIL_REQUEST_COOLDOWN_MS = 2 * 60 * 1000;

export default function Login() {
  usePageTitle('Connexion');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [totpToken, setTotpToken] = useState('');
  const [loginChallenge, setLoginChallenge] = useState('');
  const [emailChallengeToken, setEmailChallengeToken] = useState('');
  const [emailOtpToken, setEmailOtpToken] = useState('');
  const [emailRequestCooldownUntil, setEmailRequestCooldownUntil] = useState(null);
  const [emailRequestCooldown, setEmailRequestCooldown] = useState(0);
  const [rememberMe, setRememberMe] = useState(false);
  const [availableMethods, setAvailableMethods] = useState([]);
  const [selectedFactor, setSelectedFactor] = useState('totp');
  const [twoFactorSetup, setTwoFactorSetup] = useState(null);
  const [setupToken, setSetupToken] = useState('');
  const [setupLoading, setSetupLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const {
    login,
    verifyLoginTotp,
    completeLoginChallenge,
    completeEmailOtpLogin,
    twoFactorEnrollmentRequired,
    completeTwoFactorEnrollment,
  } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!emailRequestCooldownUntil) {
      setEmailRequestCooldown(0);
      return undefined;
    }

    const updateCountdown = () => {
      const remaining = Math.max(0, Math.ceil((emailRequestCooldownUntil - Date.now()) / 1000));
      setEmailRequestCooldown(remaining);
      if (remaining === 0) setEmailRequestCooldownUntil(null);
    };

    updateCountdown();
    const intervalId = window.setInterval(updateCountdown, 1000);
    return () => window.clearInterval(intervalId);
  }, [emailRequestCooldownUntil]);

  const sendEmailOtp = async (challengeToken) => {
    try {
      const challenge = await requestEmailOtp(challengeToken);
      const token = challenge?.emailChallengeToken
        || challenge?.challengeToken
        || challenge?.loginChallenge
        || challengeToken;
      setEmailChallengeToken(token);
      setEmailOtpToken('');
      setEmailRequestCooldownUntil(null);
    } catch (error) {
      setEmailRequestCooldownUntil(Date.now() + EMAIL_REQUEST_COOLDOWN_MS);
      throw error;
    }
  };

  const selectFactor = async (method) => {
    setSelectedFactor(method);
    setTotpToken('');
    setEmailOtpToken('');

    if (method !== 'email-otp') {
      setEmailChallengeToken('');
      return;
    }

    if (emailChallengeToken || emailRequestCooldown > 0) return;

    setLoading(true);
    try {
      await sendEmailOtp(loginChallenge);
      toast.success('Un code de vérification a été envoyé par e-mail.');
    } catch (error) {
      toast.error(error?.response?.data?.message || 'Impossible d’envoyer le code de vérification.');
    } finally {
      setLoading(false);
    }
  };

  const allowedRoles = ['Utilisateur', 'Moderateur', 'Admin'];
  const finishLogin = (profile) => {
    if (profile && allowedRoles.includes(profile.userAccess)) {
      if (profile.twoFactorEnabled === true) {
        toast.success('Connexion réussie !');
        navigate('/dashboard', { replace: true });
      }
    } else {
      toast.error("Votre rôle ne permet pas d'accéder à cette application.");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (loginChallenge && selectedFactor === 'totp' && totpToken.length !== 6) {
      toast.error('Saisissez le code Authenticator à 6 chiffres.');
      return;
    }
    if (loginChallenge && selectedFactor === 'email-otp' && emailChallengeToken && emailOtpToken.length !== 6) {
      toast.error('Saisissez le code reçu par e-mail.');
      return;
    }
    if (loginChallenge && selectedFactor === 'email-otp' && !emailChallengeToken && emailRequestCooldown > 0) return;
    setLoading(true);
    try {
      if (loginChallenge) {
        if (selectedFactor === 'email-otp') {
          if (!emailChallengeToken) {
            await sendEmailOtp(loginChallenge);
            toast.success('Un code de vérification a été envoyé par e-mail.');
            return;
          }
          const profile = await completeEmailOtpLogin(emailChallengeToken, emailOtpToken, rememberMe);
          finishLogin(profile);
          return;
        }

        const result = await verifyLoginTotp(loginChallenge, totpToken);
        if (result?.accessToken) {
          const profile = await completeLoginChallenge(result);
          finishLogin(profile);
          return;
        }

        if (result?.emailChallengeToken || result?.challengeToken || result?.requireEmailOtp) {
          const challengeToken = result.emailChallengeToken || result.challengeToken || loginChallenge;
          setEmailChallengeToken(challengeToken);
          setSelectedFactor('email-otp');
          setTotpToken('');
          setEmailOtpToken('');
          toast.success('Code Authenticator validé. Saisissez maintenant le code reçu par e-mail.');
          return;
        }

        throw new Error('Le serveur n’a pas confirmé la validation du second facteur.');
      }

      const result = await login(email, password, rememberMe);
      if (result?.require2FA || result?.loginChallenge) {
        const methods = Array.isArray(result.methods) && result.methods.length > 0
          ? result.methods
          : ['totp', 'email-otp'];
        setAvailableMethods(methods);
        setSelectedFactor(methods.includes('totp') ? 'totp' : methods[0]);
        setLoginChallenge(result.loginChallenge || '');
        setEmailChallengeToken('');
        setEmailRequestCooldownUntil(null);
        setEmailOtpToken('');
        setTotpToken('');
        setPassword('');
        toast.info(methods.includes('totp') ? 'Choisissez votre facteur de vérification pour terminer la connexion.' : 'Un code de vérification a été préparé pour votre e-mail.');
      } else if (result?.require2faSetup) {
        setPassword('');
        toast.info('Configurez l’authentification à deux facteurs pour continuer.');
      } else {
        finishLogin(result);
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

  const resendEmailOtp = async () => {
    setLoading(true);
    try {
      await sendEmailOtp(emailChallengeToken || loginChallenge);
      toast.success('Un nouveau code de vérification a été envoyé par e-mail.');
    } catch (error) {
      toast.error(error?.response?.data?.message || 'Impossible de renvoyer le code de vérification.');
    } finally {
      setLoading(false);
    }
  };

  const startTwoFactorSetup = async () => {
    setSetupLoading(true);
    try {
      const data = await enableTwoFactor();
      setTwoFactorSetup(data);
      setSetupToken('');
    } catch (error) {
      toast.error(error?.response?.data?.message || 'Impossible de préparer l’authentification à deux facteurs');
    } finally {
      setSetupLoading(false);
    }
  };

  const confirmTwoFactorSetup = async (event) => {
    event.preventDefault();
    setSetupLoading(true);
    try {
      await verifyTwoFactor(setupToken, rememberMe);
      await completeTwoFactorEnrollment();
      setTwoFactorSetup(null);
      toast.success('Authentification à deux facteurs activée.');
      navigate('/dashboard', { replace: true });
    } catch (error) {
      toast.error(error?.response?.data?.message || 'Code d’authentification invalide');
    } finally {
      setSetupLoading(false);
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
          title={loginChallenge ? 'Vérifiez votre identité' : 'Bon retour parmi nous'}
          subtitle={
            loginChallenge
              ? selectedFactor === 'email-otp'
                ? emailChallengeToken
                  ? 'Saisissez le code à six chiffres envoyé à votre adresse e-mail pour terminer votre connexion.'
                  : 'Un code sécurisé va vous être envoyé par e-mail pour finaliser l’accès.'
                : emailChallengeToken
                  ? 'Le code Authenticator est validé. Saisissez maintenant le code reçu par e-mail.'
                  : 'Choisissez votre facteur de vérification et saisissez le code correspondant.'
              : <>
                  Connectez-vous à votre compte <span className="font-semibold text-violet-700">Etokisana</span> pour reprendre votre activité.
                </>
          }
        />

        <form onSubmit={handleSubmit} className="space-y-5">
          {!loginChallenge && <div className="space-y-2">
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
          </div>}

          {loginChallenge && (
            <section className="space-y-5" aria-labelledby="two-factor-step-title">
              <div className="flex items-center justify-between border border-violet-100 bg-violet-50/70 px-4 py-3">
                <div className="flex items-center gap-3">
                  <span className="flex size-9 items-center justify-center rounded-full bg-white text-violet-700 ring-1 ring-violet-100">
                    {emailChallengeToken
                      ? <MailCheck size={18} aria-hidden="true" />
                      : <ShieldCheck size={18} aria-hidden="true" />}
                  </span>
                  <div>
                    <p className="text-sm font-semibold text-neutral-900">Connexion protégée</p>
                    <p className="text-xs text-neutral-500">Votre mot de passe a été confirmé</p>
                  </div>
                </div>
                <span className="shrink-0 rounded-full bg-white px-2.5 py-1 text-[11px] font-semibold text-violet-700 ring-1 ring-violet-100">
                  Étape {emailChallengeToken ? '3' : '2'} sur 3
                </span>
              </div>

              {availableMethods.length > 1 && (
                <div className="space-y-2">
                  <p className="text-sm font-medium text-neutral-700">Choisir le facteur</p>
                  <div className="grid gap-2 sm:grid-cols-2">
                    {availableMethods.map((method) => {
                      const isSelected = selectedFactor === method;
                      const label = method === 'totp' ? 'Code Authenticator' : 'Code par e-mail';
                      return (
                        <button
                          key={method}
                          type="button"
                          onClick={() => selectFactor(method)}
                          disabled={loading}
                          className={`rounded-md border px-3 py-2 text-left text-sm transition ${isSelected ? 'border-violet-500 bg-violet-50 text-violet-800' : 'border-neutral-200 bg-white text-neutral-600 hover:border-violet-200'}`}
                        >
                          {label}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              <div>
                <h3 id="two-factor-step-title" className="text-sm font-semibold text-neutral-900">
                  {selectedFactor === 'email-otp' ? 'Vérification par e-mail' : 'Vérification Authenticator'}
                </h3>
                <p className="mt-1 text-sm leading-relaxed text-neutral-500">
                  {selectedFactor === 'email-otp'
                    ? emailChallengeToken
                      ? 'Saisissez le code à usage unique envoyé à votre adresse e-mail.'
                      : 'Le code de vérification vous sera envoyé rapidement par e-mail.'
                    : 'Ouvrez Google Authenticator, Authy ou une application compatible et saisissez le code affiché.'}
                </p>
              </div>

              {(selectedFactor === 'totp' || !emailChallengeToken) && selectedFactor !== 'email-otp' ? (
                <div className="space-y-2">
                  <Label htmlFor="totpToken">Code Authenticator</Label>
                  <InputOTP
                    id="totpToken"
                    value={totpToken}
                    onChange={(value) => setTotpToken(value.replace(/\D/g, '').slice(0, 6))}
                    autoComplete="one-time-code"
                    maxLength={6}
                    aria-label="Code Authenticator à six chiffres"
                  >
                    <InputOTPGroup className="gap-2">
                      {Array.from({ length: 6 }, (_, index) => <InputOTPSlot key={index} index={index} className="h-11 w-11 rounded-md border text-lg" />)}
                    </InputOTPGroup>
                  </InputOTP>
                </div>
              ) : (
                <div className="space-y-2">
                  <Label htmlFor="emailOtpToken">Code reçu par e-mail</Label>
                  <InputOTP
                    id="emailOtpToken"
                    value={emailOtpToken}
                    onChange={(value) => setEmailOtpToken(value.replace(/\D/g, '').slice(0, 6))}
                    autoComplete="one-time-code"
                    maxLength={6}
                    aria-label="Code reçu par e-mail à six chiffres"
                  >
                    <InputOTPGroup className="gap-2">
                      {Array.from({ length: 6 }, (_, index) => <InputOTPSlot key={index} index={index} className="h-11 w-11 rounded-md border text-lg" />)}
                    </InputOTPGroup>
                  </InputOTP>
                  <p className="text-xs text-neutral-500" role="status" aria-live="polite">
                    {emailRequestCooldown > 0
                      ? `Nouvelle tentative possible dans ${String(Math.floor(emailRequestCooldown / 60)).padStart(2, '0')}:${String(emailRequestCooldown % 60).padStart(2, '0')}.`
                      : emailChallengeToken
                        ? 'Le code expire dans 10 minutes. Vérifiez vos courriers indésirables si besoin.'
                        : loading ? 'Envoi du code en cours…' : 'Un code vous sera envoyé par e-mail.'}
                  </p>
                  <button
                    type="button"
                    className="text-xs font-semibold text-violet-700 hover:text-violet-800 hover:underline disabled:opacity-50"
                    onClick={resendEmailOtp}
                    disabled={loading || emailRequestCooldown > 0}
                  >
                    Renvoyer le code
                  </button>
                </div>
              )}

              <button
                type="button"
                className="rounded-md text-xs font-semibold text-violet-700 hover:text-violet-800 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500 focus-visible:ring-offset-2"
                onClick={() => {
                  setLoginChallenge('');
                  setEmailChallengeToken('');
                  setEmailRequestCooldownUntil(null);
                  setAvailableMethods([]);
                  setSelectedFactor('totp');
                  setTotpToken('');
                  setEmailOtpToken('');
                  setPassword('');
                }}
              >
                Utiliser un autre compte
              </button>
            </section>
          )}

          {!loginChallenge && <div className="space-y-2">
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
          </div>}

          {!loginChallenge && (
            <label htmlFor="rememberMe" className="flex items-center gap-2 text-sm text-neutral-600">
              <Checkbox
                id="rememberMe"
                checked={rememberMe}
                onCheckedChange={setRememberMe}
              />
              Se souvenir de moi
            </label>
          )}

          <Button
            type="submit"
            status={loading ? 'loading' : 'active'}
            className="h-11 w-full rounded-md text-[15px] font-semibold shadow-none"
            disabled={loading || (loginChallenge && selectedFactor === 'email-otp' && !emailChallengeToken && emailRequestCooldown > 0)}
          >
            {loading && <Loader size="sm" className="border-white border-t-transparent shrink-0" />}
            {loginChallenge
              ? selectedFactor === 'email-otp'
                ? emailChallengeToken ? 'Valider le code e-mail' : 'Envoyer le code par e-mail'
                : 'Valider le code Authenticator'
              : 'Se connecter'}
          </Button>
        </form>

        {!loginChallenge && <>
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
        </>}
      </FormPanel>
      <Dialog open={twoFactorEnrollmentRequired}>
        <DialogContent onPointerDownOutside={(event) => event.preventDefault()} onEscapeKeyDown={(event) => event.preventDefault()}>
          <DialogHeader>
            <DialogTitle>Protégez votre compte avec la 2FA</DialogTitle>
            <DialogDescription>Avant d’accéder à votre espace, activez l’authentification à deux facteurs avec Google Authenticator, Authy ou une application compatible.</DialogDescription>
          </DialogHeader>
          {!twoFactorSetup ? (
            <div className="space-y-4">
              <p className="text-sm text-neutral-600">Cette protection demandera un code temporaire lors de chaque connexion.</p>
              <DialogFooter>
                <Button type="button" onClick={startTwoFactorSetup} disabled={setupLoading}>
                  {setupLoading && <Loader size="sm" className="border-white border-t-transparent shrink-0" />}
                  Activer maintenant
                </Button>
              </DialogFooter>
            </div>
          ) : (
            <form onSubmit={confirmTwoFactorSetup} className="space-y-4">
              {twoFactorSetup.qrCodeDataUrl && <img src={twoFactorSetup.qrCodeDataUrl} alt="QR code de configuration 2FA" className="mx-auto h-48 w-48" />}
              {twoFactorSetup.secret && <p className="break-all rounded bg-neutral-100 p-3 text-center font-mono text-sm">Clé manuelle : {twoFactorSetup.secret}</p>}
              <div className="space-y-2">
                <Label htmlFor="enrollment-totp">Code à 6 chiffres</Label>
                <InputOTP
                  id="enrollment-totp"
                  value={setupToken}
                  onChange={(value) => setSetupToken(value.replace(/\D/g, '').slice(0, 6))}
                  autoComplete="one-time-code"
                  maxLength={6}
                  autoFocus
                  aria-label="Code de confirmation à six chiffres"
                >
                  <InputOTPGroup className="gap-2">
                    {Array.from({ length: 6 }, (_, index) => <InputOTPSlot key={index} index={index} className="h-11 w-11 rounded-md border text-lg" />)}
                  </InputOTPGroup>
                </InputOTP>
              </div>
              <DialogFooter>
                <Button type="submit" disabled={setupLoading}>
                  {setupLoading && <Loader size="sm" className="border-white border-t-transparent shrink-0" />}
                  Confirmer l’activation
                </Button>
              </DialogFooter>
            </form>
          )}
        </DialogContent>
      </Dialog>
    </AuthShell>
  );
}
