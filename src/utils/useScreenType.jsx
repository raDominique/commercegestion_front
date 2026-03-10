import * as React from 'react';

// Breakpoints (px)
const MOBILE_BP = 768; // typical mobile max width
const TABLET_BP = 1024; // treat this as midpoint threshold

/**
 * useScreenType
 * Behavior: if width is strictly greater than TABLET_BP => 'desktop'
 * otherwise => 'mobile'
 * Returns { type, isMobile, isDesktop, width }
 */
export default function useScreenType() {
    const [width, setWidth] = React.useState(typeof window !== 'undefined' ? window.innerWidth : 0);

    React.useEffect(() => {
        const onResize = () => setWidth(window.innerWidth);
        window.addEventListener('resize', onResize, { passive: true });
        // initialize
        onResize();
        return () => window.removeEventListener('resize', onResize);
    }, []);

    const isDesktop = width > TABLET_BP; // strict greater -> desktop
    const isMobile = !isDesktop; // <= TABLET_BP -> mobile

    const type = isDesktop ? 'desktop' : 'mobile';

    return { type, isMobile, isDesktop, width };
}

export { MOBILE_BP, TABLET_BP };

export function getScreenTypeFromWidth(w) {
    return w > TABLET_BP ? 'desktop' : 'mobile';
}
