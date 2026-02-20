import { useState, useEffect } from 'react';
import { Card } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Badge } from '../../components/ui/badge';
import SearchIcon from '@mui/icons-material/Search';
import { toast } from 'sonner';
import usePageTitle from '../../utils/usePageTitle.jsx';
import { getCpc } from '../../services/cpc.service';
import { getCpcByCode } from '../../services/cpc.service';
import {
    Dialog,
    DialogTrigger,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
    DialogClose,
    DialogDescription,
} from '../../components/ui/dialog';
import { createCpc } from '../../services/cpc.service';
import {
    Select,
    SelectTrigger,
    SelectContent,
    SelectItem,
    SelectValue,
} from '../../components/ui/select';
import InfoIcon from '@mui/icons-material/Info';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import { updateCpc } from '../../services/cpc.service';
import { deleteCpc } from '../../services/cpc.service';

const AdminCpc = () => {
    usePageTitle('CPC');

    const [searchTerm, setSearchTerm] = useState('');
    const [cpcList, setCpcList] = useState([]);
    const [loading, setLoading] = useState(false);
    const [page, setPage] = useState(1);
    const [limit, setLimit] = useState(10);
    const [total, setTotal] = useState(0);
    const [niveau, setNiveau] = useState('');
    const [open, setOpen] = useState(false);
    const [form, setForm] = useState({
        code: '',
        nom: '',
        niveau: '',
        parentCode: '',
        ancetres: [],
        correspondances: { sh: '', citi: '' },
    });
    const [saving, setSaving] = useState(false);
    const [deleting, setDeleting] = useState(false);
    const [selectedCpc, setSelectedCpc] = useState(null);
    const [infoOpen, setInfoOpen] = useState(false);
    const [editOpen, setEditOpen] = useState(false);
    const [editId, setEditId] = useState(null);
    const [deleteOpen, setDeleteOpen] = useState(false);
    const [deleteId, setDeleteId] = useState(null);

    const mapApiCpc = (item) => ({
        code: item.code,
        nom: item.nom,
        niveau: item.niveau,
        raw: item,
    });

    const fetchCpc = async () => {
        setLoading(true);
        try {
            const params = {
                search: searchTerm || undefined,
                limit,
                page,
                niveau: niveau || undefined,
            };
            const res = await getCpc(params);
            setCpcList(Array.isArray(res.data) ? res.data.map(mapApiCpc) : []);
            setTotal(res.total || 0);
        } catch (err) {
            toast.error('Erreur lors du chargement des CPC');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchCpc();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [searchTerm, page, limit, niveau]);

    const handleFormChange = (e) => {
        const { name, value } = e.target;
        if (name.startsWith('correspondances.')) {
            setForm({
                ...form,
                correspondances: {
                    ...form.correspondances,
                    [name.split('.')[1]]: value,
                },
            });
        } else if (name === 'ancetres') {
            setForm({ ...form, ancetres: value.split(',').map(v => v.trim()) });
        } else {
            setForm({ ...form, [name]: value });
        }
    };

    const handleAddCpc = async () => {
        setSaving(true);
        try {
            const token = localStorage.getItem('token');
            await createCpc(form, token);
            toast.success('CPC ajouté avec succès');
            setOpen(false);
            setForm({ code: '', nom: '', niveau: '', parentCode: '', ancetres: [], correspondances: { sh: '', citi: '' } });
            fetchCpc();
        } catch (err) {
            toast.error('Erreur lors de l\'ajout du CPC');
        } finally {
            setSaving(false);
        }
    };

    const handleShowInfo = async (code) => {
        try {
            const res = await getCpcByCode(code);
            const data = Array.isArray(res.data) ? res.data[0] : res.data;
            setSelectedCpc(data);
            setInfoOpen(true);
        } catch (err) {
            toast.error("Impossible de charger les infos du CPC");
        }
    };

    const handleEditCpc = async (code) => {
        try {
            const res = await getCpcByCode(code);
            const data = Array.isArray(res.data) ? res.data[0] : res.data;
            setForm({
                code: data.code || '',
                nom: data.nom || '',
                niveau: data.niveau || '',
                parentCode: data.parentCode || '',
                ancetres: data.ancetres || [],
                correspondances: data.correspondances || { sh: '', citi: '' },
            });
            setEditId(data.code);
            setEditOpen(true);
        } catch (err) {
            toast.error("Impossible de charger le CPC à modifier");
        }
    };

    const handleUpdateCpc = async (e) => {
        e.preventDefault();
        setSaving(true);
        try {
            const token = localStorage.getItem('token');
            await updateCpc(editId, form, token);
            toast.success('CPC modifié avec succès');
            setEditOpen(false);
            setForm({ code: '', nom: '', niveau: '', parentCode: '', ancetres: [], correspondances: { sh: '', citi: '' } });
            fetchCpc();
        } catch (err) {
            toast.error("Erreur lors de la modification du CPC");
        } finally {
            setSaving(false);
        }
    };

    const handleDeleteCpc = (code) => {
        setDeleteId(code);
        setDeleteOpen(true);
    };

    const confirmDeleteCpc = async () => {
        setDeleting(true);
        try {
            const token = localStorage.getItem('token');
            await deleteCpc(deleteId, token);
            toast.success('CPC supprimé avec succès');
            setDeleteOpen(false);
            setDeleteId(null);
            fetchCpc();
        } catch (err) {
            toast.error("Erreur lors de la suppression du CPC");
        } finally {
            setDeleting(false);
        }
    };

    return (
        <div className="p-6 max-w-7xl mx-auto">
            <div className="space-y-6">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                    <div>
                        <h1 className="text-2xl text-neutral-900 mb-2">Gestion des CPC</h1>
                        <p className="text-sm text-neutral-600">
                            Gérez les codes CPC
                        </p>
                    </div>
                    <Dialog open={open} onOpenChange={setOpen}>
                        <DialogTrigger asChild>
                            <Button variant="default" className="bg-violet-600 text-white hover:bg-violet-700">Ajouter un CPC</Button>
                        </DialogTrigger>
                        <DialogContent>
                            <DialogHeader>
                                <DialogTitle>Ajouter un CPC</DialogTitle>
                                <DialogDescription>Remplissez les informations du code CPC.</DialogDescription>
                            </DialogHeader>
                            <form className="space-y-4">
                                <label className="block text-sm font-medium text-neutral-700 mb-1" htmlFor="code">Code</label>
                                <Input name="code" id="code" placeholder="Code" value={form.code} onChange={handleFormChange} required />
                                <label className="block text-sm font-medium text-neutral-700 mb-1" htmlFor="nom">Nom</label>
                                <Input name="nom" id="nom" placeholder="Nom" value={form.nom} onChange={handleFormChange} required />
                                <label className="block text-sm font-medium text-neutral-700 mb-1" htmlFor="niveau">Niveau</label>
                                <div className="relative">
                                    <Select value={form.niveau} onValueChange={value => setForm({ ...form, niveau: value })}>
                                        <SelectTrigger id="niveau" className="w-full border-neutral-300 bg-white" style={{ zIndex: 11000 }}>
                                            <SelectValue placeholder="Choisir un niveau" />
                                        </SelectTrigger>
                                        <SelectContent className="z-11000">
                                            <SelectItem value="section">Section</SelectItem>
                                            <SelectItem value="division">Division</SelectItem>
                                            <SelectItem value="groupe">Groupe</SelectItem>
                                            <SelectItem value="classe">Classe</SelectItem>
                                            <SelectItem value="sous-classe">Sous-classe</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <label className="block text-sm font-medium text-neutral-700 mb-1" htmlFor="parentCode">Code Parent</label>
                                <Input name="parentCode" id="parentCode" placeholder="Parent Code" value={form.parentCode} onChange={handleFormChange} />
                                <label className="block text-sm font-medium text-neutral-700 mb-1" htmlFor="ancetres">Ancêtres</label>
                                <Input name="ancetres" id="ancetres" placeholder="0,01,011,0111" value={form.ancetres.join(',')} onChange={handleFormChange} />
                                <label className="block text-sm font-medium text-neutral-700 mb-1" htmlFor="correspondances.sh">SH</label>
                                <Input name="correspondances.sh" id="correspondances.sh" placeholder="SH" value={form.correspondances.sh} onChange={handleFormChange} />
                                <label className="block text-sm font-medium text-neutral-700 mb-1" htmlFor="correspondances.citi">CITI</label>
                                <Input name="correspondances.citi" id="correspondances.citi" placeholder="CITI" value={form.correspondances.citi} onChange={handleFormChange} />
                                <label className="block text-sm font-medium text-neutral-700 mb-1" htmlFor="correspondances.ctci">CTCI</label>
                                <Input name="correspondances.ctci" id="correspondances.ctci" placeholder="CTCI" value={form.correspondances.ctci} onChange={handleFormChange} />
                            </form>
                            <DialogFooter>
                                <DialogClose asChild>
                                    <Button variant="outline">Annuler</Button>
                                </DialogClose>
                                <Button variant="default" className="bg-violet-600 text-white hover:bg-violet-700" onClick={handleAddCpc} disabled={saving}>
                                    {saving ? 'Ajout...' : 'Ajouter'}
                                </Button>
                            </DialogFooter>
                        </DialogContent>
                    </Dialog>
                </div>

                {/* Filtres + Search */}
                <div className="flex flex-col md:flex-row md:items-center md:gap-4 gap-2">
                    <div className="relative flex-1">
                        <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-neutral-400" />
                        <Input
                            placeholder="Rechercher un code ou libellé..."
                            value={searchTerm}
                            onChange={(e) => {
                                setPage(1);
                                setSearchTerm(e.target.value);
                            }}
                            className="pl-10 border-neutral-300"
                        />
                    </div>
                    <div className="relative w-56">
                        <Select value={niveau} onValueChange={value => { setPage(1); setNiveau(value); }}>
                            <SelectTrigger id="niveau" className="w-full border-neutral-300 bg-white">
                                <SelectValue placeholder="Choisir un niveau" />
                            </SelectTrigger>
                            <SelectContent className="z-10000">
                                <SelectItem value="section">Section</SelectItem>
                                <SelectItem value="division">Division</SelectItem>
                                <SelectItem value="groupe">Groupe</SelectItem>
                                <SelectItem value="classe">Classe</SelectItem>
                                <SelectItem value="sous-classe">Sous-classe</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </div>

                {/* CPC Table */}
                <Card className="border-neutral-200">
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-neutral-50 border-b border-neutral-200">
                                <tr>
                                    <th className="text-left p-4 text-xs text-neutral-600">Code</th>
                                    <th className="text-left p-4 text-xs text-neutral-600">Nom</th>
                                    <th className="text-left p-4 text-xs text-neutral-600">Niveau</th>
                                    <th className="text-right p-4 text-xs text-neutral-600">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {loading ? (
                                    <tr>
                                        <td colSpan="4" className="p-8 text-center text-neutral-400">Chargement...</td>
                                    </tr>
                                ) : cpcList.length > 0 ? (
                                    cpcList.map((item, idx) => (
                                        <tr key={idx} className="border-b border-neutral-200 last:border-0">
                                            <td className="p-4 text-sm text-neutral-900">{item.code}</td>
                                            <td className="p-4 text-sm text-neutral-600">{item.nom}</td>
                                            <td className="p-4 text-sm text-neutral-600">
                                                <Badge variant="secondary" className="text-xs">{item.niveau}</Badge>
                                            </td>
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
                                        <td colSpan="4" className="p-8 text-center text-neutral-400">Aucun code trouvé</td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </Card>

                {/* Pagination simple */}
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

            {/* Dialog Info CPC */}
            <Dialog open={infoOpen} onOpenChange={setInfoOpen}>
                <DialogContent aria-describedby="cpc-info-desc">
                    <DialogHeader>
                        <DialogTitle>Détail du code CPC</DialogTitle>
                        <DialogDescription id="cpc-info-desc">
                            Informations détaillées sur le code CPC sélectionné.
                        </DialogDescription>
                    </DialogHeader>
                    {selectedCpc ? (
                        <Card className="p-4 border-violet-200 bg-violet-50">
                            <div className="mb-2 flex items-center gap-2">
                                <span className="text-lg font-bold text-violet-700">{selectedCpc.code}</span>
                                <Badge variant="secondary" className="text-xs capitalize">{selectedCpc.niveau}</Badge>
                            </div>
                            <div className="mb-2 text-neutral-900 font-semibold">{selectedCpc.nom}</div>
                            <div className="text-sm text-neutral-700 mb-1"><b>Parent :</b> {selectedCpc.parentCode || <span className="italic text-neutral-400">Aucun</span>}</div>
                            <div className="text-sm text-neutral-700 mb-1"><b>Ancêtres :</b> {selectedCpc.ancetres?.length ? selectedCpc.ancetres.join(' > ') : <span className="italic text-neutral-400">Aucun</span>}</div>
                            <div className="flex gap-4 mt-2">
                                <div className="text-xs text-neutral-600"><b>SH :</b> {selectedCpc.correspondances?.sh || <span className="italic text-neutral-400">-</span>}</div>
                                <div className="text-xs text-neutral-600"><b>CITI :</b> {selectedCpc.correspondances?.citi || <span className="italic text-neutral-400">-</span>}</div>
                                <div className="text-xs text-neutral-600"><b>CTCI :</b> {selectedCpc.correspondances?.ctci || <span className="italic text-neutral-400">-</span>}</div>
                            </div>
                            <div className="mt-4 text-xs text-neutral-400">Créé le : {selectedCpc.createdAt ? new Date(selectedCpc.createdAt).toLocaleString() : '-'}</div>
                            <div className="text-xs text-neutral-400">Modifié le : {selectedCpc.updatedAt ? new Date(selectedCpc.updatedAt).toLocaleString() : '-'}</div>
                        </Card>
                    ) : (
                        <div>Chargement...</div>
                    )}
                </DialogContent>
            </Dialog>

            {/* Dialog Edit CPC */}
            <Dialog open={editOpen} onOpenChange={setEditOpen}>
                <DialogContent aria-describedby="cpc-edit-desc">
                    <DialogHeader>
                        <DialogTitle>Modifier le code CPC</DialogTitle>
                        <DialogDescription id="cpc-edit-desc">
                            Modifiez les informations du code CPC sélectionné.
                        </DialogDescription>
                    </DialogHeader>
                    <form className="space-y-4">
                        <label className="block text-sm font-medium text-neutral-700 mb-1" htmlFor="code">Code</label>
                        <Input name="code" id="code" placeholder="Code" value={form.code} onChange={handleFormChange} required disabled />
                        <label className="block text-sm font-medium text-neutral-700 mb-1" htmlFor="nom">Nom</label>
                        <Input name="nom" id="nom" placeholder="Nom" value={form.nom} onChange={handleFormChange} required />
                        <label className="block text-sm font-medium text-neutral-700 mb-1" htmlFor="niveau">Niveau</label>
                        <div className="relative">
                            <Select value={form.niveau} onValueChange={value => setForm({ ...form, niveau: value })}>
                                <SelectTrigger id="niveau" className="w-full border-neutral-300 bg-white" style={{ zIndex: 11000 }}>
                                    <SelectValue placeholder="Choisir un niveau" />
                                </SelectTrigger>
                                <SelectContent className="z-11000">
                                    <SelectItem value="section">Section</SelectItem>
                                    <SelectItem value="division">Division</SelectItem>
                                    <SelectItem value="groupe">Groupe</SelectItem>
                                    <SelectItem value="classe">Classe</SelectItem>
                                    <SelectItem value="sous-classe">Sous-classe</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <label className="block text-sm font-medium text-neutral-700 mb-1" htmlFor="parentCode">Code Parent</label>
                        <Input name="parentCode" id="parentCode" placeholder="Parent Code" value={form.parentCode} onChange={handleFormChange} />
                        <label className="block text-sm font-medium text-neutral-700 mb-1" htmlFor="ancetres">Ancêtres</label>
                        <Input name="ancetres" id="ancetres" placeholder="0,01,011,0111" value={form.ancetres.join(',')} onChange={handleFormChange} />
                        <label className="block text-sm font-medium text-neutral-700 mb-1" htmlFor="correspondances.sh">SH</label>
                        <Input name="correspondances.sh" id="correspondances.sh" placeholder="SH" value={form.correspondances.sh} onChange={handleFormChange} />
                        <label className="block text-sm font-medium text-neutral-700 mb-1" htmlFor="correspondances.citi">CITI</label>
                        <Input name="correspondances.citi" id="correspondances.citi" placeholder="CITI" value={form.correspondances.citi} onChange={handleFormChange} />
                    </form>
                    <DialogFooter>
                        <DialogClose asChild>
                            <Button variant="outline">Annuler</Button>
                        </DialogClose>
                        <Button variant="default" className="bg-violet-600 text-white hover:bg-violet-700" onClick={handleUpdateCpc} disabled={saving}>
                            {saving ? 'Enregistrement...' : 'Enregistrer'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Dialog Delete CPC */}
            <Dialog open={deleteOpen} onOpenChange={setDeleteOpen}>
                <DialogContent aria-describedby="cpc-delete-desc">
                    <DialogHeader>
                        <DialogTitle>Supprimer le code CPC</DialogTitle>
                        <DialogDescription id="cpc-delete-desc">
                            Êtes-vous sûr de vouloir supprimer ce code CPC ? Cette action est irréversible.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="flex justify-end gap-2 mt-4">
                        <DialogClose asChild>
                            <Button variant="outline">Annuler</Button>
                        </DialogClose>
                        <Button variant="default" className="bg-red-600 text-white hover:bg-red-700" onClick={confirmDeleteCpc} disabled={deleting}>
                            {deleting ? 'Suppression...' : 'Confirmer la suppression'}
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
};

export default AdminCpc;