import { useState, useEffect } from 'react';
import VisibilityIcon from '@mui/icons-material/Visibility';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import { maskUppercase, maskFirstname, maskPhone } from '../../utils/inputMasks.js';
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
import useScreenType from '../../utils/useScreenType.jsx';
import { Button } from '../../components/ui/button.jsx';
import { Squelette } from '../../components/ui/skeleton.jsx';
import { toast } from 'sonner';
import { Card } from '../../components/ui/card.jsx';
import { Input } from '../../components/ui/input.jsx';
import PhoneInput from 'react-phone-input-2';
import 'react-phone-input-2/lib/style.css';
import { Label } from '../../components/ui/label.jsx';
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from '../../components/ui/select';
import LogoImage from '../../assets/logo/logo.png';
import { createUser } from '../../services/auth.service.js';
import { getAllUsersSelect } from '../../services/user.service';

const steps = [
  "Type d'utilisateur",
  'Informations personnelles',
  'Documents & Images',
];

const Register = () => {
  // Handle form submission (final step)
  const handleSubmit = async (e) => {
    e.preventDefault();
    // Validation étape 3 avant soumission
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
      // Préparer les données pour createUser
      const dataToSend = { ...form };
      // Nettoyer les tableaux de fichiers nulls éventuels
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
      console.log('Erreur lors de l\'inscription :', error);
      toast.error(error?.response?.data?.message || "Erreur lors de l'inscription.");
    } finally {
      setLoading(false);
    }
  };
  // Step navigation handlers
  const [fieldErrors, setFieldErrors] = useState({});

  // mapping userId -> name for parrain lookup
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
      // Filtrer les erreurs non vides
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
      // Filtrer les erreurs non vides
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
  usePageTitle('Inscription');
  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const { isMobile } = useScreenType();
  const [showInfo, setShowInfo] = useState(false);

  // Load users map once for parrain lookup
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

  // État global du formulaire
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
  // Handle input changes for both text and file inputs
  const handleChange = (e) => {
    const { name, type, value, files, dataset } = e.target;
    let maskedValue = value;
    if (name === 'userName') {
      maskedValue = maskUppercase(value);
    } else if (name === 'userFirstname') {
      maskedValue = maskFirstname(value);
    } else if (name === 'userPhone') {
      maskedValue = maskPhone(value);
    }
    // Masquer l'erreur du champ concerné dès la saisie
    setFieldErrors(prev => ({ ...prev, [name]: undefined }));
    // For dynamic file arrays (carteFiscal, documents, carteStat)
    if ((name === 'carteFiscal' || name === 'documents' || name === 'carteStat') && dataset.idx !== undefined) {
      const idx = parseInt(dataset.idx, 10);
      setForm((prev) => {
        const arr = [...prev[name]];
        arr[idx] = type === 'file' ? files[0] : maskedValue;
        return { ...prev, [name]: arr };
      });
      return;
    }
    // Update value
    setForm((prev) => ({
      ...prev,
      [name]: type === 'file' ? files[0] : maskedValue,
    }));

    // If user types a parrain ID of exactly 8 chars, lookup name from usersMap
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

  // Populate parrain names when parrain ID is provided (on load or programmatic set)
  useEffect(() => {
    if (!usersMap) return;
    setForm(prev => {
      const p1 = (prev.parrain1ID || '').trim();
      const p2 = (prev.parrain2ID || '').trim();
      const newP1 = p1.length === 8 ? (usersMap[p1] || '') : '';
      const newP2 = p2.length === 8 ? (usersMap[p2] || '') : '';
      // Log when parrain codes are provided for debugging
      if (p1.length === 8 || p2.length === 8) {
      }
      if (prev.parrain1Name === newP1 && prev.parrain2Name === newP2) return prev;
      return { ...prev, parrain1Name: newP1, parrain2Name: newP2 };
    });
  }, [usersMap, form.parrain1ID, form.parrain2ID]);

  // Add/remove file input for carteFiscal/documents
  const handleAddFile = (field) => {
    setForm((prev) => {
      if (prev[field].length < 5) {
        return { ...prev, [field]: [...prev[field], null] };
      }
      return prev;
    });
  };
  const handleRemoveFile = (field, idx) => {
    setForm((prev) => {
      if (prev[field].length > 1) {
        const arr = prev[field].filter((_, i) => i !== idx);
        return { ...prev, [field]: arr };
      }
      return prev;
    });
  };
  return (
    <div className={`min-h-screen w-full bg-linear-to-br from-neutral-50 to-neutral-100 flex items-center ${isMobile ? 'justify-start pt-6 pb-8' : 'justify-center p-0'}`}>
      <Card className="w-full h-full max-w-none rounded-none p-0 border-none shadow-none overflow-auto">
        <div className="flex flex-col md:flex-row w-full">
          {!isMobile && (
            <div className="md:w-1/2 bg-violet-50 flex flex-col items-center justify-center p-6 md:p-8 border-b md:border-b-0 md:border-r border-neutral-200 h-56 md:h-auto">
              <img src={LogoImage} alt="Logo Etokisana" className="h-14 md:h-20 w-auto mb-4 md:mb-6" />
              <h1 className="text-2xl md:text-3xl font-bold text-violet-700 mb-2">Créer un compte</h1>
              <p className="text-sm md:text-base text-neutral-700 mb-6 text-center">
                Rejoignez <span className="font-bold text-violet-600">Etokisana</span> dès aujourd'hui
              </p>
              <div className="flex justify-center gap-2 mb-4 md:mb-6">
                {steps.map((label, idx) => (
                  <div
                    key={label}
                    className={`h-2 w-6 md:w-8 rounded-full transition-all ${step >= idx ? 'bg-violet-600' : 'bg-neutral-200'}`}
                  />
                ))}
              </div>
              <div className="flex flex-col gap-1 w-full max-w-xs md:max-w-xs mx-auto px-2 md:px-0">
                {steps.map((label, idx) => (
                  <div key={label} className="flex items-center gap-2">
                    <div className={`h-3 w-3 rounded-full ${step === idx ? 'bg-violet-600' : 'bg-neutral-300'}`}></div>
                    <span className={`text-sm ${step === idx ? 'text-violet-700 font-semibold' : 'text-neutral-500'}`}>{label}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
          {/* Right column: Form */}
          <div className={`${isMobile ? 'w-full px-4' : 'md:w-1/2'} p-4 md:p-8 flex flex-col ${isMobile ? 'justify-start' : 'justify-center'} flex-1 overflow-auto pb-20`}>
            {/* Mobile header with toggle to show branding/info */}
            {isMobile && (
              <div className="w-full flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <img src={LogoImage} alt="Logo" className="h-10 w-auto" />
                  <div>
                    <div className="text-lg font-semibold text-violet-700">Créer un compte</div>
                    <div className="text-xs text-neutral-600">Rejoignez Etokisana</div>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setShowInfo(s => !s)}
                  className="text-sm text-violet-600 hover:text-violet-700 bg-violet-50 px-3 py-1 rounded-md"
                >
                  {showInfo ? 'Fermer' : 'Infos'}
                </button>
              </div>
            )}

            {/* Collapsible mobile info (branding + steps) */}
            {isMobile && showInfo && (
              <div className="mb-4 p-3 bg-violet-50 rounded-md border border-violet-100">
                <div className="flex flex-col items-start gap-2">
                  <div className="text-sm font-semibold text-violet-700">Pourquoi s'inscrire ?</div>
                  <div className="text-xs text-neutral-700">Rejoignez Etokisana pour gérer vos produits, transactions et sites.</div>
                  <div className="w-full mt-2 grid grid-cols-3 gap-2">
                    {steps.map((label, idx) => (
                      <div key={label} className="flex flex-col items-center">
                        <div className={`h-2 w-8 rounded-full ${step >= idx ? 'bg-violet-600' : 'bg-neutral-200'}`} />
                        <div className="text-[10px] text-neutral-600 mt-1 text-center">{label}</div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            <form onSubmit={step === steps.length - 1 ? handleSubmit : (e) => { e.preventDefault(); nextStep(); }} className="space-y-4">
              {/* ÉTAPE 1 : Choix du type d'utilisateur */}
              {step === 0 && (
                <div className={`${isMobile ? 'w-full px-2' : 'flex flex-col gap-2 max-w-xs mx-auto'}`}>
                  <Label htmlFor="userType" className="text-sm">
                    Type d'utilisateur
                    <span className='text-red-400'>*</span>
                  </Label>
                  <Select value={form.userType} onValueChange={val => { setForm(f => ({ ...f, userType: val })); setFieldErrors({ ...fieldErrors, userType: undefined }); }}>
                    <SelectTrigger aria-invalid={!!fieldErrors.userType}>
                      <SelectValue placeholder="Sélectionner le type d'utilisateur" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Particulier">Particulier</SelectItem>
                      <SelectItem value="Entreprise">Entreprise</SelectItem>
                    </SelectContent>
                  </Select>
                  {fieldErrors.userType && (
                    <span className="text-xs text-red-500 mt-1 flex items-center"><InfoOutlinedIcon fontSize="small" className="mr-1 inline" /> {fieldErrors.userType}</span>
                  )}
                  <div className='space-y-2'>
                    <Label htmlFor="parrain1ID" className="text-sm text-muted-foreground">
                      Code Parrain 1
                    </Label>
                    <Input id="parrain1ID" name="parrain1ID" type="text" placeholder="Code Parrain 1" value={form.parrain1ID} onChange={handleChange} required className="border-neutral-300" />
                    {/* Read-only display for parrain1 name when code is resolved */}
                    <Input id="parrain1Name" name="parrain1Name" type="text" placeholder="Nom du parrain 1" value={form.parrain1Name} readOnly className="border-neutral-300 bg-neutral-100 text-neutral-700" />
                    <Label htmlFor="parrain2ID" className="text-sm text-muted-foreground">
                      Code Parrain 2
                    </Label>
                    <Input id="parrain2ID" name="parrain2ID" type="text" placeholder="Code Parrain 2" value={form.parrain2ID} onChange={handleChange} required className="border-neutral-300" />
                    {/* Read-only display for parrain2 name when code is resolved */}
                    <Input id="parrain2Name" name="parrain2Name" type="text" placeholder="Nom du parrain 2" value={form.parrain2Name} readOnly className="border-neutral-300 bg-neutral-100 text-neutral-700" />
                  </div>
                </div>
              )}
              {/* ÉTAPE 2 */}
              {step === 1 && form.userType && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="userNickName">
                      Pseudo
                      <span className='text-red-400'>*</span>
                    </Label>
                    <Input id="userNickName" name="userNickName" type="text" placeholder="Pseudo" value={form.userNickName} onChange={handleChange} required className="border-neutral-300" aria-invalid={!!fieldErrors.userNickName} />
                    {fieldErrors.userNickName && (
                      <span className="text-xs text-red-500 mt-1 flex items-center"><InfoOutlinedIcon fontSize="small" className="mr-1 inline" /> {fieldErrors.userNickName}</span>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="userName">
                      {form.userType === 'Entreprise' ? 'Raison sociale' : 'Nom'}
                      <span className='text-red-400'>*</span>
                    </Label>
                    <Input id="userName" name="userName" type="text" placeholder={form.userType === 'Entreprise' ? 'Raison sociale' : 'Nom'} value={form.userName} onChange={handleChange} required className="border-neutral-300" aria-invalid={!!fieldErrors.userName} />
                    {fieldErrors.userName && (
                      <span className="text-xs text-red-500 mt-1 flex items-center"><InfoOutlinedIcon fontSize="small" className="mr-1 inline" /> {fieldErrors.userName}</span>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="userFirstname">{form.userType === 'Entreprise' ? 'Nom commercial' : 'Prénom'}</Label>
                    <Input id="userFirstname" name="userFirstname" type="text" placeholder={form.userType === 'Entreprise' ? 'Nom commercial' : 'Prénom'} value={form.userFirstname} onChange={handleChange} required className="border-neutral-300" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="userDateOfBirth">Date de naissance</Label>
                    <Input id="userDateOfBirth" name="userDateOfBirth" type="date" placeholder="Date de naissance" value={form.userDateOfBirth} onChange={handleChange} className="border-neutral-300" />
                    {fieldErrors.userDateOfBirth && (
                      <span className="text-xs text-red-500 mt-1 flex items-center"><InfoOutlinedIcon fontSize="small" className="mr-1 inline" /> {fieldErrors.userDateOfBirth}</span>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="userEmail">
                      Email
                      <span className='text-red-400'>*</span>
                    </Label>
                    <Input id="userEmail" name="userEmail" type="email" placeholder="Email" value={form.userEmail} onChange={handleChange} required className="border-neutral-300" aria-invalid={!!fieldErrors.userEmail} />
                    {fieldErrors.userEmail && (
                      <span className="text-xs text-red-500 mt-1 flex items-center"><InfoOutlinedIcon fontSize="small" className="mr-1 inline" /> {fieldErrors.userEmail}</span>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="userPassword">
                      Mot de passe
                      <span className='text-red-400'>*</span>
                    </Label>
                    <div className="relative">
                      <Input
                        id="userPassword"
                        name="userPassword"
                        type={showPassword ? 'text' : 'password'}
                        placeholder="Mot de passe"
                        value={form.userPassword}
                        onChange={handleChange}
                        required
                        className="border-neutral-300 pr-10"
                        aria-invalid={!!fieldErrors.userPassword}
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
                    {form.userPassword.length >= 8 ? (
                      <span className="text-xs text-green-500 flex items-center"><CheckCircleIcon fontSize="small" className="mr-1 inline" /> Mot de passe valide.</span>
                    ) : (
                      <span className="text-xs text-orange-300 flex items-center"><InfoOutlinedIcon fontSize="small" className="mr-1 inline" /> Le mot de passe doit contenir au moins 8 caractères.</span>
                    )}
                    {fieldErrors.userPassword && (
                      <span className="text-xs text-red-500 mt-1 flex items-center"><InfoOutlinedIcon fontSize="small" className="mr-1 inline" /> {fieldErrors.userPassword}</span>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="userPhone">
                      Téléphone
                      <span className='text-red-400'>*</span>
                    </Label>
                    <div className="relative">
                      <div className={isMobile ? 'flex flex-col' : 'flex items-center gap-2'}>
                        <PhoneInput
                          country={'mg'}
                          value={form.userPhone}
                          onChange={phone => setForm(prev => ({ ...prev, userPhone: phone }))}
                          inputProps={{
                            name: 'userPhone',
                            required: true,
                            id: 'userPhone',
                            placeholder: 'Numéro sans indicatif',
                            autoComplete: 'tel',
                            'aria-invalid': !!fieldErrors.userPhone
                          }}
                          enableSearch
                          containerClass="w-full"
                          inputClass="border-neutral-300 w-full h-9 rounded-md px-3 py-1 text-base"
                          buttonClass="border-none bg-transparent px-2 flex items-center"
                          dropdownClass="rounded-md bg-input-background text-base shadow-lg z-50"
                          searchClass="rounded-md px-2 py-1 mb-2 w-full"
                          disableCountryCode={false}
                          disableDropdown={false}
                          masks={{ mg: '.. .. ... ..' }}
                        />
                        {fieldErrors.userPhone && (
                          <span className="text-xs text-red-500 mt-2 flex items-center w-full text-left"><InfoOutlinedIcon fontSize="small" className="mr-1 inline" /> {fieldErrors.userPhone}</span>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="space-y-2 md:col-span-2">
                    <Label htmlFor="userAddress">Adresse</Label>
                    <Input id="userAddress" name="userAddress" type="text" placeholder="Adresse" value={form.userAddress} onChange={handleChange} required className="border-neutral-300" aria-invalid={!!fieldErrors.userAddress} />
                    {fieldErrors.userAddress && (
                      <span className="text-xs text-red-500 mt-1 flex items-center"><InfoOutlinedIcon fontSize="small" className="mr-1 inline" /> {fieldErrors.userAddress}</span>
                    )}
                  </div>
                  {/* Champs manager pour Entreprise */}
                  {form.userType === 'Entreprise' && (
                    <>
                      <div className="space-y-2 md:col-span-2">
                        <Label htmlFor="managerName">Nom du gérant</Label>
                        <Input id="managerName" name="managerName" type="text" placeholder="Nom du gérant" value={form.managerName} onChange={handleChange} required className="border-neutral-300" />
                      </div>
                      <div className="space-y-2 md:col-span-2">
                        <Label htmlFor="managerEmail">Email du gérant</Label>
                        <Input id="managerEmail" name="managerEmail" type="email" placeholder="Email du gérant" value={form.managerEmail} onChange={handleChange} required className="border-neutral-300" />
                      </div>
                    </>
                  )}
                  <div className="md:col-span-2 mb-s">
                    <Label>
                      Localisation sur la carte
                      <span className='text-red-400'>*</span>
                    </Label>
                    <GoogleMapPicker lat={form.userMainLat} lng={form.userMainLng} onChange={({ lat, lng }) => setForm((prev) => ({ ...prev, userMainLat: lat, userMainLng: lng }))} />
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="userMainLat">
                          Latitude
                          <span className='text-red-400'>*</span>
                        </Label>
                        <Input id="userMainLat" name="userMainLat" type="text" placeholder="-21.45267" value={form.userMainLat} readOnly required className="border-neutral-300 bg-neutral-100 cursor-not-allowed" aria-invalid={!!fieldErrors.userMainLat} />
                        {fieldErrors.userMainLat && (
                          <span className="text-xs text-red-500 mt-1 flex items-center"><InfoOutlinedIcon fontSize="small" className="mr-1 inline" /> {fieldErrors.userMainLat}</span>
                        )}
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="userMainLng">
                          Longitude
                          <span className='text-red-400'>*</span>
                        </Label>
                        <Input id="userMainLng" name="userMainLng" type="text" placeholder="47.08569" value={form.userMainLng} readOnly required className="border-neutral-300 bg-neutral-100 cursor-not-allowed" aria-invalid={!!fieldErrors.userMainLng} />
                        {fieldErrors.userMainLng && (
                          <span className="text-xs text-red-500 mt-1 flex items-center"><InfoOutlinedIcon fontSize="small" className="mr-1 inline" /> {fieldErrors.userMainLng}</span>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="documentType">
                      {form.userType === 'Entreprise' ? "Pièce d'identité du gérant" : "Pièce d'identité"}
                      <span className='text-red-400'>*</span>
                    </Label>
                    <Select value={form.documentType} onValueChange={val => { setForm(f => ({ ...f, documentType: val })); setFieldErrors({ ...fieldErrors, documentType: undefined }); }}>
                      <SelectTrigger aria-invalid={!!fieldErrors.documentType}>
                        <SelectValue placeholder="Sélectionner" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="cin">CIN</SelectItem>
                        <SelectItem value="passeport">Passeport</SelectItem>
                        <SelectItem value="permis-de-conduire">Permis de conduire</SelectItem>
                      </SelectContent>
                    </Select>
                    {fieldErrors.documentType && (
                      <span className="text-xs text-red-500 mt-1 flex items-center"><InfoOutlinedIcon fontSize="small" className="mr-1 inline" /> {fieldErrors.documentType}</span>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="identityCardNumber">
                      Numéro de pièce d'identité
                      <span className='text-red-400'>*</span>
                    </Label>
                    <Input id="identityCardNumber" name="identityCardNumber" type="text" placeholder="Numéro de pièce d'identité" value={form.identityCardNumber} onChange={handleChange} required className="border-neutral-300" aria-invalid={!!fieldErrors.identityCardNumber} />
                    {fieldErrors.identityCardNumber && (
                      <span className="text-xs text-red-500 mt-1 flex items-center"><InfoOutlinedIcon fontSize="small" className="mr-1 inline" /> {fieldErrors.identityCardNumber}</span>
                    )}
                  </div>
                </div>
              )}
              {/* ÉTAPE 3 */}
              {step === 2 && form.userType && (
                <div className="space-y-6">

                  {/* Avatar */}
                  <div className="flex flex-col md:flex-row items-center gap-6">
                    <div className="flex flex-col gap-2">
                      <Label htmlFor="avatar">Avatar (PNG)</Label>
                      <Input
                        id="avatar"
                        name="avatar"
                        type="file"
                        accept="image/png"
                        onChange={handleChange}
                        className="border-neutral-300"
                      />
                      {fieldErrors.avatar && (
                        <span className="text-xs text-red-500 mt-1 flex items-center"><InfoOutlinedIcon fontSize="small" className="mr-1 inline" /> {fieldErrors.avatar}</span>
                      )}
                    </div>
                    {form.avatar && (
                      <div className="relative w-20 h-20 md:w-24 md:h-24 rounded-full overflow-hidden border-2 border-violet-400 shadow-lg">
                        <img src={URL.createObjectURL(form.avatar)} alt="Avatar" className="w-full h-full object-cover" />
                      </div>
                    )}
                  </div>

                  {/* Documents (fixe: 2 inputs) */}
                  <div className="space-y-3">
                    <Label>
                      {form.documentType === 'cin' && "CIN (PNG recto-verso)"}
                      {form.documentType === 'passeport' && "Passeport (PNG recto-verso)"}
                      {form.documentType === 'permis-de-conduire' && "Permis de conduire (PNG recto-verso)"}
                      {!form.documentType && "Documents (PNG recto-verso)"}
                    </Label>
                    <div className="grid grid-cols-2 gap-4">
                      {[0, 1].map((idx) => {
                        // Erreur dynamique pour chaque document
                        let docErrors = [];
                        if (typeof validateDocuments === 'function') {
                          docErrors = validateDocuments(form.documents);
                        }
                        return (
                          <div key={idx} className="relative flex flex-col items-center justify-center">
                            <Input
                              id={`documents-${idx}`}
                              name="documents"
                              type="file"
                              accept="image/*,.pdf"
                              data-idx={idx}
                              onChange={handleChange}
                              className="border-neutral-300 w-full"
                            />
                            {docErrors && Array.isArray(docErrors) && docErrors[idx] && (
                              <span className="text-xs text-red-500 mt-1 flex items-center w-full text-left"><InfoOutlinedIcon fontSize="small" className="mr-1 inline" /> {docErrors[idx]}</span>
                            )}
                            {form.documents[idx] && (
                              <img
                                src={URL.createObjectURL(form.documents[idx])}
                                alt={`Document ${idx + 1}`}
                                className="w-20 h-20 md:w-24 md:h-24 object-cover mt-2 rounded border"
                              />
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Entreprise: Logo + Carte Stat + Carte Fiscale */}
                  {form.userType === 'Entreprise' && (
                    <div className="space-y-4">
                      {/* Logo */}
                      <div className="p-4 bg-neutral-50 rounded-lg flex items-center gap-6">
                        <div className="flex flex-col gap-2">
                          <Label htmlFor="logo">Logo (JPEG)</Label>
                          <Input
                            id="logo"
                            name="logo"
                            type="file"
                            accept="image/jpeg"
                            onChange={handleChange}
                            className="border-neutral-300"
                          />
                          {fieldErrors.logo && (
                            <span className="text-xs text-red-500 mt-1 flex items-center"><InfoOutlinedIcon fontSize="small" className="mr-1 inline" /> {fieldErrors.logo}</span>
                          )}
                        </div>
                        {form.logo && (
                          <div className="w-20 h-20 md:w-24 md:h-24 rounded-lg overflow-hidden border-2 border-violet-400 shadow-lg">
                            <img src={URL.createObjectURL(form.logo)} alt="Logo" className="w-full h-full object-cover" />
                          </div>
                        )}
                      </div>

                      {/* Carte Stat (recto + verso) */}
                      <div className="p-4 bg-neutral-50 rounded-lg space-y-3">
                        <Label>Carte Stat (PNG recto-verso)</Label>
                        <div className="grid grid-cols-2 gap-4">
                          {[0, 1].map((idx) => (
                            <div key={idx} className="relative border rounded-lg p-2 flex flex-col items-center justify-center bg-white shadow-sm">
                              <Input
                                id={`carteStat-${idx}`}
                                name="carteStat"
                                type="file"
                                accept="image/*,.pdf"
                                data-idx={idx}
                                onChange={handleChange}
                                className="border-neutral-300 w-full"
                              />
                              {fieldErrors.carteStat && Array.isArray(fieldErrors.carteStat) && fieldErrors.carteStat.includes(`carte stat ${idx + 1}`) && (
                                <span className="text-xs text-red-500 mt-1 flex items-center"><InfoOutlinedIcon fontSize="small" className="mr-1 inline" /> {fieldErrors.carteStat}</span>
                              )}
                              {form.carteStat && form.carteStat[idx] && (
                                <img
                                  src={URL.createObjectURL(form.carteStat[idx])}
                                  alt={`Carte Stat ${idx + 1}`}
                                  className="w-20 h-20 md:w-24 md:h-24 object-cover mt-2 rounded border"
                                />
                              )}
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Carte Fiscale (fixe: 2 inputs) */}
                      <div className="p-4 bg-neutral-50 rounded-lg space-y-3">
                        <Label>Carte fiscale (PNG recto-verso)</Label>
                        <div className="grid grid-cols-2 gap-4">
                          {[0, 1].map((idx) => (
                            <div key={idx} className="relative border rounded-lg p-2 flex flex-col items-center justify-center bg-white shadow-sm">
                              <Input
                                id={`carteFiscal-${idx}`}
                                name="carteFiscal"
                                type="file"
                                accept="image/*,.pdf"
                                data-idx={idx}
                                onChange={handleChange}
                                className="border-neutral-300 w-full"
                              />
                              {fieldErrors.carteFiscal && fieldErrors.carteFiscal.includes(`carte fiscale ${idx + 1}`) && (
                                <span className="text-xs text-red-500 mt-1 flex items-center"><InfoOutlinedIcon fontSize="small" className="mr-1 inline" /> {fieldErrors.carteFiscal}</span>
                              )}
                              {form.carteFiscal[idx] && (
                                <img
                                  src={URL.createObjectURL(form.carteFiscal[idx])}
                                  alt={`Carte fiscale ${idx + 1}`}
                                  className="w-20 h-20 md:w-24 md:h-24 object-cover mt-2 rounded border"
                                />
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}
              <div className="flex gap-2 pt-2 flex-wrap">
                {step > 0 && (
                  <Button type="button" variant="outline" onClick={prevStep} disabled={loading}>
                    {loading ? (
                      <span className="flex items-center gap-2">
                        <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"></path>
                        </svg>
                        Précédent
                      </span>
                    ) : 'Précédent'}
                  </Button>
                )}
                {step < steps.length - 1 && (
                  <Button type="button" className="bg-violet-600 hover:bg-violet-700 text-white" onClick={nextStep} disabled={loading}>
                    Suivant
                  </Button>
                )}
                {step === steps.length - 1 && (
                  <Button
                    type="submit"
                    className="bg-violet-600 hover:bg-violet-700 text-white"
                    disabled={loading}
                  >
                    {loading ? (
                      <span className="flex items-center gap-2">
                        <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"></path>
                        </svg>
                        S'inscrire
                      </span>
                    ) : "S'inscrire"}
                  </Button>
                )}
              </div>
            </form>
            <div className="text-center text-sm mt-6">
              <span className="text-neutral-600">Déjà un compte ? </span>
              <Link to="/login" className="text-violet-600 hover:text-violet-700">
                Se connecter
              </Link>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default Register;