import { useEffect } from 'react';

interface UmamiAnalyticsProps {
    children: React.ReactNode;
}

const UmamiAnalytics: React.FC<UmamiAnalyticsProps> = ({ children }) => {
    useEffect(() => {
        // Defer analytics tracking until after the page has loaded
        if (document.readyState === 'complete') {
            // If page is already loaded, track immediately
            setTimeout(() => {
                window.umami?.track(window.location.pathname);
            }, 100);
        } else {
            // Otherwise wait for the load event
            const handleLoad = () => {
                setTimeout(() => {
                    window.umami?.track(window.location.pathname);
                }, 100);
            };
            
            window.addEventListener('load', handleLoad, { once: true, passive: true });
            
            return () => {
                window.removeEventListener('load', handleLoad);
            };
        }
    }, []);

    return <>{children}</>;
};

export default UmamiAnalytics;
