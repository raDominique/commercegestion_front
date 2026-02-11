function Footer() {
  return (
    <footer className="bg-white border-t border-neutral-200 py-4 mt-auto">
      <div className="max-w-7xl mx-auto px-4 text-center text-sm text-neutral-500">
        © {new Date().getFullYear()} . Tous droits réservés.
      </div>
    </footer>
  );
}

export default Footer;
