import { useMemo } from 'react';
import type { HealthEpisodeRecord } from '../types/healthEpisode';

const WARNING_THRESHOLD_BYTES = 2 * 1024 * 1024;
const CRITICAL_THRESHOLD_BYTES = 4.5 * 1024 * 1024;

export interface EpisodeStorageSize {
  bytes: number;
  megabytes: number;
  isApproachingLimit: boolean;
  isCritical: boolean;
  warningThresholdMb: number;
  limitMb: number;
}

export function useEpisodeStorageSize(episodes: HealthEpisodeRecord[]): EpisodeStorageSize {
  return useMemo(() => {
    let bytes = 0;
    try {
      bytes = new Blob([JSON.stringify(episodes)]).size;
    } catch {
      bytes = JSON.stringify(episodes).length;
    }

    const megabytes = bytes / (1024 * 1024);
    return {
      bytes,
      megabytes,
      isApproachingLimit: bytes >= WARNING_THRESHOLD_BYTES,
      isCritical: bytes >= CRITICAL_THRESHOLD_BYTES,
      warningThresholdMb: WARNING_THRESHOLD_BYTES / (1024 * 1024),
      limitMb: 5,
    };
  }, [episodes]);
}

export function estimateAdditionalAttachmentBytes(dataUrl: string): number {
  const commaIndex = dataUrl.indexOf(',');
  const base64 = commaIndex >= 0 ? dataUrl.slice(commaIndex + 1) : dataUrl;
  return Math.floor((base64.length * 3) / 4);
}

export const EPISODE_STORAGE_CRITICAL_BYTES = CRITICAL_THRESHOLD_BYTES;
