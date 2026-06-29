import React from 'react';
import InfoIcon from '@mui/icons-material/Info';
import AddHomeIcon from '@mui/icons-material/AddHome';
import LocalOfferIcon from '@mui/icons-material/LocalOffer';
import SwapHorizIcon from '@mui/icons-material/SwapHoriz';
import { Button } from '../ui/button';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '../ui/table';
import { formatThousands } from '../../utils/formatNumber';
import { getFullMediaUrl } from '../../services/media.service';
import { Loader } from '../ui/loader';

const renderPerson = (person) => {
  if (!person) return '-';
  if (typeof person === 'string') return person;
  if (person.userNickName) return person.userNickName;
  if (person.userName) return person.userName;
  if (person.name) return person.name;
  return '-';
};

export default function ActifsTable({ loading, actifs, dateFormat, isDesktop, onShowDetail, onOpenStockModal, onOpenSellModal, onVirerDroit }) {
  if (loading) return <div className="p-8 flex justify-center"><Loader message="Chargement..." /></div>;
  if (!actifs || actifs.length === 0) return <div className="p-8 text-center text-neutral-400">Aucun actif trouvé</div>;

  if (isDesktop) {
    return (
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="text-xs text-neutral-600">Produit</TableHead>
              <TableHead className="text-xs text-neutral-600">Code</TableHead>
              <TableHead className="text-xs text-neutral-600">Image</TableHead>
              <TableHead className="text-xs text-neutral-600">Dépôt</TableHead>
              <TableHead className="text-xs text-neutral-600">Adresse dépôt</TableHead>
              <TableHead className="text-xs text-neutral-600 text-right">Qté</TableHead>
              <TableHead className="text-xs text-neutral-600">Détenteur</TableHead>
              <TableHead className="text-xs text-neutral-600">Ayant droit</TableHead>
              <TableHead className="text-xs text-neutral-600">Date</TableHead>
              <TableHead className="text-xs text-neutral-600 text-right p-4">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {actifs.map(item => (
              <TableRow key={item.id || item._id || item.productId || JSON.stringify(item)}>
                <TableCell className="text-sm truncate max-w-xs">{item.productName || '-'}</TableCell>
                <TableCell className="text-sm text-neutral-500 truncate max-w-xs">{item.productCode || '-'}</TableCell>
                <TableCell>
                  {item.productImage ? (
                    <img src={getFullMediaUrl(item.productImage)} className="w-12 h-12 rounded object-cover" />
                  ) : (
                    <span className="text-neutral-400">-</span>
                  )}
                </TableCell>
                <TableCell className="text-sm truncate max-w-xs">{item.depot || '-'}</TableCell>
                <TableCell className="text-sm truncate max-w-xs">{item.depotAdresse || '-'}</TableCell>
                <TableCell className="text-sm text-right">{formatThousands(item.quantite)}</TableCell>
                <TableCell className="text-sm truncate max-w-xs">{renderPerson(item.detentaire)}</TableCell>
                <TableCell className="text-sm truncate max-w-xs">{renderPerson(item.ayant_droit || item.ayantDroit)}</TableCell>
                <TableCell className="text-sm">{item.dateCreation ? (dateFormat ? dateFormat(item.dateCreation) : item.dateCreation) : '-'}</TableCell>
                <TableCell className="text-sm text-right">
                  <div className="flex flex-col items-end gap-2">
                    <div className="flex gap-2 justify-end">
                        {onShowDetail && (
                          <Button variant="ghost" size="sm" onClick={() => onShowDetail(item.id || item._id)}>
                            <InfoIcon className="w-5 h-5 text-violet-600" />
                          </Button>
                        )}
                      {onOpenStockModal && (
                        <Button variant="ghost" size="sm" onClick={() => onOpenStockModal(item)}>
                          <AddHomeIcon className="w-4 h-4 text-orange-500" /> Rajouter stock
                        </Button>
                      )}
                      {onOpenSellModal && (
                        <Button variant="ghost" size="sm" onClick={() => onOpenSellModal(item)}>
                          <LocalOfferIcon className="w-4 h-4 text-green-600" /> Mettre en vente
                        </Button>
                      )}
                    </div>
                    {onVirerDroit && (
                      <div>
                        <Button variant="ghost" size="sm" onClick={() => onVirerDroit(item)}>
                          <SwapHorizIcon className="w-4 h-4 text-blue-600" /> Virer droit
                        </Button>
                      </div>
                    )}
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    );
  }

  return (
    <div className="space-y-3 p-4">
      {actifs.map(item => (
        <div key={item.id || item._id || item.productId || JSON.stringify(item)} className="p-4 border rounded bg-white">
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 flex items-center justify-center bg-neutral-100 rounded overflow-hidden">
                {item.productImage ? (
                  <img src={getFullMediaUrl(item.productImage)} alt={item.productName} className="w-full h-full object-cover" />
                ) : (
                  <span className="text-neutral-400">-</span>
                )}
              </div>
              <div className="min-w-0">
                <div className="font-medium text-neutral-900 truncate">{item.productName || '-'}</div>
                <div className="text-xs text-neutral-500">{item.productCode || '-'}</div>
                <div className="text-xs text-neutral-500 mt-1">{item.depot || '-'}</div>
              </div>
            </div>
              <div className="flex flex-col items-end gap-2">
              <div className="text-sm font-medium text-neutral-900">Qté: {formatThousands(item.quantite)}</div>
              <div className="text-xs text-neutral-600">PU: {formatThousands(item.prixUnitaire)}</div>
              <div className="text-sm text-neutral-900 font-medium">Total: {formatThousands(item.valeurTotale)}</div>
              <div className="flex gap-2 mt-2">
                {onShowDetail && <Button variant="ghost" size="sm" onClick={() => onShowDetail(item.id || item._id)}><InfoIcon className="w-4 h-4 text-violet-600" /></Button>}
                {onOpenStockModal && <Button variant="ghost" size="sm" onClick={() => onOpenStockModal(item)}><AddHomeIcon className="w-4 h-4 text-orange-500" /> Rajouter stock</Button>}
              </div>
              {onOpenSellModal && <div><Button variant="ghost" size="sm" onClick={() => onOpenSellModal(item)}><LocalOfferIcon className="w-4 h-4 text-green-600" /> Mettre en vente</Button></div>}
              {onVirerDroit && <div><Button variant="ghost" size="sm" onClick={() => onVirerDroit(item)}><SwapHorizIcon className="w-4 h-4 text-blue-600" /> Virer droit</Button></div>}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
