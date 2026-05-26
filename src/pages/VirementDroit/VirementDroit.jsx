import { useEffect, useState } from 'react';
import { Card } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import usePageTitle from '../../utils/usePageTitle.jsx';
import { toast } from 'sonner';
import { useAuth } from '../../context/AuthContext';
import UserNotValidatedBanner from '../../components/commons/UserNotValidatedBanner.jsx';
import ActifsTable from '../../components/commons/ActifsTable';
import { getActifs } from '../../services/ledger.service';
import { getProfile } from '../../services/auth.service';
import useDateFormat from '../../utils/useDateFormat.jsx';

const VirementDroit = () => {
  usePageTitle('Virement de droit');
  const { user } = useAuth();

  const [form, setForm] = useState({ produit: '', productId: '', quantite: '', destinataire: '', observations: '' });
  const [saving, setSaving] = useState(false);

  const dateFormat = useDateFormat();

  const [actifs, setActifs] = useState([]);
  const [loadingActifs, setLoadingActifs] = useState(false);

  const fetchActifs = async () => {
    try {
      setLoadingActifs(true);
      let userId = user?._id;
      if (!userId) {
        try {
          const profile = await getProfile();
          userId = profile?._id || profile?.id;
        } catch (e) {
          console.debug("Impossible de récupérer l'identifiant utilisateur pour actifs:", e);
        }
      }

      const params = { page: 1, limit: 100 };
      const res = await getActifs(userId, params);
      const actifsList = Array.isArray(res?.data) ? res.data : (Array.isArray(res) ? res : []);
      setActifs(actifsList);
    } catch (err) {
      console.error('Erreur fetchActifs:', err);
      setActifs([]);
    } finally {
      setLoadingActifs(false);
    }
  };

  useEffect(() => { fetchActifs(); }, []);


  const handleOpenVirementFromActif = (actif) => {
    const pid = (actif?.productId && (actif.productId._id || actif.productId)) || actif.productId || actif.id || '';
    setForm(prev => ({ ...prev, produit: actif.productName || '', productId: pid, quantite: '' }));
    toast.info(`Produit sélectionné pour virement : ${actif.productName || '-'} (interface uniquement)`);
  };

  // form submission removed: action happens from the ActifsTable 'Virer droit' button (UI only)

  return (
    <div className="px-6 mx-auto">
      {user && user.userValidated === false ? (
        <UserNotValidatedBanner />
      ) : (
        <>
          <div className="flex justify-between items-center mb-6">
            <div>
              <h1 className="text-2xl text-neutral-900 mb-2">Virement de droit</h1>
              <p className="text-sm text-neutral-600">Transférez le droit d'un actif à un autre ayant droit</p>
            </div>
          </div>

          <Card className="border-neutral-200 bg-white">
            <div className="px-4 pt-4">
              <h2 className="text-lg font-semibold text-neutral-900">Mes actifs</h2>
              <p className="text-sm text-neutral-600">Sélectionnez un actif pour virer le droit</p>
            </div>
            <div className="p-4">
              <ActifsTable loading={loadingActifs} actifs={actifs} dateFormat={dateFormat} isDesktop={true} onVirerDroit={handleOpenVirementFromActif} />
            </div>
          </Card>
        </>
      )}
    </div>
  );
};

export default VirementDroit;
