import { useState, useEffect } from 'react';

export function useBreakpoint() {
    const [w, setW] = useState(window.innerWidth);

    useEffect(() => {
        const fn = () => setW(window.innerWidth);
        window.addEventListener('resize', fn);
        return () => window.removeEventListener('resize', fn);
    }, []);

    return {
        w,
        isMobile: w < 640,
        isTablet: w >= 640 && w < 1024,
        isDesktop: w >= 1024,
        // helpers
        lt: (px) => w < px,
        gt: (px) => w > px,
    };
}