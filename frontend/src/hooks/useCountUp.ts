'use client';

import { useEffect, useState } from 'react';

// Animates a number from 0 to target once `active` turns true. Drives the social
// proof counters on the homepage.
export function useCountUp(target: number, active: boolean, durationMs = 1600) {
  const [value, setValue] = useState(0);

  useEffect(() => {
    if (!active) return;

    let frame = 0;
    const start = performance.now();

    const tick = (now: number) => {
      const progress = Math.min((now - start) / durationMs, 1);
      // Ease-out so the count decelerates as it lands on the target.
      const eased = 1 - Math.pow(1 - progress, 3);
      setValue(Math.round(eased * target));
      if (progress < 1) frame = requestAnimationFrame(tick);
    };

    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [target, active, durationMs]);

  return value;
}
