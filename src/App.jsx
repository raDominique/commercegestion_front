
import AppRoutes from './routes/AppRoutes.jsx';
import ToasterProvider from './components/ui/ToasterProvider.jsx';

function App() {
  const apiUrl = import.meta.env.VITE_API_BASE_URL;
  console.log('API URL:', apiUrl);
  return (
    <>
      <ToasterProvider />
      <AppRoutes />
    </>
  );
}

export default App;
