import { Alert } from '../ui/alert';
import { InfoOutlined as InfoIcon } from '@mui/icons-material';

export default function UserNotValidatedBanner() {
  return (
    <Alert
      variant="warning"
      className="mb-4 flex items-center gap-2 bg-yellow-50 border-l-4 border-yellow-400 text-yellow-800"
      style={{ backgroundColor: '#FFFBEB', borderLeftColor: '#F59E42', color: '#B45309' }}
    >
      <InfoIcon style={{ color: '#F59E42' }} className="mr-2" />
      <div>
        <span className="font-semibold">Votre compte n'est pas encore validé.</span>
        <br />
        Certaines fonctionnalités sont inaccessibles tant que votre compte n'a pas été validé par l'administration. Merci de vérifier vos emails ou de contacter le support si besoin.
      </div>
    </Alert>
  );
}
