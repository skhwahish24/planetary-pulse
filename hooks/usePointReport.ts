import { useQuery } from '@tanstack/react-query';
import type { PointReport } from '@/types/data';

/** Hook to fetch the point drill-down report for given coordinates. */
export function usePointReport(
  lat: number | null,
  lon: number | null,
  timeIso: string
) {
  const isEnabled = lat !== null && lon !== null;

  return useQuery<PointReport>({
    queryKey: ['pointReport', lat, lon, timeIso.slice(0, 10)],
    queryFn: async () => {
      if (lat === null || lon === null) {
        throw new Error('Coordinates missing');
      }
      const res = await fetch(
        `/api/point?lat=${lat}&lon=${lon}&t=${encodeURIComponent(timeIso)}`
      );
      if (!res.ok) {
        throw new Error(`Report fetch failed: ${res.statusText}`);
      }
      return res.json();
    },
    enabled: isEnabled,
    staleTime: 1000 * 60 * 5,
  });
}
