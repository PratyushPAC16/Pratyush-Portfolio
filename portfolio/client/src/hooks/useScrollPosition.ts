import { useState, useEffect, useRef } from 'react';

interface ScrollState {
  /** True when the page has scrolled past the threshold (default 40px) */
  isScrolled: boolean;
  /** True when the nav should be visible (at top, or scrolling up) */
  isVisible: boolean;
}

export function useScrollPosition(threshold = 40): ScrollState {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isVisible, setIsVisible] = useState(true);
  const lastScrollY = useRef(0);

  useEffect(() => {
    const handleScroll = () => {
      const currentY = window.scrollY;

      // Compact mode when past threshold
      setIsScrolled(currentY > threshold);

      // Show/hide: always show at top, hide on scroll-down, show on scroll-up
      if (currentY <= threshold) {
        setIsVisible(true);
      } else if (currentY > lastScrollY.current + 5) {
        // Scrolling down — hide (with 5px dead-zone to prevent jitter)
        setIsVisible(false);
      } else if (currentY < lastScrollY.current - 5) {
        // Scrolling up — show
        setIsVisible(true);
      }

      lastScrollY.current = currentY;
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [threshold]);

  return { isScrolled, isVisible };
}
