import { useEffect, useRef, useState } from 'react';
import { Card } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
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
import PaginationControls from '../../components/commons/PaginationControls.jsx';
import { getUsers } from '../../services/user.service';
import { virementDroit, getMyDepositsAtOthers } from '../../services/transaction.service';
import { getAccessToken } from '../../services/token.service';
import useDateFormat from '../../utils/useDateFormat.jsx';
import useScreenType from '../../utils/useScreenType';
import { UserAutocomplete } from '../../components/commons/UserAutocomplete';

const VirementDroit = () => {
  usePageTitle('Virement de droit');
  const { user } = useAuth();
  const { isDesktop } = useScreenType();

  const [form, setForm] = useState({ quantite: '', observations: '' });

  const [virerModalOpen, setVirerModalOpen] = useState(false);
  const [selectedActifForVirement, setSelectedActifForVirement] = useState(null);

  const [recipientCode, setRecipientCode] = useState('');
  const [recipientName, setRecipientName] = useState('');
  const [selectedRecipient, setSelectedRecipient] = useState(null);
  const [recipientLookupLoading, setRecipientLookupLoading] = useState(false);
  const [recipientNotFound, setRecipientNotFound] = useState(false);
  const recipientSearchCodeRef = useRef('');
  const [loadingVirement, setLoadingVirement] = useState(false);
  // Conservés uniquement pendant la transition d'interface : le nouveau
  // contrat n'envoie ni site ni détenteur choisi par l'utilisateur.
  const [usersOptions] = useState([]);
  const [detenteurSearch, setDetenteurSearch] = useState('');
  const [, setSelectedDetenteur] = useState(null);
  const [recipientSites] = useState([]);
  const [loadingRecipientSites] = useState(false);
  const [, setSelectedRecipientSite] = useState(null);
  const [siteSearch, setSiteSearch] = useState('');
  const [siteOpen, setSiteOpen] = useState(false);
  const [siteHighlighted, setSiteHighlighted] = useState(0);
  const filteredSites = recipientSites.filter((site) => (
    (site?.siteName || '').toLowerCase().includes(siteSearch.toLowerCase())
  ));

  const dateFormat = useDateFormat();

  const [actifs, setActifs] = useState([]);
  const [loadingActifs, setLoadingActifs] = useState(false);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [total, setTotal] = useState(0);

  // Filtres
  const [filterSearch, setFilterSearch] = useState('');
  const [filterSiteId, setFilterSiteId] = useState('');
  const [filterProductId, setFilterProductId] = useState('');
  const [filterDetenteurId, setFilterDetenteurId] = useState('');

  const fetchActifs = async () => {
    try {
      setLoadingActifs(true);
      const token = getAccessToken() || localStorage.getItem('token');
      if (!token) {
        setActifs([]);
        setTotal(0);
        return;
      }

      const params = {
        page,
        limit,
        search: filterSearch || undefined,
        siteId: filterSiteId || undefined,
        productId: filterProductId || undefined,
        detentaireId: filterDetenteurId || undefined,
      };
      const res = await getMyDepositsAtOthers(params, token);
      const body = res?.data;
      const rawList = Array.isArray(body?.data) ? body.data : (Array.isArray(body) ? body : []);
      const actifsList = rawList.map(item => ({
        _id: item._id,
        productId: item.productId,
        productName: item.productId?.productName || '-',
        productCode: item.productId?.codeCPC || '',
        productImage: item.productId?.productImage || null,
        depot: item.siteDestinationId?.siteName || item.siteOrigineId?.siteName || '-',
        depotAdresse: item.siteDestinationId?.siteAddress || item.siteOrigineId?.siteAddress || '-',
        quantite: item.remainingQuantity ?? item.remainingQuantite ?? item.reliquat ?? item.quantite,
        status: item.status,
        detentaire: item.detentaire,
        ayant_droit: item.ayant_droit,
        dateCreation: item.createdAt,
        prixUnitaire: item.prixUnitaire,
        transactionNumber: item.transactionNumber,
        depotId: item.siteDestinationId?._id || item.siteOrigineId?._id,
      }));
      setActifs(actifsList);
      const totalCount = Number(body?.total ?? body?.pagination?.total ?? rawList.length);
      setTotal(Number.isFinite(totalCount) ? totalCount : 0);
    } catch (err) {
      console.error('Erreur fetchActifs:', err);
      setActifs([]);
      setTotal(0);
    } finally {
      setLoadingActifs(false);
    }
  };

  useEffect(() => { fetchActifs(); }, [page, limit, filterSearch, filterSiteId, filterProductId, filterDetenteurId]);

  const resolveRecipientByCode = async (code) => {
    setRecipientLookupLoading(true);
    try {
      const res = await getUsers({ search: code, limit: 10 });
      const list = Array.isArray(res) ? res : (Array.isArray(res?.data) ? res.data : []);
      return list.find(member => member?.userId === code) || list[0] || null;
    } catch (err) {
      console.error('Erreur lors de la recherche du bénéficiaire:', err);
      return null;
    } finally {
      setRecipientLookupLoading(false);
    }
  };

  const handleOpenVirementFromActif = (actif) => {
    if (actif?.status && String(actif.status).toUpperCase() !== 'APPROVED') {
      toast.error('Le dépôt de référence doit être approuvé.');
      return;
    }
    const currentUserId = String(user?._id ?? user?.id ?? user?.sub ?? user?.userId ?? '');
    const rightsHolderId = typeof actif?.ayant_droit === 'object'
      ? actif.ayant_droit?._id || actif.ayant_droit?.id
      : actif?.ayant_droit;
    if (currentUserId && rightsHolderId && currentUserId !== String(rightsHolderId)) {
      toast.error('Seul l’ayant droit actuel peut initier ce virement.');
      return;
    }
    setSelectedActifForVirement(actif);
    setForm({ quantite: '', observations: '' });
    setSelectedRecipient(null);
    setRecipientCode('');
    setRecipientName('');
    setRecipientNotFound(false);
    recipientSearchCodeRef.current = '';
    setVirerModalOpen(true);
  };

  const handleConfirmVirement = async () => {
    if (!selectedRecipient || !selectedActifForVirement) {
      toast.error('Veuillez sélectionner un bénéficiaire');
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

      const detentaireId = typeof actif?.detentaire === 'object'
        ? actif.detentaire?._id || actif.detentaire?.id
        : actif?.detentaire;
      if (!detentaireId) {
        toast.error('Détenteur introuvable pour ce dépôt');
        setLoadingVirement(false);
        return;
      }

      const quantiteVal = Number(form.quantite);
      if (!Number.isFinite(quantiteVal) || quantiteVal <= 0) {
        toast.error('Quantité invalide');
        setLoadingVirement(false);
        return;
      }
      if (actif?.quantite != null && quantiteVal > Number(actif.quantite)) {
        toast.error('Quantité supérieure au reliquat de ce dépôt');
        setLoadingVirement(false);
        return;
      }

      const payload = {
        id_transactions: actif._id,
        beneficiaryId: selectedRecipient._id || selectedRecipient.id || selectedRecipient,
        detentaireId,
        productId,
        quantite: quantiteVal,
        ...(form.observations.trim() ? { observations: form.observations.trim() } : {}),
      };

      await virementDroit(payload, token);
      const reliquat = Math.max(0, Number(actif.quantite) - quantiteVal);
      toast.success(`Virement de droit effectué : ${quantiteVal} transféré(s) au bénéficiaire. Reliquat du dépôt : ${reliquat}.`);
      setVirerModalOpen(false);
      setSelectedActifForVirement(null);
      setSelectedRecipient(null);
      setRecipientCode('');
      setRecipientName('');
      setRecipientNotFound(false);
      recipientSearchCodeRef.current = '';
      setForm({ quantite: '', observations: '' });
      await fetchActifs();
    } catch (err) {
      console.error('Erreur lors du virement :', err);
      toast.error(err?.response?.data?.message || 'Erreur lors du virement de droit');
    } finally {
      setLoadingVirement(false);
    }
  };

  const actif = selectedActifForVirement;
  const productId = actif?.productId?._id || actif?.productId || actif?.id || '';
  const quantity = Number(form.quantite);
  const quantityIsValid = form.quantite !== ''
    && Number.isFinite(quantity)
    && quantity > 0
    && (actif?.quantite == null || quantity <= Number(actif.quantite));
  const isVirementFormValid = Boolean(
    selectedRecipient
    && productId
    && quantityIsValid
    && !recipientLookupLoading
  );

  return (
    <div className="px-4 md:px-6 mx-auto">
      {user && user.userValidated === false ? (
        <UserNotValidatedBanner />
      ) : (
        <>
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="text-2xl text-neutral-900 mb-2">Virement de droit</h1>
              <p className="text-sm text-neutral-600">Transfert du droit d'un actif à un bénéficiaire tiers</p>
            </div>
          </div>

          <Card className="border-neutral-200 bg-white">
            <div className="p-4 space-y-4">
              <div className="flex flex-wrap gap-4">
                <div className="flex-1 min-w-50">
                  <Input
                    placeholder="Rechercher par produit ou transaction..."
                    value={filterSearch}
                    onChange={e => { setFilterSearch(e.target.value); setPage(1); }}
                    className="border-neutral-300"
                  />
                </div>
              </div>
              <ActifsTable loading={loadingActifs} actifs={actifs} dateFormat={dateFormat} isDesktop={isDesktop} onVirerDroit={handleOpenVirementFromActif} />
              <PaginationControls
                page={page}
                total={total}
                limit={limit}
                loading={loadingActifs}
                onPageChange={setPage}
                onLimitChange={setLimit}
                showLimitSelector
                className="pt-2"
              />
            </div>
          </Card>

          <Dialog open={virerModalOpen} onOpenChange={(open) => {
            setVirerModalOpen(open);
            if (!open) {
              setSelectedActifForVirement(null);
              setSelectedRecipient(null);
              setRecipientCode('');
              setRecipientName('');
              setRecipientNotFound(false);
              recipientSearchCodeRef.current = '';
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
                  <div className={`rounded-md p-2 ${recipientNotFound ? 'border border-red-400 bg-red-50' : ''}`}>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <Input
                          placeholder="ID du membre (8 caractères)"
                          value={recipientCode}
                          maxLength={8}
                          style={{ textTransform: 'uppercase' }}
                          onChange={e => {
                            const value = e.target.value.toUpperCase();
                            const code = value.trim();
                            recipientSearchCodeRef.current = code;
                            setRecipientCode(value);
                            setSelectedRecipient(null);
                            setRecipientName('');
                            setRecipientNotFound(false);

                            if (code.length === 8) {
                              resolveRecipientByCode(code).then(found => {
                                if (recipientSearchCodeRef.current !== code) return;
                                if (!found) {
                                  setRecipientNotFound(true);
                                  return;
                                }
                                const name = ([found.userName, found.userFirstname].filter(Boolean).join(' ') || found.userNickName || found.name || '');
                                setSelectedRecipient(found);
                                setRecipientName(name);
                              });
                            }
                          }}
                          className={`border-neutral-300 ${recipientNotFound ? 'border-red-400 bg-white' : ''}`}
                        />
                      </div>
                      <Input
                        placeholder={recipientNotFound ? 'Membre non trouvé' : 'Nom du bénéficiaire'}
                        value={recipientName}
                        readOnly
                        disabled={recipientLookupLoading}
                        className={`border-neutral-300 bg-neutral-100 text-neutral-700 ${recipientNotFound ? 'border-red-400 text-red-600' : ''}`}
                      />
                      <div className="sm:col-span-2 flex items-center justify-between text-xs">
                        {recipientLookupLoading ? (
                          <span className="text-neutral-400">Recherche en cours...</span>
                        ) : recipientName ? (
                          <span className="text-emerald-600">Code valide</span>
                        ) : recipientNotFound ? (
                          <span className="text-red-600">Code invalide</span>
                        ) : recipientCode && recipientCode.length !== 8 ? (
                          <span className="text-amber-600">Le code doit contenir exactement 8 caractères</span>
                        ) : (
                          <span className="text-neutral-500" />
                        )}
                        <span className="text-neutral-400">{recipientCode.length}/8</span>
                      </div>
                      {recipientNotFound && (
                        <p className="sm:col-span-2 text-xs text-red-600">Aucun membre trouvé avec cet ID. Vérifiez l'ID membre et le nom du membre.</p>
                      )}
                    </div>
                  </div>
                </div>

                <div className="hidden">
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
                            onMouseDown={(e) => e.preventDefault()}
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

                <div className="hidden">
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

                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-1">Produit</label>
                  <Input disabled value={actif?.productName || '-'} className="border-neutral-300 bg-neutral-50" />
                </div>

                <p className="text-xs text-neutral-500">
                  Le détenteur et le site du dépôt de référence restent inchangés.
                </p>

                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-1">Quantité <span className="text-red-500 ml-0.5">*</span></label>
                  <Input
                    type="number"
                    min="any"
                    step="any"
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
                  <Button status={loadingVirement ? 'loading' : (isVirementFormValid ? 'active' : 'inactive')} onClick={handleConfirmVirement} disabled={!isVirementFormValid || loadingVirement} color="default">
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
