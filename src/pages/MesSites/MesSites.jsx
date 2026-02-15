import { useState } from 'react';
import usePageTitle from '../../utils/usePageTitle.jsx';
import messitesData from '../../data/messites.json';
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle } from '../../components/ui/dialog.jsx';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { Card } from '../../components/ui/card';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { toast } from 'sonner';
import { Public as GlobeIcon, Add as PlusIcon, Link as ExternalLinkIcon, Edit as EditIcon, Delete as TrashIcon, Visibility as EyeIcon } from '@mui/icons-material';

const MesSites = () => {
  usePageTitle('Mes sites');
  const [sites, setSites] = useState(messitesData);
  const [newSite, setNewSite] = useState({
    name: '',
    url: '',
  });
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const handleAddSite = (e) => {
    e.preventDefault();
    const site = {
      id: sites.length + 1,
      name: newSite.name,
      url: newSite.url,
      status: 'Actif',
      visits: 0,
      sales: 0,
    };
    setSites([...sites, site]);
    toast.success('Site ajouté avec succès');
    setNewSite({ name: '', url: '' });
    setIsDialogOpen(false);
  };

  const handleDeleteSite = (id) => {
    setSites(sites.filter((s) => s.id !== id));
    toast.success('Site supprimé');
  };

  const totalVisits = sites.reduce((sum, site) => sum + site.visits, 0);
  const totalSales = sites.reduce((sum, site) => sum + site.sales, 0);

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-2xl text-neutral-900 mb-2">Mes Sites</h1>
            <p className="text-sm text-neutral-600">
              Gérez vos sites web et boutiques en ligne
            </p>
          </div>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-violet-600 hover:bg-violet-700 text-white">
                <PlusIcon className="w-4 h-4 mr-2" />
                Ajouter un site
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Ajouter un nouveau site</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleAddSite} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="siteName">Nom du site</Label>
                  <Input
                    id="siteName"
                    value={newSite.name}
                    onChange={(e) => setNewSite({ ...newSite, name: e.target.value })}
                    placeholder="Ma boutique en ligne"
                    required
                    className="border-neutral-300"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="siteUrl">URL du site</Label>
                  <Input
                    id="siteUrl"
                    type="url"
                    value={newSite.url}
                    onChange={(e) => setNewSite({ ...newSite, url: e.target.value })}
                    placeholder="https://monsite.com"
                    required
                    className="border-neutral-300"
                  />
                </div>

                <Button type="submit" className="w-full bg-violet-600 hover:bg-violet-700 text-white">
                  Ajouter le site
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="p-4 border-neutral-200">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-violet-50 rounded-lg flex items-center justify-center">
                <GlobeIcon className="w-5 h-5 text-violet-600" />
              </div>
              <div>
                <p className="text-sm text-neutral-600">Total sites</p>
                <p className="text-lg text-neutral-900">{sites.length}</p>
              </div>
            </div>
          </Card>

          <Card className="p-4 border-neutral-200">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center">
                <EyeIcon className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-neutral-600">Visites totales</p>
                <p className="text-lg text-neutral-900">{totalVisits.toLocaleString()}</p>
              </div>
            </div>
          </Card>

          <Card className="p-4 border-neutral-200">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-green-50 rounded-lg flex items-center justify-center">
                <GlobeIcon className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-neutral-600">Ventes totales</p>
                <p className="text-lg text-neutral-900">{totalSales}</p>
              </div>
            </div>
          </Card>
        </div>

        {/* Sites Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {sites.map((site) => (
            <Card key={site.id} className="p-6 border-neutral-200 hover:border-violet-200 transition-colors">
              <div className="space-y-4">
                <div className="flex items-start justify-between">
                  <div className="w-12 h-12 bg-linear -to-br from-violet-600 to-indigo-600 rounded-lg flex items-center justify-center">
                    <GlobeIcon className="w-6 h-6 text-white" />
                  </div>
                  <Badge
                    variant={site.status === 'Actif' ? 'default' : 'secondary'}
                    className="text-xs"
                  >
                    {site.status}
                  </Badge>
                </div>

                <div>
                  <h3 className="text-lg text-neutral-900 mb-1">{site.name}</h3>
                  <a
                    href={site.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-violet-600 hover:text-violet-700 flex items-center gap-1"
                  >
                    {site.url}
                    <ExternalLinkIcon className="w-3 h-3" />
                  </a>
                </div>

                <div className="grid grid-cols-2 gap-4 pt-4 border-t border-neutral-200">
                  <div>
                    <p className="text-xs text-neutral-500">Visites</p>
                    <p className="text-lg text-neutral-900">{site.visits.toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="text-xs text-neutral-500">Ventes</p>
                    <p className="text-lg text-neutral-900">{site.sales}</p>
                  </div>
                </div>

                <div className="flex items-center gap-2 pt-2">
                  <Button variant="outline" size="sm" className="flex-1">
                    <EditIcon className="w-4 h-4 mr-1" />
                    Modifier
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDeleteSite(site.id)}
                  >
                    <TrashIcon className="w-4 h-4 text-red-600" />
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>

        {sites.length === 0 && (
          <Card className="p-12 text-center border-neutral-200">
            <GlobeIcon className="w-12 h-12 text-neutral-400 mx-auto mb-4" />
            <p className="text-neutral-500 mb-4">Aucun site enregistré</p>
            <Button className="bg-violet-600 hover:bg-violet-700 text-white">
              <PlusIcon className="w-4 h-4 mr-2" />
              Ajouter votre premier site
            </Button>
          </Card>
        )}
      </div>
    </div>
  );
};

export default MesSites;
