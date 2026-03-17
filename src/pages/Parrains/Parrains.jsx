import { useState, useEffect } from 'react';
import { getReferrals, getUserById, validateViaParrain } from '@/services/user.service';
import { toast } from 'sonner';
import { getFullMediaUrl } from '@/services/media.service';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import InfoIcon from '@mui/icons-material/Info';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogClose } from '@/components/ui/dialog';
import { useAuth } from '@/context/AuthContext';
import useScreenType from '@/utils/useScreenType';
import UserNotValidatedBanner from '@/components/commons/UserNotValidatedBanner';
import usePageTitle from '@/utils/usePageTitle';

function ParrainsTableContent({ loading, referrals, isDesktop, onShowDetail, onApprove }) {
    if (loading) return <div className="p-8 text-center text-neutral-400">Chargement...</div>;
    if (!referrals || referrals.length === 0) return <div className="p-8 text-center text-neutral-400">Aucun parrain trouvé</div>;

    if (isDesktop) {
        return (
            <div className="overflow-x-auto">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead className="text-xs text-neutral-600">N° membre</TableHead>
                            <TableHead className="text-xs text-neutral-600">Utilisateur</TableHead>
                            <TableHead className="text-xs text-neutral-600">Email</TableHead>
                            <TableHead className="text-xs text-neutral-600">Type</TableHead>
                            <TableHead className="text-xs text-neutral-600">Statut</TableHead>
                            <TableHead className="text-xs text-neutral-600 text-right">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {referrals.map((referral) => (
                            <TableRow key={referral._id}>
                                <TableCell>
                                    <div className="flex items-center gap-2">
                                        <Badge variant="outline" className="text-xs">{referral.userId ?? 'N/A'}</Badge>
                                        {referral.userId && (
                                            <Button
                                                type="button"
                                                size="icon"
                                                variant="ghost"
                                                className="p-1 h-6 w-6 text-neutral-500"
                                                onClick={async () => {
                                                    try {
                                                        await navigator.clipboard.writeText(referral.userId);
                                                        toast.success('ID copié');
                                                    } catch (e) {
                                                        toast.error('Impossible de copier');
                                                    }
                                                }}
                                                aria-label="Copier l'ID utilisateur"
                                            >
                                                <ContentCopyIcon fontSize="small" />
                                            </Button>
                                        )}
                                    </div>
                                </TableCell>
                                <TableCell className="text-sm">
                                    <div className="flex items-center gap-3">
                                        {/* {referral.userImage ? (
                                            <img src={getFullMediaUrl(referral.userImage)} alt={referral.userNickName || referral.userName} className="w-8 h-8 rounded object-cover" />
                                        ) : (
                                            <div className="w-8 h-8 rounded bg-neutral-100 flex items-center justify-center text-sm text-neutral-500">{(referral.userNickName || referral.userName || '').charAt(0)}</div>
                                        )} */}
                                        <div>{referral.userNickName || referral.userName}</div>
                                    </div>
                                </TableCell>
                                <TableCell className="text-sm">{referral.userEmail}</TableCell>
                                <TableCell className="text-sm">{referral.userType}</TableCell>
                                <TableCell className="text-sm">
                                    <span className={`px-2 py-1 rounded text-xs font-medium ${referral.userValidated ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                                        {referral.userValidated ? 'Validé' : 'En attente'}
                                    </span>
                                </TableCell>
                                <TableCell className="text-sm text-right">
                                    <div className="flex items-center justify-end gap-2">
                                        <Button size="sm" variant={referral.userValidated ? 'ghost' : 'default'} disabled={referral.userValidated} onClick={() => onApprove?.(referral._id)}>
                                            {referral.userValidated ? 'Validé' : 'Valider'}
                                        </Button>
                                        <Button size="sm" variant="ghost" onClick={() => onShowDetail?.(referral)} aria-label="Détails">
                                            <InfoIcon className="w-4 h-4" />
                                        </Button>
                                    </div>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>
        );
    }

    // Mobile view: cards
    return (
        <div className="space-y-3 p-4">
            {referrals.map((referral) => (
                <Card key={referral._id} className="p-4">
                    <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full flex items-center justify-center bg-neutral-100 text-sm">
                                    {(referral.userNickName || referral.userName || '').charAt(0).toUpperCase()}
                                </div>
                                <div>
                                    <div className="font-medium text-neutral-900">{referral.userNickName || referral.userName}</div>
                                    <div className="text-xs text-neutral-500">{referral.userEmail}</div>
                                </div>
                            </div>
                            <div className="mt-3 flex flex-wrap gap-2 items-center">
                                <Badge variant="outline" className="text-xs">{referral.userId ?? 'N/A'}</Badge>
                                <div className="text-sm text-neutral-900">{referral.userType}</div>
                                <Badge variant={referral.userValidated ? 'default' : 'secondary'} className="text-xs">{referral.userValidated ? 'Validé' : 'En attente'}</Badge>
                            </div>
                        </div>
                        <div className="flex flex-col items-end gap-2">
                            <div className="flex gap-2">
                                <Button size="sm" variant={referral.userValidated ? 'ghost' : 'default'} disabled={referral.userValidated} onClick={() => onApprove?.(referral._id)}>
                                    {referral.userValidated ? 'Validé' : 'Valider'}
                                </Button>
                                <Button size="sm" variant="ghost" onClick={() => onShowDetail?.(referral)}>
                                    <InfoIcon className="w-4 h-4" />
                                </Button>
                            </div>
                        </div>
                    </div>
                </Card>
            ))}
        </div>
    );
}

const Parrains = () => {
    const { user } = useAuth();
    usePageTitle('Mes Parrains');

    const [referrals, setReferrals] = useState([]);
    const [loading, setLoading] = useState(false);
    const [page, setPage] = useState(1);
    const [limit] = useState(10);
    const [totalPages, setTotalPages] = useState(1);

    const [detailOpen, setDetailOpen] = useState(false);
    const [detailUser, setDetailUser] = useState(null);
    const [detailLoading, setDetailLoading] = useState(false);
    const [actionLoading, setActionLoading] = useState(false);

    const { isDesktop } = useScreenType();

    useEffect(() => {
        const fetchReferrals = async () => {
            setLoading(true);
            try {
                const res = await getReferrals({ page, limit });
                // normalize response
                const data = res?.data ?? res?.referrals ?? res ?? [];
                const list = Array.isArray(data) ? data : data.data ?? data.items ?? [];
                const total = data.total ?? data.count ?? (Array.isArray(data) ? data.length : list.length);
                setReferrals(list);
                setTotalPages(Math.max(1, Math.ceil((total || list.length) / limit)));
            } catch (err) {
                console.error(err);
                toast.error('Impossible de charger les parrains');
            } finally {
                setLoading(false);
            }
        };

        fetchReferrals();
    }, [page, limit]);

    const handleShowUserDetail = async (userOrObj) => {
        const userId = typeof userOrObj === 'string' ? userOrObj : (userOrObj?._id ?? userOrObj?.id);
        if (!userId) return;
        setDetailLoading(true);
        setDetailOpen(true);
        try {
            const res = await getUserById(userId);
            const detail = res?.data ?? res;
            setDetailUser(detail);
        } catch (err) {
            console.error(err);
            toast.error('Impossible de charger le détail');
            setDetailOpen(false);
        } finally {
            setDetailLoading(false);
        }
    };

    const handleApprove = async (id, closeModal = false) => {
        if (!id) return;
        setActionLoading(true);
        try {
            await validateViaParrain(id);
            setReferrals((prev) => prev.map((r) => (r._id === id ? { ...r, userValidated: true } : r)));
            if (closeModal) setDetailOpen(false);
            toast.success('Utilisateur validé');
        } catch (err) {
            console.error(err);
            toast.error('Erreur lors de la validation');
        } finally {
            setActionLoading(false);
        }
    };

    return (
        <div className="px-6 mx-auto">
            <div className="space-y-6">
                {user && user.userValidated === false ? (
                    <UserNotValidatedBanner />
                ) : (
                    <>
                        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                            <div>
                                <h1 className="text-2xl text-neutral-900 mb-2">Mes Parrains</h1>
                                <p className="text-sm text-neutral-600">Liste des utilisateurs parrainés et statut de validation</p>
                            </div>
                        </div>

                        <Card className="border-neutral-200 bg-white">
                            <ParrainsTableContent loading={loading} referrals={referrals} isDesktop={isDesktop} onShowDetail={(u) => handleShowUserDetail(u)} onApprove={(id) => handleApprove(id, false)} />
                        </Card>

                        {/* Detail Dialog */}
                        <Dialog open={detailOpen} onOpenChange={setDetailOpen}>
                            <DialogContent>
                                <DialogHeader>
                                    <DialogTitle>Détail utilisateur</DialogTitle>
                                </DialogHeader>
                                {detailLoading ? (
                                    <div className="p-8 text-center text-neutral-400">Chargement...</div>
                                ) : detailUser ? (
                                    <div>
                                        <div className="space-y-2 text-sm">
                                            <div className="flex items-center gap-4 mb-4">
                                                <img
                                                    src={getFullMediaUrl(detailUser.userType === 'Entreprise' ? (detailUser.logo || detailUser.userImage) : (detailUser.userImage || detailUser.logo))}
                                                    alt={detailUser.userNickName || detailUser.userName}
                                                    className={detailUser.userType === 'Entreprise' ? 'w-20 h-20 object-contain rounded border' : 'w-16 h-16 object-cover rounded-full border'}
                                                />
                                                <div>
                                                    <div className="font-bold text-lg text-neutral-900">{detailUser.userName} {detailUser.userFirstname}</div>
                                                    <div className="text-xs text-neutral-500">{detailUser.userType} - {detailUser.userAccess}</div>
                                                </div>
                                            </div>

                                            <div><b>Email :</b> {detailUser.userEmail}</div>
                                            {detailUser.userType === 'Entreprise' ? (
                                                <div><b>Date de création :</b> {detailUser.userDateOfBirth ? new Date(detailUser.userDateOfBirth).toLocaleDateString() : '-'}</div>
                                            ) : (
                                                <div><b>Date de naissance:</b> {detailUser.userDateOfBirth ? new Date(detailUser.userDateOfBirth).toLocaleDateString() : '-'}</div>
                                            )}
                                            <div><b>Téléphone :</b> {detailUser.userPhone ?? '-'}</div>
                                            <div><b>Adresse :</b> {detailUser.userAddress ?? '-'}</div>
                                            <div><b>Solde :</b> {detailUser.userTotalSolde ?? 0} Ariary</div>
                                            <div><b>Validé :</b> {detailUser.userValidated ? 'Oui' : 'Non'}</div>
                                            <div><b>Email vérifié :</b> {detailUser.userEmailVerified ? 'Oui' : 'Non'}</div>

                                            {Array.isArray(detailUser.carteStat) && detailUser.carteStat.length > 0 && (
                                                <div className="mt-2">
                                                    <b>Carte Stat :</b>
                                                    <ul className="list-disc ml-6">
                                                        {detailUser.carteStat.map((file, idx) => (
                                                            <li key={idx}><a href={getFullMediaUrl(file)} download target="_blank" rel="noopener noreferrer" className="text-violet-600 underline">Télécharger fichier {idx + 1}</a></li>
                                                        ))}
                                                    </ul>
                                                </div>
                                            )}

                                            {Array.isArray(detailUser.identityDocument) && detailUser.identityDocument.length > 0 && (
                                                <div className="mt-2">
                                                    <b>Documents d'identité :</b>
                                                    <ul className="list-disc ml-6">
                                                        {detailUser.identityDocument.map((file, idx) => (
                                                            <li key={idx}><a href={getFullMediaUrl(file)} download target="_blank" rel="noopener noreferrer" className="text-violet-600 underline">Télécharger document {idx + 1}</a></li>
                                                        ))}
                                                    </ul>
                                                </div>
                                            )}
                                        </div>
                                        <div className="flex justify-end gap-2 mt-4">
                                            <DialogClose asChild>
                                                <Button variant="outline">Fermer</Button>
                                            </DialogClose>
                                            <Button
                                                variant="default"
                                                className="bg-green-600 text-white hover:bg-green-700"
                                                disabled={actionLoading || detailUser.userValidated}
                                                onClick={() => { if (detailUser && detailUser._id) handleApprove(detailUser._id, true); }}
                                            >
                                                {detailUser.userValidated ? 'Déjà approuvé' : (actionLoading ? 'Traitement...' : 'Approuver')}
                                            </Button>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="p-8 text-center text-neutral-400">Aucune donnée</div>
                                )}
                            </DialogContent>
                        </Dialog>
                        {/* Pagination */}
                        <div className="flex justify-end items-center gap-4 mt-4">
                            <Button variant="outline" size="sm" disabled={page === 1 || loading} onClick={() => setPage((p) => Math.max(1, p - 1))}>
                                Précédent
                            </Button>

                            <span className="text-sm text-neutral-600">Page {page} / {totalPages}</span>

                            <Button variant="outline" size="sm" disabled={page >= totalPages || loading} onClick={() => setPage((p) => p + 1)}>
                                Suivant
                            </Button>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
};

export default Parrains;