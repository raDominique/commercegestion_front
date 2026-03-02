import { useState, useEffect } from 'react';
import usePageTitle from '../../utils/usePageTitle.jsx';
import { getShopProducts } from '../../services/product.service.js';
import { getFullMediaUrl } from '../../services/media.service.js';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/card.jsx';
import { Badge } from '../../components/ui/badge.jsx';
import { Button } from '../../components/ui/button.jsx';
import { useAuth } from '../../context/AuthContext';
import UserNotValidatedBanner from '../../components/commons/UserNotValidatedBanner.jsx';

const sortOptions = [
  { value: 'createdAt', label: 'Date de création' },
  { value: 'productName', label: 'Nom du produit' },
  { value: 'codeCPC', label: 'Code CPC' },
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
  const [total, setTotal] = useState(0);
  const [search, setSearch] = useState('');
  const [sort, setSort] = useState('createdAt');
  const [order, setOrder] = useState(-1);

  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      try {
        const res = await getShopProducts({ page, limit, search, sort, order });
        setProducts(res.data || []);
        setTotal(res.total || 0);
      } catch (err) {
        setProducts([]);
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, [page, limit, search, sort, order]);

  if (user && user.userValidated === false) {
    return (
      <div className="p-6 max-w-7xl mx-auto">
        <UserNotValidatedBanner />
      </div>
    );
  }
  return (
    <div className="p-6 max-w-7xl mx-auto">
      <h1 className="text-2xl font-bold mb-6 text-neutral-900">Boutique</h1>
      <div className="flex flex-col md:flex-row md:items-center gap-4 mb-6">
        <input
          type="text"
          placeholder="Rechercher par nom ou code CPC..."
          value={search}
          onChange={e => { setPage(1); setSearch(e.target.value); }}
          className="border border-neutral-300 rounded px-3 py-2 text-sm w-full md:w-64"
        />
        <select
          value={sort}
          onChange={e => { setPage(1); setSort(e.target.value); }}
          className="border border-neutral-300 rounded px-3 py-2 text-sm w-full md:w-48"
        >
          {sortOptions.map(opt => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
          ))}
        </select>
        <select
          value={order}
          onChange={e => { setPage(1); setOrder(Number(e.target.value)); }}
          className="border border-neutral-300 rounded px-3 py-2 text-sm w-full md:w-40"
        >
          {orderOptions.map(opt => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
          ))}
        </select>
        {/* <input
          type="number"
          min={1}
          value={limit}
          onChange={e => { setPage(1); setLimit(Number(e.target.value)); }}
          className="border border-neutral-300 rounded px-3 py-2 text-sm w-full md:w-24"
          placeholder="Limite"
        /> */}
      </div>
      {loading ? (
        <div className="text-center text-neutral-400 py-12">Chargement...</div>
      ) : products.length === 0 ? (
        <div className="text-center text-neutral-400 py-12">Aucun produit trouvé</div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {products.map(product => (
            <Card key={product._id} className="border-neutral-200">
              <CardHeader>
                <img src={getFullMediaUrl(product.image)} alt={product.name} className="w-full h-40 object-cover rounded-xl mb-2" />
                <CardTitle className="text-lg font-bold text-neutral-900 truncate">{product.name}</CardTitle>
                {product.categoryNom && (
                  <Badge variant="secondary" className="mt-1">{product.categoryNom}</Badge>
                )}
              </CardHeader>
              <CardContent>
                <div className="flex flex-col gap-2">
                  <div className="text-sm text-neutral-700"><b>Code CPC:</b> {product.codeCPC || '-'}</div>
                  <div className="text-sm text-neutral-700"><b>Propriétaire:</b> {product.ownerName || '-'}</div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
      <div className="flex justify-end items-center gap-4 mt-8">
        <Button
          variant="outline"
          size="sm"
          disabled={page === 1 || loading}
          onClick={() => setPage(p => Math.max(1, p - 1))}
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
          onClick={() => setPage(p => p + 1)}
        >
          Suivant
        </Button>
      </div>
    </div>
  );
};
export default Boutique;
