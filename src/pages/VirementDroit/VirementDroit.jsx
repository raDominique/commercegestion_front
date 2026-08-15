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
import { getAllUsersSelect } from '../../services/user.service';
import { virementDroit, getMyDepositsAtOthers } from '../../services/transaction.service';
import { getAccessToken } from '../../services/token.service';
import { getSitesByUser } from '../../services/site.service';
import useDateFormat from '../../utils/useDateFormat.jsx';
import useScreenType from '../../utils/useScreenType';
import { UserAutocomplete } from '../../components/commons/UserAutocomplete';

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
  const { isDesktop } = useScreenType();

  const [form, setForm] = useState({ quantite: '', observations: '' });

  const [virerModalOpen, setVirerModalOpen] = useState(false);
  const [selectedActifForVirement, setSelectedActifForVirement] = useState(null);

  const [usersOptions, setUsersOptions] = useState([]);
  const [recipientSearch, setRecipientSearch] = useState('');
  const [selectedRecipient, setSelectedRecipient] = useState(null);
  const [, setLoadingRecipients] = useState(false);
  const [loadingVirement, setLoadingVirement] = useState(false);

	const [detenteurSearch, setDetenteurSearch] = useState('');
	const [selectedDetenteur, setSelectedDetenteur] = useState(null);

	const [recipientSites, setRecipientSites] = useState([]);
	const [loadingRecipientSites, setLoadingRecipientSites] = useState(false);
	const [selectedRecipientSite, setSelectedRecipientSite] = useState(null);
	const [siteSearch, setSiteSearch] = useState('');
	const [siteOpen, setSiteOpen] = useState(false);
	const [siteHighlighted, setSiteHighlighted] = useState(0);

  const dateFormat = useDateFormat();

  const [actifs, setActifs] = useState([]);
  const [loadingActifs, setLoadingActifs] = useState(false);

  // Filtres
  const [filterSearch, setFilterSearch] = useState('');
  const [filterDetenteurId, setFilterDetenteurId] = useState('');

  const fetchActifs = async () => {
    try {
      setLoadingActifs(true);
      const token = getAccessToken() || localStorage.getItem('token');
      if (!token) {
        setActifs([]);
        return;
      }

      const params = { page: 1, limit: 100, search: filterSearch || undefined, detentaireId: filterDetenteurId || undefined };
      const res = await getMyDepositsAtOthers(params, token);
      const body = res?.data;
      const rawList = Array.isArray(body?.data) ? body.data : (Array.isArray(body) ? body : []);
      const actifsList = rawList.map(item => ({
        _id: item._id,
        productName: item.productId?.productName || '-',
        productCode: item.productId?.codeCPC || '',
        productImage: item.productId?.productImage || null,
        depot: item.siteDestinationId?.siteName || item.siteOrigineId?.siteName || '-',
        depotAdresse: item.siteDestinationId?.siteAddress || item.siteOrigineId?.siteAddress || '-',
        quantite: item.quantite,
        detentaire: item.detentaire,
        ayant_droit: item.ayant_droit,
        dateCreation: item.createdAt,
        prixUnitaire: item.prixUnitaire,
        transactionNumber: item.transactionNumber,
        depotId: item.siteDestinationId?._id || item.siteOrigineId?._id,
      }));
      setActifs(actifsList);
    } catch (err) {
      console.error('Erreur fetchActifs:', err);
      setActifs([]);
    } finally {
      setLoadingActifs(false);
    }
  };

  useEffect(() => { fetchActifs(); }, [filterSearch, filterDetenteurId]);

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

  const filteredSites = recipientSites.filter(site => (site?.siteName || '').toLowerCase().includes(siteSearch.toLowerCase()));

  useEffect(() => {
    const recId = selectedRecipient?._id || selectedRecipient?.id;
    if (recId) {
      setLoadingRecipientSites(true);
      setSelectedRecipientSite(null);
      setSiteSearch('');
      getSitesByUser(recId)
        .then(res => {
          const sites = Array.isArray(res) ? res : (res?.data ?? []);
          setRecipientSites(Array.isArray(sites) ? sites : []);
        })
        .catch(() => {
          toast.error('Erreur de chargement des sites du bénéficiaire');
          setRecipientSites([]);
        })
        .finally(() => setLoadingRecipientSites(false));
    } else {
      setRecipientSites([]);
      setSelectedRecipientSite(null);
      setSiteSearch('');
    }
  }, [selectedRecipient]);

  const handleOpenVirementFromActif = (actif) => {
    setSelectedActifForVirement(actif);
    setForm({ quantite: '', observations: '' });
    setSelectedRecipient(null);
    setRecipientSearch('');
    setSelectedDetenteur(null);
    setSelectedRecipientSite(null);
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
    if (!selectedRecipientSite) {
      toast.error('Veuillez sélectionner le site du bénéficiaire');
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

      const siteId = selectedRecipientSite?._id || selectedRecipientSite?.id || '';
      if (!siteId) {
        toast.error('Site du bénéficiaire introuvable');
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
    <div className="px-4 md:px-6 mx-auto">
      {user && user.userValidated === false ? (
        <UserNotValidatedBanner />
      ) : (
        <>
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="text-2xl text-neutral-900 mb-2">Virement de droit</h1>
              <p className="text-sm text-neutral-600">Transférez le droit d'un actif à un bénéficiaire tiers</p>
            </div>
          </div>

          <Card className="border-neutral-200 bg-white">
            <div className="p-4 space-y-4">
              <div className="flex flex-wrap gap-4">
                <div className="flex-1 min-w-50">
                  <Input
                    placeholder="Rechercher par produit ou transaction..."
                    value={filterSearch}
                    onChange={e => setFilterSearch(e.target.value)}
                    className="border-neutral-300"
                  />
                </div>
              </div>
              <ActifsTable loading={loadingActifs} actifs={actifs} dateFormat={dateFormat} isDesktop={isDesktop} onVirerDroit={handleOpenVirementFromActif} />
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
                  <UserAutocomplete
                    users={usersOptions}
                    value={recipientSearch}
                    onChange={setRecipientSearch}
                    onSelect={(user) => {
                      setSelectedRecipient(user);
                      setRecipientSearch(`${user.name || user.userName || user.userNickName || ''} - ${user.numeroMembre || user._id || ''}`);
                    }}
                    getSubLabel={(user) => `${user.numeroMembre || ''}`}
                    placeholder={usersOptions.length === 0 ? 'Chargement...' : 'Rechercher le bénéficiaire...'}
                    className="w-full border-neutral-300"
                  />
                </div>

                <div className="space-y-2">
                  <label className="block text-sm font-medium text-neutral-700 mb-1">Détenteur (Y) <span className="text-red-500 ml-0.5">*</span></label>
                  <UserAutocomplete
                    users={usersOptions}
                    value={detenteurSearch}
                    onChange={setDetenteurSearch}
                    onSelect={(user) => {
                      setSelectedDetenteur(user);
                      setDetenteurSearch(`${user.name || user.userName || user.userNickName || ''} - ${user.numeroMembre || user._id || ''}`);
                    }}
                    getSubLabel={(user) => `${user.numeroMembre || ''}`}
                    placeholder={usersOptions.length === 0 ? 'Chargement...' : 'Rechercher le détenteur...'}
                    className="w-full border-neutral-300"
                  />
                </div>

                <div className="space-y-2">
                  <label className="block text-sm font-medium text-neutral-700 mb-1">Site du bénéficiaire (Z) <span className="text-red-500 ml-0.5">*</span></label>
                  <div className="relative">
                    <Input
                      placeholder={loadingRecipientSites ? 'Chargement...' : selectedRecipient ? 'Rechercher le site...' : 'Sélectionnez d\'abord le bénéficiaire'}
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
                              setSelectedRecipientSite(site);
                              setSiteSearch(site.siteName);
                              setSiteOpen(false);
                            }
                          }
                        }
                      }}
                      className="w-full border-neutral-300"
                      disabled={!selectedRecipient || loadingRecipientSites}
                    />
                    {siteOpen && filteredSites.length > 0 && (
                      <div className="absolute left-0 right-0 mt-1 bg-white border rounded shadow max-h-60 overflow-auto z-50">
                        {filteredSites.map((site, idx) => (
                          <button
                            type="button"
                            key={site._id}
                            onMouseEnter={() => setSiteHighlighted(idx)}
                            onClick={() => { setSelectedRecipientSite(site); setSiteSearch(site.siteName); setSiteOpen(false); }}
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
                  <Button status={loadingVirement ? 'loading' : (selectedRecipient && selectedDetenteur && selectedRecipientSite ? 'active' : 'inactive')} onClick={handleConfirmVirement} disabled={!selectedRecipient || !selectedDetenteur || !selectedRecipientSite || loadingVirement} color="default">
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
