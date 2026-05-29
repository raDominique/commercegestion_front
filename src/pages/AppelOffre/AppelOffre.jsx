import React from 'react';
import usePageTitle from '../../utils/usePageTitle.jsx';
import { Card } from '../../components/ui/card';
import { Button } from '../../components/ui/button';

const AppelOffre = () => {
  usePageTitle("Appels d'offre");

  return (
    <div className="px-6 mx-auto">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl text-neutral-900 mb-2">Appels d'offre</h1>
          <p className="text-sm text-neutral-600">Gérez vos appels d'offre et réponses ici.</p>
        </div>
        <div>
          <Button color="default">Créer un appel d'offre</Button>
        </div>
      </div>

      <Card className="border-neutral-200 bg-white">
        <div className="p-4">
          <p className="text-neutral-500">Aucune donnée pour l'instant — implémenter la liste et le formulaire selon les besoins.</p>
        </div>
      </Card>
    </div>
  );
};

export default AppelOffre;
