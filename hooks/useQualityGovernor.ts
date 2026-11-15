import { useState, useEffect } from 'react';

/** Dynamically determines rendering quality tier based on device concurrency & memory. */
export function useQualityGovernor(): 'high' | 'low' {
  const [quality, setQuality] = useState<'high' | 'low'>('high');

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const nav = navigator as Navigator & { deviceMemory?: number };
    const concurrency = nav.hardwareConcurrency || 4;
    const memory = nav.deviceMemory || 8;

    if (concurrency < 4 || memory < 4) {
      setQuality('low');
    }
  }, []);

  return quality;
}
