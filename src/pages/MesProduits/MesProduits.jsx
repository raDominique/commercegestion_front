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
import useScreenType from '../../utils/useScreenType.jsx';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '../../components/ui/table';
import { getMyProducts, toggleProductStocker, getProductById, createProduct, updateProduct, deleteProduct } from '../../services/product.service';
import { getFullMediaUrl } from '../../services/media.service';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogTrigger, DialogClose } from '../../components/ui/dialog';
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from '../../components/ui/select';
import { Label } from '../../components/ui/label';
import { getAllCpcSelect } from '../../services/cpc.service';
import { getAllUsersSelect } from '../../services/user.service';
import { depositStock } from '../../services/stocks_move.service.js';
import { getMySites } from '../../services/site.service';
import { useAuth } from '../../context/AuthContext';
import UserNotValidatedBanner from '../../components/commons/UserNotValidatedBanner.jsx';
import { addProductFieldControl } from '../../utils/addProductFieldControl';

const MesProduits = () => {
  // Gestion des erreurs pour le formulaire dépôt
  const [depositErrors, setDepositErrors] = useState({});
  const { user } = useAuth();
  if (user && user.userValidated === false) {
    return (
      <div className="px-6 mx-auto">
        <UserNotValidatedBanner />
      </div>
    );
  }
  // Options CPC pour édition
  const [editCpcOptions, setEditCpcOptions] = useState([]);
  // Ouvrir le modal dépôt
  const handleOpenDepositModal = async (productId) => {
    setDepositProductId(productId);
    setDepositForm(f => ({ ...f, productId: productId || '' }));
    setDepositModalOpen(true);
    try {
      const res = await getMySites({ limit: 100, page: 1 });
      setSites(res.data || []);
      try {
        const usersRes = await getAllUsersSelect();
        const usersArr = Array.isArray(usersRes) ? usersRes : (Array.isArray(usersRes?.data) ? usersRes.data : []);
        setUsersOptions(usersArr);
      } catch (errUsers) {
        setUsersOptions([]);
      }
    } catch (err) {
      toast.error('Erreur lors du chargement des sites');
      setSites([]);
    }
  };

  // Soumission du dépôt
  const handleDepositSubmit = async (e) => {
    e.preventDefault();
    // Validation centralisée
    const errors = {};
    Object.entries(addProductFieldControl).forEach(([key, ctrl]) => {
      const err = ctrl.validate(depositForm[key]);
      if (err) errors[key] = err;
    });
    setDepositErrors(errors);
    if (Object.keys(errors).length > 0) return;
    const token = localStorage.getItem('token');
    try {
      await depositStock({
        ...depositForm,
        productId: depositProductId || depositForm.productId,
        quantite: Number(depositForm.quantite),
        prixUnitaire: Number(depositForm.prixUnitaire),
      }, token);
      toast.success('Produit déposé avec succès');
      setDepositModalOpen(false);
      setDepositForm({
        siteOrigineId: '',
        siteDestinationId: '',
        productId: '',
        quantite: '',
        prixUnitaire: '',
        detentaire: '',
        ayant_droit: '',
        observations: '',
      });
      setDepositErrors({});
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
  const [validationFilter, setValidationFilter] = useState('all'); // 'all', 'true', 'false'
  const [isStockerFilter, setIsStockerFilter] = useState('all'); // 'all', 'true', 'false'
  const [detailOpen, setDetailOpen] = useState(false);
  const [detailProduct, setDetailProduct] = useState(null);
  const [loadingDetail, setLoadingDetail] = useState(false);
  // Ajout pour le modal d'ajout de produit
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [adding, setAdding] = useState(false);
  // Modal modification produit
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editProductId, setEditProductId] = useState(null);
  const [editForm, setEditForm] = useState({
    // productState: '',
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
  // Ouvre le modal d'édition et pré-remplit le formulaire
  const handleOpenEditModal = async (productId) => {
    setEditProductId(productId);
    setEditModalOpen(true);
    try {
      const token = localStorage.getItem('token');
      const res = await getProductById(productId, token);
      const data = Array.isArray(res.data) ? res.data[0] : res.data;
      setEditForm({
        // productState: data.productState || '',
        codeCPC: data.codeCPC || '',
        productVolume: data.productVolume || '',
        productLargeur: data.productLargeur || '',
        productPoids: data.productPoids || '',
        productCategory: data.productCategory || '',
        productDescription: data.productDescription || '',
        productLongueur: data.productLongueur || '',
        categoryId: data.categoryId || '',
        productName: data.productName || data.name || '',
        productHauteur: data.productHauteur || '',
        image: data.image || data.productImage || null,
      });
    } catch (err) {
      toast.error("Impossible de charger le produit à modifier");
      setEditModalOpen(false);
    }
  };

  // Gère la modification du produit
  const handleEditProduct = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem('token');
    try {
      // Remplacer par la fonction de modification réelle (updateProduct)
      await updateProduct(editProductId, {
        // productState: editForm.productState,
        codeCPC: editForm.codeCPC,
        productVolume: editForm.productVolume,
        productLargeur: editForm.productLargeur,
        productPoids: editForm.productPoids,
        productCategory: editForm.productCategory,
        productDescription: editForm.productDescription,
        productLongueur: editForm.productLongueur,
        categoryId: editForm.categoryId,
        productName: editForm.productName,
        productHauteur: editForm.productHauteur,
      }, editForm.image, token);
      toast.success('Produit modifié avec succès');
      setEditModalOpen(false);
      setEditForm({
        // productState: '',
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
      toast.error("Erreur lors de la modification du produit");
    }
  };

  // Gère le changement des champs du formulaire d'édition
  const handleEditInputChange = e => {
    const { name, value, files, type } = e.target;
    setEditForm(f => ({
      ...f,
      [name]: type === 'file' ? files[0] : value,
    }));
  };
  // Modal dépôt
  const [depositModalOpen, setDepositModalOpen] = useState(false);
  const [depositProductId, setDepositProductId] = useState(null);
  const [sites, setSites] = useState([]);
  const [depositForm, setDepositForm] = useState({
    siteOrigineId: '',
    siteDestinationId: '',
    productId: '',
    quantite: '',
    prixUnitaire: '',
    detentaire: '',
    ayant_droit: '',
    observations: '',
  });
  const [cpcOptions, setCpcOptions] = useState([]);
  const [cpcSearch, setCpcSearch] = useState('');
  const [cpcOpen, setCpcOpen] = useState(false);
  const [cpcHighlighted, setCpcHighlighted] = useState(0);
  const [usersOptions, setUsersOptions] = useState([]);
  const [editCpcSearch, setEditCpcSearch] = useState('');
  const [editCpcOpen, setEditCpcOpen] = useState(false);
  const [editCpcHighlighted, setEditCpcHighlighted] = useState(0);
  const [form, setForm] = useState({
    // productState: '',
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

  const filteredCpcOptions = cpcOptions.filter(opt => opt.nom.toLowerCase().includes(cpcSearch.toLowerCase()));
  const filteredEditCpcOptions = editCpcOptions.filter(opt => opt.nom.toLowerCase().includes(editCpcSearch.toLowerCase()));

  // Soumission du formulaire d'ajout
  const handleAddProduct = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem('token');
    setAdding(true);
    try {
      await createProduct({
        // productState: form.productState,
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
        // productState: '',
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
    finally {
      setAdding(false);
    }
  };
  useEffect(() => {
    if (addModalOpen) {
      getAllCpcSelect().then(res => {
        setCpcOptions(res.data || []);
        setCpcSearch('');
      });
    }
    if (editModalOpen) {
      getAllCpcSelect().then(res => {
        setEditCpcOptions(res.data || []);
        setEditCpcSearch('');
      });
    }
  }, [addModalOpen, editModalOpen]);
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

  const [deleting, setDeleting] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleteId, setDeleteId] = useState(null);

  const handleDeleteProduct = (id) => {
    setDeleteId(id);
    setDeleteOpen(true);
  };

  const confirmDeleteProduct = async () => {
    setDeleting(true);
    try {
      const token = localStorage.getItem('token');
      await deleteProduct(deleteId, token);
      toast.success('Produit supprimé avec succès');
      setDeleteOpen(false);
      setDeleteId(null);
      fetchProducts();
    } catch (err) {
      toast.error('Erreur lors de la suppression du produit');
    } finally {
      setDeleting(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, [searchTerm, page, limit, validationFilter, isStockerFilter]);

  const { isDesktop } = useScreenType();

  const ProductsTableOrList = () => {
    if (isDesktop) {
      return (
        <div className="overflow-x-auto">
          <Table className="table-fixed">
            <TableHeader>
              <TableRow>
                <TableHead className="text-left p-4 text-xs text-neutral-600">Aperçu</TableHead>
                <TableHead className="text-left p-4 text-xs text-neutral-600">Nom</TableHead>
                <TableHead className="text-left p-4 text-xs text-neutral-600 w-48">Catégorie</TableHead>
                <TableHead className="text-left p-4 text-xs text-neutral-600">Validé</TableHead>
                <TableHead className="text-left p-4 text-xs text-neutral-600">Code CPC</TableHead>
                <TableHead className="text-left p-4 text-xs text-neutral-600">Déposer</TableHead>
                <TableHead className="text-right p-4 text-xs text-neutral-600">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={7} className="p-8 text-center text-neutral-400">Chargement...</TableCell>
                </TableRow>
              ) : products.length > 0 ? (
                products.map((product) => (
                  <TableRow key={product._id} className="border-b border-neutral-200 last:border-0">
                    <TableCell className="p-4 text-sm">
                      {product.image ? (
                        <img src={getFullMediaUrl(product.image)} alt={product.name} className="w-12 h-12 object-cover rounded" />
                      ) : (
                        <span className="text-neutral-400">-</span>
                      )}
                    </TableCell>
                    <TableCell className="p-4 text-sm text-neutral-900">{product.name}</TableCell>
                    <TableCell className="p-4 text-sm text-neutral-600 w-48">
                      <div className="w-48 truncate">{product.categoryNom || '-'}</div>
                    </TableCell>
                    <TableCell className="p-4 text-sm">
                      <Badge
                        variant={product.validation ? 'default' : 'secondary'}
                        className={product.validation ? 'bg-green-100 text-green-700 border-green-200 ml-2' : 'bg-neutral-200 text-neutral-500 border-neutral-200 ml-2'}
                      >
                        {product.validation ? 'Oui' : 'Non'}
                      </Badge>
                    </TableCell>
                    <TableCell className="p-4 text-sm text-neutral-600">{product.codeCPC || '-'}</TableCell>
                    <TableCell className="p-4 text-sm">
                      <Button
                        onClick={() => handleOpenDepositModal(product._id)}
                        variant="outline"
                        size="sm"
                        disabled={product.isStocker}
                        className={product.isStocker ? 'opacity-50 cursor-not-allowed' : ''}
                      >
                        Ajouter à un dépôt
                      </Button>
                    </TableCell>
                    <TableCell className="p-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleShowDetail(product._id)}
                          aria-label={`Voir détails ${product.name}`}
                        >
                          <InfoIcon className="w-5 h-5 text-violet-600" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleOpenEditModal(product._id)}
                          disabled={product.isStocker}
                          className={product.isStocker ? 'opacity-50 cursor-not-allowed' : ''}
                          aria-label={`Modifier ${product.name}`}
                        >
                          <EditIcon className="w-5 h-5 text-amber-600" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteProduct(product._id)}
                          disabled={product.isStocker}
                          className={product.isStocker ? 'opacity-50 cursor-not-allowed' : ''}
                          aria-label={`Supprimer ${product.name}`}
                        >
                          <DeleteIcon className="w-5 h-5 text-red-600" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={7} className="p-8 text-center text-neutral-400">Aucun produit trouvé</TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      );
    }

    // Mobile list view
    return (
      <div className="space-y-3">
        {loading ? (
          <div className="p-8 text-center text-neutral-400">Chargement...</div>
        ) : products.length > 0 ? (
          products.map((product) => (
            <Card key={product._id} className="p-4">
              <div className="flex items-start gap-4">
                {product.image ? (
                  <img src={getFullMediaUrl(product.image)} alt={product.name} className="w-16 h-16 object-cover rounded" />
                ) : (
                  <div className="w-16 h-16 flex items-center justify-center bg-neutral-200 rounded text-neutral-400">-</div>
                )}
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-start">
                    <div className="text-sm font-medium text-neutral-900 truncate">{product.name}</div>
                    <div className="text-sm text-neutral-600">{product.codeCPC || '-'}</div>
                  </div>
                  <div className="text-sm text-neutral-600 max-w-full wrap-wrap-break-words whitespace-normal">{product.categoryNom || '-'}</div>
                  <div className="flex items-center gap-2 mt-2">
                    <Badge
                      variant={product.validation ? 'default' : 'secondary'}
                      className={product.validation ? 'bg-green-100 text-green-700 border-green-200' : 'bg-neutral-200 text-neutral-500 border-neutral-200'}
                    >
                      {product.validation ? 'Oui' : 'Non'}
                    </Badge>
                    <Button
                      onClick={() => handleOpenDepositModal(product._id)}
                      variant="outline"
                      size="sm"
                      disabled={product.isStocker}
                      className={product.isStocker ? 'opacity-50 cursor-not-allowed' : ''}
                    >
                      Ajouter
                    </Button>
                  </div>
                </div>
              </div>
              <div className="flex gap-2 mt-3 justify-end">
                <Button variant="ghost" size="sm" onClick={() => handleShowDetail(product._id)} aria-label={`Voir détails ${product.name}`}>
                  <InfoIcon className="w-5 h-5 mr-2" />Détails
                </Button>
                <Button variant="ghost" size="sm" onClick={() => handleOpenEditModal(product._id)} disabled={product.isStocker} className={product.isStocker ? 'opacity-50 cursor-not-allowed' : ''} aria-label={`Modifier ${product.name}`}>
                  <EditIcon className="w-5 h-5 mr-2" />Modifier
                </Button>
                <Button variant="ghost" size="sm" onClick={() => handleDeleteProduct(product._id)} disabled={product.isStocker} className={product.isStocker ? 'opacity-50 cursor-not-allowed' : ''} aria-label={`Supprimer ${product.name}`}>
                  <DeleteIcon className="w-5 h-5 mr-2" />Supprimer
                </Button>
              </div>
            </Card>
          ))
        ) : (
          <div className="p-8 text-center text-neutral-400">Aucun produit trouvé</div>
        )}
      </div>
    );
  };

  return (
    <div className="px-6 mx-auto">
      {user && user.userValidated === false && (
        <UserNotValidatedBanner />
      )}
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
                      <div className="space-y-2 flex-2">
                        <Label htmlFor="productCategory">Catégorie CPC</Label>
                        <div className="relative">
                          <Input
                            placeholder="Rechercher / Choisir une catégorie..."
                            value={cpcSearch}
                            onChange={e => { setCpcSearch(e.target.value); setCpcHighlighted(0); }}
                            onFocus={() => { setCpcOpen(true); setCpcHighlighted(0); }}
                            onBlur={() => setTimeout(() => setCpcOpen(false), 150)}
                            onKeyDown={(e) => {
                              if (e.key === 'Escape') return setCpcOpen(false);
                              if (!cpcOpen && (e.key === 'ArrowDown' || e.key === 'ArrowUp')) {
                                setCpcOpen(true);
                                e.preventDefault();
                                return;
                              }
                              if (cpcOpen) {
                                if (e.key === 'ArrowDown') {
                                  e.preventDefault();
                                  setCpcHighlighted(i => Math.min(i + 1, Math.max(filteredCpcOptions.length - 1, 0)));
                                } else if (e.key === 'ArrowUp') {
                                  e.preventDefault();
                                  setCpcHighlighted(i => Math.max(i - 1, 0));
                                } else if (e.key === 'Enter') {
                                  e.preventDefault();
                                  const opt = filteredCpcOptions[cpcHighlighted];
                                  if (opt) {
                                    handleCpcSelect(opt.id, opt.nom, opt.code);
                                    setCpcSearch(opt.nom);
                                    setCpcOpen(false);
                                  }
                                }
                              }
                            }}
                            className="w-full"
                          />
                          {cpcOpen && (
                            <div className="absolute left-0 right-0 mt-1 bg-white border rounded shadow max-h-60 overflow-auto z-50">
                              {filteredCpcOptions.length > 0 ? (
                                filteredCpcOptions.map((opt, idx) => (
                                  <button
                                    type="button"
                                    key={opt.id}
                                    onMouseEnter={() => setCpcHighlighted(idx)}
                                    onClick={() => {
                                      handleCpcSelect(opt.id, opt.nom, opt.code);
                                      setCpcSearch(opt.nom);
                                      setCpcOpen(false);
                                    }}
                                    className={`w-full text-left px-3 py-2 text-sm ${idx === cpcHighlighted ? 'bg-violet-50' : 'hover:bg-neutral-100'}`}
                                  >
                                    {opt.nom}
                                  </button>
                                ))
                              ) : (
                                <div className="px-3 py-2 text-sm text-neutral-500">Aucune catégorie</div>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="space-y-2 flex-[0.7] min-w-30">
                        <Label htmlFor="codeCPC">Code CPC</Label>
                        <Input name="codeCPC" value={form.codeCPC} onChange={handleInputChange} required placeholder="01111" className="border-neutral-300" readOnly />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="productName">Nom du produit</Label>
                      <Input name="productName" value={form.productName} onChange={handleInputChange} required placeholder="Blé dur de qualité supérieure" className="border-neutral-300" />
                    </div>
                    {/* <div className="space-y-2">
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
                      </div> */}
                    <div className="space-y-2">
                      <Label htmlFor="productVolume">Volume</Label>
                      <Input name="productVolume" value={form.productVolume} onChange={handleInputChange} placeholder="1000 L" className="border-neutral-300" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="productLargeur">Largeur</Label>
                      <Input name="productLargeur" value={form.productLargeur} onChange={handleInputChange} placeholder="0.8 m" className="border-neutral-300" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="productPoids">Poids</Label>
                      <Input name="productPoids" value={form.productPoids} onChange={handleInputChange} placeholder="500 kg" className="border-neutral-300" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="productLongueur">Longueur</Label>
                      <Input name="productLongueur" value={form.productLongueur} onChange={handleInputChange} placeholder="0.8 m" className="border-neutral-300" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="productHauteur">Hauteur</Label>
                      <Input name="productHauteur" value={form.productHauteur} onChange={handleInputChange} placeholder="1.2 m" className="border-neutral-300" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="productDescription">Description</Label>
                      <Input name="productDescription" value={form.productDescription} onChange={handleInputChange} placeholder="Blé dur récolté en 2025, teneur en humidité < 12%" className="border-neutral-300" />
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
                    <Button variant="outline" type="button" onClick={() => setAddModalOpen(false)} disabled={adding}>Annuler</Button>
                    <Button variant="default" className="bg-violet-600 text-white hover:bg-violet-700" type="submit" disabled={adding}>
                      {adding ? 'Ajout...' : 'Ajouter'}
                    </Button>
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
              className="pl-10 border-black bg-white"
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
              className="min-w-0 border border-neutral-300 rounded px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500 md:w-auto"
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
              className="min-w-0 border border-neutral-300 rounded px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500 md:w-auto"
            >
              <option value="all">Tous</option>
              <option value="true">Stockés</option>
              <option value="false">Non stockés</option>
            </select>
          </div>
        </div>
        <Card className="border-neutral-200 bg-white">
          <ProductsTableOrList />
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


      {/* Modal modification produit */}
      <Dialog open={editModalOpen} onOpenChange={setEditModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Modifier le produit</DialogTitle>
          </DialogHeader>
          <form className="space-y-4" onSubmit={handleEditProduct}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Catégorie CPC et Code CPC côte à côte */}
              <div className="col-span-1 md:col-span-2 flex gap-4">
                <div className="space-y-2 flex-1">
                  <Label htmlFor="productCategory">Catégorie CPC</Label>
                  <div className="relative">
                    <Input
                      placeholder="Rechercher / Choisir une catégorie..."
                      value={editCpcSearch}
                      onChange={e => { setEditCpcSearch(e.target.value); setEditCpcHighlighted(0); }}
                      onFocus={() => { setEditCpcOpen(true); setEditCpcHighlighted(0); }}
                      onBlur={() => setTimeout(() => setEditCpcOpen(false), 150)}
                      onKeyDown={(e) => {
                        if (e.key === 'Escape') return setEditCpcOpen(false);
                        if (!editCpcOpen && (e.key === 'ArrowDown' || e.key === 'ArrowUp')) {
                          setEditCpcOpen(true);
                          e.preventDefault();
                          return;
                        }
                        if (editCpcOpen) {
                          if (e.key === 'ArrowDown') {
                            e.preventDefault();
                            setEditCpcHighlighted(i => Math.min(i + 1, Math.max(filteredEditCpcOptions.length - 1, 0)));
                          } else if (e.key === 'ArrowUp') {
                            e.preventDefault();
                            setEditCpcHighlighted(i => Math.max(i - 1, 0));
                          } else if (e.key === 'Enter') {
                            e.preventDefault();
                            const opt = filteredEditCpcOptions[editCpcHighlighted];
                            if (opt) {
                              setEditForm(f => ({ ...f, productCategory: opt.nom, categoryId: opt.id, codeCPC: opt.code }));
                              setEditCpcSearch(opt.nom);
                              setEditCpcOpen(false);
                            }
                          }
                        }
                      }}
                      className="w-full"
                    />
                    {editCpcOpen && (
                      <div className="absolute left-0 right-0 mt-1 bg-white border rounded shadow max-h-60 overflow-auto z-50">
                        {filteredEditCpcOptions.length > 0 ? (
                          filteredEditCpcOptions.map((opt, idx) => (
                            <button
                              type="button"
                              key={opt.id}
                              onMouseEnter={() => setEditCpcHighlighted(idx)}
                              onClick={() => {
                                setEditForm(f => ({ ...f, productCategory: opt.nom, categoryId: opt.id, codeCPC: opt.code }));
                                setEditCpcSearch(opt.nom);
                                setEditCpcOpen(false);
                              }}
                              className={`w-full text-left px-3 py-2 text-sm ${idx === editCpcHighlighted ? 'bg-violet-50' : 'hover:bg-neutral-100'}`}
                            >
                              {opt.nom}
                            </button>
                          ))
                        ) : (
                          <div className="px-3 py-2 text-sm text-neutral-500">Aucune catégorie</div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
                <div className="space-y-2 flex-1">
                  <Label htmlFor="codeCPC">Code CPC</Label>
                  <Input name="codeCPC" value={editForm.codeCPC} onChange={handleEditInputChange} required placeholder="01111" className="border-neutral-300" readOnly />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="productName">Nom du produit</Label>
                <Input name="productName" value={editForm.productName} onChange={handleEditInputChange} required placeholder="Nom du produit" className="border-neutral-300" />
              </div>
              {/* <div className="space-y-2">
                <Label htmlFor="productState">État</Label>
                <Input name="productState" value={editForm.productState} onChange={handleEditInputChange} required placeholder="État" className="border-neutral-300" />
              </div> */}
              <div className="space-y-2">
                <Label htmlFor="productVolume">Volume</Label>
                <Input name="productVolume" value={editForm.productVolume} onChange={handleEditInputChange} required placeholder="Volume" className="border-neutral-300" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="productLargeur">Largeur</Label>
                <Input name="productLargeur" value={editForm.productLargeur} onChange={handleEditInputChange} required placeholder="Largeur" className="border-neutral-300" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="productPoids">Poids</Label>
                <Input name="productPoids" value={editForm.productPoids} onChange={handleEditInputChange} required placeholder="Poids" className="border-neutral-300" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="productLongueur">Longueur</Label>
                <Input name="productLongueur" value={editForm.productLongueur} onChange={handleEditInputChange} required placeholder="Longueur" className="border-neutral-300" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="productHauteur">Hauteur</Label>
                <Input name="productHauteur" value={editForm.productHauteur} onChange={handleEditInputChange} required placeholder="Hauteur" className="border-neutral-300" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="productDescription">Description</Label>
                <Input name="productDescription" value={editForm.productDescription} onChange={handleEditInputChange} required placeholder="Description" className="border-neutral-300" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="image">Image</Label>
                {editForm.image && typeof editForm.image === 'string' && (
                  <img src={getFullMediaUrl(editForm.image)} alt="Aperçu" className="w-24 h-24 object-cover rounded mb-2" />
                )}
                <Input name="image" type="file" accept="image/*" onChange={handleEditInputChange} className="border-neutral-300" />
              </div>
            </div>
            <div className="flex justify-end gap-2 mt-4">
              <Button variant="outline" type="button" onClick={() => setEditModalOpen(false)}>Annuler</Button>
              <Button variant="default" className="bg-violet-600 text-white hover:bg-violet-700" type="submit">Modifier</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Dialog Delete Product */}
      <Dialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <DialogContent aria-describedby="product-delete-desc">
          <DialogHeader>
            <DialogTitle>Supprimer le produit</DialogTitle>
            <DialogDescription id="product-delete-desc">
              Êtes-vous sûr de vouloir supprimer ce produit ? Cette action est irréversible.
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-end gap-2 mt-4">
            <DialogClose asChild>
              <Button variant="outline">Annuler</Button>
            </DialogClose>
            <Button variant="default" className="bg-red-600 text-white hover:bg-red-700" onClick={confirmDeleteProduct} disabled={deleting}>
              {deleting ? 'Suppression...' : 'Confirmer la suppression'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Modal dépôt */}
      <Dialog open={depositModalOpen} onOpenChange={setDepositModalOpen}>
        <DialogContent className="bg-white border border-neutral-200">
          <DialogHeader>
            <DialogTitle>Déposer le produit</DialogTitle>
          </DialogHeader>
          <form className="space-y-4" onSubmit={handleDepositSubmit}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="siteOrigineId">
                  {addProductFieldControl.siteOrigineId.label}
                  {addProductFieldControl.siteOrigineId.required && <span style={{ color: 'red' }}> *</span>}
                </Label>
                <Select value={depositForm.siteOrigineId} onValueChange={val => setDepositForm(f => ({ ...f, siteOrigineId: val }))}>
                  <SelectTrigger aria-invalid={!!depositErrors.siteOrigineId}>
                    <SelectValue placeholder="Sélectionner le site d'origine" />
                  </SelectTrigger>
                  <SelectContent>
                    {sites.map(site => (
                      <SelectItem key={site._id} value={site._id}>{site.siteName}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {depositErrors.siteOrigineId && <div className="text-red-600 text-xs mt-1">{depositErrors.siteOrigineId}</div>}
              </div>
              <div className="space-y-2">
                <Label htmlFor="siteDestinationId">
                  {addProductFieldControl.siteDestinationId.label}
                  {addProductFieldControl.siteDestinationId.required && <span style={{ color: 'red' }}> *</span>}
                </Label>
                <Select value={depositForm.siteDestinationId} onValueChange={val => setDepositForm(f => ({ ...f, siteDestinationId: val }))}>
                  <SelectTrigger aria-invalid={!!depositErrors.siteDestinationId}>
                    <SelectValue placeholder="Sélectionner le site de destination" />
                  </SelectTrigger>
                  <SelectContent>
                    {sites.map(site => (
                      <SelectItem key={site._id} value={site._id}>{site.siteName}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {depositErrors.siteDestinationId && <div className="text-red-600 text-xs mt-1">{depositErrors.siteDestinationId}</div>}
              </div>
              <div className="space-y-2">
                <Label htmlFor="quantite">
                  {addProductFieldControl.quantite.label}
                  {addProductFieldControl.quantite.required && <span style={{ color: 'red' }}> *</span>}
                </Label>
                <Input name="quantite" value={depositForm.quantite} onChange={e => setDepositForm(f => ({ ...f, quantite: e.target.value }))} placeholder="Quantité à déposer" className="border-neutral-300" type="number" min="1" aria-invalid={!!depositErrors.quantite} />
                {depositErrors.quantite && <div className="text-red-600 text-xs mt-1">{depositErrors.quantite}</div>}
              </div>
              <div className="space-y-2">
                <Label htmlFor="prixUnitaire">
                  {addProductFieldControl.prixUnitaire.label}
                  {addProductFieldControl.prixUnitaire.required && <span style={{ color: 'red' }}> *</span>}
                </Label>
                <Input name="prixUnitaire" value={depositForm.prixUnitaire} onChange={e => setDepositForm(f => ({ ...f, prixUnitaire: e.target.value }))} placeholder="Prix Unitaire du produit" className="border-neutral-300" type="number" min="0" step="0.01" aria-invalid={!!depositErrors.prixUnitaire} />
                {depositErrors.prixUnitaire && <div className="text-red-600 text-xs mt-1">{depositErrors.prixUnitaire}</div>}
              </div>
              <div className="space-y-2">
                <Label htmlFor="detentaire">Détenteur</Label>
                <Select value={depositForm.detentaire} onValueChange={val => setDepositForm(f => ({ ...f, detentaire: val }))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionner le détenteur" />
                  </SelectTrigger>
                  <SelectContent>
                    {usersOptions.map(user => (
                      <SelectItem key={user._id} value={user._id}>{user.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="ayant_droit">Ayant droit</Label>
                <Select value={depositForm.ayant_droit} onValueChange={val => setDepositForm(f => ({ ...f, ayant_droit: val }))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionner l'ayant droit" />
                  </SelectTrigger>
                  <SelectContent>
                    {usersOptions.map(user => (
                      <SelectItem key={user._id} value={user._id}>{user.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
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

                <div className="flex flex-col gap-2 min-w-0 flex-1">
                  <div className="text-xl font-bold text-violet-700 wrap-break-words">
                    {detailProduct.productName}
                  </div>

                  <Badge
                    variant="secondary"
                    className="text-xs capitalize w-fit max-w-full wrap-break-words whitespace-normal"
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
                <div className="text-sm text-neutral-900 wrap-break-words">
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

export default MesProduits;
