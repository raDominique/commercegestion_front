import { Alert } from '../ui/alert';
import { InfoOutlined as InfoIcon } from '@mui/icons-material';

export default function UserNotValidatedBanner() {
  return (
    <Alert variant="warning" className="mb-4 flex items-center gap-2">
      <InfoIcon className="text-yellow-500 mr-2" />
      <div>
        <span className="font-semibold">Votre compte n'est pas encore validé.</span>
        <br />
        Certaines fonctionnalités sont inaccessibles tant que votre compte n'a pas été validé par l'administration. Merci de vérifier vos emails ou de contacter le support si besoin.
      </div>
    </Alert>
  );
}
