"use client";
import React, { useEffect, useState, useCallback, useMemo } from 'react';

const GoUpButton: React.FC = () => {
    const [showButton, setShowButton] = useState(false);
    const [isMobile, setIsMobile] = useState(false);

    // Throttle scroll handler to reduce main thread work
    const handleScroll = useCallback(() => {
        if (window.scrollY > 100) {
            if (!showButton) setShowButton(true);
        } else {
            if (showButton) setShowButton(false);
        }
    }, [showButton]);

    // Memoize the scroll to top function
    const scrollToTop = useCallback(() => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }, []);

    useEffect(() => {
        // Use passive event listener to improve performance
        let scrollTimeout: number | null = null;
        
        const throttledScroll = () => {
            if (scrollTimeout === null) {
                scrollTimeout = window.setTimeout(() => {
                    handleScroll();
                    scrollTimeout = null;
                }, 200); // Throttle to 200ms
            }
        };
        
        window.addEventListener('scroll', throttledScroll, { passive: true });
        
        // Check if on mobile only once on mount
        const checkIfMobile = () => {
            setIsMobile(window.innerWidth < 768);
        };
        
        checkIfMobile();
        
        // Use passive event listener for resize as well
        const throttledResize = () => {
            if (scrollTimeout === null) {
                scrollTimeout = window.setTimeout(() => {
                    checkIfMobile();
                    scrollTimeout = null;
                }, 200);
            }
        };
        
        window.addEventListener('resize', throttledResize, { passive: true });

        return () => {
            window.removeEventListener('scroll', throttledScroll);
            window.removeEventListener('resize', throttledResize);
            if (scrollTimeout) clearTimeout(scrollTimeout);
        };
    }, [handleScroll]);

    // Optimize button rendering with useMemo
    const buttonClasses = useMemo(() => `fixed z-50 bg-slate-950 text-white p-3 rounded-full transition-opacity duration-300 
        ${showButton ? 'opacity-100' : 'opacity-0 pointer-events-none'} 
        ${isMobile ? 'bottom-20 right-4' : 'bottom-8 right-8'}`, [showButton, isMobile]);

    // Only render if needed
    if (!showButton && typeof window !== 'undefined' && window.scrollY <= 100) {
        return null;
    }

    return (
        <button
            className={buttonClasses}
            onClick={scrollToTop}
            aria-label="Scroll to top"
        >
            <span>&#8593;</span>
        </button>
    );
};

export default React.memo(GoUpButton);