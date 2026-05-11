import { useState, useEffect } from 'react';
import usePageTitle from '../../utils/usePageTitle.jsx';
import { getShopProducts } from '../../services/product.service.js';
import { getFullMediaUrl } from '../../services/media.service.js';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/card.jsx';
import { Badge } from '../../components/ui/badge.jsx';
import { Button } from '../../components/ui/button.jsx';
import { useAuth } from '../../context/AuthContext';
import { formatThousands } from '../../utils/formatNumber.js';
import { Input } from '../../components/ui/input.jsx';
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from '../../components/ui/select.jsx';
import UserNotValidatedBanner from '../../components/commons/UserNotValidatedBanner.jsx';
import PaginationControls from '../../components/commons/PaginationControls.jsx';

const sortOptions = [
  { value: 'createdAt', label: 'Date de création' },
  { value: 'productName', label: 'Nom du produit' },
  { value: 'codeCPC', label: 'Code CPC' },
  { value: 'prixUnitaire', label: 'Prix unitaire' },
];
const orderOptions = [
  { value: 1, label: 'Ascendant' },
  { value: -1, label: 'Descendant' },
];

const Boutique = () => {
  const { user } = useAuth();
  usePageTitle('Boutique');
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [fournisseurId, setFournisseurId] = useState('all');
  const [total, setTotal] = useState(0);
  const [search, setSearch] = useState('');
  const [sort, setSort] = useState('createdAt');
  const [order, setOrder] = useState(-1);

  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      try {
        const params = { page, limit, search, sort, order };
        if (fournisseurId && fournisseurId !== 'all') params.fournisseurId = fournisseurId;
        const res = await getShopProducts(params);
        setProducts(res.data || []);
        setTotal(res.total || 0);
      } catch (err) {
        setProducts([]);
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, [page, limit, search, sort, order, fournisseurId]);

  const vendors = Array.from(new Map(
    products
      .map(i => i.vendeur)
      .filter(Boolean)
      .map(v => [v._id, v])
  ).values());

  if (user && user.userValidated === false) {
    return (
      <div className="px-6 mx-auto">
        <UserNotValidatedBanner />
      </div>
    );
  }
  return (
    <div className="px-6 mx-auto">
      <h1 className="text-2xl mb-6 text-neutral-900">Boutiques</h1>
      <div className="flex flex-col md:flex-row md:items-center gap-4 mb-6">
        <div className="w-full md:w-64">
          <Input
            type="text"
            placeholder="Rechercher par nom"
            className="bg-white"
            value={search}
            onChange={e => { setPage(1); setSearch(e.target.value); }}
          />
        </div>

        <div className="w-full md:w-48">
          <Select value={sort} onValueChange={v => { setPage(1); setSort(v); }}>
            <SelectTrigger className="bg-white">
              <SelectValue placeholder="Trier par" />
            </SelectTrigger>
            <SelectContent>
              {sortOptions.map(opt => (
                <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="w-full md:w-40">
          <Select value={String(order)} onValueChange={v => { setPage(1); setOrder(Number(v)); }}>
            <SelectTrigger className="bg-white">
              <SelectValue placeholder="Ordre" />
            </SelectTrigger>
            <SelectContent>
              {orderOptions.map(opt => (
                <SelectItem key={opt.value} value={String(opt.value)}>{opt.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="w-full md:w-24">
          <Select value={String(limit)} onValueChange={v => { setPage(1); setLimit(Number(v)); }}>
            <SelectTrigger className="bg-white">
              <SelectValue placeholder="Limite" />
            </SelectTrigger>
            <SelectContent>
              {[10, 20, 50].map(n => (
                <SelectItem key={n} value={String(n)}>{n} / page</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="w-full md:w-56">
          <Select value={fournisseurId} onValueChange={v => { setPage(1); setFournisseurId(v); }}>
            <SelectTrigger className="bg-white">
              <SelectValue placeholder="Tous les fournisseurs" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tous les fournisseurs</SelectItem>
              {vendors.map(v => (
                <SelectItem key={v._id} value={v._id}>{v.userNickName}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
      {loading ? (
        <div className="text-center text-neutral-400 py-12">Chargement...</div>
      ) : products.length === 0 ? (
        <div className="text-center text-neutral-400 py-12">Aucun produit trouvé</div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {products.map(item => {
            const product = item.produit || {};
            const vendeur = item.vendeur || null;
            const key = item.id || product._id;
            return (
              <Card key={key} className="border border-neutral-200 bg-white rounded-lg overflow-hidden">
                <CardHeader className="p-0">
                  <div className="relative">
                    <img
                      src={getFullMediaUrl(product.productImage)}
                      alt={product.productName}
                      className="w-full h-40 object-cover"
                    />
                    <div className="absolute top-3 right-3 bg-white/95 text-sm text-neutral-900 px-2 py-1 rounded-md border border-neutral-200">
                      {item.prixUnitaire != null ? `${formatThousands(item.prixUnitaire)} Ar` : '-'}
                    </div>
                  </div>
                  <div className="px-4 py-3">
                    <CardTitle className="text-lg font-semibold text-neutral-900 truncate mb-1">{product.productName}</CardTitle>
                    {product.productCategory && (
                      <Badge variant="secondary" className="mt-1">{product.productCategory}</Badge>
                    )}
                  </div>
                </CardHeader>
                <CardContent className="px-4 py-3">
                  <div className="flex flex-col gap-2">
                    <div className="text-sm text-neutral-700"><span className="font-medium">Code CPC:</span> {product.codeCPC || '-'}</div>
                    <div className="text-sm text-neutral-700"><span className="font-medium">Créateur:</span> {vendeur?.userNickName || product.productOwnerId || '-'}</div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
      <PaginationControls page={page} total={total} limit={limit} loading={loading} onPageChange={setPage} className="mt-8" />
    </div>
  );
};
export default Boutique;
