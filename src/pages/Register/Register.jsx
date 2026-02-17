import { useState } from 'react';
import LeafletMapPicker from '../../components/ui/LeafletMapPicker.jsx';
import { Link, useNavigate } from 'react-router-dom';
import usePageTitle from '../../utils/usePageTitle.jsx';
import { Button } from '../../components/ui/button.jsx';
import { toast } from 'sonner';
import { Card } from '../../components/ui/card.jsx';
import { Input } from '../../components/ui/input.jsx';
import { Label } from '../../components/ui/label.jsx';
import LogoImage from '../../assets/logo/logo.png';

const steps = [
  'Informations de connexion',
  'Informations personnelles',
  'Documents & Images',
];

const Register = () => {
  // Handle form submission (final step)
  const handleSubmit = (e) => {
    e.preventDefault();
    try {
      console.log('Form data:', JSON.stringify(form));
      toast.success('Inscription réussie !');
    } catch (error) {
      toast.error('Erreur lors de l\'inscription.');
    }
  };
  // Step navigation handlers
  const nextStep = () => setStep((prev) => Math.min(prev + 1, steps.length - 1));
  const prevStep = () => setStep((prev) => Math.max(prev - 1, 0));
  usePageTitle('Inscription');
  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

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
  });
  // Handle input changes for both text and file inputs
  const handleChange = (e) => {
    const { name, type, value, files, dataset } = e.target;
    // For dynamic file arrays (carteFiscal, documents)
    if ((name === 'carteFiscal' || name === 'documents') && dataset.idx !== undefined) {
      const idx = parseInt(dataset.idx, 10);
      setForm((prev) => {
        const arr = [...prev[name]];
        arr[idx] = type === 'file' ? files[0] : value;
        return { ...prev, [name]: arr };
      });
      return;
    }
    setForm((prev) => ({
      ...prev,
      [name]: type === 'file' ? files[0] : value,
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
              {/* ÉTAPE 1 */}
              {step === 0 && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="userEmail">Email</Label>
                    <Input
                      id="userEmail"
                      name="userEmail"
                      type="email"
                      placeholder="votre@email.com"
                      value={form.userEmail}
                      onChange={handleChange}
                      required
                      className="border-neutral-300"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="userPassword">Mot de passe</Label>
                    <Input
                      id="userPassword"
                      name="userPassword"
                      type="password"
                      placeholder="••••••••"
                      value={form.userPassword}
                      onChange={handleChange}
                      required
                      className="border-neutral-300"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="confirmPassword">Confirmer le mot de passe</Label>
                    <Input
                      id="confirmPassword"
                      name="confirmPassword"
                      type="password"
                      placeholder="••••••••"
                      value={form.confirmPassword}
                      onChange={handleChange}
                      required
                      className="border-neutral-300"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="userType">Type d'utilisateur</Label>
                    <select
                      id="userType"
                      name="userType"
                      value={form.userType}
                      onChange={handleChange}
                      required
                      className="border border-neutral-300 focus:border-violet-600 w-full rounded-md px-3 py-1.5"
                    >
                      <option value="">Sélectionner</option>
                      <option value="Particulier">Particulier</option>
                      <option value="Professionnel">Professionnel</option>
                      <option value="Entreprise">Entreprise</option>
                    </select>
                  </div>
                </div>
              )}
              {/* ÉTAPE 2 */}
              {step === 1 && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="userName">Nom</Label>
                    <Input
                      id="userName"
                      name="userName"
                      type="text"
                      placeholder="Alain Patrick"
                      value={form.userName}
                      onChange={handleChange}
                      required
                      className="border-neutral-300"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="userNickName">Pseudo</Label>
                    <Input
                      id="userNickName"
                      name="userNickName"
                      type="text"
                      placeholder="Alain Patrick"
                      value={form.userNickName}
                      onChange={handleChange}
                      required
                      className="border-neutral-300"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="userFirstname">Prénom</Label>
                    <Input
                      id="userFirstname"
                      name="userFirstname"
                      type="text"
                      placeholder="RAMAHEFARSON"
                      value={form.userFirstname}
                      onChange={handleChange}
                      required
                      className="border-neutral-300"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="userPhone">Téléphone</Label>
                    <Input
                      id="userPhone"
                      name="userPhone"
                      type="tel"
                      placeholder="0345682040"
                      value={form.userPhone}
                      onChange={handleChange}
                      required
                      className="border-neutral-300"
                    />
                  </div>
                  <div className="space-y-2 md:col-span-2">
                    <Label htmlFor="userAddress">Adresse</Label>
                    <Input
                      id="userAddress"
                      name="userAddress"
                      type="text"
                      placeholder="Ivory Nord"
                      value={form.userAddress}
                      onChange={handleChange}
                      required
                      className="border-neutral-300"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <Label>Localisation sur la carte (OpenStreetMap)</Label>
                    <LeafletMapPicker
                      lat={form.userMainLat}
                      lng={form.userMainLng}
                      onChange={({ lat, lng }) => setForm((prev) => ({ ...prev, userMainLat: lat, userMainLng: lng }))}
                    />
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="userMainLat">Latitude</Label>
                        <Input
                          id="userMainLat"
                          name="userMainLat"
                          type="text"
                          placeholder="-21.45267"
                          value={form.userMainLat}
                          readOnly
                          required
                          className="border-neutral-300 bg-neutral-100 cursor-not-allowed"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="userMainLng">Longitude</Label>
                        <Input
                          id="userMainLng"
                          name="userMainLng"
                          type="text"
                          placeholder="47.08569"
                          value={form.userMainLng}
                          readOnly
                          required
                          className="border-neutral-300 bg-neutral-100 cursor-not-allowed"
                        />
                      </div>
                    </div>
                  </div>
                  <div className="space-y-2 md:col-span-2">
                    <Label htmlFor="identityCardNumber">Numéro CIN</Label>
                    <Input
                      id="identityCardNumber"
                      name="identityCardNumber"
                      type="text"
                      placeholder="201031054771"
                      value={form.identityCardNumber}
                      onChange={handleChange}
                      required
                      className="border-neutral-300"
                    />
                  </div>
                  <div className="space-y-2 md:col-span-2">
                    <Label htmlFor="documentType">Type de document</Label>
                    <select
                      id="documentType"
                      name="documentType"
                      value={form.documentType}
                      onChange={handleChange}
                      required
                      className="border border-neutral-300 focus:border-violet-600 w-full rounded-md px-3 py-1.5"
                    >
                      <option value="">Sélectionner</option>
                      <option value="cin">CIN</option>
                      <option value="passeport">Passeport</option>
                      <option value="permi-de-conduire">Permis de conduire</option>
                    </select>
                  </div>
                </div>
              )}
              {/* ÉTAPE 3 */}
              {step === 2 && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Carte fiscale (PNG)</Label>
                    {form.carteFiscal.map((file, idx) => (
                      <div key={idx} className="flex items-center gap-2 mb-2">
                        <Input
                          id={`carteFiscal-${idx}`}
                          name="carteFiscal"
                          type="file"
                          accept="image/png"
                          data-idx={idx}
                          onChange={handleChange}
                          required={idx === 0}
                          className="border-neutral-300 flex-1"
                        />
                        {form.carteFiscal.length > 1 && (
                          <button type="button" onClick={() => handleRemoveFile('carteFiscal', idx)}
                            className="rounded-full bg-red-100 hover:bg-red-200 text-red-600 w-8 h-8 flex items-center justify-center transition">
                            <span className="text-xl font-bold">&minus;</span>
                          </button>
                        )}
                        {idx === form.carteFiscal.length - 1 && form.carteFiscal.length < 5 && (
                          <button type="button" onClick={() => handleAddFile('carteFiscal')}
                            className="rounded-full bg-violet-100 hover:bg-violet-200 text-violet-700 w-8 h-8 flex items-center justify-center transition">
                            <span className="text-xl font-bold">+</span>
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="carteStat">Carte Stat (PNG)</Label>
                    <Input
                      id="carteStat"
                      name="carteStat"
                      type="file"
                      accept="image/png"
                      onChange={handleChange}
                      required
                      className="border-neutral-300"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="logo">Logo (JPEG)</Label>
                    <Input
                      id="logo"
                      name="logo"
                      type="file"
                      accept="image/jpeg"
                      onChange={handleChange}
                      required
                      className="border-neutral-300"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="avatar">Avatar (PNG)</Label>
                    <Input
                      id="avatar"
                      name="avatar"
                      type="file"
                      accept="image/png"
                      onChange={handleChange}
                      required
                      className="border-neutral-300"
                    />
                  </div>
                  <div className="space-y-2 md:col-span-2">
                    <Label>Documents (PNG)</Label>
                    {form.documents.map((file, idx) => (
                      <div key={idx} className="flex items-center gap-2 mb-2">
                        <Input
                          id={`documents-${idx}`}
                          name="documents"
                          type="file"
                          accept="image/png"
                          data-idx={idx}
                          onChange={handleChange}
                          required={idx === 0}
                          className="border-neutral-300 flex-1"
                        />
                        {form.documents.length > 1 && (
                          <button type="button" onClick={() => handleRemoveFile('documents', idx)}
                            className="rounded-full bg-red-100 hover:bg-red-200 text-red-600 w-8 h-8 flex items-center justify-center transition">
                            <span className="text-xl font-bold">&minus;</span>
                          </button>
                        )}
                        {idx === form.documents.length - 1 && form.documents.length < 5 && (
                          <button type="button" onClick={() => handleAddFile('documents')}
                            className="rounded-full bg-violet-100 hover:bg-violet-200 text-violet-700 w-8 h-8 flex items-center justify-center transition">
                            <span className="text-xl font-bold">+</span>
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
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
                  <Button
                    type="submit"
                    className="bg-violet-600 hover:bg-violet-700 text-white"
                    disabled={loading}
                  >
                    {loading ? 'Inscription...' : "S'inscrire"}
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