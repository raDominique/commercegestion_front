import { useState } from 'react';
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
  validateUserEmail,
  validateUserPassword,
  validateUserPhone,
  validateUserAddress,
  validateUserMainLat,
  validateUserMainLng,
  validateDocumentType,
  validateIdentityCardNumber
} from '../../utils/registerFieldControl.js';
import LeafletMapPicker from '../../components/ui/LeafletMapPicker.jsx';
import { Link, useNavigate } from 'react-router-dom';
import usePageTitle from '../../utils/usePageTitle.jsx';
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

const steps = [
  "Type d'utilisateur",
  'Informations personnelles',
  'Documents & Images',
];

const Register = () => {
  // Handle form submission (final step)
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      // Préparer les données pour createUser
      const dataToSend = { ...form };
      // Nettoyer les tableaux de fichiers nulls éventuels
      if (Array.isArray(dataToSend.carteFiscal)) {
        dataToSend.carteFiscal = dataToSend.carteFiscal.filter(f => f);
      }
      if (Array.isArray(dataToSend.documents)) {
        dataToSend.documents = dataToSend.documents.filter(f => f);
      }
      await createUser(dataToSend);
      toast.success('Inscription réussie !');
      navigate('/login');
    } catch (error) {
      toast.error(error?.response?.data?.message || "Erreur lors de l'inscription.");
      console.log('[REGISTER] Erreur lors de la création du compte:', error);
    } finally {
      setLoading(false);
    }
  };
  // Step navigation handlers
  const [fieldErrors, setFieldErrors] = useState({});

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
    setStep((prev) => Math.min(prev + 1, steps.length - 1));
  };
  const prevStep = () => setStep((prev) => Math.max(prev - 1, 0));
  usePageTitle('Inscription');
  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);

  // État global du formulaire
  const [form, setForm] = useState({
    userName: '',
    userNickName: '',
    userFirstname: '',
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
    carteStat: null,
    logo: null,
    avatar: null,
    documents: [null],
    managerName: '',
    managerEmail: '',
    parrain1ID: '',
    parrain2ID: '',
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
    // For dynamic file arrays (carteFiscal, documents)
    if ((name === 'carteFiscal' || name === 'documents') && dataset.idx !== undefined) {
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
  };

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
    <div className="min-h-screen w-full bg-linear-to-br from-neutral-50 to-neutral-100 flex items-center justify-center p-0">
      <Card className="w-full h-full max-w-none rounded-none p-0 border-none shadow-none overflow-hidden">
        <div className="flex flex-col md:flex-row w-full h-screen">
          {/* Left column: Branding and steps */}
          <div className="md:w-1/2 bg-violet-50 flex flex-col items-center justify-center p-8 border-b md:border-b-0 md:border-r border-neutral-200">
            <img src={LogoImage} alt="Logo Etokisana" className="h-20 w-auto mb-6" />
            <h1 className="text-3xl font-bold text-violet-700 mb-2">Créer un compte</h1>
            <p className="text-base text-neutral-700 mb-6 text-center">
              Rejoignez <span className="font-bold text-violet-600">Etokisana</span> dès aujourd'hui
            </p>
            <div className="flex justify-center gap-2 mb-4">
              {steps.map((label, idx) => (
                <div
                  key={label}
                  className={`h-2 w-8 rounded-full transition-all ${step >= idx ? 'bg-violet-600' : 'bg-neutral-200'}`}
                />
              ))}
            </div>
            <div className="flex flex-col gap-1 w-full max-w-xs mx-auto">
              {steps.map((label, idx) => (
                <div key={label} className="flex items-center gap-2">
                  <div className={`h-3 w-3 rounded-full ${step === idx ? 'bg-violet-600' : 'bg-neutral-300'}`}></div>
                  <span className={`text-sm ${step === idx ? 'text-violet-700 font-semibold' : 'text-neutral-500'}`}>{label}</span>
                </div>
              ))}
            </div>
          </div>
          {/* Right column: Form */}
          <div className="md:w-1/2 p-8 flex flex-col justify-center">
            <form onSubmit={step === steps.length - 1 ? handleSubmit : (e) => { e.preventDefault(); nextStep(); }} className="space-y-4">
              {/* ÉTAPE 1 : Choix du type d'utilisateur */}
              {step === 0 && (
                <div className="flex flex-col gap-2 max-w-xs mx-auto">
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
                    <Label htmlFor="parrain2ID" className="text-sm text-muted-foreground">
                      Code Parrain 2
                    </Label>
                    <Input id="parrain2ID" name="parrain2ID" type="text" placeholder="Code Parrain 2" value={form.parrain2ID} onChange={handleChange} required className="border-neutral-300" />
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
                      Nom
                      <span className='text-red-400'>*</span>
                    </Label>
                    <Input id="userName" name="userName" type="text" placeholder="Nom" value={form.userName} onChange={handleChange} required className="border-neutral-300" aria-invalid={!!fieldErrors.userName} />
                    {fieldErrors.userName && (
                      <span className="text-xs text-red-500 mt-1 flex items-center"><InfoOutlinedIcon fontSize="small" className="mr-1 inline" /> {fieldErrors.userName}</span>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="userFirstname">Prénom</Label>
                    <Input id="userFirstname" name="userFirstname" type="text" placeholder="Prénom" value={form.userFirstname} onChange={handleChange} required className="border-neutral-300" />
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
                      <div className="flex items-center gap-2">
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
                          inputClass="file:text-foreground placeholder:text-muted-foreground selection:bg-primary selection:text-primary-foreground dark:bg-input/30 border-input flex h-9 w-full min-w-0 rounded-md border px-3 py-1 text-base bg-input-background transition-[color,box-shadow] outline-none file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive"
                          buttonClass="border-none bg-transparent px-2 flex items-center"
                          dropdownClass="rounded-md border bg-input-background text-base shadow-lg z-50"
                          searchClass="rounded-md border px-2 py-1 mb-2 w-full"
                          disableCountryCode={false}
                          disableDropdown={false}
                          masks={{ mg: '.. .. ... ..' }}
                        />
                        {fieldErrors.userPhone && (
                          <span className="text-xs text-red-500 mt-1 flex items-center"><InfoOutlinedIcon fontSize="small" className="mr-1 inline" /> {fieldErrors.userPhone}</span>
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
                    <LeafletMapPicker lat={form.userMainLat} lng={form.userMainLng} onChange={({ lat, lng }) => setForm((prev) => ({ ...prev, userMainLat: lat, userMainLng: lng }))} />
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
                      Pièce d'identité
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
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Documents pour Particulier et Entreprise */}
                  <div className="space-y-2 md:col-span-2">
                    <Label htmlFor="avatar">Avatar (PNG)</Label>
                    <Input id="avatar" name="avatar" type="file" accept="image/png" onChange={handleChange} required className="border-neutral-300" />
                  </div>
                  <div className="space-y-2 md:col-span-2">
                    <Label>Documents (PNG recto-verso)</Label>
                    {form.documents.map((file, idx) => (
                      <div key={idx} className="flex items-center gap-2 mb-2">
                        <Input id={`documents-${idx}`} name="documents" type="file" accept="image/png" data-idx={idx} onChange={handleChange} required={idx === 0} className="border-neutral-300 flex-1" />
                        {form.documents.length > 1 && (
                          <button type="button" onClick={() => handleRemoveFile('documents', idx)} className="rounded-full bg-red-100 hover:bg-red-200 text-red-600 w-8 h-8 flex items-center justify-center transition"><span className="text-xl font-bold">&minus;</span></button>
                        )}
                        {idx === form.documents.length - 1 && form.documents.length < 5 && (
                          <button type="button" onClick={() => handleAddFile('documents')} className="rounded-full bg-violet-100 hover:bg-violet-200 text-violet-700 w-8 h-8 flex items-center justify-center transition"><span className="text-xl font-bold">+</span></button>
                        )}
                      </div>
                    ))}
                  </div>
                  {/* Champs entreprise uniquement */}
                  {form.userType === 'Entreprise' && (
                    <>
                      <div className="space-y-2 md:col-span-2">
                        <Label htmlFor="logo">Logo (JPEG)</Label>
                        <Input id="logo" name="logo" type="file" accept="image/jpeg" onChange={handleChange} required className="border-neutral-300" />
                      </div>
                      <div className="space-y-2 md:col-span-2">
                        <Label htmlFor="carteStat">Carte Stat (PNG recto-verso)</Label>
                        <Input id="carteStat" name="carteStat" type="file" accept="image/png" onChange={handleChange} required className="border-neutral-300" />
                      </div>
                      <div className="space-y-2 md:col-span-2">
                        <Label>Carte fiscale (PNG recto-verso)</Label>
                        {form.carteFiscal.map((file, idx) => (
                          <div key={idx} className="flex items-center gap-2 mb-2">
                            <Input id={`carteFiscal-${idx}`} name="carteFiscal" type="file" accept="image/png" data-idx={idx} onChange={handleChange} required={idx === 0} className="border-neutral-300 flex-1" />
                            {form.carteFiscal.length > 1 && (
                              <button type="button" onClick={() => handleRemoveFile('carteFiscal', idx)} className="rounded-full bg-red-100 hover:bg-red-200 text-red-600 w-8 h-8 flex items-center justify-center transition"><span className="text-xl font-bold">&minus;</span></button>
                            )}
                            {idx === form.carteFiscal.length - 1 && form.carteFiscal.length < 5 && (
                              <button type="button" onClick={() => handleAddFile('carteFiscal')} className="rounded-full bg-violet-100 hover:bg-violet-200 text-violet-700 w-8 h-8 flex items-center justify-center transition"><span className="text-xl font-bold">+</span></button>
                            )}
                          </div>
                        ))}
                      </div>
                    </>
                  )}
                </div>
              )}
              <div className="flex gap-2 pt-2">
                {step > 0 && (
                  <Button type="button" variant="outline" onClick={prevStep}>
                    Précédent
                  </Button>
                )}
                {step < steps.length - 1 && (
                  <Button type="button" className="bg-violet-600 hover:bg-violet-700 text-white" onClick={nextStep}>
                    Suivant
                  </Button>
                )}
                {step === steps.length - 1 && (
                  loading ? (
                    <Squelette className="w-full h-10 mb-2" />
                  ) : (
                    <Button
                      type="submit"
                      className="bg-violet-600 hover:bg-violet-700 text-white"
                      disabled={loading}
                    >
                      S'inscrire
                    </Button>
                  )
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