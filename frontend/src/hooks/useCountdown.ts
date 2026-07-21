'use client';

import { useEffect, useState } from 'react';

export interface Countdown {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  done: boolean;
}

function remaining(target: Date): Countdown {
  const diff = target.getTime() - Date.now();
  if (diff <= 0) {
    return { days: 0, hours: 0, minutes: 0, seconds: 0, done: true };
  }
  const seconds = Math.floor(diff / 1000);
  return {
    days: Math.floor(seconds / 86400),
    hours: Math.floor((seconds % 86400) / 3600),
    minutes: Math.floor((seconds % 3600) / 60),
    seconds: seconds % 60,
    done: false,
  };
}

// Ticks a countdown to `target` every second. `target` should be a stable value
// (memoized by the caller) so the interval isn't torn down each render.
export function useCountdown(target: Date): Countdown {
  const [value, setValue] = useState(() => remaining(target));

  // The initial value comes from useState above; the interval keeps it ticking.
  // target is memoized by callers, so it effectively never changes after mount.
  useEffect(() => {
    const id = setInterval(() => setValue(remaining(target)), 1000);
    return () => clearInterval(id);
  }, [target]);

  return value;
}
