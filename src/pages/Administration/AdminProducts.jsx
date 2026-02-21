import { useState, useEffect } from 'react';
import { Card } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import SearchIcon from '@mui/icons-material/Search';
import InfoIcon from '@mui/icons-material/Info';
import { toast } from 'sonner';
import usePageTitle from '../../utils/usePageTitle.jsx';
import { getProducts, validateProduct, getProductById } from '../../services/product.service';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogClose, DialogDescription } from '../../components/ui/dialog';
import { Badge } from '../../components/ui/badge';
import { Switch } from '../../components/ui/switch';
import { getFullMediaUrl } from '../../services/media.service';

const AdminProducts = () => {
  usePageTitle('Produits');

  const [searchTerm, setSearchTerm] = useState('');
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [total, setTotal] = useState(0);
  const [validateOpen, setValidateOpen] = useState(false);
  const [validateId, setValidateId] = useState(null);
  const [validating, setValidating] = useState(false);
  const [detailOpen, setDetailOpen] = useState(false);
  const [detailProduct, setDetailProduct] = useState(null);
  const [loadingDetail, setLoadingDetail] = useState(false);
  const [isStocker, setIsStocker] = useState('');

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const params = {
        search: searchTerm || undefined,
        page,
        limit,
        isStocker: isStocker === '' ? undefined : isStocker === 'true',
      };
      const res = await getProducts(params, token);
      setProducts(Array.isArray(res.data) ? res.data : []);
      setTotal(res.total || 0);
    } catch (err) {
      toast.error('Erreur lors du chargement des produits');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, [searchTerm, page, limit, isStocker]);

  const handleAskValidate = (id) => {
    setValidateId(id);
    setValidateOpen(true);
  };

  const handleValidateProduct = async () => {
    setValidating(true);
    try {
      const token = localStorage.getItem('token');
      await validateProduct(validateId, token);
      toast.success('Validation modifiée');
      setProducts(
        products.map((p) =>
          p._id === validateId ? { ...p, validation: !p.validation } : p
        )
      );
      setValidateOpen(false);
      setValidateId(null);
    } catch (err) {
      toast.error("Erreur lors de la validation");
    } finally {
      setValidating(false);
    }
  };

  const handleShowDetail = async (id) => {
    setLoadingDetail(true);
    setDetailOpen(true);
    try {
      const token = localStorage.getItem('token');
      const res = await getProductById(id, token);
      const data = Array.isArray(res.data) ? res.data[0] : res.data;
      setDetailProduct(data);
    } catch (err) {
      toast.error("Impossible de charger le détail du produit");
      setDetailProduct(null);
    } finally {
      setLoadingDetail(false);
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-2xl text-neutral-900 mb-2">Gestion des produits</h1>
            <p className="text-sm text-neutral-600">
              Gérez les produits de la plateforme
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
        </div>
        <Card className="border-neutral-200">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-neutral-50 border-b border-neutral-200">
                <tr>
                  <th className="text-left p-4 text-xs text-neutral-600">Aperçu</th>
                  <th className="text-left p-4 text-xs text-neutral-600">Nom</th>
                  <th className="text-left p-4 text-xs text-neutral-600">Catégorie</th>
                  <th className="text-left p-4 text-xs text-neutral-600">Propriétaire</th>
                  <th className="text-left p-4 text-xs text-neutral-600">Stocké</th>
                  <th className="text-left p-4 text-xs text-neutral-600">Validé</th>
                  <th className="text-left p-4 text-xs text-neutral-600">Code CPC</th>
                  <th className="text-left p-4 text-xs text-neutral-600">Détail</th>
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
                      <td className="p-4 text-sm text-neutral-600">{product.ownerName || product.ownerNickName || '-'}</td>
                      <td className="p-4 text-sm">
                        <Badge
                          variant={product.isStocker ? 'default' : 'secondary'}
                          className={product.isStocker ? 'bg-green-100 text-green-700 border-green-200' : 'bg-neutral-200 text-neutral-500 border-neutral-200'}
                        >
                          {product.isStocker ? 'Oui' : 'Non'}
                        </Badge>
                      </td>
                      <td className="p-4 text-sm">
                        <Switch
                          checked={product.validation}
                          onCheckedChange={() => handleAskValidate(product._id)}
                        />
                        <Badge
                          variant={product.validation ? 'default' : 'secondary'}
                          className={product.validation ? 'bg-green-100 text-green-700 border-green-200 ml-2' : 'bg-neutral-200 text-neutral-500 border-neutral-200 ml-2'}
                        >
                          {product.validation ? 'Oui' : 'Non'}
                        </Badge>
                      </td>
                      <td className="p-4 text-sm text-neutral-600">{product.codeCPC || '-'}</td>
                      <td className="p-4 text-sm">
                        <Button variant="ghost" size="sm" onClick={() => handleShowDetail(product._id)}>
                          <InfoIcon className="w-5 h-5 text-violet-600" />
                        </Button>
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
      {/* Modal de confirmation validation produit */}
      <Dialog open={validateOpen} onOpenChange={setValidateOpen}>
        <DialogContent aria-describedby="product-validate-desc">
          <DialogHeader>
            <DialogTitle>Valider ce produit ?</DialogTitle>
            <DialogDescription id="product-validate-desc">
              Cette action changera l'état de validation du produit. Continuer ?
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-end gap-2 mt-4">
            <DialogClose asChild>
              <Button variant="outline">Annuler</Button>
            </DialogClose>
            <Button variant="default" className="bg-violet-600 text-white hover:bg-violet-700" onClick={handleValidateProduct} disabled={validating}>
              {validating ? 'Validation...' : 'Confirmer'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
      {/* Modal détail produit */}
      <Dialog open={detailOpen} onOpenChange={setDetailOpen}>
        <DialogContent aria-describedby="product-detail-desc">
          <DialogHeader>
            <DialogTitle>Détail du produit</DialogTitle>
            <DialogDescription id="product-detail-desc">
              Informations détaillées sur le produit sélectionné.
            </DialogDescription>
          </DialogHeader>
          {loadingDetail ? (
            <div className="p-8 text-center text-neutral-400">Chargement...</div>
          ) : detailProduct ? (
            <Card className="p-4 border-violet-200 bg-violet-50">
              <div className="flex flex-col md:flex-row gap-6">
                <div className="flex-1 space-y-2">
                  <div className="text-lg font-bold text-violet-700">{detailProduct.productName}</div>
                  <Badge variant="secondary" className="text-xs capitalize mb-2">{detailProduct.productCategory}</Badge>
                  <div className="text-neutral-900 font-semibold mb-2">{detailProduct.productDescription}</div>
                  <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm text-neutral-700">
                    <div><b>Code CPC :</b> {detailProduct.codeCPC || '-'}</div>
                    <div><b>État :</b> {detailProduct.productState || '-'}</div>
                    <div><b>Volume :</b> {detailProduct.productVolume || '-'}</div>
                    <div><b>Poids :</b> {detailProduct.productPoids || '-'}</div>
                    <div><b>Dimensions :</b> {detailProduct.productLongueur || '-'} x {detailProduct.productLargeur || '-'} x {detailProduct.productHauteur || '-'}</div>
                    <div><b>Stocké :</b> <Badge variant={detailProduct.isStocker ? 'default' : 'secondary'} className={detailProduct.isStocker ? 'bg-green-100 text-green-700 border-green-200' : 'bg-neutral-200 text-neutral-500 border-neutral-200'}>{detailProduct.isStocker ? 'Oui' : 'Non'}</Badge></div>
                    <div><b>Validé :</b> <Badge variant={detailProduct.productValidation ? 'default' : 'secondary'} className={detailProduct.productValidation ? 'bg-green-100 text-green-700 border-green-200' : 'bg-neutral-200 text-neutral-500 border-neutral-200'}>{detailProduct.productValidation ? 'Oui' : 'Non'}</Badge></div>
                    <div><b>Date création :</b> {detailProduct.createdAt ? new Date(detailProduct.createdAt).toLocaleString() : '-'}</div>
                    <div><b>Date modification :</b> {detailProduct.updatedAt ? new Date(detailProduct.updatedAt).toLocaleString() : '-'}</div>
                  </div>
                </div>
                <div className="flex-1 flex flex-col items-center justify-center">
                  {detailProduct.productImage && (
                    <img src={getFullMediaUrl(detailProduct.productImage)} alt={detailProduct.productName} className="w-40 h-40 object-cover rounded mb-2" />
                  )}
                </div>
              </div>
            </Card>
          ) : (
            <div className="p-8 text-center text-neutral-400">Aucune donnée</div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminProducts;
