import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

// Pri SPA navigácii react-router nezresetuje scroll pozíciu — nová stránka
// sa otvorí tam, kde bola predchádzajúca (napr. v strede zoznamu článkov).
// Po zmene cesty posunieme na začiatok; hash necháme prehliadaču (kotvy).
export default function ScrollToTop() {
  const { pathname, hash } = useLocation();

  useEffect(() => {
    if (hash) return;
    window.scrollTo(0, 0);
  }, [pathname, hash]);

  return null;
}
