import { useState, useEffect } from 'react';
import VisibilityIcon from '@mui/icons-material/Visibility';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import PersonOutlinedIcon from '@mui/icons-material/PersonOutlined';
import BusinessOutlinedIcon from '@mui/icons-material/BusinessOutlined';
import UploadOutlinedIcon from '@mui/icons-material/UploadOutlined';
import { maskUppercase, maskFirstname } from '../../utils/inputMasks.js';
import {
  validateUserType,
  validateUserNickName,
  validateUserName,
  validateUserFirstname,
  validateUserDateOfBirth,
  validateUserEmail,
  validateUserPassword,
  validateUserPhone,
  validateUserAddress,
  validateUserMainLat,
  validateUserMainLng,
  validateDocumentType,
  validateIdentityCardNumber,
  validateAvatar,
  validateDocuments,
  validateLogo,
  validateCarteStat,
  validateCarteFiscal
} from '../../utils/registerFieldControl.js';
import GoogleMapPicker from '../../components/ui/GoogleMapPicker.jsx';
import { Link, useNavigate } from 'react-router-dom';
import usePageTitle from '../../utils/usePageTitle.jsx';
import { Button } from '../../components/ui/button.jsx';
import { toast } from 'sonner';
import { Input } from '../../components/ui/input.jsx';
import PhoneInput from 'react-phone-input-2';
import 'react-phone-input-2/lib/style.css';
import { Label } from '../../components/ui/label.jsx';
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from '../../components/ui/select';
import { createUser } from '../../services/auth.service.js';
import { getAllUsersSelect } from '../../services/user.service';
import { Loader } from '../../components/ui/loader';
import { AuthShell, BrandPanel, FormPanel, AuthHeader, AuthSteps } from '../../components/commons/authLayout';

const steps = [
  "Type d'utilisateur",
  'Informations personnelles',
  'Documents & Images',
];

const fieldClass =
  'rounded-md border-neutral-200 bg-neutral-50 shadow-none focus-visible:border-violet-600 focus-visible:ring-0';
const errorClass = 'text-xs text-red-500 mt-1 flex items-center gap-1';
const sectionTitleClass = 'border-l-2 border-violet-600 pl-3 text-sm font-bold text-neutral-900';

function FieldError({ message }) {
  if (!message) return null;
  return (
    <span className={errorClass}>
      <InfoOutlinedIcon fontSize="small" className="inline" /> {message}
    </span>
  );
}

