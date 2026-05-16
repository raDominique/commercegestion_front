import React, { useState } from 'react';
import usePageTitle from '../../utils/usePageTitle.jsx';
import { useAuth } from '../../context/AuthContext';
import UserNotValidatedBanner from '../../components/commons/UserNotValidatedBanner.jsx';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/card.jsx';

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

  const [audits] = useState([]);
  const [loading] = useState(false);

  return (
    <div className="px-6 mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-neutral-900">Audit</h1>
        <p className="text-muted-foreground mt-1">Historique et activités liées à votre compte</p>
      </div>

      <Card className="border border-gray-200 bg-white">
        <CardHeader>
          <CardTitle>Activité du compte</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-neutral-700">Cette section affichera l'activité de votre compte (connexions, transactions, modifications, etc.).</p>

          {!loading && audits.length === 0 && (
            <div className="mt-4 text-center text-neutral-400">Aucune donnée d'audit disponible pour le moment.</div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default Audit;
