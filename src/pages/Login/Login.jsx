import { useState } from 'react';
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
import { Check, KeyRound, MailCheck, Smartphone } from 'lucide-react';
import { Loader } from '../../components/ui/loader';
import { AuthShell, BrandPanel, BrandPoints, FormPanel, AuthHeader } from '../../components/commons/authLayout';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '../../components/ui/dialog';
import { InputOTP, InputOTPGroup, InputOTPSlot } from '../../components/ui/input-otp';

const inputClass =
  'h-11 rounded-md border-neutral-200 bg-neutral-50 pl-10 text-[15px] shadow-none focus-visible:border-violet-600 focus-visible:ring-0';

export default function Login() {
  usePageTitle('Connexion');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [totpToken, setTotpToken] = useState('');
  const [requiresTwoFactor, setRequiresTwoFactor] = useState(false);
  const [loginChallenge, setLoginChallenge] = useState('');
  const [availableMethods, setAvailableMethods] = useState([]);
  const [selectedMethod, setSelectedMethod] = useState('totp');
  const [emailOtpSent, setEmailOtpSent] = useState(false);
  const [emailOtpToken, setEmailOtpToken] = useState('');
  const [usingBackupCode, setUsingBackupCode] = useState(false);
  const [backupCode, setBackupCode] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [twoFactorSetup, setTwoFactorSetup] = useState(null);
  const [setupToken, setSetupToken] = useState('');
  const [setupLoading, setSetupLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const {
    login,
    completeTwoFactorLogin,
    completeBackupCodeLogin,
    twoFactorEnrollmentRequired,
    completeTwoFactorEnrollment,
  } = useAuth();
  const navigate = useNavigate();

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
    if (loginChallenge && usingBackupCode && !backupCode.trim()) {
      toast.error('Saisissez un code de secours.');
      return;
    }
    if (loginChallenge && !usingBackupCode && selectedMethod === 'totp' && totpToken.length !== 6) {
      toast.error('Saisissez le code 2FA à 6 chiffres.');
      return;
    }
    if (loginChallenge && !usingBackupCode && selectedMethod === 'email-otp' && emailOtpSent && emailOtpToken.length !== 6) {
      toast.error('Saisissez le code reçu par e-mail.');
      return;
    }
    if (!loginChallenge && requiresTwoFactor && totpToken.length !== 6) {
      toast.error('Saisissez le code 2FA à 6 chiffres.');
      return;
    }
    setLoading(true);
    try {
      if (loginChallenge) {
        if (usingBackupCode) {
          const profile = await completeBackupCodeLogin(loginChallenge, backupCode.trim(), rememberMe);
          finishLogin(profile);
        } else if (selectedMethod === 'email-otp' && !emailOtpSent) {
          await requestEmailOtp(loginChallenge);
          setEmailOtpSent(true);
          toast.success('Un code de vérification a été envoyé par e-mail.');
        } else {
          const factor = selectedMethod === 'email-otp'
            ? { emailOtpToken }
            : { totpToken };
          const profile = await completeTwoFactorLogin(loginChallenge, factor, rememberMe);
          finishLogin(profile);
        }
      } else {
        const result = await login(email, password, rememberMe, requiresTwoFactor ? totpToken : undefined);
        if (result?.loginChallenge) {
          const methods = (Array.isArray(result.methods) ? result.methods : ['totp'])
            .map((method) => String(method).toLowerCase())
            .map((method) => method === 'email' ? 'email-otp' : method)
            .filter((method) => method === 'totp' || method === 'email-otp');
          const supportedMethods = methods.length ? methods : ['totp'];
          setLoginChallenge(result.loginChallenge);
          setAvailableMethods(supportedMethods);
          setSelectedMethod(supportedMethods.includes('totp') ? 'totp' : supportedMethods[0]);
          setEmailOtpSent(false);
          setEmailOtpToken('');
          setTotpToken('');
          setUsingBackupCode(false);
          setPassword('');
          toast.info('Choisissez une méthode pour terminer votre connexion.');
        } else if (result?.require2faSetup) {
          setPassword('');
          toast.info('Configurez l’authentification à deux facteurs pour continuer.');
        } else {
          finishLogin(result);
        }
      }
    } catch (error) {
      console.error('Erreur de connexion:', error);
      const apiMessage = error?.response?.data?.message;
      const responseData = error?.response?.data;
      const url = error?.config?.url;
      const message = Array.isArray(apiMessage) ? apiMessage.join(' ') : String(apiMessage || '');
      const twoFactorRequired = message === 'Code 2FA requis'
        || responseData?.requiresTwoFactor
        || responseData?.twoFactorRequired
        || responseData?.code === 'TWO_FACTOR_REQUIRED'
        || /(?:totp|2fa|two.factor).*(?:required|requis)|(?:required|requis).*(?:totp|2fa|two.factor)/i.test(message);
      if (twoFactorRequired && !requiresTwoFactor && !loginChallenge) {
        setRequiresTwoFactor(true);
        setTotpToken('');
        toast.info('Saisissez le code généré par votre application d’authentification.');
        return;
      }
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
      await requestEmailOtp(loginChallenge);
      toast.success('Un nouveau code de vérification a été envoyé.');
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
          title={loginChallenge ? 'Vérifiez votre identité' : requiresTwoFactor ? 'Vérification en deux étapes' : 'Bon retour parmi nous'}
          subtitle={
            loginChallenge
              ? 'Une dernière étape pour accéder à votre compte. Choisissez comment confirmer votre identité.'
              : requiresTwoFactor
                ? 'Saisissez le code à six chiffres de votre application d’authentification pour terminer votre connexion.'
              : <>
                  Connectez-vous à votre compte <span className="font-semibold text-violet-700">Etokisana</span> pour reprendre votre activité.
                </>
          }
        />

        <form onSubmit={handleSubmit} className="space-y-5">
          {!requiresTwoFactor && !loginChallenge && <div className="space-y-2">
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

          {(requiresTwoFactor || loginChallenge) && (
            <div className="space-y-2">
              {loginChallenge && (
                <div className="mb-5 flex items-center justify-between border border-violet-100 bg-violet-50/70 px-4 py-3">
                  <div className="flex items-center gap-3">
                    <span className="flex size-9 items-center justify-center rounded-full bg-white text-violet-700 ring-1 ring-violet-100">
                      <LockOutlinedIcon fontSize="small" />
                    </span>
                    <div>
                      <p className="text-sm font-semibold text-neutral-900">Connexion protégée</p>
                      <p className="text-xs text-neutral-500">Mot de passe confirmé · vérification 2FA requise</p>
                    </div>
                  </div>
                  <span className="shrink-0 rounded-full bg-white px-2.5 py-1 text-[11px] font-semibold text-violet-700 ring-1 ring-violet-100">
                    Étape 2 sur 2
                  </span>
                </div>
              )}
              <div className="flex items-center justify-between">
                <button
                  type="button"
                  className="ml-auto rounded-md text-xs font-semibold text-violet-700 hover:text-violet-800 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500 focus-visible:ring-offset-2"
                  onClick={() => {
                    setRequiresTwoFactor(false);
                    setLoginChallenge('');
                    setTotpToken('');
                    setEmailOtpToken('');
                    setBackupCode('');
                    setEmailOtpSent(false);
                    setUsingBackupCode(false);
                  }}
                >
                  Utiliser un autre compte
                </button>
              </div>
              {loginChallenge && !usingBackupCode && (
                <>
                <p className="text-sm font-semibold text-neutral-800">Choisissez une méthode de vérification</p>
                <div className="grid gap-3 sm:grid-cols-2" role="group" aria-label="Choisir une méthode de vérification">
                  {(availableMethods.length ? availableMethods : ['totp']).map((method) => {
                    const value = String(method).toLowerCase();
                    const isEmail = value === 'email-otp' || value === 'email';
                    const normalized = isEmail ? 'email-otp' : 'totp';
                    const label = isEmail ? 'E-mail' : 'Application mobile';
                    const description = isEmail
                      ? 'Recevez un code temporaire à votre adresse vérifiée.'
                      : 'Utilisez le code généré par Google Authenticator, Authy ou une app similaire.';
                    const Icon = isEmail ? MailCheck : Smartphone;
                    const selected = selectedMethod === normalized;
                    return (
                      <Button
                        key={value}
                        type="button"
                        variant="outline"
                        aria-pressed={selected}
                        className={`group relative h-auto min-h-[112px] w-full items-start justify-start whitespace-normal rounded-xl border-2 p-4 text-left transition-colors ${
                          selected
                            ? 'border-violet-600 bg-violet-50 text-neutral-900 hover:bg-violet-50'
                            : 'border-neutral-200 bg-white text-neutral-700 hover:border-violet-300 hover:bg-neutral-50'
                        }`}
                        onClick={() => {
                          setSelectedMethod(normalized);
                          setEmailOtpSent(false);
                          setEmailOtpToken('');
                          setTotpToken('');
                        }}
                      >
                        <span className={`flex size-10 shrink-0 items-center justify-center rounded-lg ${
                          selected ? 'bg-violet-600 text-white' : 'bg-neutral-100 text-neutral-500 group-hover:bg-violet-100 group-hover:text-violet-700'
                        }`}>
                          <Icon size={19} aria-hidden="true" />
                        </span>
                        <span className="min-w-0 flex-1 self-center">
                          <span className="block text-sm font-semibold">{label}</span>
                          <span className="mt-1 block text-xs font-normal leading-relaxed text-neutral-500">{description}</span>
                        </span>
                        <span className={`flex size-5 shrink-0 items-center justify-center rounded-full border ${
                          selected ? 'border-violet-600 bg-violet-600 text-white' : 'border-neutral-300 bg-white text-transparent'
                        }`}>
                          <Check size={12} strokeWidth={3} aria-hidden="true" />
                        </span>
                      </Button>
                    );
                  })}
                </div>
                </>
              )}
              {loginChallenge && !usingBackupCode && (
                <p className="pt-1 text-xs text-neutral-500">
                  {selectedMethod === 'email-otp'
                    ? 'Le code expire après quelques minutes. Vérifiez également vos courriers indésirables.'
                    : 'Votre code change régulièrement et ne peut être utilisé qu’une seule fois.'}
                </p>
              )}
              {usingBackupCode ? (
                <>
                  <Label htmlFor="backupCode">Code de secours</Label>
                  <Input
                    id="backupCode"
                    value={backupCode}
                    onChange={(event) => setBackupCode(event.target.value)}
                    autoComplete="one-time-code"
                    autoFocus
                    required
                    placeholder="Code de secours"
                  />
                </>
              ) : selectedMethod === 'email-otp' && loginChallenge ? (
                emailOtpSent ? (
                  <>
                    <Label htmlFor="totpToken">Code reçu par e-mail</Label>
                    <InputOTP
                      id="totpToken"
                      value={emailOtpToken}
                      onChange={(value) => setEmailOtpToken(value.replace(/\D/g, '').slice(0, 6))}
                      autoComplete="one-time-code"
                      maxLength={6}
                      autoFocus
                      aria-label="Code reçu par e-mail à six chiffres"
                    >
                      <InputOTPGroup className="gap-2">
                        {Array.from({ length: 6 }, (_, index) => <InputOTPSlot key={index} index={index} className="h-11 w-11 rounded-md border text-lg" />)}
                      </InputOTPGroup>
                    </InputOTP>
                    <button
                      type="button"
                      className="text-xs font-semibold text-violet-700 hover:text-violet-800 hover:underline disabled:opacity-50"
                      onClick={resendEmailOtp}
                      disabled={loading}
                    >
                      Renvoyer le code
                    </button>
                  </>
                ) : (
                  <p className="text-xs text-neutral-500">Un code à usage unique sera envoyé à votre adresse e-mail vérifiée.</p>
                )
              ) : (
                <>
                  {(!loginChallenge || selectedMethod !== 'email-otp') && (
                    <Label htmlFor="totpToken">Code d’authentification</Label>
                  )}
                  <InputOTP
                    id="totpToken"
                    value={totpToken}
                    onChange={(value) => setTotpToken(value.replace(/\D/g, '').slice(0, 6))}
                    autoComplete="one-time-code"
                    maxLength={6}
                    autoFocus
                    aria-label="Code d’authentification à six chiffres"
                  >
                    <InputOTPGroup className="gap-2">
                      {Array.from({ length: 6 }, (_, index) => <InputOTPSlot key={index} index={index} className="h-11 w-11 rounded-md border text-lg" />)}
                    </InputOTPGroup>
                  </InputOTP>
                  <p className="text-xs text-neutral-500">Ouvrez Google Authenticator, Authy ou votre application équivalente.</p>
                </>
              )}
              {loginChallenge && !usingBackupCode && (
                <button
                  type="button"
                  className="inline-flex items-center gap-2 rounded-md py-1 text-sm font-medium text-neutral-600 transition-colors hover:text-violet-700 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500 focus-visible:ring-offset-2"
                  onClick={() => { setUsingBackupCode(true); setBackupCode(''); }}
                >
                  <KeyRound size={15} aria-hidden="true" />
                  Utiliser un code de secours
                </button>
              )}
              {usingBackupCode && (
                <button
                  type="button"
                  className="inline-flex items-center gap-2 rounded-md py-1 text-sm font-medium text-violet-700 transition-colors hover:text-violet-800 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500 focus-visible:ring-offset-2"
                  onClick={() => { setUsingBackupCode(false); setBackupCode(''); }}
                >
                  ← Revenir aux méthodes de vérification
                </button>
              )}
            </div>
          )}

          {!requiresTwoFactor && !loginChallenge && <div className="space-y-2">
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

          {!requiresTwoFactor && !loginChallenge && (
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
            disabled={loading}
          >
            {loading && <Loader size="sm" className="border-white border-t-transparent shrink-0" />}
            {loginChallenge && selectedMethod === 'email-otp' && !emailOtpSent && !usingBackupCode
              ? 'Envoyer le code'
              : requiresTwoFactor || loginChallenge
                ? 'Vérifier le code'
                : 'Se connecter'}
          </Button>
        </form>

        {!requiresTwoFactor && !loginChallenge && <>
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
