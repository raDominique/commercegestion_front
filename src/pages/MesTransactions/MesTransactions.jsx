import React from 'react';
import usePageTitle from '../../utils/usePageTitle.jsx';
import { useAuth } from '../../context/AuthContext';
import UserNotValidatedBanner from '../../components/commons/UserNotValidatedBanner.jsx';

const MesTransactions = () => {
  const { user } = useAuth();
  usePageTitle('Mes transactions');
  if (user && user.userValidated === false) {
    return (
          <div className="px-6 mx-auto">
        <UserNotValidatedBanner />
      </div>
    );
  }
  return (
        <div className="px-6 mx-auto">
      <h1>Mes transactions</h1>
    </div>
  );
};

export default MesTransactions;
