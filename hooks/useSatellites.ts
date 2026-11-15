'use client';

/**
 * useSatellites — fetches TLE catalog and polls positions from server every second.
 * SGP4 propagation runs server-side. Never fabricates positions.
 */

import { useQuery } from '@tanstack/react-query';
import { useEffect, useRef, useState, useCallback } from 'react';
import type { TLERecord, TLEApiResponse, SatellitePosition, SatelliteCategory } from '@/types/satellites';
import { useExplorerStore } from '@/store/useExplorerStore';

export interface LiveSatellite {
  record: TLERecord;
  position: SatellitePosition | null;
}

interface PositionEntry {
  noradId: number;
  name: string;
  category: SatelliteCategory;
  position: SatellitePosition | null;
}

/** Fetch TLE catalog for a group. */
async function fetchTLEGroup(group: string): Promise<TLEApiResponse> {
  const res = await fetch(`/api/satellites/tle?group=${group}`);
  if (!res.ok) throw new Error(`TLE fetch failed: ${res.status}`);
  return res.json() as Promise<TLEApiResponse>;
}

/** Fetch current positions from server-side SGP4 propagation. */
async function fetchPositions(group: string): Promise<PositionEntry[]> {
  const res = await fetch(`/api/satellites/positions?group=${group}`);
  if (!res.ok) return [];
  const data = await res.json() as { positions: PositionEntry[] };
  return data.positions;
}

/** Groups to load per category. */
function groupsForCategory(cat: SatelliteCategory | 'all'): string[] {
  if (cat === 'all')          return ['stations', 'weather', 'science'];
  if (cat === 'crewed')       return ['stations'];
  if (cat === 'weather')      return ['weather'];
  if (cat === 'navigation')   return ['gps-ops'];
  if (cat === 'science')      return ['science'];
  return ['stations', 'weather'];
}

export function useSatellites(): {
  satellites: LiveSatellite[];
  isLoading: boolean;
  source: string;
  fetchedAt: string;
} {
  const satelliteMode = useExplorerStore((s) => s.satelliteMode);
  const satelliteCategory = useExplorerStore((s) => s.satelliteCategory);

  const groups = groupsForCategory(satelliteCategory);

  // Fetch TLE catalogs (long cache — TLEs change slowly)
  const q0 = useQuery({
    queryKey: ['tle', groups[0]],
    queryFn: () => fetchTLEGroup(groups[0]),
    enabled: satelliteMode && groups.length > 0,
    staleTime: 6 * 60 * 60 * 1000,
    retry: 2,
  });
  const q1 = useQuery({
    queryKey: ['tle', groups[1] ?? '_none1'],
    queryFn: () => fetchTLEGroup(groups[1] ?? 'stations'),
    enabled: satelliteMode && groups.length > 1,
    staleTime: 6 * 60 * 60 * 1000,
    retry: 2,
  });
  const q2 = useQuery({
    queryKey: ['tle', groups[2] ?? '_none2'],
    queryFn: () => fetchTLEGroup(groups[2] ?? 'stations'),
    enabled: satelliteMode && groups.length > 2,
    staleTime: 6 * 60 * 60 * 1000,
    retry: 2,
  });

  const isLoading = q0.isLoading || q1.isLoading || q2.isLoading;
  const source = q0.data?.source ?? 'CelesTrak GP Data';
  const fetchedAt = q0.data?.fetchedAt ?? '';

  // Build record map (noradId → TLERecord)
  const recordMapRef = useRef<Map<number, TLERecord>>(new Map());
  const tleKey = [q0.data?.satellites.length, q1.data?.satellites.length, q2.data?.satellites.length].join('-');

  useEffect(() => {
    const map = new Map<number, TLERecord>();
    [q0.data, q1.data, q2.data].forEach((d) => {
      d?.satellites.forEach((r) => map.set(r.noradId, r));
    });
    recordMapRef.current = map;
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tleKey]);

  // Poll positions from server every second
  const [satellites, setSatellites] = useState<LiveSatellite[]>([]);

  const updatePositions = useCallback(async () => {
    if (!satelliteMode || recordMapRef.current.size === 0) return;

    const allPositions: PositionEntry[] = [];
    for (const group of groups) {
      const positions = await fetchPositions(group);
      allPositions.push(...positions);
    }

    const liveMap = new Map<number, PositionEntry>();
    allPositions.forEach((p) => liveMap.set(p.noradId, p));

    const result: LiveSatellite[] = [];
    recordMapRef.current.forEach((record, noradId) => {
      result.push({
        record,
        position: liveMap.get(noradId)?.position ?? null,
      });
    });

    setSatellites(result);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [satelliteMode, groups.join(',')]);

  useEffect(() => {
    if (!satelliteMode) {
      setSatellites([]);
      return;
    }

    void updatePositions();
    const interval = setInterval(() => { void updatePositions(); }, 2000);
    return () => clearInterval(interval);
  }, [satelliteMode, updatePositions]);

  return { satellites, isLoading, source, fetchedAt };
}
