import { useState, useEffect } from 'react';
import { Card } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Badge } from '../../components/ui/badge';
import SearchIcon from '@mui/icons-material/Search';
import AddIcon from '@mui/icons-material/Add';
import InfoIcon from '@mui/icons-material/Info';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import { toast } from 'sonner';
import usePageTitle from '../../utils/usePageTitle.jsx';
import { getMyProducts, toggleProductStocker, getProductById, createProduct } from '../../services/product.service';
import { getFullMediaUrl } from '../../services/media.service';
// import { Switch } from '../../components/ui/switch';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogClose, DialogDescription, DialogTrigger } from '../../components/ui/dialog';
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from '../../components/ui/select';
import { Label } from '../../components/ui/label';
import { getAllCpcSelect } from '../../services/cpc.service';
import { depositStock } from '../../services/stocker_move.service';
import { getMySites } from '../../services/site.service';

const MesProduits = () => {
  // Ouvrir le modal dépôt
  const handleOpenDepositModal = async (productId) => {
    setDepositProductId(productId);
    setDepositForm(f => ({ ...f, productId }));
    setDepositModalOpen(true);
    try {
      const token = localStorage.getItem('token');
      const res = await getMySites({ limit: 100, page: 1 });
      setSites(res.data || []);
    } catch (err) {
      toast.error('Erreur lors du chargement des sites');
      setSites([]);
    }
  };

  // Soumission du dépôt
  const handleDepositSubmit = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem('token');
    try {
      await depositStock({
        ...depositForm,
        productId: depositProductId,
        quantite: Number(depositForm.quantite),
      }, token);
      toast.success('Produit déposé avec succès');
      setDepositModalOpen(false);
      setDepositForm({
        siteOrigineId: '',
        siteDestinationId: '',
        productId: '',
        quantite: '',
        type: 'Depot',
        observations: '',
      });
    } catch (err) {
      toast.error('Erreur lors du dépôt');
    }
  };
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
  const [detailOpen, setDetailOpen] = useState(false);
  const [detailProduct, setDetailProduct] = useState(null);
  const [loadingDetail, setLoadingDetail] = useState(false);
  // Ajout pour le modal d'ajout de produit
  const [addModalOpen, setAddModalOpen] = useState(false);
  // Modal dépôt
  const [depositModalOpen, setDepositModalOpen] = useState(false);
  const [depositProductId, setDepositProductId] = useState(null);
  const [sites, setSites] = useState([]);
  const [depositForm, setDepositForm] = useState({
    siteOrigineId: '',
    siteDestinationId: '',
    productId: '',
    quantite: '',
    type: 'Depot',
    observations: '',
  });
  const [cpcOptions, setCpcOptions] = useState([]);
  const [form, setForm] = useState({
    productState: '',
    codeCPC: '',
    productVolume: '',
    productLargeur: '',
    productPoids: '',
    productCategory: '',
    productDescription: '',
    productLongueur: '',
    categoryId: '',
    productName: '',
    productHauteur: '',
    image: null,
  });
  // Complétion auto
  const handleCpcSelect = (id, nom, code) => {
    setForm(f => ({
      ...f,
      productCategory: nom,
      categoryId: id,
      codeCPC: code,
    }));
  };

  // Soumission du formulaire d'ajout
  const handleAddProduct = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem('token');
    try {
      await createProduct({
        productState: form.productState,
        codeCPC: form.codeCPC,
        productVolume: form.productVolume,
        productLargeur: form.productLargeur,
        productPoids: form.productPoids,
        productCategory: form.productCategory,
        productDescription: form.productDescription,
        productLongueur: form.productLongueur,
        categoryId: form.categoryId,
        productName: form.productName,
        productHauteur: form.productHauteur,
      }, form.image, token);
      toast.success('Produit ajouté avec succès');
      setAddModalOpen(false);
      setForm({
        productState: '',
        codeCPC: '',
        productVolume: '',
        productLargeur: '',
        productPoids: '',
        productCategory: '',
        productDescription: '',
        productLongueur: '',
        categoryId: '',
        productName: '',
        productHauteur: '',
        image: null,
      });
      fetchProducts();
    } catch (err) {
      toast.error('Erreur lors de l\'ajout du produit');
    }
  };
  useEffect(() => {
    if (addModalOpen) {
      getAllCpcSelect().then(res => {
        setCpcOptions(res.data || []);
      });
    }
  }, [addModalOpen]);
  const handleInputChange = e => {
    const { name, value, files, type } = e.target;
    setForm(f => ({
      ...f,
      [name]: type === 'file' ? files[0] : value,
    }));
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
            <div>
              <Dialog open={addModalOpen} onOpenChange={setAddModalOpen}>
                <DialogTrigger asChild>
                  <Button
                    className="bg-violet-600 hover:bg-violet-700 text-white"
                    onClick={() => setAddModalOpen(true)}
                  >
                    <AddIcon className="w-5 h-5 mr-2" />
                    Ajouter un produit
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Ajouter un produit</DialogTitle>
                  </DialogHeader>
                  <form className="space-y-4" onSubmit={handleAddProduct}>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* Catégorie CPC et Code CPC côte à côte */}
                      <div className="col-span-1 md:col-span-2 flex gap-4">
                        <div className="space-y-2 flex-1">
                          <Label htmlFor="productCategory">Catégorie CPC</Label>
                          <Select value={form.productCategory} onValueChange={val => {
                            const selected = cpcOptions.find(opt => opt.nom === val);
                            if (selected) handleCpcSelect(selected.id, selected.nom, selected.code);
                          }}>
                            <SelectTrigger>
                              <SelectValue placeholder="Choisir la catégorie" />
                            </SelectTrigger>
                            <SelectContent>
                              {cpcOptions.map(opt => (
                                <SelectItem key={opt.id} value={opt.nom}>{opt.nom}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-2 flex-1">
                          <Label htmlFor="codeCPC">Code CPC</Label>
                          <Input name="codeCPC" value={form.codeCPC} onChange={handleInputChange} required placeholder="01111" className="border-neutral-300" readOnly />
                        </div>
                      </div>
                      {/* ...autres champs... */}
                      <div className="space-y-2">
                        <Label htmlFor="productName">Nom du produit</Label>
                        <Input name="productName" value={form.productName} onChange={handleInputChange} required placeholder="Blé dur de qualité supérieure" className="border-neutral-300" />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="productState">État</Label>
                        <Select value={form.productState} onValueChange={val => setForm(f => ({ ...f, productState: val }))}>
                          <SelectTrigger>
                            <SelectValue placeholder="Sélectionner l'état" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Brut">Brut</SelectItem>
                            <SelectItem value="Conditionné">Conditionné</SelectItem>
                            <SelectItem value="Transformé">Transformé</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="productVolume">Volume</Label>
                        <Input name="productVolume" value={form.productVolume} onChange={handleInputChange} required placeholder="1000 L" className="border-neutral-300" />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="productLargeur">Largeur</Label>
                        <Input name="productLargeur" value={form.productLargeur} onChange={handleInputChange} required placeholder="0.8 m" className="border-neutral-300" />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="productPoids">Poids</Label>
                        <Input name="productPoids" value={form.productPoids} onChange={handleInputChange} required placeholder="500 kg" className="border-neutral-300" />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="productLongueur">Longueur</Label>
                        <Input name="productLongueur" value={form.productLongueur} onChange={handleInputChange} required placeholder="0.8 m" className="border-neutral-300" />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="productHauteur">Hauteur</Label>
                        <Input name="productHauteur" value={form.productHauteur} onChange={handleInputChange} required placeholder="1.2 m" className="border-neutral-300" />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="productDescription">Description</Label>
                        <Input name="productDescription" value={form.productDescription} onChange={handleInputChange} required placeholder="Blé dur récolté en 2025, teneur en humidité < 12%" className="border-neutral-300" />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="image">Image</Label>
                        <Input name="image" type="file" accept="image/*" onChange={handleInputChange} required className="border-neutral-300" />
                      </div>
                      {/* Champ ID Catégorie masqué */}
                      {/* <div className="space-y-2">
                        <Label htmlFor="categoryId">ID Catégorie</Label>
                        <Input name="categoryId" value={form.categoryId} onChange={handleInputChange} required placeholder="65dcf1234567890abcdef123" className="border-neutral-300" readOnly />
                      </div> */}
                    </div>
                    <div className="flex justify-end gap-2 mt-4">
                      <Button variant="outline" type="button" onClick={() => setAddModalOpen(false)}>Annuler</Button>
                      <Button variant="default" className="bg-violet-600 text-white hover:bg-violet-700" type="submit">Ajouter</Button>
                    </div>
                  </form>
                </DialogContent>
              </Dialog>
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
                    {/* <th className="text-left p-4 text-xs text-neutral-600">Stocké</th> */}
                    <th className="text-left p-4 text-xs text-neutral-600">Validé</th>
                    <th className="text-left p-4 text-xs text-neutral-600">Code CPC</th>
                    <th className="text-left p-4 text-xs text-neutral-600">Déposer</th>
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
                          <Badge
                            variant={product.validation ? 'default' : 'secondary'}
                            className={product.validation ? 'bg-green-100 text-green-700 border-green-200 ml-2' : 'bg-neutral-200 text-neutral-500 border-neutral-200 ml-2'}
                          >
                            {product.validation ? 'Oui' : 'Non'}
                          </Badge>
                        </td>
                        <td className="p-4 text-sm text-neutral-600">{product.codeCPC || '-'}</td>
                        <td className="p-4 text-sm">
                          <Button onClick={() => handleOpenDepositModal(product._id)} variant="outline" size="sm">
                            Ajouter à un dépôt
                          </Button>
                        </td>
                        <td className="p-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <Button variant="ghost" size="sm" onClick={() => handleShowDetail(product._id)}>
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

      {/* Modal dépôt */}
      <Dialog open={depositModalOpen} onOpenChange={setDepositModalOpen}>
        <DialogContent className="bg-white border border-neutral-200">
          <DialogHeader>
            <DialogTitle>Déposer le produit</DialogTitle>
          </DialogHeader>
          <form className="space-y-4" onSubmit={handleDepositSubmit}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="siteOrigineId">Site d'origine</Label>
                <Select value={depositForm.siteOrigineId} onValueChange={val => setDepositForm(f => ({ ...f, siteOrigineId: val }))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionner le site d'origine" />
                  </SelectTrigger>
                  <SelectContent>
                    {sites.map(site => (
                      <SelectItem key={site._id} value={site._id}>{site.siteName}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="siteDestinationId">Site de destination</Label>
                <Select value={depositForm.siteDestinationId} onValueChange={val => setDepositForm(f => ({ ...f, siteDestinationId: val }))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionner le site de destination" />
                  </SelectTrigger>
                  <SelectContent>
                    {sites.map(site => (
                      <SelectItem key={site._id} value={site._id}>{site.siteName}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="quantite">Quantité</Label>
                <Input name="quantite" value={depositForm.quantite} onChange={e => setDepositForm(f => ({ ...f, quantite: e.target.value }))} required placeholder="Quantité à déposer" className="border-neutral-300" type="number" min="1" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="type">Type</Label>
                <Input name="type" value={depositForm.type} onChange={e => setDepositForm(f => ({ ...f, type: e.target.value }))} required placeholder="Type de mouvement" className="border-neutral-300" />
              </div>
              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="observations">Observations</Label>
                <Input name="observations" value={depositForm.observations} onChange={e => setDepositForm(f => ({ ...f, observations: e.target.value }))} placeholder="Observations (facultatif)" className="border-neutral-300" />
              </div>
            </div>
            <div className="flex justify-end gap-2 mt-4">
              <Button variant="outline" type="button" onClick={() => setDepositModalOpen(false)}>Annuler</Button>
              <Button variant="default" className="bg-violet-600 text-white hover:bg-violet-700" type="submit">Déposer</Button>
            </div>
          </form>
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
    </>
  );
};

export default MesProduits;
