import { useQuery } from '@tanstack/react-query';
import { getDataProvider } from '@/services/provider';
import type { GridField } from '@/types/data';

/** Hook to fetch and cache a scalar/vector GridField via TanStack Query. */
export function useGridField(layerId: string, timeIso: string) {
  return useQuery<GridField>({
    queryKey: ['gridField', layerId, timeIso.slice(0, 10)],
    queryFn: async () => {
      const provider = await getDataProvider();
      return provider.getGridField(layerId, timeIso);
    },
    staleTime: 1000 * 60 * 10,
    gcTime: 1000 * 60 * 30,
  });
}
