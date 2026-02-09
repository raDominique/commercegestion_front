import React from 'react';

const Footer = () => (
  <footer className="bg-gray-100 text-gray-600 py-4 mt-10 border-t">
    <div className="container mx-auto text-center text-sm">
      &copy; {new Date().getFullYear()} Etokisana. Tous droits réservés.
    </div>
  </footer>
);

export default Footer;
