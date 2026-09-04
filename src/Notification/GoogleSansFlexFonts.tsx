import { useEffect } from 'react';

const LINK_ID = 'lw-google-sans-flex-fonts';
const HREF = 'https://fonts.googleapis.com/css2?family=Google+Sans+Flex:opsz,wght@8..144,400;8..144,500;8..144,700&display=swap';

const GoogleSansFlexFonts = () => {
  useEffect(() => {
    if (typeof document === 'undefined' || document.getElementById(LINK_ID)) {
      return undefined;
    }

    const preconnectGoogle = document.createElement('link');
    preconnectGoogle.rel = 'preconnect';
    preconnectGoogle.href = 'https://fonts.googleapis.com';
    document.head.appendChild(preconnectGoogle);

    const preconnectGstatic = document.createElement('link');
    preconnectGstatic.rel = 'preconnect';
    preconnectGstatic.href = 'https://fonts.gstatic.com';
    preconnectGstatic.crossOrigin = 'anonymous';
    document.head.appendChild(preconnectGstatic);

    const link = document.createElement('link');
    link.id = LINK_ID;
    link.rel = 'stylesheet';
    link.href = HREF;
    document.head.appendChild(link);

    return undefined;
  }, []);

  return null;
};

export default GoogleSansFlexFonts;
