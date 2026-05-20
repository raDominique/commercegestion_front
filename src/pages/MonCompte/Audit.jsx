import React, { useState, useEffect, useMemo } from 'react';
import usePageTitle from '../../utils/usePageTitle.jsx';
import { useAuth } from '../../context/AuthContext';
import UserNotValidatedBanner from '../../components/commons/UserNotValidatedBanner.jsx';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/card.jsx';
import { getAllSessions, exportAudit } from '../../services/audit.service';
import { getProfile } from '../../services/auth.service';
import { getAccessToken } from '../../services/token.service';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { toast } from 'sonner';
import PaginationControls from '../../components/commons/PaginationControls.jsx';
import { formatThousands } from '../../utils/formatNumber.js';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '../../components/ui/dialog';
import { Badge } from '../../components/ui/badge';
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from '../../components/ui/select';

const Audit = () => {
  const { user } = useAuth();
  if (user && user.userValidated === false) {
    return (
      <div className="px-6 mx-auto">
        <UserNotValidatedBanner />
      </div>
    );
  }

  usePageTitle('Audit');

  const [allAudits, setAllAudits] = useState([]);
  const [profileData, setProfileData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [query, setQuery] = useState('');
  const [actionFilter, setActionFilter] = useState('all');
  const [exporting, setExporting] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedAudit, setSelectedAudit] = useState(null);

  useEffect(() => {
    const fetchAudits = async () => {
      setLoading(true);
      try {
        const token = getAccessToken() || localStorage.getItem('token');
        // API doesn't accept query params: fetch all and filter client-side
        const res = await getAllSessions(undefined, token);
        const items = Array.isArray(res?.data) ? res.data : Array.isArray(res) ? res : [];
        items.sort((a, b) => new Date(b.timestamp || b.createdAt) - new Date(a.timestamp || a.createdAt));
        setAllAudits(items);
      } catch (err) {
        console.error('getAllSessions error', err);
        toast.error('Erreur lors du chargement des données d\'audit');
        setAllAudits([]);
      } finally {
        setLoading(false);
      }
    };

    fetchAudits();
  }, []);

  useEffect(() => {
    let mounted = true;
    const loadProfile = async () => {
      try {
        const p = await getProfile();
        if (mounted) setProfileData(p);
      } catch (err) {
        console.debug('getProfile failed', err?.message || err);
      }
    };
    loadProfile();
    return () => { mounted = false; };
  }, []);

  const handleExport = async (format = 'excel') => {
    setExporting(true);
    try {
      const token = getAccessToken() || localStorage.getItem('token');
      // API export doesn't accept filters: ask server for full export
      const res = await exportAudit(format, undefined, token);

      const blobData = res?.data;
      const blob = blobData instanceof Blob ? blobData : new Blob([blobData]);

      let filename = format === 'excel' ? 'audit_export.xlsx' : 'audit_export.pdf';
      const disposition = res?.headers?.['content-disposition'] || res?.headers?.['Content-Disposition'];
      if (disposition) {
        const match = disposition.match(/filename\*?=(?:UTF-8'')?"?([^;\n"]+)/i);
        if (match && match[1]) {
          filename = decodeURIComponent(match[1].replace(/['\"]/g, ''));
        }
      }

      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
      toast.success('Export téléchargé');
    } catch (err) {
      console.error('exportAudit error', err);
      toast.error('Erreur lors de l\'export');
    } finally {
      setExporting(false);
    }
  };

  // Helpers
  const formatTimestamp = (ts) => {
    if (!ts) return '-';
    const d = new Date(ts);
    if (Number.isNaN(d.getTime())) return '-';
    const datePart = d.toLocaleDateString('fr-FR', { day: '2-digit', month: 'long', year: 'numeric' });
    const timePart = d.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
    return `Le ${datePart} à ${timePart}`;
  };

  const actionMeta = {
    CREATE: { label: 'Création', bg: 'bg-primary', iconName: 'add_circle' },
    LOGIN: { label: 'Connexion', bg: 'bg-secondary', iconName: 'login' },
    LOGOUT: { label: 'Déconnexion', bg: 'bg-secondary', iconName: 'logout' },
    PASSWORD_CHANGED: { label: 'Mot de passe modifié', bg: 'bg-secondary', iconName: 'lock' },
    PASSWORD_RESET: { label: 'Mot de passe réinitialisé', bg: 'bg-destructive', iconName: 'lock_reset' },
    REFRESH_TOKEN: { label: 'Token rafraîchi', bg: 'bg-primary', iconName: 'autorenew' },
    UPDATE: { label: 'Modification', bg: 'bg-secondary', iconName: 'edit' },
    DELETE: { label: 'Suppression', bg: 'bg-destructive', iconName: 'delete' },
    DEFAULT: { label: 'Action', bg: 'bg-muted', iconName: 'info' },
  };

  const getActorName = (item) => {
    // explicit actor name
    if (item.actorName) return item.actorName;

    // actor id could be in different fields
    const actorId = item.actorId || item.userId || item.user?._id || item.userId;

    // if actor matches current profile, show friendly name
    if (actorId && profileData) {
      if (String(actorId) === String(profileData._id) || String(actorId) === String(profileData.userId)) {
        return `${profileData.userFirstname || ''} ${profileData.userName || ''}`.trim() || profileData.userNickName || profileData.userEmail;
      }
    }

    // try to derive from nested user object
    if (item.user) {
      const u = item.user;
      const name = u.userFirstname ? `${u.userFirstname} ${u.userName || ''}`.trim() : u.userName || u.userNickName || u.userEmail;
      if (name) return name;
    }

    // fallback: if actorId exists, show shortened id for readability
    if (actorId) {
      const s = String(actorId);
      return s.length > 10 ? `Utilisateur ${s.slice(0, 8)}...` : `Utilisateur ${s}`;
    }

    return 'Système';
  };

  const getEntityDisplayName = (item) => {
    const ns = item.newState || {};
    if (item.entityType === 'USER') return ns.userFirstname ? `${ns.userFirstname} ${ns.userName || ''}`.trim() : ns.userName || item.entityName || item.entityId || 'Utilisateur';
    if (item.entityType === 'SITE') return ns.siteName || item.entityName || item.entityId || 'Site';
    if (item.entityType === 'PRODUCT') return ns.productName || item.entityName || item.entityId || 'Produit';
    return item.entityName || item.entityId || '-';
  };

  const sanitizeNewState = (obj) => {
    const blacklist = ['__v', '_id', 'userPassword', 'password', 'hashedPassword', 'salt'];
    const _sanitize = (v) => {
      if (v === null || v === undefined) return v;
      if (Array.isArray(v)) return v.map(_sanitize);
      if (typeof v === 'object') {
        const out = {};
        for (const [k, val] of Object.entries(v)) {
          if (blacklist.includes(k)) continue;
          out[k] = _sanitize(val);
        }
        return out;
      }
      return v;
    };
    return _sanitize(obj);
  };

  const actionOptions = useMemo(() => {
    return [
      { value: 'all', label: 'Toutes actions' },
      ...Object.keys(actionMeta).filter(k => k !== 'DEFAULT').map(k => ({ value: k, label: actionMeta[k].label })),
    ];
  }, []);

  // Client-side filtering & pagination
  const filteredAudits = useMemo(() => {
    const q = (query || '').trim().toLowerCase();
    const items = allAudits.filter(item => {
      if (!item) return false;
      if (actionFilter && actionFilter !== 'all' && item.action !== actionFilter) return false;

      if (!q) return true;

      const haystack = [
        getActorName(item),
        getEntityDisplayName(item),
        item.action,
        item.entityType,
        item.ip || item.ipAddress || item.remoteIp,
        JSON.stringify(sanitizeNewState(item.newState || item.details || {})),
      ].filter(Boolean).join(' ').toLowerCase();

      return haystack.indexOf(q) !== -1;
    });
    return items;
  }, [allAudits, query, actionFilter]);

  const total = filteredAudits.length;
  useEffect(() => {
    if ((page - 1) * limit >= total) setPage(1);
  }, [total, page, limit]);

  const visibleAudits = useMemo(() => {
    const start = (page - 1) * limit;
    return filteredAudits.slice(start, start + limit);
  }, [filteredAudits, page, limit]);

  const humanKey = (key) => {
    const map = {
      userName: "Nom d'utilisateur",
      userEmail: 'Email',
      userFirstname: 'Prénom',
      userLastname: 'Nom',
      createdAt: 'Créé le',
      updatedAt: 'Mis à jour',
      amount: 'Montant',
      total: 'Total',
      price: 'Prix',
      ip: 'Adresse IP',
      entityType: 'Type',
      action: 'Action',
      status: 'Statut',
      actorName: 'Acteur',
    };
    if (map[key]) return map[key];
    // fallback: split camelCase/underscores
    const s = key.replace(/([A-Z])/g, ' $1').replace(/[_\-]/g, ' ');
    return s.charAt(0).toUpperCase() + s.slice(1);
  };

  const formatDetailValue = (k, v) => {
    if (v === null || v === undefined || v === '') return '-';
    if (typeof v === 'number') return formatThousands(v);
    if (typeof v === 'string') {
      const d = new Date(v);
      if (!Number.isNaN(d.getTime()) && /T|\d{4}-\d{2}-\d{2}/.test(v)) return formatTimestamp(v);
      return v;
    }
    if (Array.isArray(v)) return v.join(', ');
    try {
      return JSON.stringify(v);
    } catch (e) {
      return String(v);
    }
  };

  const renderDetails = (obj) => {
    if (!obj || Object.keys(obj).length === 0) return <div className="text-sm text-neutral-500">Aucun détail disponible</div>;
    return (
      <div className="space-y-3">
        {Object.entries(obj).map(([k, v]) => (
          <div key={k} className="grid grid-cols-3 gap-4 items-start">
            <div className="text-sm text-neutral-600 col-span-1">{humanKey(k)}</div>
            <div className="text-sm font-medium col-span-2 text-right wrap-break-words whitespace-normal overflow-x-auto">{formatDetailValue(k, v)}</div>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="px-6 mx-auto space-y-6">
      <div>
        <h1 className="text-2xl text-neutral-900 mb-2">Audit</h1>
        <p className="text-sm text-neutral-600">
          Historique et activités liées à votre compte
        </p>
      </div>

      <Card className="border border-gray-200 bg-white">
        <CardHeader>
          <CardTitle>Activité du compte</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 mb-4">
            <div className="flex items-center gap-3">
              <Input placeholder="Rechercher..." value={query} onChange={e => { setPage(1); setQuery(e.target.value); }} className="w-64" />
              <Select value={actionFilter} onValueChange={value => { setPage(1); setActionFilter(value); }}>
                <SelectTrigger className="w-44 border-neutral-300 bg-white min-w-0">
                  <SelectValue placeholder="Filtrer action" />
                </SelectTrigger>
                <SelectContent className="z-50">
                  {actionOptions.map(opt => (
                    <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center gap-2">
              <Button onClick={() => { setPage(1); setQuery(''); setActionFilter('all'); }} variant="outline">Réinitialiser</Button>
              <Button onClick={() => handleExport('excel')} status={exporting ? 'loading' : 'active'}>Exporter Excel</Button>
              <Button onClick={() => handleExport('pdf')} status={exporting ? 'loading' : 'active'}>Exporter PDF</Button>
            </div>
          </div>

          {loading ? (
            <div className="p-4 text-center text-neutral-500">Chargement...</div>
          ) : allAudits.length === 0 ? (
            <div className="mt-4 text-center text-neutral-400">Aucune donnée d'audit disponible pour le moment.</div>
          ) : filteredAudits.length === 0 ? (
            <div className="mt-4 text-center text-neutral-400">Aucun résultat pour votre recherche ou vos filtres.</div>
          ) : (
            <div className="mt-2">
              <ul className="space-y-4">
                {visibleAudits.map((item, idx) => {
                  const meta = actionMeta[item.action] || actionMeta.DEFAULT;
                  const Actor = getActorName(item);
                  const entityName = getEntityDisplayName(item);
                  const verb = (item.action === 'CREATE') ? 'a créé' : (item.action === 'LOGIN' ? "s'est connecté" : (item.action === 'LOGOUT' ? "s'est déconnecté" : (item.action === 'PASSWORD_CHANGED' ? 'a modifié le mot de passe' : (item.action === 'PASSWORD_RESET' ? 'a réinitialisé le mot de passe' : (item.action === 'UPDATE' ? 'a modifié' : (item.action === 'DELETE' ? 'a supprimé' : 'a effectué une action'))))));

                  return (
                    <li key={item._id || item.id || idx} className="p-3 rounded-lg hover:bg-neutral-50">
                      <div className="flex items-start gap-3">
                        <div className="shrink-0">
                          <div className={`${meta.bg} w-10 h-10 rounded-full flex items-center justify-center`}>
                            <span className="material-icons size-4 text-white">{meta.iconName || 'info'}</span>
                          </div>
                        </div>
                        <div className="flex-1">
                          <div className="text-sm text-neutral-900">
                            <span className="font-medium">{Actor}</span>
                            <span className="text-neutral-600"> {verb} </span>
                            <span className="font-semibold">{entityName}</span>
                          </div>
                          <div className="mt-1 text-xs text-neutral-500 flex flex-wrap gap-3">
                            <Badge variant="outline" className="text-xs">{item.entityType || '-'}</Badge>
                            {item.ipAddress || item.ip || item.remoteIp ? <span>Adresse IP: {item.ipAddress || item.ip || item.remoteIp}</span> : null}
                            <span>{formatTimestamp(item.timestamp || item.createdAt)}</span>
                          </div>
                        </div>
                        <div className="ml-2">
                          <Button variant="ghost" onClick={() => { setSelectedAudit(item); setDialogOpen(true); }}>Détails</Button>
                        </div>
                      </div>
                    </li>
                  );
                })}
              </ul>
            </div>
          )}

          <div className="mt-4">
            <PaginationControls page={page} total={total} limit={limit} loading={loading} onPageChange={setPage} onLimitChange={setLimit} showLimitSelector className="mt-4" />
          </div>
        </CardContent>
      </Card>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{selectedAudit ? `${selectedAudit.action || '-'} — ${getEntityDisplayName(selectedAudit)}` : 'Détails'}</DialogTitle>
            <DialogDescription>{selectedAudit ? `${getActorName(selectedAudit)} • ${selectedAudit.entityType || ''} • ${selectedAudit.entityId || ''}` : ''}</DialogDescription>
          </DialogHeader>
          <div className="p-4 max-h-[70vh] overflow-y-auto show-scrollbar">
            {selectedAudit ? (
              <div className="text-sm space-y-4">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <div className="text-sm text-neutral-600">Acteur</div>
                    <div className="font-medium">{getActorName(selectedAudit)}</div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm text-neutral-600">Date</div>
                    <div className="font-medium">{formatTimestamp(selectedAudit.timestamp || selectedAudit.createdAt)}</div>
                  </div>
                </div>

                <div className="border border-border rounded-md p-3 bg-background">
                  <div className="flex items-center justify-between mb-2">
                    <div className="text-sm text-neutral-600">Objet</div>
                    <Badge variant="outline" className="text-xs">{selectedAudit.entityType || '-'}</Badge>
                  </div>
                  <div className="text-sm font-semibold">{getEntityDisplayName(selectedAudit)}</div>
                </div>

                <div>
                  <div className="text-sm text-neutral-600 mb-2">Détails (affiche le <strong>newState</strong>)</div>
                  <div className="bg-white border rounded-md p-3 overflow-x-auto">
                    {selectedAudit.newState ? (
                      renderDetails(sanitizeNewState(selectedAudit.newState))
                    ) : (
                      <div className="text-sm text-neutral-500">Aucun <em>newState</em> retourné par l'API pour cet événement.</div>
                    )}
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-sm text-neutral-500">Aucun détail sélectionné</div>
            )}
          </div>
          <DialogFooter>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setDialogOpen(false)}>Fermer</Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Audit;
