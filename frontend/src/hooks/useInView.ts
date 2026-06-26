'use client';

import { useEffect, useRef, useState } from 'react';

// Fires once when the element scrolls into view. Used to drive scroll-triggered
// reveals and counters without pulling in an animation library.
export function useInView<T extends HTMLElement = HTMLDivElement>(
  rootMargin = '-10% 0px',
) {
  const ref = useRef<T | null>(null);
  const [inView, setInView] = useState(false);

  useEffect(() => {
    const node = ref.current;
    if (!node || inView) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInView(true);
          observer.disconnect();
        }
      },
      { rootMargin },
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, [inView, rootMargin]);

  return { ref, inView };
}
