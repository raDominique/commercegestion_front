import { useState, useEffect } from 'react';
import { Card } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Badge } from '../../components/ui/badge';
import SearchIcon from '@mui/icons-material/Search';
import InfoIcon from '@mui/icons-material/Info';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import { toast } from 'sonner';
import usePageTitle from '../../utils/usePageTitle.jsx';
import { getMyProducts, toggleProductStocker } from '../../services/product.service';
import { getFullMediaUrl } from '../../services/media.service';
import { Switch } from '../../components/ui/switch';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogClose
} from '../../components/ui/dialog';

const MesProduits = () => {
  usePageTitle('Mes Produits');

  const [searchTerm, setSearchTerm] = useState('');
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [total, setTotal] = useState(0);
  const [stockerLoadingId, setStockerLoadingId] = useState(null);
  const [confirmStockerModal, setConfirmStockerModal] = useState({ open: false, productId: null });
  const [validationFilter, setValidationFilter] = useState('all'); // 'all', 'true', 'false'
  const [isStockerFilter, setIsStockerFilter] = useState('all'); // 'all', 'true', 'false'

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const params = {
        search: searchTerm || '',
        limit,
        page,
      };
      if (validationFilter === 'true') params.validation = true;
      if (validationFilter === 'false') params.validation = false;
      if (isStockerFilter === 'true') params.isStocker = true;
      if (isStockerFilter === 'false') params.isStocker = false;
      const res = await getMyProducts(params, token);
      setProducts(Array.isArray(res.data) ? res.data : []);
      setTotal(res.total || 0);
    } catch (err) {
      toast.error('Erreur lors du chargement de vos produits');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleStocker = async (id) => {
    setStockerLoadingId(id);
    try {
      const token = localStorage.getItem('token');
      await toggleProductStocker(id, token);
      setProducts(
        products.map((p) =>
          p._id === id ? { ...p, isStocker: !p.isStocker } : p
        )
      );
      toast.success('État stocké modifié');
    } catch (err) {
      toast.error('Erreur lors du changement de stocké');
    } finally {
      setStockerLoadingId(null);
    }
  };

  const askToggleStocker = (id) => {
    setConfirmStockerModal({ open: true, productId: id });
  };

  useEffect(() => {
    fetchProducts();
  }, [searchTerm, page, limit, validationFilter, isStockerFilter]);

  return (
    <>
      <div className="p-6 max-w-7xl mx-auto">
        <div className="space-y-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="text-2xl text-neutral-900 mb-2">Mes Produits</h1>
              <p className="text-sm text-neutral-600">
                Liste de vos produits
              </p>
            </div>
          </div>
          <div className="flex flex-col md:flex-row md:items-center md:gap-4 gap-2">
            <div className="relative flex-1">
              <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-neutral-400" />
              <Input
                placeholder="Rechercher un produit..."
                value={searchTerm}
                onChange={(e) => {
                  setPage(1);
                  setSearchTerm(e.target.value);
                }}
                className="pl-10 border-neutral-300"
              />
            </div>
            <div className="flex items-center gap-2 mt-2 md:mt-0">
              <label htmlFor="validationFilter" className="text-sm text-neutral-700">Validation :</label>
              <select
                id="validationFilter"
                value={validationFilter}
                onChange={e => {
                  setPage(1);
                  setValidationFilter(e.target.value);
                }}
                className="border border-neutral-300 rounded px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500"
              >
                <option value="all">Tous</option>
                <option value="true">Validés</option>
                <option value="false">Attente de validation</option>
              </select>
            </div>
            <div className="flex items-center gap-2 mt-2 md:mt-0">
              <label htmlFor="isStockerFilter" className="text-sm text-neutral-700">Stocké :</label>
              <select
                id="isStockerFilter"
                value={isStockerFilter}
                onChange={e => {
                  setPage(1);
                  setIsStockerFilter(e.target.value);
                }}
                className="border border-neutral-300 rounded px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500"
              >
                <option value="all">Tous</option>
                <option value="true">Stockés</option>
                <option value="false">Non stockés</option>
              </select>
            </div>
          </div>
          <Card className="border-neutral-200">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-neutral-50 border-b border-neutral-200">
                  <tr>
                    <th className="text-left p-4 text-xs text-neutral-600">Aperçu</th>
                    <th className="text-left p-4 text-xs text-neutral-600">Nom</th>
                    <th className="text-left p-4 text-xs text-neutral-600">Catégorie</th>
                    <th className="text-left p-4 text-xs text-neutral-600">Stocké</th>
                    <th className="text-left p-4 text-xs text-neutral-600">Validé</th>
                    <th className="text-left p-4 text-xs text-neutral-600">Code CPC</th>
                    <th className="text-right p-4 text-xs text-neutral-600">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr>
                      <td colSpan="6" className="p-8 text-center text-neutral-400">Chargement...</td>
                    </tr>
                  ) : products.length > 0 ? (
                    products.map((product) => (
                      <tr key={product._id} className="border-b border-neutral-200 last:border-0">
                        <td className="p-4 text-sm">
                          {product.image ? (
                            <img src={getFullMediaUrl(product.image)} alt={product.name} className="w-12 h-12 object-cover rounded" />
                          ) : (
                            <span className="text-neutral-400">-</span>
                          )}
                        </td>
                        <td className="p-4 text-sm text-neutral-900">{product.name}</td>
                        <td className="p-4 text-sm text-neutral-600">{product.categoryNom || '-'}</td>
                        <td className="p-4 text-sm">
                          <Switch
                            checked={product.isStocker}
                            onCheckedChange={() => askToggleStocker(product._id)}
                            disabled={stockerLoadingId === product._id}
                          />
                          <Badge
                            variant={product.isStocker ? 'default' : 'secondary'}
                            className={product.isStocker ? 'bg-green-100 text-green-700 border-green-200 ml-2' : 'bg-neutral-200 text-neutral-500 border-neutral-200 ml-2'}
                          >
                            {product.isStocker ? 'Oui' : 'Non'}
                          </Badge>
                        </td>
                        <td className="p-4 text-sm">
                          <Badge
                            variant={product.validation ? 'default' : 'secondary'}
                            className={product.validation ? 'bg-green-100 text-green-700 border-green-200 ml-2' : 'bg-neutral-200 text-neutral-500 border-neutral-200 ml-2'}
                          >
                            {product.validation ? 'Oui' : 'Non'}
                          </Badge>
                        </td>
                        <td className="p-4 text-sm text-neutral-600">{product.codeCPC || '-'}</td>
                        <td className="p-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <Button variant="ghost" size="sm" onClick={() => handleShowInfo(item.code)}>
                              <InfoIcon className="w-5 h-5 text-violet-600" />
                            </Button>
                            <Button variant="ghost" size="sm" onClick={() => handleEditCpc(item.code)}>
                              <EditIcon className="w-5 h-5 text-amber-600" />
                            </Button>
                            <Button variant="ghost" size="sm" onClick={() => handleDeleteCpc(item.code)}>
                              <DeleteIcon className="w-5 h-5 text-red-600" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="6" className="p-8 text-center text-neutral-400">Aucun produit trouvé</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </Card>
          <div className="flex justify-end items-center gap-4 mt-4">
            <Button
              variant="outline"
              size="sm"
              disabled={page === 1 || loading}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
            >
              Précédent
            </Button>
            <span className="text-sm text-neutral-600">
              Page {page} / {Math.max(1, Math.ceil(total / limit))}
            </span>
            <Button
              variant="outline"
              size="sm"
              disabled={page >= Math.ceil(total / limit) || loading}
              onClick={() => setPage((p) => p + 1)}
            >
              Suivant
            </Button>
          </div>
        </div>
      </div>
      {/* Modal de confirmation pour toggle stocker */}
      <Dialog open={confirmStockerModal.open} onOpenChange={(open) => setConfirmStockerModal({ open, productId: open ? confirmStockerModal.productId : null })}>
        <DialogContent>
          <DialogHeader className="mb-2 text-lg font-semibold text-violet-700">Confirmation</DialogHeader>
          <div className="mb-4 text-neutral-700">Voulez-vous vraiment modifier l'état stocké de ce produit ?</div>
          <div className="flex justify-end gap-2">
            <DialogClose asChild>
              <Button variant="outline" size="sm">Annuler</Button>
            </DialogClose>
            <Button
              variant="default"
              size="sm"
              loading={!!stockerLoadingId}
              onClick={() => handleToggleStocker(confirmStockerModal.productId)}
              disabled={!!stockerLoadingId}
            >
              Valider
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default MesProduits;
