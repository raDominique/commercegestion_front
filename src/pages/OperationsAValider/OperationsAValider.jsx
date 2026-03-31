import { Card } from '../../components/ui/card';
import { useAuth } from '../../context/AuthContext';
import UserNotValidatedBanner from '../../components/commons/UserNotValidatedBanner.jsx';
import usePageTitle from '../../utils/usePageTitle.jsx';

const OperationsAValider = () => {
  usePageTitle('Opérations à valider');
  const { user } = useAuth();

  if (user && user.userValidated === false) {
    return (
      <div className="px-6 mx-auto">
        <UserNotValidatedBanner />
      </div>
    );
  }

  return (
    <div className="px-6 mx-auto space-y-4">
      <div>
        <h1 className="text-2xl text-neutral-900">Opérations à valider</h1>
        <p className="text-sm text-neutral-600">Consultez les opérations en attente de validation.</p>
      </div>

      <Card className="border-neutral-200 bg-white p-6">
        <div className="text-neutral-600">Aucune opération à valider pour le moment.</div>
      </Card>
    </div>
  );
};

export default OperationsAValider;
