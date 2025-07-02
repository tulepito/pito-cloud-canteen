import { useEffect } from 'react';

function GleapCSSInjector() {
  useEffect(() => {
    if (window.innerWidth < 768) {
      document.body.classList.add('mobile-gleap');
    } else {
      document.body.classList.remove('mobile-gleap');
    }
  }, []);

  return null;
}

export default GleapCSSInjector;
