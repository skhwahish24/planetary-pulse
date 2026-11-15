/**
 * Scientific data structures for Alaska Satellite Facility (ASF) SAR & InSAR.
 * Source: https://asf.alaska.edu/
 */

export interface SARSceneMetadata {
  granuleName: string;
  platform: 'Sentinel-1A' | 'Sentinel-1C' | 'ALOS PALSAR-2' | 'NISAR (Simulated)';
  beamMode: 'IW' | 'EW' | 'SM';
  polarization: 'VV+VH' | 'HH+HV' | 'VV' | 'HH';
  flightDirection: 'ASCENDING' | 'DESCENDING';
  orbitNumber: number;
  acquisitionDate: string;
  centerLatitude: number;
  centerLongitude: number;
  footprintCoordinates: [number, number][]; // 4-corner polygon
  pathNumber: number;
  frameNumber: number;
  processingLevel: 'GRD_HD (Ground Range Detected)' | 'SLC (Single Look Complex)' | 'RTC (Radiometrically Terrain Corrected)';
  meanBackscatterVvDb: number; // Decibels (-25 to 0 dB)
  meanBackscatterVhDb: number;
  coherenceMean?: number; // 0.0 - 1.0 for InSAR pairs
  deformationRateMmYr?: number; // InSAR ground displacement
  application: 'Flood Inundation' | 'Surface Change Detection' | 'Wetland Hydroperiod' | 'Volcanic Subsidence' | 'Ice Sheet Velocity';
  downloadUrl: string;
  thumbnailUrl?: string;
}

export interface SARApiResponse {
  scenes: SARSceneMetadata[];
  count: number;
  source: string;
  earthdataAuthNotice: {
    required: boolean;
    portalUrl: string;
    description: string;
    freeAccount: boolean;
  };
  radarTechnicalNotes: {
    wavelength: string;
    penetrationCapability: string;
    polarizationGuide: string;
    limitations: string;
  };
  queryTime: string;
}
