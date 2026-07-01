import { useEffect, useState } from 'react';
import { Card } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Label } from '../../components/ui/label';
import { Loader } from '../../components/ui/loader';
import { Input } from '../../components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription
} from '../../components/ui/dialog';
import usePageTitle from '../../utils/usePageTitle.jsx';
import { toast } from 'sonner';
import { useAuth } from '../../context/AuthContext';
import UserNotValidatedBanner from '../../components/commons/UserNotValidatedBanner.jsx';
import ActifsTable from '../../components/commons/ActifsTable';
import { getActifs } from '../../services/ledger.service';
import { getAllUsersSelect } from '../../services/user.service';
import { getProfile } from '../../services/auth.service';
import { virementDroit } from '../../services/transaction.service';
import { getAccessToken } from '../../services/token.service';
import { getSitesByUser } from '../../services/site.service';
import useDateFormat from '../../utils/useDateFormat.jsx';

const findUserByName = (name, users) => {
  if (!name || !users?.length) return null;
  const q = name.toLowerCase();
  return users.find(u =>
    (u?.name || '').toLowerCase() === q ||
    (u?.userName || '').toLowerCase() === q ||
    (u?.userNickName || '').toLowerCase() === q ||
    `${(u?.userNickName || '')} ${(u?.userName || '')}`.toLowerCase() === q ||
    `${(u?.userName || '')} ${(u?.userNickName || '')}`.toLowerCase() === q ||
    (u?.name || '').toLowerCase().includes(q) ||
    (u?.userNickName || '').toLowerCase().includes(q)
  ) || null;
};

const renderPerson = (person) => {
  if (!person) return '-';
  if (typeof person === 'string') return person;
  if (person.userNickName) return person.userNickName;
  if (person.userName) return person.userName;
  if (person.name) return person.name;
  return '-';
};