const Register = () => {
  const handleSubmit = async (e) => {
    e.preventDefault();
    const errors = {};
    errors.avatar = validateAvatar(form.avatar);
    errors.documents = validateDocuments(form.documents);
    if (form.userType === 'Entreprise') {
      errors.logo = validateLogo(form.logo);
      errors.carteStat = validateCarteStat(form.carteStat);
      errors.carteFiscal = validateCarteFiscal(form.carteFiscal);
    }
    const filtered = Object.fromEntries(Object.entries(errors).filter(([_, v]) => v));
    if (Object.keys(filtered).length > 0) {
      setFieldErrors(filtered);
      setLoading(false);
      toast.error('Veuillez remplir tous les champs requis.');
      return;
    }
    setLoading(true);
    try {
      const dataToSend = { ...form };
      if (Array.isArray(dataToSend.carteFiscal)) {
        dataToSend.carteFiscal = dataToSend.carteFiscal.filter(f => f);
      }
      if (Array.isArray(dataToSend.carteStat)) {
        dataToSend.carteStat = dataToSend.carteStat.filter(f => f);
      }
      if (Array.isArray(dataToSend.documents)) {
        dataToSend.documents = dataToSend.documents.filter(f => f);
      }
      const res = await createUser(dataToSend);
      const successMessage = res?.data?.message || res?.message || 'Inscription réussie !';
      toast.success(successMessage);
      navigate('/login');
    } catch (error) {
      toast.error(error?.response?.data?.message || "Erreur lors de l'inscription.");
    } finally {
      setLoading(false);
    }
  };

  const [fieldErrors, setFieldErrors] = useState({});
  const [usersMap, setUsersMap] = useState({});

  const nextStep = () => {
    if (step === 0) {
      const error = validateUserType(form.userType);
      if (error) {
        setFieldErrors({ userType: error });
        return;
      }
      setFieldErrors({});
    }
    if (step === 1) {
      let phoneLog = form.userPhone;
      if (phoneLog && !phoneLog.startsWith('+')) {
        phoneLog = '+' + phoneLog;
      }
      const errors = {};
      errors.userNickName = validateUserNickName(form.userNickName);
      errors.userName = validateUserName(form.userName);
      errors.userFirstname = validateUserFirstname(form.userFirstname);
      errors.userEmail = validateUserEmail(form.userEmail);
      errors.userPassword = validateUserPassword(form.userPassword);
      errors.userPhone = validateUserPhone(form.userPhone);
      errors.userDateOfBirth = validateUserDateOfBirth(form.userDateOfBirth);
      errors.userAddress = validateUserAddress(form.userAddress);
      errors.userMainLat = validateUserMainLat(form.userMainLat);
      errors.userMainLng = validateUserMainLng(form.userMainLng);
      errors.documentType = validateDocumentType(form.documentType);
      errors.identityCardNumber = validateIdentityCardNumber(form.identityCardNumber);
      const filtered = Object.fromEntries(Object.entries(errors).filter(([_, v]) => v));
      if (Object.keys(filtered).length > 0) {
        setFieldErrors(filtered);
        return;
      }
      setFieldErrors({});
    }
    if (step === 2) {
      const errors = {};
      errors.avatar = validateAvatar(form.avatar);
      errors.documents = validateDocuments(form.documents);
      if (form.userType === 'Entreprise') {
        errors.logo = validateLogo(form.logo);
        errors.carteStat = validateCarteStat(form.carteStat);
        errors.carteFiscal = validateCarteFiscal(form.carteFiscal);
      }
      const filtered = Object.fromEntries(Object.entries(errors).filter(([_, v]) => v));
      if (Object.keys(filtered).length > 0) {
        setFieldErrors(filtered);
        return;
      }
      setFieldErrors({});
    }
    setStep((prev) => Math.min(prev + 1, steps.length - 1));
  };
  const prevStep = () => setStep((prev) => Math.max(prev - 1, 0));
  usePageTitle('Créer un compte');
  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    let mounted = true;
    getAllUsersSelect().then(res => {
      if (!mounted) return;
      const arr = Array.isArray(res) ? res : (Array.isArray(res?.data) ? res.data : []);
      const map = arr.reduce((acc, u) => {
        if (u && u.userId) acc[u.userId] = u.name || u.userNickName || '';
        return acc;
      }, {});
      setUsersMap(map);
    }).catch(() => { });
    return () => { mounted = false; };
  }, []);

  const [form, setForm] = useState({
    userName: '',
    userNickName: '',
    userFirstname: '',
    userDateOfBirth: '',
    userEmail: '',
    userPassword: '',
    confirmPassword: '',
    userType: '',
    userPhone: '',
    userAddress: '',
    userMainLat: '',
    userMainLng: '',
    documentType: '',
    identityCardNumber: '',
    carteFiscal: [null],
    carteStat: [null],
    logo: null,
    avatar: null,
    documents: [null],
    managerName: '',
    managerEmail: '',
    parrain1ID: '',
    parrain1Name: '',
    parrain2ID: '',
    parrain2Name: '',
  });

  const handleChange = (e) => {
    const { name, type, value, files, dataset } = e.target;
    let maskedValue = value;
    if (name === 'userName') {
      maskedValue = maskUppercase(value);
    } else if (name === 'userFirstname') {
      maskedValue = maskFirstname(value);
    }
    setFieldErrors(prev => ({ ...prev, [name]: undefined }));
    if ((name === 'carteFiscal' || name === 'documents' || name === 'carteStat') && dataset.idx !== undefined) {
      const idx = parseInt(dataset.idx, 10);
      setForm((prev) => {
        const arr = [...prev[name]];
        arr[idx] = type === 'file' ? files[0] : maskedValue;
        return { ...prev, [name]: arr };
      });
      return;
    }
    setForm((prev) => ({
      ...prev,
      [name]: type === 'file' ? files[0] : maskedValue,
    }));

    if ((name === 'parrain1ID' || name === 'parrain2ID')) {
      const code = (maskedValue || '').trim();
      if (code.length === 8) {
        const found = usersMap[code];
        if (name === 'parrain1ID') {
          setForm(prev => ({ ...prev, parrain1Name: found || '' }));
        } else {
          setForm(prev => ({ ...prev, parrain2Name: found || '' }));
        }
      } else {
        if (name === 'parrain1ID') {
          setForm(prev => ({ ...prev, parrain1Name: '' }));
        } else {
          setForm(prev => ({ ...prev, parrain2Name: '' }));
        }
      }
    }
  };

  useEffect(() => {
    if (!usersMap) return;
    setForm(prev => {
      const p1 = (prev.parrain1ID || '').trim();
      const p2 = (prev.parrain2ID || '').trim();
      const newP1 = p1.length === 8 ? (usersMap[p1] || '') : '';
      const newP2 = p2.length === 8 ? (usersMap[p2] || '') : '';
      if (prev.parrain1Name === newP1 && prev.parrain2Name === newP2) return prev;
      return { ...prev, parrain1Name: newP1, parrain2Name: newP2 };
    });
  }, [usersMap, form.parrain1ID, form.parrain2ID]);

  const docErrors = typeof validateDocuments === 'function' ? validateDocuments(form.documents) : [];

  return (
    <AuthShell>
      <BrandPanel
        eyebrow="Inscription gratuite"
        title="Rejoignez Etokisana en 3 étapes."
        subtitle="Un seul compte pour vendre, acheter, suivre vos opérations et développer votre réseau."
      >
        <ol className="space-y-px border border-white/20 bg-violet-700">
          {steps.map((label, idx) => {
            const active = idx === step;
            const done = idx < step;
            return (
              <li
                key={label}
                className={`flex items-center gap-3 px-4 py-3 ${idx > 0 ? 'border-t border-white/20' : ''} ${active ? 'bg-white text-violet-800' : 'text-white'}`}
              >
                <span className={`flex h-7 w-7 shrink-0 items-center justify-center text-xs font-bold ${active ? 'bg-violet-600 text-white' : done ? 'bg-white text-violet-700' : 'border border-white/40 text-white'}`}>
                  {done ? '✓' : `0${idx + 1}`}
                </span>
                <span>
                  <span className="block text-sm font-semibold leading-tight">{label}</span>
                  <span className={`block text-xs ${active ? 'text-violet-600' : 'text-violet-200'}`}>
                    {done ? 'Complété' : active ? 'Étape en cours' : idx === 0 ? 'Profil & parrains' : idx === 1 ? 'Identité & contact' : 'Justificatifs'}
                  </span>
                </span>
              </li>
            );
          })}
        </ol>
        <p className="mt-6 border-t border-white/20 pt-4 text-xs tracking-wide text-violet-200">
          Vos informations restent confidentielles et sécurisées.
        </p>
      </BrandPanel>

      <FormPanel wide>
        <AuthHeader
          title="Créer votre compte"
          subtitle={
            <>
              Étape <span className="font-semibold text-violet-700">0{step + 1} sur 03</span> — {steps[step]}.
            </>
          }
        />

        <AuthSteps steps={steps} current={step} />

        <form onSubmit={step === steps.length - 1 ? handleSubmit : (e) => { e.preventDefault(); nextStep(); }} className="space-y-6">
          {/* ÉTAPE 1 */}
          {step === 0 && (
            <div className="space-y-6">
              <div>
                <h3 className={sectionTitleClass}>Quel est votre profil ?</h3>
                <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2">
                  {[
                    { value: 'Particulier', icon: <PersonOutlinedIcon fontSize="small" />, text: 'Compte personnel' },
                    { value: 'Entreprise', icon: <BusinessOutlinedIcon fontSize="small" />, text: 'Compte professionnel' },
                  ].map((opt) => {
                    const selected = form.userType === opt.value;
                    return (
                      <button
                        key={opt.value}
                        type="button"
                        onClick={() => { setForm(f => ({ ...f, userType: opt.value })); setFieldErrors(prev => ({ ...prev, userType: undefined })); }}
                        aria-pressed={selected}
                        className={`flex items-center gap-3 border px-4 py-3.5 text-left transition-colors ${selected ? 'border-violet-600 bg-violet-50' : 'border-neutral-200 bg-neutral-50 hover:border-violet-300'}`}
                      >
                        <span className={`flex h-9 w-9 shrink-0 items-center justify-center ${selected ? 'bg-violet-600 text-white' : 'bg-white text-neutral-500 border border-neutral-200'}`}>
                          {opt.icon}
                        </span>
                        <span>
                          <span className={`block text-sm font-bold ${selected ? 'text-violet-800' : 'text-neutral-800'}`}>{opt.value}</span>
                          <span className="block text-xs text-neutral-500">{opt.text}</span>
                        </span>
                        <span className={`ml-auto flex h-5 w-5 items-center justify-center border text-[11px] font-bold ${selected ? 'border-violet-600 bg-violet-600 text-white' : 'border-neutral-300 bg-white text-transparent'}`}>✓</span>
                      </button>
                    );
                  })}
                </div>
                <FieldError message={fieldErrors.userType} />
              </div>

              <div>
                <h3 className={sectionTitleClass}>Vos parrains</h3>
                <p className="mt-1.5 text-xs leading-relaxed text-neutral-500">
                  Saisissez les codes à 8 caractères reçus de vos parrains. Le nom s’affiche automatiquement.
                </p>
                <div className="mt-3 grid grid-cols-1 gap-4 sm:grid-cols-2">
                  {[1, 2].map((n) => (
                    <div key={n} className="border border-neutral-200 bg-neutral-50 p-4">
                      <Label htmlFor={`parrain${n}ID`}>Code Parrain {n} <span className="text-red-500">*</span></Label>
                      <Input
                        id={`parrain${n}ID`}
                        name={`parrain${n}ID`}
                        type="text"
                        placeholder="Ex. A1B2C3D4"
                        value={form[`parrain${n}ID`]}
                        onChange={handleChange}
                        required
                        maxLength={8}
                        className="mt-2 border-neutral-200 bg-white font-mono uppercase shadow-none focus-visible:border-violet-600 focus-visible:ring-0"
                      />
                      <Input
                        id={`parrain${n}Name`}
                        name={`parrain${n}Name`}
                        type="text"
                        placeholder={form[`parrain${n}ID`]?.trim().length === 8 ? (form[`parrain${n}Name`] || 'Code non reconnu') : 'Nom du parrain'}
                        value={form[`parrain${n}Name`]}
                        readOnly
                        tabIndex={-1}
                        className={`mt-2 shadow-none ${form[`parrain${n}Name`] ? 'border-violet-200 bg-violet-50 text-violet-800' : 'border-neutral-200 bg-neutral-100 text-neutral-400'}`}
                      />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ÉTAPE 2 */}
          {step === 1 && form.userType && (
            <div className="space-y-6">
              <div>
                <h3 className={sectionTitleClass}>Identité</h3>
                <div className="mt-3 grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="userNickName" required>Pseudo</Label>
                    <Input id="userNickName" name="userNickName" type="text" placeholder="Pseudo" value={form.userNickName} onChange={handleChange} required className={fieldClass} aria-invalid={!!fieldErrors.userNickName} />
                    <FieldError message={fieldErrors.userNickName} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="userName" required>{form.userType === 'Entreprise' ? 'Raison sociale' : 'Nom'}</Label>
                    <Input id="userName" name="userName" type="text" placeholder={form.userType === 'Entreprise' ? 'Raison sociale' : 'Nom'} value={form.userName} onChange={handleChange} required className={fieldClass} aria-invalid={!!fieldErrors.userName} />
                    <FieldError message={fieldErrors.userName} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="userFirstname">{form.userType === 'Entreprise' ? 'Nom commercial' : 'Prénom'}</Label>
                    <Input id="userFirstname" name="userFirstname" type="text" placeholder={form.userType === 'Entreprise' ? 'Nom commercial' : 'Prénom'} value={form.userFirstname} onChange={handleChange} required className={fieldClass} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="userDateOfBirth">{form.userType === 'Entreprise' ? "Date de création" : 'Date de naissance'}</Label>
                    <Input id="userDateOfBirth" name="userDateOfBirth" type="date" value={form.userDateOfBirth} onChange={handleChange} className={fieldClass} />
                    <FieldError message={fieldErrors.userDateOfBirth} />
                  </div>
                </div>
              </div>

              <div>
                <h3 className={sectionTitleClass}>Contact & accès</h3>
                <div className="mt-3 grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="userEmail" required>Email</Label>
                    <Input id="userEmail" name="userEmail" type="email" placeholder="vous@exemple.com" value={form.userEmail} onChange={handleChange} required className={fieldClass} aria-invalid={!!fieldErrors.userEmail} />
                    <FieldError message={fieldErrors.userEmail} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="userPassword" required>Mot de passe</Label>
                    <div className="relative">
                      <Input
                        id="userPassword"
                        name="userPassword"
                        type={showPassword ? 'text' : 'password'}
                        placeholder="8 caractères minimum"
                        value={form.userPassword}
                        onChange={handleChange}
                        required
                        className={`${fieldClass} pr-10`}
                        aria-invalid={!!fieldErrors.userPassword}
                      />
                      <button
                        type="button"
                        className="absolute right-2 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-md text-neutral-400 hover:bg-neutral-200/60 hover:text-neutral-700"
                        tabIndex={-1}
                        onClick={() => setShowPassword((v) => !v)}
                        aria-label={showPassword ? 'Masquer le mot de passe' : 'Afficher le mot de passe'}
                      >
                        {showPassword ? <VisibilityOffIcon fontSize="small" /> : <VisibilityIcon fontSize="small" />}
                      </button>
                    </div>
                    {form.userPassword.length >= 8 ? (
                      <span className="text-xs text-violet-600 flex items-center gap-1"><CheckCircleIcon fontSize="small" className="inline" /> Mot de passe valide.</span>
                    ) : (
                      <span className="text-xs text-neutral-400 flex items-center gap-1"><InfoOutlinedIcon fontSize="small" className="inline" /> 8 caractères minimum.</span>
                    )}
                    <FieldError message={fieldErrors.userPassword} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="userPhone" required>Téléphone</Label>
                    <PhoneInput
                      country={'mg'}
                      value={form.userPhone}
                      onChange={phone => { setForm(prev => ({ ...prev, userPhone: phone })); setFieldErrors(prev => ({ ...prev, userPhone: undefined })); }}
                      inputProps={{ name: 'userPhone', required: true, id: 'userPhone', placeholder: 'Numéro sans indicatif', autoComplete: 'tel', 'aria-invalid': !!fieldErrors.userPhone }}
                      enableSearch
                      containerClass="w-full"
                      inputClass="border-neutral-200 bg-neutral-50 w-full h-10 text-sm shadow-none"
                      buttonClass="border border-neutral-200 bg-white px-2"
                      dropdownClass="bg-white text-sm border border-neutral-200 z-50"
                      searchClass="px-2 py-1 mb-2 w-full border border-neutral-200 text-sm"
                      masks={{ mg: '.. .. ... ..' }}
                    />
                    <FieldError message={fieldErrors.userPhone} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="userAddress">Adresse</Label>
                    <Input id="userAddress" name="userAddress" type="text" placeholder="Lot, rue, ville" value={form.userAddress} onChange={handleChange} required className={fieldClass} aria-invalid={!!fieldErrors.userAddress} />
                    <FieldError message={fieldErrors.userAddress} />
                  </div>
                </div>
              </div>

              {form.userType === 'Entreprise' && (
                <div>
                  <h3 className={sectionTitleClass}>Gérant</h3>
                  <div className="mt-3 grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="managerName">Nom du gérant</Label>
                      <Input id="managerName" name="managerName" type="text" placeholder="Nom du gérant" value={form.managerName} onChange={handleChange} required className={fieldClass} />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="managerEmail">Email du gérant</Label>
                      <Input id="managerEmail" name="managerEmail" type="email" placeholder="gerant@entreprise.com" value={form.managerEmail} onChange={handleChange} required className={fieldClass} />
                    </div>
                  </div>
                </div>
              )}

              <div>
                <h3 className={sectionTitleClass}>Localisation <span className="text-red-500">*</span></h3>
                <div className="mt-3 border border-neutral-200 bg-neutral-50 p-3">
                  <GoogleMapPicker lat={form.userMainLat} lng={form.userMainLng} onChange={({ lat, lng }) => setForm((prev) => ({ ...prev, userMainLat: lat, userMainLng: lng }))} />
                  <div className="mt-3 grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="userMainLat" required>Latitude</Label>
                      <Input id="userMainLat" name="userMainLat" type="text" placeholder="-21.45267" value={form.userMainLat} readOnly required className="border-neutral-200 bg-neutral-100 shadow-none cursor-not-allowed" aria-invalid={!!fieldErrors.userMainLat} />
                      <FieldError message={fieldErrors.userMainLat} />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="userMainLng" required>Longitude</Label>
                      <Input id="userMainLng" name="userMainLng" type="text" placeholder="47.08569" value={form.userMainLng} readOnly required className="border-neutral-200 bg-neutral-100 shadow-none cursor-not-allowed" aria-invalid={!!fieldErrors.userMainLng} />
                      <FieldError message={fieldErrors.userMainLng} />
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <h3 className={sectionTitleClass}>Pièce d’identité <span className="text-red-500">*</span></h3>
                <div className="mt-3 grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="documentType" required>{form.userType === 'Entreprise' ? "Pièce du gérant" : 'Type de pièce'}</Label>
                    <Select value={form.documentType} onValueChange={val => { setForm(f => ({ ...f, documentType: val })); setFieldErrors(prev => ({ ...prev, documentType: undefined })); }}>
                      <SelectTrigger aria-invalid={!!fieldErrors.documentType} className="rounded-md border-neutral-200 bg-neutral-50 shadow-none">
                        <SelectValue placeholder="Sélectionner" />
                      </SelectTrigger>
                      <SelectContent className="rounded-md shadow-none border-neutral-200">
                        <SelectItem value="cin">CIN</SelectItem>
                        <SelectItem value="passeport">Passeport</SelectItem>
                        <SelectItem value="permis-de-conduire">Permis de conduire</SelectItem>
                      </SelectContent>
                    </Select>
                    <FieldError message={fieldErrors.documentType} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="identityCardNumber" required>Numéro de pièce</Label>
                    <Input id="identityCardNumber" name="identityCardNumber" type="text" placeholder="N° de pièce" value={form.identityCardNumber} onChange={handleChange} required className={fieldClass} aria-invalid={!!fieldErrors.identityCardNumber} />
                    <FieldError message={fieldErrors.identityCardNumber} />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ÉTAPE 3 */}
          {step === 2 && form.userType && (
            <div className="space-y-6">
              <div>
                <h3 className={sectionTitleClass}>Photo de profil</h3>
                <div className="mt-3 flex flex-col gap-4 border border-neutral-200 bg-neutral-50 p-4 sm:flex-row sm:items-center">
                  <div className="flex-1 space-y-2">
                    <Label htmlFor="avatar">Avatar (PNG)</Label>
                    <label htmlFor="avatar" className="flex cursor-pointer items-center gap-3 border border-dashed border-neutral-300 bg-white px-4 py-3 text-sm text-neutral-500 hover:border-violet-400 hover:text-violet-700">
                      <UploadOutlinedIcon fontSize="small" />
                      <span>{form.avatar ? form.avatar.name : 'Choisir une image…'}</span>
                    </label>
                    <Input id="avatar" name="avatar" type="file" accept="image/*" onChange={handleChange} className="hidden" />
                    <FieldError message={fieldErrors.avatar} />
                  </div>
                  {form.avatar && (
                    <img src={URL.createObjectURL(form.avatar)} alt="Avatar" className="h-20 w-20 border border-violet-200 object-cover" />
                  )}
                </div>
              </div>

              <div>
                <h3 className={sectionTitleClass}>
                  {form.documentType === 'cin' && 'CIN (recto-verso)'}
                  {form.documentType === 'passeport' && 'Passeport (recto-verso)'}
                  {form.documentType === 'permis-de-conduire' && 'Permis (recto-verso)'}
                  {!form.documentType && 'Documents (recto-verso)'}
                </h3>
                <div className="mt-3 grid grid-cols-1 gap-4 sm:grid-cols-2">
                  {[0, 1].map((idx) => (
                    <div key={idx} className="border border-neutral-200 bg-neutral-50 p-4">
                      <Label htmlFor={`documents-${idx}`}>{idx === 0 ? 'Recto' : 'Verso'}</Label>
                      <label htmlFor={`documents-${idx}`} className="mt-2 flex cursor-pointer items-center gap-3 border border-dashed border-neutral-300 bg-white px-4 py-3 text-sm text-neutral-500 hover:border-violet-400 hover:text-violet-700">
                        <UploadOutlinedIcon fontSize="small" />
                        <span className="truncate">{form.documents[idx] ? form.documents[idx].name : `Choisir le fichier ${idx + 1}…`}</span>
                      </label>
                      <Input id={`documents-${idx}`} name="documents" type="file" accept="image/*,.pdf" data-idx={idx} onChange={handleChange} className="hidden" />
                      {Array.isArray(docErrors) && docErrors[idx] && (
                        <span className={errorClass}><InfoOutlinedIcon fontSize="small" className="inline" /> {docErrors[idx]}</span>
                      )}
                      {form.documents[idx] && form.documents[idx].type?.startsWith('image/') && (
                        <img src={URL.createObjectURL(form.documents[idx])} alt={`Document ${idx + 1}`} className="mt-2 h-20 w-full border border-neutral-200 object-cover" />
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {form.userType === 'Entreprise' && (
                <>
                  <div>
                    <h3 className={sectionTitleClass}>Logo de l’entreprise (JPEG)</h3>
                    <div className="mt-3 flex flex-col gap-4 border border-neutral-200 bg-neutral-50 p-4 sm:flex-row sm:items-center">
                      <div className="flex-1 space-y-2">
                        <Label htmlFor="logo">Logo</Label>
                        <label htmlFor="logo" className="flex cursor-pointer items-center gap-3 border border-dashed border-neutral-300 bg-white px-4 py-3 text-sm text-neutral-500 hover:border-violet-400 hover:text-violet-700">
                          <UploadOutlinedIcon fontSize="small" />
                          <span>{form.logo ? form.logo.name : 'Choisir le logo…'}</span>
                        </label>
                        <Input id="logo" name="logo" type="file" accept="image/jpeg" onChange={handleChange} className="hidden" />
                        <FieldError message={fieldErrors.logo} />
                      </div>
                      {form.logo && (
                        <img src={URL.createObjectURL(form.logo)} alt="Logo" className="h-20 w-20 border border-violet-200 object-cover" />
                      )}
                    </div>
                  </div>

                  {[
                    { key: 'carteStat', title: 'Carte Stat (recto-verso)' },
                    { key: 'carteFiscal', title: 'Carte fiscale (recto-verso)' },
                  ].map(({ key, title }) => (
                    <div key={key}>
                      <h3 className={sectionTitleClass}>{title}</h3>
                      <div className="mt-3 grid grid-cols-1 gap-4 sm:grid-cols-2">
                        {[0, 1].map((idx) => (
                          <div key={idx} className="border border-neutral-200 bg-neutral-50 p-4">
                            <Label htmlFor={`${key}-${idx}`}>{idx === 0 ? 'Recto' : 'Verso'}</Label>
                            <label htmlFor={`${key}-${idx}`} className="mt-2 flex cursor-pointer items-center gap-3 border border-dashed border-neutral-300 bg-white px-4 py-3 text-sm text-neutral-500 hover:border-violet-400 hover:text-violet-700">
                              <UploadOutlinedIcon fontSize="small" />
                              <span className="truncate">{form[key]?.[idx] ? form[key][idx].name : 'Choisir le fichier…'}</span>
                            </label>
                            <Input id={`${key}-${idx}`} name={key} type="file" accept="image/*,.pdf" data-idx={idx} onChange={handleChange} className="hidden" />
                            {form[key]?.[idx] && form[key][idx].type?.startsWith('image/') && (
                              <img src={URL.createObjectURL(form[key][idx])} alt={`${title} ${idx + 1}`} className="mt-2 h-20 w-full border border-neutral-200 object-cover" />
                            )}
                          </div>
                        ))}
                      </div>
                      <FieldError message={Array.isArray(fieldErrors[key]) ? fieldErrors[key].join(', ') : fieldErrors[key]} />
                    </div>
                  ))}
                </>
              )}
            </div>
          )}

          <div className="flex flex-col-reverse gap-3 border-t border-neutral-200 pt-5 sm:flex-row sm:items-center">
            {step > 0 && (
              <Button type="button" variant="outline" onClick={prevStep} disabled={loading} className="h-11 rounded-md border-neutral-300 bg-white px-6 shadow-none">
                Précédent
              </Button>
            )}
            <div className="sm:ml-auto">
              {step < steps.length - 1 ? (
                <Button type="button" status="active" onClick={nextStep} disabled={loading} className="h-11 w-full rounded-md px-8 font-semibold shadow-none sm:w-auto">
                  Continuer
                </Button>
              ) : (
                <Button type="submit" status={loading ? 'loading' : 'active'} disabled={loading} className="h-11 w-full rounded-md px-8 font-semibold shadow-none sm:w-auto">
                  {loading && <Loader size="sm" className="border-white border-t-transparent shrink-0" />}
                  Créer mon compte
                </Button>
              )}
            </div>
          </div>
        </form>

        <div className="mt-6 border border-neutral-200 bg-neutral-50 px-4 py-3.5 text-center text-sm text-neutral-600">
          Déjà un compte ?{' '}
          <Link to="/login" className="font-semibold text-violet-700 hover:text-violet-800 hover:underline">
            Se connecter
          </Link>
        </div>
      </FormPanel>
    </AuthShell>
  );
};

export default Register;
