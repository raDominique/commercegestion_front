import { useEffect, useState } from 'react';
import { Card } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Label } from '../../components/ui/label';
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
import { getSitesByUser } from '../../services/site.service';
import { virementStock } from '../../services/stocks_move.service';
import { getAccessToken } from '../../services/token.service';
import useDateFormat from '../../utils/useDateFormat.jsx';

const VirementDroit = () => {
  usePageTitle('Virement de droit');
  const { user } = useAuth();

  const [form, setForm] = useState({ produit: '', productId: '', quantite: '', prixUnitaire: '', destinataire: '', observations: '' });
  const [saving, setSaving] = useState(false);

  // Modal état pour virer droit
  const [virerModalOpen, setVirerModalOpen] = useState(false);
  const [selectedActifForVirement, setSelectedActifForVirement] = useState(null);

  // Utilisateurs / Ayant droit
  const [usersOptions, setUsersOptions] = useState([]);
  const [recipientSearch, setRecipientSearch] = useState('');
  const [recipientOpen, setRecipientOpen] = useState(false);
  const [recipientHighlighted, setRecipientHighlighted] = useState(0);
  const [filteredRecipients, setFilteredRecipients] = useState([]);
  const [selectedRecipient, setSelectedRecipient] = useState(null);
  const [loadingRecipients, setLoadingRecipients] = useState(false);
  const [loadingVirement, setLoadingVirement] = useState(false);

  // Sites destinataire
  const [destinationSites, setDestinationSites] = useState([]);
  const [siteDestinationSearch, setSiteDestinationSearch] = useState('');
  const [siteDestinationOpen, setSiteDestinationOpen] = useState(false);
  const [siteDestinationHighlighted, setSiteDestinationHighlighted] = useState(0);
  const [selectedDestinationSite, setSelectedDestinationSite] = useState(null);
  const [loadingDestinationSites, setLoadingDestinationSites] = useState(false);

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
    // Load destination sites for the selected recipient
    async function loadDestinationSites() {
      if (!selectedRecipient) {
        setDestinationSites([]);
        setSelectedDestinationSite(null);
        setSiteDestinationSearch('');
        setForm(prev => ({ ...prev, siteDestinationId: '' }));
        return;
      }
      try {
        setLoadingDestinationSites(true);
        const res = await getSitesByUser(selectedRecipient._id || selectedRecipient.id || selectedRecipient);
        const list = Array.isArray(res) ? res : (res?.data ?? []);
        setDestinationSites(list || []);
        if (Array.isArray(list) && list.length === 1) {
          const s = list[0];
          setSelectedDestinationSite(s);
          setSiteDestinationSearch(s.siteName || s.name || '');
          setForm(prev => ({ ...prev, siteDestinationId: s._id || s.id }));
        }
      } catch (err) {
        console.error('Erreur fetch destination sites:', err);
        setDestinationSites([]);
      } finally {
        setLoadingDestinationSites(false);
      }
    }
    loadDestinationSites();
  }, [selectedRecipient]);

  const handleOpenVirementFromActif = (actif) => {
    const pid = (actif?.productId && (actif.productId._id || actif.productId)) || actif.productId || actif.id || '';
    // Prefill deposit (site destination) from the actif when opening
    const rawDepot = actif?.depotId || actif?.siteOrigineId || actif?.siteId || actif?.depot || null;
    const depotId = rawDepot && (rawDepot._id || rawDepot.id || rawDepot) || '';
    const depotName = rawDepot && (rawDepot.siteName || rawDepot.name || actif?.depot || '') || '';
    setForm(prev => ({ ...prev, produit: actif.productName || '', productId: pid, quantite: '', prixUnitaire: actif?.prixUnitaire || '', siteDestinationId: depotId }));
    setSiteDestinationSearch(depotName);
    setSelectedActifForVirement(actif);
    setSelectedRecipient(null);
    setRecipientSearch('');
    setVirerModalOpen(true);
    if (!usersOptions || usersOptions.length === 0) fetchUsers();
  };

  const handleConfirmVirement = async () => {
    if (!selectedRecipient || !selectedActifForVirement) {
      toast.error('Veuillez sélectionner un ayant droit');
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

      const pid = form.productId || ((selectedActifForVirement?.productId && (selectedActifForVirement.productId._id || selectedActifForVirement.productId)) || selectedActifForVirement?.id || '');

      // Extraire l'ID du site d'origine depuis plusieurs champs possibles (depotId, siteOrigineId, etc.)
      const rawSiteOrigine = selectedActifForVirement?.departDeId || selectedActifForVirement?.depotId || selectedActifForVirement?.siteOrigineId || selectedActifForVirement?.siteOriginId || selectedActifForVirement?.siteId || selectedActifForVirement?.depot || '';
      const siteOrigineId = rawSiteOrigine && (rawSiteOrigine._id || rawSiteOrigine.id || rawSiteOrigine) || '';

      // Validate siteOrigineId (must be non-empty and look like a Mongo ObjectId)
      const isLikelyObjectId = (id) => typeof id === 'string' && /^[0-9a-fA-F]{24}$/.test(id);
      if (!siteOrigineId || !isLikelyObjectId(siteOrigineId)) {
        toast.error("Site d'origine introuvable ou invalide pour cet actif");
        setLoadingVirement(false);
        return;
      }

      // Resolve destination site: explicit form value, selectedSite, or fallback to origin if recipient has no sites
      let siteDestinationId = form.siteDestinationId || (selectedDestinationSite && (selectedDestinationSite._id || selectedDestinationSite.id)) || '';
      if (!siteDestinationId && destinationSites.length === 0 && siteOrigineId) {
        siteDestinationId = siteOrigineId; // fallback when recipient has no sites
      }
      if (!siteDestinationId) {
        toast.error('Veuillez sélectionner un site de destination');
        setLoadingVirement(false);
        return;
      }

      const quantiteVal = Number(form.quantite || selectedActifForVirement?.quantite || 1);
      if (!Number.isFinite(quantiteVal) || quantiteVal <= 0) {
        toast.error('Quantité invalide');
        setLoadingVirement(false);
        return;
      }
      if (selectedActifForVirement?.quantite != null && quantiteVal > Number(selectedActifForVirement.quantite)) {
        toast.error('Quantité supérieure au stock disponible');
        setLoadingVirement(false);
        return;
      }

      let prixVal = null;
      if (form.prixUnitaire !== '' && form.prixUnitaire != null) prixVal = Number(form.prixUnitaire);
      else if (selectedActifForVirement?.prixUnitaire != null) prixVal = Number(selectedActifForVirement.prixUnitaire);

      if (prixVal == null || Number.isNaN(prixVal)) {
        toast.error('Prix unitaire invalide');
        setLoadingVirement(false);
        return;
      }
      if (prixVal < 0) {
        toast.error('Prix unitaire doit être supérieur ou égal à 0');
        setLoadingVirement(false);
        return;
      }

      const payload = {
        siteOrigineId,
        siteDestinationId,
        productId: pid,
        quantite: quantiteVal,
        prixUnitaire: prixVal,
        detentaire: user?._id || user?.id || null,
        ayant_droit: selectedRecipient._id || selectedRecipient.id || selectedRecipient,
        observations: form.observations || `Virement de droit vers ${selectedRecipient.name || selectedRecipient.userName || selectedRecipient.userNickName}`,
      };

      await virementStock(payload, token);
      toast.success(`Virement de droit effectué vers ${selectedRecipient.name || selectedRecipient.userName || selectedRecipient.userNickName}`);
      setVirerModalOpen(false);
      setSelectedActifForVirement(null);
      setSelectedRecipient(null);
      setRecipientSearch('');
      setForm({ produit: '', productId: '', quantite: '', prixUnitaire: '', destinataire: '', observations: '' });
      await fetchActifs();
    } catch (err) {
      console.error('Erreur lors du virement :', err);
      toast.error(err?.response?.data?.message || 'Erreur lors du virement');
    } finally {
      setLoadingVirement(false);
    }
  };

  // form submission removed: action happens from the ActifsTable 'Virer droit' button (UI only)
  const filteredDestinationSites = destinationSites.filter(s => (s?.siteName || s?.name || '').toLowerCase().includes((siteDestinationSearch || '').toLowerCase()));

  return (
    <div className="px-6 mx-auto">
      {user && user.userValidated === false ? (
        <UserNotValidatedBanner />
      ) : (
        <>
          <div className="flex justify-between items-center mb-6">
            <div>
              <h1 className="text-2xl text-neutral-900 mb-2">Virement de droit</h1>
              <p className="text-sm text-neutral-600">Transférez le droit d'un actif à un autre ayant droit</p>
            </div>
          </div>

          <Card className="border-neutral-200 bg-white">
            <div className="p-4">
              <ActifsTable loading={loadingActifs} actifs={actifs} dateFormat={dateFormat} isDesktop={true} onVirerDroit={handleOpenVirementFromActif} />
            </div>
          </Card>
          {/* Modal pour sélectionner l'ayant-droit lors d'un virement */}
          <Dialog open={virerModalOpen} onOpenChange={(open) => {
            setVirerModalOpen(open);
            if (!open) {
              setSelectedActifForVirement(null);
              setSelectedRecipient(null);
              setRecipientSearch('');
              setForm({ produit: '', productId: '', quantite: '', prixUnitaire: '', destinataire: '', observations: '' });
            }
          }}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Virer droit</DialogTitle>
                <DialogDescription>
                  Sélectionnez l'ayant-droit qui recevra le droit pour cet actif
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-1">Produit</label>
                  <Input disabled value={selectedActifForVirement?.productName || ''} className="border-neutral-300 bg-neutral-50" />
                </div>

                <div className="space-y-2">
                  <label className="block text-sm font-medium text-neutral-700 mb-1">Ayant droit <span className="text-red-500 ml-0.5">*</span></label>
                  <div className="relative">
                    <Input
                      placeholder={usersOptions.length === 0 ? 'Chargement...' : 'Rechercher un utilisateur...'}
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
                              setRecipientSearch(u.name || u.userName || u.userNickName || '');
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
                            onClick={() => { setSelectedRecipient(u); setRecipientSearch(u.name || u.userName || u.userNickName || ''); setRecipientOpen(false); }}
                            className={`w-full text-left px-3 py-2 text-sm ${idx === recipientHighlighted ? 'bg-violet-50' : 'hover:bg-neutral-100'}`}
                          >
                            {u.name || u.userName || u.userNickName}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-neutral-700 mb-1">Dépôt</label>
                  <div className="relative">
                    <Input
                      placeholder={loadingDestinationSites ? 'Chargement...' : (destinationSites.length === 0 ? 'Aucun site trouvé' : 'Dépôt pré-rempli')}
                      value={siteDestinationSearch}
                      onChange={(e) => { setSiteDestinationSearch(e.target.value); setSiteDestinationHighlighted(0); }}
                      onFocus={() => { /* keep searchable if needed */ setSiteDestinationOpen(true); setSiteDestinationHighlighted(0); }}
                      onBlur={() => setTimeout(() => setSiteDestinationOpen(false), 150)}
                      onKeyDown={(e) => {
                        if (e.key === 'Escape') return setSiteDestinationOpen(false);
                        if (!siteDestinationOpen && (e.key === 'ArrowDown' || e.key === 'ArrowUp')) {
                          setSiteDestinationOpen(true);
                          e.preventDefault();
                          return;
                        }
                        if (siteDestinationOpen) {
                          if (e.key === 'ArrowDown') {
                            e.preventDefault();
                            setSiteDestinationHighlighted(i => Math.min(i + 1, Math.max(filteredDestinationSites.length - 1, 0)));
                          } else if (e.key === 'ArrowUp') {
                            e.preventDefault();
                            setSiteDestinationHighlighted(i => Math.max(i - 1, 0));
                          } else if (e.key === 'Enter') {
                            e.preventDefault();
                            const s = filteredDestinationSites[siteDestinationHighlighted];
                            if (s) {
                              setSelectedDestinationSite(s);
                              setSiteDestinationSearch(s.siteName || s.name || '');
                              setForm(prev => ({ ...prev, siteDestinationId: s._id || s.id }));
                              setSiteDestinationOpen(false);
                            }
                          }
                        }
                      }}
                      className="w-full border-neutral-300"
                    />

                    {siteDestinationOpen && filteredDestinationSites.length > 0 && (
                      <div className="absolute left-0 right-0 mt-1 bg-white border rounded shadow max-h-60 overflow-auto z-50">
                        {filteredDestinationSites.map((s, idx) => (
                          <button
                            type="button"
                            key={s._id}
                            onMouseEnter={() => setSiteDestinationHighlighted(idx)}
                            onClick={() => { setSelectedDestinationSite(s); setSiteDestinationSearch(s.siteName || s.name || ''); setForm(prev => ({ ...prev, siteDestinationId: s._id || s.id })); setSiteDestinationOpen(false); }}
                            className={`w-full text-left px-3 py-2 text-sm ${idx === siteDestinationHighlighted ? 'bg-violet-50' : 'hover:bg-neutral-100'}`}
                          >
                            {s.siteName || s.name || '-'}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-neutral-700 mb-1">Quantité</label>
                    <Input
                      type="number"
                      min={1}
                      max={selectedActifForVirement?.quantite ?? undefined}
                      value={form.quantite}
                      onChange={(e) => setForm(prev => ({ ...prev, quantite: e.target.value }))}
                      className="w-full border-neutral-300"
                    />
                    {selectedActifForVirement?.quantite != null && (
                      <div className="text-xs text-neutral-500 mt-1">Disponible: {selectedActifForVirement.quantite}</div>
                    )}
                  </div>

                  {/*
                  <div>
                    <label className="block text-sm font-medium text-neutral-700 mb-1">Prix unitaire</label>
                    <Input
                      type="number"
                      step="0.01"
                      value={form.prixUnitaire}
                      onChange={(e) => setForm(prev => ({ ...prev, prixUnitaire: e.target.value }))}
                      className="w-full border-neutral-300"
                    />
                  </div>
                  */}
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
                  <Button variant="outline" status="inactive" onClick={() => setVirerModalOpen(false)}>Annuler</Button>
                  <Button status={loadingVirement ? 'loading' : (selectedRecipient ? 'active' : 'inactive')} onClick={handleConfirmVirement} disabled={!selectedRecipient || loadingVirement} color="default">
                    {loadingVirement ? 'En cours...' : 'Confirmer le virement'}
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