const VirementDroit = () => {
  usePageTitle('Virement de droit');
  const { user } = useAuth();

  const [form, setForm] = useState({ quantite: '', observations: '' });

  const [virerModalOpen, setVirerModalOpen] = useState(false);
  const [selectedActifForVirement, setSelectedActifForVirement] = useState(null);

  const [usersOptions, setUsersOptions] = useState([]);
  const [recipientSearch, setRecipientSearch] = useState('');
  const [recipientOpen, setRecipientOpen] = useState(false);
  const [recipientHighlighted, setRecipientHighlighted] = useState(0);
  const [filteredRecipients, setFilteredRecipients] = useState([]);
  const [selectedRecipient, setSelectedRecipient] = useState(null);
  const [, setLoadingRecipients] = useState(false);
  const [loadingVirement, setLoadingVirement] = useState(false);

	const [detenteurSearch, setDetenteurSearch] = useState('');
	const [detenteurOpen, setDetenteurOpen] = useState(false);
	const [detenteurHighlighted, setDetenteurHighlighted] = useState(0);
	const [filteredDetenteurs, setFilteredDetenteurs] = useState([]);
	const [selectedDetenteur, setSelectedDetenteur] = useState(null);

	const [detentaireSites, setDetentaireSites] = useState([]);
	const [loadingDetentaireSites, setLoadingDetentaireSites] = useState(false);
	const [selectedDetentaireSite, setSelectedDetentaireSite] = useState(null);
	const [siteSearch, setSiteSearch] = useState('');
	const [siteOpen, setSiteOpen] = useState(false);
	const [siteHighlighted, setSiteHighlighted] = useState(0);

	const dateFormat = useDateFormat();

  const [actifs, setActifs] = useState([]);
  const [loadingActifs, setLoadingActifs] = useState(false);

  const fetchActifs = async () => {
    try {
      setLoadingActifs(true);
      let userId = user?._id;
      if (!userId) {
        try {
          const profile = await getProfile();
          userId = profile?._id || profile?.id;
        } catch (e) {
          console.debug("Impossible de récupérer l'identifiant utilisateur pour actifs:", e);
        }
      }

      const params = { page: 1, limit: 100 };
      const res = await getActifs(userId, params);
      const actifsList = Array.isArray(res?.data) ? res.data : (Array.isArray(res) ? res : []);
      setActifs(actifsList);
    } catch (err) {
      console.error('Erreur fetchActifs:', err);
      setActifs([]);
    } finally {
      setLoadingActifs(false);
    }
  };

  useEffect(() => { fetchActifs(); }, []);

  const fetchUsers = async () => {
    try {
      setLoadingRecipients(true);
      const res = await getAllUsersSelect();
      const list = Array.isArray(res) ? res : (res?.data ?? []);
      setUsersOptions(list || []);
    } catch (err) {
      console.error('Erreur fetchUsers:', err);
      setUsersOptions([]);
    } finally {
      setLoadingRecipients(false);
    }
  };

  useEffect(() => {
    setFilteredRecipients(usersOptions.filter(u => (u?.name || u?.userName || u?.userNickName || '').toLowerCase().includes((recipientSearch || '').toLowerCase())));
  }, [recipientSearch, usersOptions]);

  useEffect(() => {
    setFilteredDetenteurs(usersOptions.filter(u => (u?.name || u?.userName || u?.userNickName || '').toLowerCase().includes((detenteurSearch || '').toLowerCase())));
  }, [detenteurSearch, usersOptions]);

  const filteredSites = detentaireSites.filter(site => (site?.siteName || '').toLowerCase().includes(siteSearch.toLowerCase()));

  useEffect(() => {
    const detId = selectedDetenteur?._id || selectedDetenteur?.id;
    if (detId) {
      setLoadingDetentaireSites(true);
      setSelectedDetentaireSite(null);
      setSiteSearch('');
      getSitesByUser(detId)
        .then(res => {
          const sites = Array.isArray(res) ? res : (res?.data ?? []);
          setDetentaireSites(Array.isArray(sites) ? sites : []);
        })
        .catch(() => {
          toast.error('Erreur de chargement des sites du détenteur');
          setDetentaireSites([]);
        })
        .finally(() => setLoadingDetentaireSites(false));
    } else {
      setDetentaireSites([]);
      setSelectedDetentaireSite(null);
      setSiteSearch('');
    }
  }, [selectedDetenteur]);

  const handleOpenVirementFromActif = (actif) => {
    setSelectedActifForVirement(actif);
    setForm({ quantite: '', observations: '' });
    setSelectedRecipient(null);
    setRecipientSearch('');
    setSelectedDetenteur(null);
    setSelectedDetentaireSite(null);
    setSiteSearch('');
    const detName = renderPerson(actif?.detentaire);
    setDetenteurSearch(detName);
    // try to auto-select the detenteur from usersOptions
    const found = findUserByName(detName, usersOptions);
    if (found) setSelectedDetenteur(found);
    setVirerModalOpen(true);
    if (!usersOptions || usersOptions.length === 0) fetchUsers();
  };

  const handleConfirmVirement = async () => {
    if (!selectedRecipient || !selectedDetenteur || !selectedActifForVirement) {
      toast.error('Veuillez sélectionner un détenteur et un bénéficiaire');
      return;
    }
    if (!selectedDetentaireSite) {
      toast.error('Veuillez sélectionner le site de dépôt du détenteur');
      return;
    }
    try {
      setLoadingVirement(true);
      const token = getAccessToken() || localStorage.getItem('token');
      if (!token) {
        toast.error("Token d'authentification manquant");
        setLoadingVirement(false);
        return;
      }

      const actif = selectedActifForVirement;

      const productId = (actif?.productId && (actif.productId._id || actif.productId)) || actif?.id || '';
      if (!productId) {
        toast.error('Produit introuvable pour cet actif');
        setLoadingVirement(false);
        return;
      }

      const detentaireId = selectedDetenteur?._id || selectedDetenteur?.id || '';
      if (!detentaireId) {
        toast.error('Veuillez sélectionner le détenteur (Y)');
        setLoadingVirement(false);
        return;
      }

      const siteId = selectedDetentaireSite?._id || selectedDetentaireSite?.id || '';
      if (!siteId) {
        toast.error('Site de dépôt introuvable pour cet actif');
        setLoadingVirement(false);
        return;
      }

      const quantiteVal = Number(form.quantite || actif?.quantite || 1);
      if (!Number.isFinite(quantiteVal) || quantiteVal <= 0) {
        toast.error('Quantité invalide');
        setLoadingVirement(false);
        return;
      }
      if (actif?.quantite != null && quantiteVal > Number(actif.quantite)) {
        toast.error('Quantité supérieure au stock disponible');
        setLoadingVirement(false);
        return;
      }

      const payload = {
        beneficiaryId: selectedRecipient._id || selectedRecipient.id || selectedRecipient,
        detentaireId,
        siteId,
        productId,
        quantite: quantiteVal,
        observations: form.observations || `Virement de droit vers ${renderPerson(selectedRecipient)}`,
      };

      await virementDroit(payload, token);
      toast.success(`Virement de droit effectué vers ${renderPerson(selectedRecipient)}`);
      setVirerModalOpen(false);
      setSelectedActifForVirement(null);
      setSelectedRecipient(null);
      setRecipientSearch('');
      setForm({ quantite: '', observations: '' });
      await fetchActifs();
    } catch (err) {
      console.error('Erreur lors du virement :', err);
      toast.error(err?.response?.data?.message || 'Erreur lors du virement');
    } finally {
      setLoadingVirement(false);
    }
  };

  const actif = selectedActifForVirement;

  return (
    <div className="px-6 mx-auto">
      {user && user.userValidated === false ? (
        <UserNotValidatedBanner />
      ) : (
        <>
          <div className="flex justify-between items-center mb-6">
            <div>
              <h1 className="text-2xl text-neutral-900 mb-2">Virement de droit</h1>
              <p className="text-sm text-neutral-600">Transférez le droit d'un actif à un bénéficiaire tiers</p>
            </div>
          </div>

          <Card className="border-neutral-200 bg-white">
            <div className="p-4">
              <ActifsTable loading={loadingActifs} actifs={actifs} dateFormat={dateFormat} isDesktop={true} onVirerDroit={handleOpenVirementFromActif} />
            </div>
          </Card>

          <Dialog open={virerModalOpen} onOpenChange={(open) => {
            setVirerModalOpen(open);
            if (!open) {
              setSelectedActifForVirement(null);
              setSelectedRecipient(null);
              setRecipientSearch('');
              setSelectedDetenteur(null);
              setDetenteurSearch('');
              setForm({ quantite: '', observations: '' });
            }
          }}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>VIREMENT DE DROIT</DialogTitle>
                <DialogDescription>
                  Virement de droit auprès d'un bénéficiaire tiers
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-1">ID Transaction</label>
                  <Input disabled value="Généré automatiquement" className="border-neutral-300 bg-neutral-50 text-neutral-500" />
                </div>

                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-1">Intitulé transaction</label>
                  <Input disabled value="VIREMENT DE DROIT" className="border-neutral-300 bg-neutral-50" />
                </div>

                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-1">Bénéficiaire (Z) <span className="text-red-500 ml-0.5">*</span></label>
                  <div className="relative">
                    <Input
                      placeholder={usersOptions.length === 0 ? 'Chargement...' : 'Rechercher le bénéficiaire...'}
                      value={recipientSearch}
                      onChange={(e) => { setRecipientSearch(e.target.value); setRecipientHighlighted(0); }}
                      onFocus={() => { setRecipientOpen(true); setRecipientHighlighted(0); }}
                      onBlur={() => setTimeout(() => setRecipientOpen(false), 150)}
                      onKeyDown={(e) => {
                        if (e.key === 'Escape') return setRecipientOpen(false);
                        if (!recipientOpen && (e.key === 'ArrowDown' || e.key === 'ArrowUp')) {
                          setRecipientOpen(true);
                          e.preventDefault();
                          return;
                        }
                        if (recipientOpen) {
                          if (e.key === 'ArrowDown') {
                            e.preventDefault();
                            setRecipientHighlighted(i => Math.min(i + 1, Math.max(filteredRecipients.length - 1, 0)));
                          } else if (e.key === 'ArrowUp') {
                            e.preventDefault();
                            setRecipientHighlighted(i => Math.max(i - 1, 0));
                          } else if (e.key === 'Enter') {
                            e.preventDefault();
                            const u = filteredRecipients[recipientHighlighted];
                            if (u) {
                              setSelectedRecipient(u);
                              setRecipientSearch(`${u.name || u.userName || u.userNickName || ''} - ${u.numeroMembre || u._id || ''}`);
                              setRecipientOpen(false);
                            }
                          }
                        }
                      }}
                      className="w-full border-neutral-300"
                    />

                    {recipientOpen && filteredRecipients.length > 0 && (
                      <div className="absolute left-0 right-0 mt-1 bg-white border rounded shadow max-h-60 overflow-auto z-50">
                        {filteredRecipients.map((u, idx) => (
                          <button
                            type="button"
                            key={u._id}
                            onMouseEnter={() => setRecipientHighlighted(idx)}
                            onClick={() => { setSelectedRecipient(u); setRecipientSearch(`${u.name || u.userName || u.userNickName || ''} - ${u.numeroMembre || u._id || ''}`); setRecipientOpen(false); }}
                            className={`w-full text-left px-3 py-2 text-sm ${idx === recipientHighlighted ? 'bg-violet-50' : 'hover:bg-neutral-100'}`}
                          >
                            {u.name || u.userName || u.userNickName} - {u.numeroMembre || u._id || ''}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="block text-sm font-medium text-neutral-700 mb-1">Détenteur (Y) <span className="text-red-500 ml-0.5">*</span></label>
                  <div className="relative">
                    <Input
                      placeholder={usersOptions.length === 0 ? 'Chargement...' : 'Rechercher le détenteur...'}
                      value={detenteurSearch}
                      onChange={(e) => { setDetenteurSearch(e.target.value); setDetenteurHighlighted(0); }}
                      onFocus={() => { setDetenteurOpen(true); setDetenteurHighlighted(0); }}
                      onBlur={() => setTimeout(() => setDetenteurOpen(false), 150)}
                      onKeyDown={(e) => {
                        if (e.key === 'Escape') return setDetenteurOpen(false);
                        if (!detenteurOpen && (e.key === 'ArrowDown' || e.key === 'ArrowUp')) {
                          setDetenteurOpen(true);
                          e.preventDefault();
                          return;
                        }
                        if (detenteurOpen) {
                          if (e.key === 'ArrowDown') {
                            e.preventDefault();
                            setDetenteurHighlighted(i => Math.min(i + 1, Math.max(filteredDetenteurs.length - 1, 0)));
                          } else if (e.key === 'ArrowUp') {
                            e.preventDefault();
                            setDetenteurHighlighted(i => Math.max(i - 1, 0));
                          } else if (e.key === 'Enter') {
                            e.preventDefault();
                            const u = filteredDetenteurs[detenteurHighlighted];
                            if (u) {
                              setSelectedDetenteur(u);
                              setDetenteurSearch(`${u.name || u.userName || u.userNickName || ''} - ${u.numeroMembre || u._id || ''}`);
                              setDetenteurOpen(false);
                            }
                          }
                        }
                      }}
                      className="w-full border-neutral-300"
                    />
                    {detenteurOpen && filteredDetenteurs.length > 0 && (
                      <div className="absolute left-0 right-0 mt-1 bg-white border rounded shadow max-h-60 overflow-auto z-50">
                        {filteredDetenteurs.map((u, idx) => (
                          <button
                            type="button"
                            key={u._id}
                            onMouseEnter={() => setDetenteurHighlighted(idx)}
                            onClick={() => { setSelectedDetenteur(u); setDetenteurSearch(`${u.name || u.userName || u.userNickName || ''} - ${u.numeroMembre || u._id || ''}`); setDetenteurOpen(false); }}
                            className={`w-full text-left px-3 py-2 text-sm ${idx === detenteurHighlighted ? 'bg-violet-50' : 'hover:bg-neutral-100'}`}
                          >
                            {u.name || u.userName || u.userNickName} - {u.numeroMembre || u._id || ''}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="block text-sm font-medium text-neutral-700 mb-1">Site de dépôt (Y) <span className="text-red-500 ml-0.5">*</span></label>
                  <div className="relative">
                    <Input
                      placeholder={loadingDetentaireSites ? 'Chargement...' : selectedDetenteur ? 'Rechercher le site...' : 'Sélectionnez d\'abord le détenteur'}
                      value={siteSearch}
                      onChange={(e) => { setSiteSearch(e.target.value); setSiteHighlighted(0); }}
                      onFocus={() => { setSiteOpen(true); setSiteHighlighted(0); }}
                      onBlur={() => setTimeout(() => setSiteOpen(false), 150)}
                      onKeyDown={(e) => {
                        if (e.key === 'Escape') return setSiteOpen(false);
                        if (!siteOpen && (e.key === 'ArrowDown' || e.key === 'ArrowUp')) {
                          setSiteOpen(true);
                          e.preventDefault();
                          return;
                        }
                        if (siteOpen) {
                          if (e.key === 'ArrowDown') {
                            e.preventDefault();
                            setSiteHighlighted(i => Math.min(i + 1, Math.max(filteredSites.length - 1, 0)));
                          } else if (e.key === 'ArrowUp') {
                            e.preventDefault();
                            setSiteHighlighted(i => Math.max(i - 1, 0));
                          } else if (e.key === 'Enter') {
                            e.preventDefault();
                            const site = filteredSites[siteHighlighted];
                            if (site) {
                              setSelectedDetentaireSite(site);
                              setSiteSearch(site.siteName);
                              setSiteOpen(false);
                            }
                          }
                        }
                      }}
                      className="w-full border-neutral-300"
                      disabled={!selectedDetenteur || loadingDetentaireSites}
                    />
                    {siteOpen && filteredSites.length > 0 && (
                      <div className="absolute left-0 right-0 mt-1 bg-white border rounded shadow max-h-60 overflow-auto z-50">
                        {filteredSites.map((site, idx) => (
                          <button
                            type="button"
                            key={site._id}
                            onMouseEnter={() => setSiteHighlighted(idx)}
                            onClick={() => { setSelectedDetentaireSite(site); setSiteSearch(site.siteName); setSiteOpen(false); }}
                            className={`w-full text-left px-3 py-2 text-sm ${idx === siteHighlighted ? 'bg-violet-50' : 'hover:bg-neutral-100'}`}
                          >
                            {site.siteName}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-1">Produit</label>
                  <Input disabled value={actif?.productName || '-'} className="border-neutral-300 bg-neutral-50" />
                </div>

                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-1">Quantité <span className="text-red-500 ml-0.5">*</span></label>
                  <Input
                    type="number"
                    min={1}
                    max={actif?.quantite ?? undefined}
                    value={form.quantite}
                    onChange={(e) => setForm(prev => ({ ...prev, quantite: e.target.value }))}
                    className="w-full border-neutral-300"
                  />
                  {actif?.quantite != null && (
                    <div className="text-xs text-neutral-500 mt-1">Disponible: {actif.quantite}</div>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-1">Observations</label>
                  <Input
                    placeholder="Observations facultatives"
                    value={form.observations}
                    onChange={(e) => setForm(prev => ({ ...prev, observations: e.target.value }))}
                    className="border-neutral-300"
                  />
                </div>

                <div className="flex justify-end gap-2 pt-4">
                  <Button variant="outline" onClick={() => setVirerModalOpen(false)}>Annuler</Button>
                  <Button status={loadingVirement ? 'loading' : (selectedRecipient && selectedDetenteur && selectedDetentaireSite ? 'active' : 'inactive')} onClick={handleConfirmVirement} disabled={!selectedRecipient || !selectedDetenteur || !selectedDetentaireSite || loadingVirement} color="default">
                    {loadingVirement && <Loader size="sm" className="border-white border-t-transparent shrink-0" />} Confirmer le virement
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </>
      )}
    </div>
  );
};

export default VirementDroit;
