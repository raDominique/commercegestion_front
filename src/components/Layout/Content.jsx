import Footer from './Footer';

function Content({ children }) {
  return (
    <main className="flex-1 min-w-0 flex flex-col overflow-x-clip">
      <div className="flex-1 min-w-0 px-4 py-6">{children}</div>
      <Footer />
    </main>
  );
}

export default Content;
