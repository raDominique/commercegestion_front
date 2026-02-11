import Footer from './Footer';

function Content({ children }) {
  return (
    <main className="flex-1 flex flex-col">
      <div className="flex-1 px-4 py-6">{children}</div>
      <Footer />
    </main>
  );
}

export default Content;
