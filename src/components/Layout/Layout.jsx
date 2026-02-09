
import { useLocation } from 'react-router-dom';
import Header from '../Header/Header';
import Footer from '../Footer/Footer';

const Layout = ({ children }) => {
  const location = useLocation();
  const hideLayout = ['/login', '/register'].includes(location.pathname);
  return (
    <div className="flex flex-col min-h-screen">
      {!hideLayout && <Header />}
      <main className="flex-1 container mx-auto px-4 py-6">{children}</main>
      {!hideLayout && <Footer />}
    </div>
  );
};

export default Layout;
