
import AppRoutes from './routes/AppRoutes.jsx';
import { Toaster } from './components/ui/sonner';

function App() {
  const apiUrl = import.meta.env.VITE_API_BASE_URL;
  console.log('API URL:', apiUrl);
  return (
    <>
      <Toaster position="top-right" />
      <AppRoutes />
    </>
  );
}

export default App;
