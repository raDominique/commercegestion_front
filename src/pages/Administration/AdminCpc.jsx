import { useRef, useState, useEffect } from 'react';
import { Card } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Badge } from '../../components/ui/badge';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '../../components/ui/table';
import useScreenType from '../../utils/useScreenType';
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
import PaginationControls from '../../components/commons/PaginationControls.jsx';
import AddIcon from '@mui/icons-material/Add';
import InfoIcon from '@mui/icons-material/Info';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import { updateCpc } from '../../services/cpc.service';
import { deleteCpc } from '../../services/cpc.service';
import { importCpcs } from '../../services/cpc.service';
import ExportButton from '../../components/commons/ExportButton.jsx';
import { exportAndDownloadCPC } from '../../services/export.service.js';

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
    const [importing, setImporting] = useState(false);
    const fileInputRef = useRef();

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

    const handleAddCpc = async (e) => {
        e.preventDefault();
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

    const handleImportClick = () => {
        if (fileInputRef.current) fileInputRef.current.value = null;
        fileInputRef.current.click();
    };

    const handleFileChange = async (e) => {
        const file = e.target.files[0];
        if (!file) return;
        setImporting(true);
        try {
            const token = localStorage.getItem('token');
            const formData = new FormData();
            formData.append('file', file);
            await importCpcs(formData, token);
            toast.success('Importation réussie');
            fetchCpc();
        } catch (err) {
            toast.error('Erreur lors de l\'importation');
        } finally {
            setImporting(false);
        }
    };

    return (
        <div className="px-6 mx-auto">
            <div className="space-y-6">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                    <div>
                        <h1 className="text-2xl text-neutral-900 mb-2">Gestion des CPC</h1>
                        <p className="text-sm text-neutral-600">
                            Gérez les codes CPC
                        </p>
                    </div>
                    <div className="flex gap-2">
                        <Dialog open={open} onOpenChange={setOpen}>
                            <DialogTrigger asChild>
                                <Button variant="default" status="active" color="default">
                                    <AddIcon className="w-4 h-4 mr-2" />
                                    Ajouter un CPC
                                </Button>
                            </DialogTrigger>
                            <DialogContent aria-describedby="cpc-add-desc">
                                <DialogHeader>
                                    <DialogTitle>Ajouter un code CPC</DialogTitle>
                                    <DialogDescription id="cpc-add-desc">
                                        Renseignez les informations du nouveau code CPC.
                                    </DialogDescription>
                                </DialogHeader>
                                <form className="space-y-4" onSubmit={handleAddCpc}>
                                    <label className="block text-sm font-medium text-neutral-700 mb-1" htmlFor="add-code">Code</label>
                                    <Input name="code" id="add-code" placeholder="Code" value={form.code} onChange={handleFormChange} required />

                                    <label className="block text-sm font-medium text-neutral-700 mb-1" htmlFor="add-nom">Nom</label>
                                    <Input name="nom" id="add-nom" placeholder="Nom" value={form.nom} onChange={handleFormChange} required />

                                    <label className="block text-sm font-medium text-neutral-700 mb-1" htmlFor="add-niveau">Niveau</label>
                                    <Select value={form.niveau} onValueChange={value => setForm({ ...form, niveau: value })}>
                                        <SelectTrigger id="add-niveau" className="w-full border-neutral-300 bg-white">
                                            <SelectValue placeholder="Choisir un niveau" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="section">Section</SelectItem>
                                            <SelectItem value="division">Division</SelectItem>
                                            <SelectItem value="groupe">Groupe</SelectItem>
                                            <SelectItem value="classe">Classe</SelectItem>
                                            <SelectItem value="sous-classe">Sous-classe</SelectItem>
                                        </SelectContent>
                                    </Select>

                                    <label className="block text-sm font-medium text-neutral-700 mb-1" htmlFor="add-parentCode">Code Parent</label>
                                    <Input name="parentCode" id="add-parentCode" placeholder="Parent Code" value={form.parentCode} onChange={handleFormChange} />

                                    <label className="block text-sm font-medium text-neutral-700 mb-1" htmlFor="add-ancetres">Ancêtres</label>
                                    <Input name="ancetres" id="add-ancetres" placeholder="0,01,011,0111" value={form.ancetres.join(',')} onChange={handleFormChange} />

                                    <label className="block text-sm font-medium text-neutral-700 mb-1" htmlFor="add-correspondances-sh">SH</label>
                                    <Input name="correspondances.sh" id="add-correspondances-sh" placeholder="SH" value={form.correspondances.sh} onChange={handleFormChange} />

                                    <label className="block text-sm font-medium text-neutral-700 mb-1" htmlFor="add-correspondances-citi">CITI</label>
                                    <Input name="correspondances.citi" id="add-correspondances-citi" placeholder="CITI" value={form.correspondances.citi} onChange={handleFormChange} />

                                    <DialogFooter>
                                        <DialogClose asChild>
                                            <Button variant="outline" type="button" status="inactive">Annuler</Button>
                                        </DialogClose>
                                        <Button variant="default" status={saving ? "loading" : "active"} color="default" type="submit" disabled={saving}>
                                            {saving ? 'Enregistrement...' : 'Ajouter'}
                                        </Button>
                                    </DialogFooter>
                                </form>
                            </DialogContent>
                            <input
                                type="file"
                                accept=".csv, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, application/vnd.ms-excel"
                                ref={fileInputRef}
                                style={{ display: 'none' }}
                                onChange={handleFileChange}
                            />
                        </Dialog>
                            <Button
                                variant="outline"
                                status={importing ? "loading" : "inactive"}
                                className="bg-white border-violet-600 text-violet-700 hover:bg-violet-50"
                                onClick={handleImportClick}
                                disabled={importing}
                            >
                                {importing ? 'Importation...' : 'Importer CSV/Excel'}
                            </Button>
                            <ExportButton
                                exportFunction={exportAndDownloadCPC}
                                formats={[
                                    { label: 'CSV', value: 'csv', description: 'Fichier CSV' }
                                ]}
                                title="Exporter CPC"
                                buttonLabel="Exporter"
                                buttonVariant="outline"
                            />
                    </div>
                </div>

                {/* Filtres + Search */}
                <div className="flex flex-col md:flex-row md:items-center md:gap-4 gap-2">
                    <div className="relative flex-1 min-w-0">
                        <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-neutral-400" />
                        <Input
                            placeholder="Rechercher un code ou libellé..."
                            value={searchTerm}
                            onChange={(e) => {
                                setPage(1);
                                setSearchTerm(e.target.value);
                            }}
                            className="border-black pl-10 bg-white w-full"
                        />
                    </div>
                    <div className="relative w-full md:w-56 min-w-0">
                        <Select value={niveau} onValueChange={value => { setPage(1); setNiveau(value); }}>
                            <SelectTrigger id="niveau" className="w-full border-neutral-300 bg-white min-w-0">
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

                {/* CPC Table / List (responsive) */}
                <Card className="border-neutral-200 bg-white">
                    <CpcTableOrList
                        loading={loading}
                        items={cpcList}
                        handleShowInfo={handleShowInfo}
                        handleEditCpc={handleEditCpc}
                        handleDeleteCpc={handleDeleteCpc}
                    />
                </Card>

                <PaginationControls page={page} total={total} limit={limit} loading={loading} onPageChange={setPage} className="mt-4" />
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
                            <Button variant="outline" status="inactive">Annuler</Button>
                        </DialogClose>
                        <Button variant="default" status={saving ? "loading" : "active"} color="default" onClick={handleUpdateCpc} disabled={saving}>
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
                            <Button variant="outline" status="inactive">Annuler</Button>
                        </DialogClose>
                        <Button variant="default" status={deleting ? "loading" : "active"} color="destructive" onClick={confirmDeleteCpc} disabled={deleting}>
                            {deleting ? 'Suppression...' : 'Confirmer la suppression'}
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
};

export default AdminCpc;

function CpcTableOrList({ loading, items, handleShowInfo, handleEditCpc, handleDeleteCpc }) {
    const { isDesktop } = useScreenType();

    if (loading) return <div className="p-8 text-center text-neutral-400">Chargement...</div>;
    if (!items || items.length === 0) return <div className="p-8 text-center text-neutral-400">Aucun code trouvé</div>;

    if (isDesktop) {
        return (
            <div className="overflow-x-auto">
                <Table className="table-fixed">
                    <TableHeader>
                        <TableRow>
                            <TableHead className="text-xs text-neutral-600 w-28">Code</TableHead>
                            <TableHead className="text-xs text-neutral-600 w-64">Nom</TableHead>
                            <TableHead className="text-xs text-neutral-600 w-40">Niveau</TableHead>
                            <TableHead className="text-xs text-neutral-600 text-right w-32">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {items.map((item, idx) => (
                            <TableRow key={idx}>
                                <TableCell className="text-sm text-neutral-900 w-28">{item.code}</TableCell>
                                <TableCell className="text-sm text-neutral-600 w-64">
                                    <div className="w-64 truncate max-w-xs">{item.nom}</div>
                                </TableCell>
                                <TableCell className="text-sm text-neutral-600 w-40"><Badge variant="secondary" className="text-xs">{item.niveau}</Badge></TableCell>
                                <TableCell className="w-32">
                                    <div className="flex items-center justify-end gap-2">
                                        <Button variant="ghost" size="sm" aria-label={`Voir ${item.code}`} onClick={() => handleShowInfo(item.code)}><InfoIcon className="w-5 h-5 text-violet-600" /></Button>
                                        <Button variant="ghost" size="sm" aria-label={`Modifier ${item.code}`} onClick={() => handleEditCpc(item.code)}><EditIcon className="w-5 h-5 text-amber-600" /></Button>
                                        <Button variant="ghost" size="sm" aria-label={`Supprimer ${item.code}`} onClick={() => handleDeleteCpc(item.code)}><DeleteIcon className="w-5 h-5 text-red-600" /></Button>
                                    </div>
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
            {items.map((item, idx) => (
                <Card key={idx} className="p-4">
                    <div className="flex items-start justify-between gap-4">
                        <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-3">
                                <div className="flex flex-col">
                                    <span className="font-bold text-neutral-900">{item.code}</span>
                                    <span className="text-xs text-neutral-500 max-w-full wrap-break-words whitespace-normal">{item.nom}</span>
                                </div>
                            </div>
                            <div className="mt-3 flex items-center gap-2 flex-wrap">
                                <Badge variant="secondary" className="text-xs">{item.niveau}</Badge>
                            </div>
                        </div>
                        <div className="flex flex-col items-end gap-2">
                            <div className="flex gap-2">
                                <Button variant="ghost" size="sm" aria-label={`Voir ${item.code}`} onClick={() => handleShowInfo(item.code)}><InfoIcon className="w-5 h-5 text-violet-600" /></Button>
                                <Button variant="ghost" size="sm" aria-label={`Modifier ${item.code}`} onClick={() => handleEditCpc(item.code)}><EditIcon className="w-5 h-5 text-amber-600" /></Button>
                                <Button variant="ghost" size="sm" aria-label={`Supprimer ${item.code}`} onClick={() => handleDeleteCpc(item.code)}><DeleteIcon className="w-5 h-5 text-red-600" /></Button>
                            </div>
                        </div>
                    </div>
                </Card>
            ))}
        </div>
    );
}