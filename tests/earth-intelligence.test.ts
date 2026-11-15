import { describe, it, expect } from 'vitest';
import { getSWOTWaterBodies, VERIFIED_SWOT_CATALOG } from '@/lib/swot-data';
import { getAgriculturalData, VERIFIED_AGRI_REGIONS } from '@/lib/agriculture-data';
import { getForestryData, VERIFIED_FOREST_PLOTS } from '@/lib/forestry-data';
import { getDisasterEvents, VERIFIED_DISASTER_EVENTS } from '@/lib/disasters-data';
import { searchASFRadarScenes, VERIFIED_SAR_SCENES } from '@/lib/radar-data';
import { getCoastalAndGeoCaData, VERIFIED_GEOCA_DATASETS, VERIFIED_COASTAL_SITES } from '@/lib/coastal-geoca-data';

describe('Module 1: Water Intelligence — NASA SWOT & Hydrocron', () => {
  it('returns verified SWOT hydrological sites with valid elevations', async () => {
    const res = await getSWOTWaterBodies();
    expect(res.waterBodies.length).toBeGreaterThanOrEqual(8);
    expect(res.mission).toContain('SWOT');

    const superior = res.waterBodies.find((b) => b.name === 'Lake Superior');
    expect(superior).toBeDefined();
    expect(superior?.currentMeasurement.waterSurfaceElevationM).toBeCloseTo(183.42, 1);
    expect(superior?.currentMeasurement.qualityFlag).toBe('nominal');
    expect(superior?.historicalObservations.length).toBeGreaterThan(0);
  });

  it('filters SWOT features by search query and type', async () => {
    const lakeRes = await getSWOTWaterBodies('Superior', 'lake');
    expect(lakeRes.waterBodies.length).toBe(1);
    expect(lakeRes.waterBodies[0].name).toBe('Lake Superior');

    const riverRes = await getSWOTWaterBodies(undefined, 'river_reach');
    expect(riverRes.waterBodies.every((b) => b.type === 'river_reach')).toBe(true);
  });
});

describe('Module 2: Agriculture & Vegetation Monitoring — NASA USDA GLAM & SMAP', () => {
  it('returns verified agricultural regions with realistic NDVI and soil moisture', () => {
    const res = getAgriculturalData();
    expect(res.regions.length).toBeGreaterThanOrEqual(6);

    const cornbelt = res.regions.find((r) => r.id === 'AGRI-US-CORNBELT');
    expect(cornbelt).toBeDefined();
    expect(cornbelt?.currentNdvi).toBeGreaterThan(0.7);
    expect(cornbelt?.soilMoistureVolumetric).toBeGreaterThan(0.15);
    expect(cornbelt?.historicalNdviSeries.length).toBeGreaterThanOrEqual(5);
  });
});

describe('Module 3: Forestry & Wetlands — NASA GEDI & MEaSUREs', () => {
  it('differentiates historical GEDI footprint lidar from continuous monitoring', () => {
    const res = getForestryData();
    expect(res.plots.length).toBeGreaterThanOrEqual(6);
    expect(res.disclaimer).toContain('GEDI');

    const amazon = res.plots.find((p) => p.id === 'GEDI-AMAZON-TAPAJOS');
    expect(amazon).toBeDefined();
    expect(amazon?.canopyHeightM).toBeGreaterThan(30);
    expect(amazon?.aboveGroundBiomassMgHa).toBeGreaterThan(200);
  });
});

describe('Module 4: Disaster Intelligence — NASA Disasters Program', () => {
  it('contains categorized events and explicit scientific situational awareness disclaimer', () => {
    const res = getDisasterEvents();
    expect(res.events.length).toBeGreaterThanOrEqual(5);
    expect(res.disclaimer).toContain('Situational Awareness');
    expect(res.disclaimer).toContain('Not an official emergency');

    const wildfire = res.events.find((e) => e.category === 'wildfire');
    expect(wildfire).toBeDefined();
    expect(wildfire?.details.wildfireFrpMw).toBeGreaterThan(1000);

    const flood = res.events.find((e) => e.category === 'flood');
    expect(flood).toBeDefined();
    expect(flood?.details.floodInundatedAreaKm2).toBeGreaterThan(5000);
  });

  it('filters disaster events by category', () => {
    const cyclones = getDisasterEvents('cyclone');
    expect(cyclones.events.every((e) => e.category === 'cyclone')).toBe(true);
  });
});

describe('Module 5: Synthetic Aperture Radar — Alaska Satellite Facility (ASF)', () => {
  it('returns Sentinel-1 SAR acquisition scenes with backscatter and Earthdata notice', async () => {
    const res = await searchASFRadarScenes();
    expect(res.scenes.length).toBeGreaterThanOrEqual(4);
    expect(res.earthdataAuthNotice.required).toBe(true);
    expect(res.earthdataAuthNotice.portalUrl).toContain('urs.earthdata.nasa.gov');

    const scene = res.scenes[0];
    expect(scene.meanBackscatterVvDb).toBeLessThan(0); // Valid negative dB backscatter
    expect(scene.footprintCoordinates.length).toBe(4); // 4-corner bounding polygon
  });
});

describe('Module 6 & 7: Coastal Ecosystems & Geo.ca Canada Data', () => {
  it('provides verified shoreline change transects and mangrove extents', () => {
    const res = getCoastalAndGeoCaData();
    expect(res.coastalSites.length).toBeGreaterThanOrEqual(4);

    const outerBanks = res.coastalSites.find((c) => c.id === 'COAST-US-OUTERBANKS');
    expect(outerBanks).toBeDefined();
    expect(outerBanks?.shorelineChangeRateMYr).toBeLessThan(0); // Erosion rate
    expect(outerBanks?.historicalShorelinePoints.length).toBeGreaterThanOrEqual(4);
  });

  it('strictly constrains Canadian Geo.ca datasets to Canadian borders', () => {
    const res = getCoastalAndGeoCaData();
    expect(res.canadianDatasets.length).toBeGreaterThanOrEqual(4);

    const { minLat, maxLat, minLon, maxLon } = res.canadianBoundingBox;
    for (const ds of res.canadianDatasets) {
      expect(ds.latitude).toBeGreaterThanOrEqual(minLat);
      expect(ds.latitude).toBeLessThanOrEqual(maxLat);
      expect(ds.longitude).toBeGreaterThanOrEqual(minLon);
      expect(ds.longitude).toBeLessThanOrEqual(maxLon);
      expect(ds.coverageRestriction).toContain('Canada');
    }
  });
});
