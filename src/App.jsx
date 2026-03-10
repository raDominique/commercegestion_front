
import AppRoutes from './routes/AppRoutes.jsx';
import { Toaster } from './components/ui/sonner';
import { CartProvider } from './context/CartContext';

function App() {
  return (
    <>
      <Toaster position="top-center" />
      <CartProvider>
        <AppRoutes />
      </CartProvider>
    </>
  );
}

export default App;
