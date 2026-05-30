import React from 'react';
import usePageTitle from '../../utils/usePageTitle.jsx';

const EchangeActifs = () => {
  usePageTitle("Echange d'actifs entre deux membres");
  return (
    <div className="px-6 mx-auto">
      <h1 className="text-2xl text-neutral-900 mb-2">Echange d'actifs entre deux membres</h1>
      <p className="text-sm text-neutral-600">Page pour échanger des actifs entre deux membres (bientôt disponible).</p>
    </div>
  );
};

export default EchangeActifs;
