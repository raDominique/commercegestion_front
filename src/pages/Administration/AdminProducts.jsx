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
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '../../components/ui/table';
import useScreenType from '../../utils/useScreenType';

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
    <div className="px-6 mx-auto">
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
          <div className="relative flex-1 min-w-0">
            <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-neutral-400" />
            <Input
              placeholder="Rechercher un produit..."
              value={searchTerm}
              onChange={(e) => {
                setPage(1);
                setSearchTerm(e.target.value);
              }}
              className="pl-10 border-black bg-white w-full"
            />
          </div>
        </div>
        <Card className="border-neutral-200 bg-white">
          <ProductTableOrList
            loading={loading}
            products={products}
            handleAskValidate={handleAskValidate}
            handleShowDetail={handleShowDetail}
          />
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
        <DialogContent aria-describedby="product-detail-desc" className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Détail du produit</DialogTitle>
            <DialogDescription id="product-detail-desc">
              Informations détaillées sur le produit sélectionné.
            </DialogDescription>
          </DialogHeader>

          {loadingDetail ? (
            <div className="p-8 text-center text-neutral-400">Chargement...</div>
          ) : detailProduct ? (
            <Card className="border-violet-200 bg-violet-50 p-6 space-y-6">

              {/* HEADER PRODUIT */}
              <div className="flex gap-6 items-center">
                {detailProduct.productImage ? (
                  <img
                    src={getFullMediaUrl(detailProduct.productImage)}
                    alt={detailProduct.productName}
                    className="w-24 h-24 object-cover rounded shadow"
                  />
                ) : (
                  <div className="w-24 h-24 flex items-center justify-center bg-neutral-200 rounded text-neutral-400">
                    -
                  </div>
                )}

                <div className="flex flex-col gap-2">
                  <div className="text-xl font-bold text-violet-700">
                    {detailProduct.productName}
                  </div>

                  <Badge
                    variant="secondary"
                    className="text-xs capitalize w-fit"
                  >
                    {detailProduct.productCategory}
                  </Badge>

                  <div className="flex gap-2 mt-1">
                    <Badge
                      variant={detailProduct.isStocker ? 'default' : 'secondary'}
                      className={
                        detailProduct.isStocker
                          ? 'bg-green-100 text-green-700 border-green-200'
                          : 'bg-neutral-200 text-neutral-500 border-neutral-200'
                      }
                    >
                      Stocké : {detailProduct.isStocker ? 'Oui' : 'Non'}
                    </Badge>

                    <Badge
                      variant={detailProduct.productValidation ? 'default' : 'secondary'}
                      className={
                        detailProduct.productValidation
                          ? 'bg-green-100 text-green-700 border-green-200'
                          : 'bg-neutral-200 text-neutral-500 border-neutral-200'
                      }
                    >
                      Validé : {detailProduct.productValidation ? 'Oui' : 'Non'}
                    </Badge>
                  </div>
                </div>
              </div>

              {/* DESCRIPTION */}
              <div>
                <div className="text-sm font-semibold text-neutral-700 mb-1">
                  Description
                </div>
                <div className="text-sm text-neutral-900">
                  {detailProduct.productDescription || '-'}
                </div>
              </div>

              {/* INFOS TECHNIQUES */}
              <div>
                <div className="text-sm font-semibold text-neutral-700 mb-3">
                  Informations techniques
                </div>

                <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
                  <div>
                    <div className="text-neutral-500">Code CPC</div>
                    <div className="font-medium">{detailProduct.codeCPC || '-'}</div>
                  </div>

                  <div>
                    <div className="text-neutral-500">État</div>
                    <div className="font-medium">{detailProduct.productState || '-'}</div>
                  </div>

                  <div>
                    <div className="text-neutral-500">Volume</div>
                    <div className="font-medium">{detailProduct.productVolume || '-'}</div>
                  </div>

                  <div>
                    <div className="text-neutral-500">Poids</div>
                    <div className="font-medium">{detailProduct.productPoids || '-'}</div>
                  </div>

                  <div className="col-span-2">
                    <div className="text-neutral-500">Dimensions</div>
                    <div className="font-medium">
                      {detailProduct.productLongueur || '-'} ×{' '}
                      {detailProduct.productLargeur || '-'} ×{' '}
                      {detailProduct.productHauteur || '-'}
                    </div>
                  </div>
                </div>
              </div>

              {/* META */}
              <div className="border-t border-violet-200 pt-4 text-xs text-neutral-500 flex flex-col md:flex-row md:justify-between gap-2">
                <div>
                  <span className="font-semibold">Créé le :</span>{' '}
                  {detailProduct.createdAt
                    ? new Date(detailProduct.createdAt).toLocaleString()
                    : '-'}
                </div>

                <div>
                  <span className="font-semibold">Modifié le :</span>{' '}
                  {detailProduct.updatedAt
                    ? new Date(detailProduct.updatedAt).toLocaleString()
                    : '-'}
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

function ProductTableOrList({ loading, products, handleAskValidate, handleShowDetail }) {
  const { isDesktop } = useScreenType();

  if (loading) return <div className="p-8 text-center text-neutral-400">Chargement...</div>;
  if (!products || products.length === 0) return <div className="p-8 text-center text-neutral-400">Aucun produit trouvé</div>;

  if (isDesktop) {
    return (
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="text-xs text-neutral-600">Aperçu</TableHead>
              <TableHead className="text-xs text-neutral-600">Nom</TableHead>
              <TableHead className="text-xs text-neutral-600">Catégorie</TableHead>
              <TableHead className="text-xs text-neutral-600">Propriétaire</TableHead>
              <TableHead className="text-xs text-neutral-600">Stocké</TableHead>
              <TableHead className="text-xs text-neutral-600">Validé</TableHead>
              <TableHead className="text-xs text-neutral-600">Code CPC</TableHead>
              <TableHead className="text-xs text-neutral-600">Détail</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {products.map((product) => (
              <TableRow key={product._id}>
                <TableCell>
                  {product.image ? (
                    <img src={getFullMediaUrl(product.image)} alt={product.name} className="w-12 h-12 object-cover rounded" />
                  ) : (
                    <span className="text-neutral-400">-</span>
                  )}
                </TableCell>
                <TableCell className="text-sm text-neutral-900">{product.name}</TableCell>
                <TableCell className="text-sm text-neutral-600">{product.categoryNom || '-'}</TableCell>
                <TableCell className="text-sm text-neutral-600">{product.ownerName || product.ownerNickName || '-'}</TableCell>
                <TableCell>
                  <Badge variant={product.isStocker ? 'default' : 'secondary'} className={product.isStocker ? 'bg-green-100 text-green-700 border-green-200' : 'bg-neutral-200 text-neutral-500 border-neutral-200'}>
                    {product.isStocker ? 'Oui' : 'Non'}
                  </Badge>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <Switch aria-label="Basculer validation produit" checked={product.validation} onCheckedChange={() => handleAskValidate(product._id)} />
                    <Badge variant={product.validation ? 'default' : 'secondary'} className={product.validation ? 'bg-green-100 text-green-700 border-green-200' : 'bg-neutral-200 text-neutral-500 border-neutral-200'}>
                      {product.validation ? 'Oui' : 'Non'}
                    </Badge>
                  </div>
                </TableCell>
                <TableCell className="text-sm text-neutral-600">{product.codeCPC || '-'}</TableCell>
                <TableCell>
                  <Button variant="ghost" size="sm" aria-label={`Détail ${product._id}`} onClick={() => handleShowDetail(product._id)}>
                    <InfoIcon className="w-5 h-5 text-violet-600" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    );
  }

  // Mobile cards
  return (
    <div className="space-y-3 p-4">
      {products.map((product) => (
        <Card key={product._id} className="p-4">
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 flex items-center justify-center bg-neutral-100 rounded overflow-hidden">
                  {product.image ? (
                    <img src={getFullMediaUrl(product.image)} alt={product.name} className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-neutral-400">-</span>
                  )}
                </div>
                <div className="min-w-0">
                  <div className="font-medium text-neutral-900 truncate">{product.name}</div>
                  <div className="text-xs text-neutral-500 truncate">{product.categoryNom || '-'}</div>
                  <div className="text-xs text-neutral-500 truncate">{product.ownerName || product.ownerNickName || '-'}</div>
                </div>
              </div>
              <div className="mt-3 flex flex-wrap items-center gap-2">
                <Badge variant={product.isStocker ? 'default' : 'secondary'} className="text-xs">{product.isStocker ? 'Stocké' : 'Non stocké'}</Badge>
                <div className="flex items-center gap-2">
                  <Switch aria-label="Basculer validation produit" checked={product.validation} onCheckedChange={() => handleAskValidate(product._id)} />
                  <span className="text-xs text-neutral-600">{product.validation ? 'Validé' : 'Non validé'}</span>
                </div>
                <div className="text-sm text-neutral-900">{product.codeCPC || '-'}</div>
              </div>
            </div>
            <div className="flex flex-col items-end gap-2">
              <Button variant="ghost" size="sm" aria-label={`Détail ${product._id}`} onClick={() => handleShowDetail(product._id)}>
                <InfoIcon className="w-5 h-5 text-violet-600" />
              </Button>
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
}
