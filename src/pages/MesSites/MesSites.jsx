import { useState, useEffect } from 'react';
import usePageTitle from '../../utils/usePageTitle.jsx';
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle } from '../../components/ui/dialog.jsx';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { Card } from '../../components/ui/card';
import { Input } from '../../components/ui/input';
import { Pagination } from '../../components/ui/pagination';
import { Label } from '../../components/ui/label';
import { toast } from 'sonner';
import PublicIcon from '@mui/icons-material/Public';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import { createSite, getMySites, getSiteById, updateSite, deleteSite } from '../../services/site.service';
import LeafletMapPicker from '../../components/ui/LeafletMapPicker.jsx';
import { useIsMobile } from '../../components/ui/use-mobile.js';

const MesSites = () => {
  const isMobile = useIsMobile();
  usePageTitle('Mes sites');
  const [sites, setSites] = useState([]);
  const [total, setTotal] = useState(0);
  const [newSite, setNewSite] = useState({
    siteName: '',
    siteAddress: '',
    siteLat: '',
    siteLng: '',
  });
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editSite, setEditSite] = useState(null);
  const [loadingEdit, setLoadingEdit] = useState(false);
  const [loading, setLoading] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [siteToDelete, setSiteToDelete] = useState(null);
  const [loadingDelete, setLoadingDelete] = useState(false);
  const [loadingSites, setLoadingSites] = useState(true);
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [search, setSearch] = useState('');

  useEffect(() => {
    const fetchSites = async () => {
      setLoadingSites(true);
      try {
        const data = await getMySites({ limit, page, search });
        setSites(Array.isArray(data.data) ? data.data : []);
        setTotal(typeof data.total === 'number' ? data.total : 0);
      } catch (e) {
        setSites([]);
      } finally {
        setLoadingSites(false);
      }
    };
    fetchSites();
  }, [page, limit, search]);

  // Ajout via modal
  const handleAddSite = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const payload = {
        siteName: newSite.siteName,
        siteAddress: newSite.siteAddress,
        siteLat: newSite.siteLat ? parseFloat(newSite.siteLat) : undefined,
        siteLng: newSite.siteLng ? parseFloat(newSite.siteLng) : undefined,
      };
      await createSite(payload);
      toast.success('Site ajouté avec succès');
      setNewSite({ siteName: '', siteAddress: '', siteLat: '', siteLng: '' });
      setIsDialogOpen(false);
      // Recharge la liste après ajout
      const data = await getMySites({ limit, page, search });
      setSites(Array.isArray(data.data) ? data.data : []);
      setTotal(typeof data.total === 'number' ? data.total : 0);
    } catch (error) {
      toast.error("Erreur lors de l'ajout du site");
    } finally {
      setLoading(false);
    }
  };

  // Ouvre le dialog de modification et charge les données du site
  const handleEditSite = async (siteId) => {
    setLoadingEdit(true);
    try {
      const data = await getSiteById(siteId);
      setEditSite({
        id: data._id,
        siteName: data.siteName || '',
        siteAddress: data.siteAddress || '',
        siteLat: data.siteLat || '',
        siteLng: data.siteLng || '',
      });
      setIsEditDialogOpen(true);
    } catch (error) {
      toast.error("Erreur lors du chargement du site");
    } finally {
      setLoadingEdit(false);
    }
  };

  // Soumission du formulaire de modification
  const handleUpdateSite = async (e) => {
    e.preventDefault();
    setLoadingEdit(true);
    try {
      await updateSite(editSite.id, {
        siteName: editSite.siteName,
        siteAddress: editSite.siteAddress,
        siteLat: editSite.siteLat,
        siteLng: editSite.siteLng,
      });
      toast.success('Site modifié avec succès');
      setIsEditDialogOpen(false);
      // Recharge la liste sans recharger la plateforme
      const data = await getMySites({ limit, page, search });
      setSites(Array.isArray(data.data) ? data.data : []);
      setTotal(typeof data.total === 'number' ? data.total : 0);
    } catch (error) {
      toast.error("Erreur lors de la modification du site");
    } finally {
      setLoadingEdit(false);
    }
  };

  // Suppression d'un site
  const handleDeleteSite = (site) => {
    setSiteToDelete(site);
    setIsDeleteDialogOpen(true);
  };

  const confirmDeleteSite = async () => {
    setLoadingDelete(true);
    try {
      await deleteSite(siteToDelete._id);
      toast.success('Site supprimé avec succès');
      setIsDeleteDialogOpen(false);
      setSiteToDelete(null);
      // Recharge la liste sans changer la page
      const data = await getMySites({ limit, page, search });
      setSites(Array.isArray(data.data) ? data.data : []);
      setTotal(typeof data.total === 'number' ? data.total : 0);
    } catch (error) {
      toast.error("Erreur lors de la suppression du site");
    } finally {
      setLoadingDelete(false);
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="space-y-6">
        <div className="space-y-2 mb-4">
          <h1 className="text-2xl text-neutral-900 mb-2">Mes Sites</h1>
          <p className="text-sm text-neutral-600">
            Gérez vos sites web et boutiques en ligne
          </p>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-violet-600 hover:bg-violet-700 text-white mt-2">
                <AddIcon className="w-4 h-4 mr-2" />
                Ajouter un site
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Ajouter un nouveau site</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleAddSite} className="space-y-4">
                {/* ...formulaire d'ajout inchangé... */}
                <div className="space-y-2">
                  <Label htmlFor="siteName">Nom du site</Label>
                  <Input
                    id="siteName"
                    value={newSite.siteName}
                    onChange={(e) => setNewSite({ ...newSite, siteName: e.target.value })}
                    placeholder="Ma boutique en ligne"
                    required
                    className="border-neutral-300"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="siteAddress">Adresse du site</Label>
                  <Input
                    id="siteAddress"
                    value={newSite.siteAddress}
                    onChange={(e) => setNewSite({ ...newSite, siteAddress: e.target.value })}
                    placeholder="Analakely, Antananarivo"
                    required
                    className="border-neutral-300"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Localisation sur la carte</Label>
                  <LeafletMapPicker
                    lat={newSite.siteLat}
                    lng={newSite.siteLng}
                    onChange={({ lat, lng }) => setNewSite({ ...newSite, siteLat: lat, siteLng: lng })}
                  />
                </div>
                <div className="flex gap-4">
                  <div className="space-y-2 flex-1">
                    <Label htmlFor="siteLat">Latitude</Label>
                    <Input
                      id="siteLat"
                      type="number"
                      step="any"
                      value={newSite.siteLat}
                      readOnly
                      className="border-neutral-300 bg-neutral-100 cursor-not-allowed"
                    />
                  </div>
                  <div className="space-y-2 flex-1">
                    <Label htmlFor="siteLng">Longitude</Label>
                    <Input
                      id="siteLng"
                      type="number"
                      step="any"
                      value={newSite.siteLng}
                      readOnly
                      className="border-neutral-300 bg-neutral-100 cursor-not-allowed"
                    />
                  </div>
                </div>
                <Button
                  type="submit"
                  className="w-full bg-violet-600 hover:bg-violet-700 text-white"
                  disabled={loading}
                >
                  {loading ? 'Ajout en cours...' : 'Ajouter le site'}
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="p-4 border-neutral-200">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-violet-50 rounded-lg flex items-center justify-center">
                <PublicIcon className="w-5 h-5 text-violet-600" />
              </div>
              <div>
                <p className="text-sm text-neutral-600">Total sites</p>
                <p className="text-lg text-neutral-900">{sites.length}</p>
              </div>
            </div>
          </Card>
        </div>

        {/* Sites Grid */}
        <div className="flex flex-col sm:flex-row gap-2 sm:items-center w-full max-w-md">
          <Input
            type="search"
            placeholder="Rechercher un site..."
            value={search}
            onChange={e => {
              setPage(1);
              setSearch(e.target.value);
            }}
            className="w-full"
          />
        </div>
        <div
          className={
            isMobile
              ? 'grid grid-cols-1 gap-6'
              : 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'
          }
        >
          {sites.map((site) => (
            <Card key={site.id} className="p-6 border-neutral-200 hover:border-violet-200 transition-colors">
              <div className="space-y-4">
                <div>
                  <h3 className="text-lg text-neutral-900 mb-1 flex items-center gap-2">
                    {site.siteName}
                  </h3>
                  <div className="flex items-center gap-1 text-sm text-neutral-700">
                    <LocationOnIcon className="w-4 h-4 text-violet-600" />
                    <span className="truncate max-w-45" title={site.siteAddress}>{site.siteAddress}</span>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4 pt-4 border-t border-neutral-200">
                  <div>
                    <p className="text-xs text-neutral-500">Latitude</p>
                    <p className="text-lg text-neutral-900 truncate max-w-27.5" title={site.siteLat?.toString()}>
                      {site.siteLat?.toFixed ? site.siteLat.toFixed(5) : site.siteLat}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-neutral-500">Longitude</p>
                    <p className="text-lg text-neutral-900 truncate max-w-27.5" title={site.siteLng?.toString()}>
                      {site.siteLng?.toFixed ? site.siteLng.toFixed(5) : site.siteLng}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2 pt-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1"
                    onClick={() => handleEditSite(site._id)}
                  >
                    <EditIcon className="w-4 h-4 mr-1" />
                    Modifier
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDeleteSite(site)}
                  >
                    <DeleteIcon className="w-4 h-4 text-red-600" />
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>

        {/* Dialog global de modification */}
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Modifier le site</DialogTitle>
            </DialogHeader>
            {editSite ? (
              <form onSubmit={handleUpdateSite} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="editSiteName">Nom du site</Label>
                  <Input
                    id="editSiteName"
                    value={editSite.siteName}
                    onChange={e => setEditSite({ ...editSite, siteName: e.target.value })}
                    placeholder="Ma boutique en ligne"
                    required
                    className="border-neutral-300"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="editSiteAddress">Adresse du site</Label>
                  <Input
                    id="editSiteAddress"
                    value={editSite.siteAddress}
                    onChange={e => setEditSite({ ...editSite, siteAddress: e.target.value })}
                    placeholder="Analakely, Antananarivo"
                    required
                    className="border-neutral-300"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Localisation sur la carte</Label>
                  <LeafletMapPicker
                    lat={editSite.siteLat}
                    lng={editSite.siteLng}
                    onChange={({ lat, lng }) => setEditSite({ ...editSite, siteLat: lat, siteLng: lng })}
                  />
                </div>
                <div className="flex gap-4">
                  <div className="space-y-2 flex-1">
                    <Label htmlFor="editSiteLat">Latitude</Label>
                    <Input
                      id="editSiteLat"
                      type="number"
                      step="any"
                      value={editSite.siteLat}
                      readOnly
                      className="border-neutral-300 bg-neutral-100 cursor-not-allowed"
                    />
                  </div>
                  <div className="space-y-2 flex-1">
                    <Label htmlFor="editSiteLng">Longitude</Label>
                    <Input
                      id="editSiteLng"
                      type="number"
                      step="any"
                      value={editSite.siteLng}
                      readOnly
                      className="border-neutral-300 bg-neutral-100 cursor-not-allowed"
                    />
                  </div>
                </div>
                <Button
                  type="submit"
                  className="w-full bg-violet-600 hover:bg-violet-700 text-white"
                  disabled={loadingEdit}
                >
                  {loadingEdit ? 'Modification...' : 'Enregistrer les modifications'}
                </Button>
              </form>
            ) : (
              <div className="text-center py-8">Chargement...</div>
            )}
          </DialogContent>
        </Dialog>

        {/* Dialog global de confirmation de suppression */}
        <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Confirmer la suppression</DialogTitle>
            </DialogHeader>
            <div className="py-4 text-center">
              <p>Voulez-vous vraiment supprimer le site&nbsp;:
                <span className="font-semibold"> {siteToDelete?.siteName}</span> ?
              </p>
            </div>
            <div className="flex gap-2 justify-end">
              <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)} disabled={loadingDelete}>
                Annuler
              </Button>
              <Button
                className="bg-red-600 hover:bg-red-700 text-white"
                onClick={confirmDeleteSite}
                disabled={loadingDelete}
              >
                {loadingDelete ? 'Suppression...' : 'Supprimer'}
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        {/* Pagination (hors de la grille) */}
        <div className="flex justify-center mt-6">
          <Pagination
            page={page}
            total={total}
            limit={limit}
            onChange={setPage}
          />
        </div>

        {sites.length === 0 && (
          <Card className="p-12 text-center border-neutral-200">
            <PublicIcon className="w-12 h-12 text-neutral-400 mx-auto mb-4" />
            <p className="text-neutral-500 mb-4">Aucun site enregistré</p>
            <Button
              className="bg-violet-600 hover:bg-violet-700 text-white"
              onClick={() => setIsDialogOpen(true)}
            >
              <AddIcon className="w-4 h-4 mr-2" />
              Ajouter votre premier site
            </Button>
          </Card>
        )}
      </div>
    </div>
  );
};

export default MesSites;