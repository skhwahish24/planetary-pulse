# Changelog — Planetary Pulse
All notable changes, scientific integrations, visual upgrades, and infrastructure updates for **Planetary Pulse (NASA Space Apps Challenge 2026)** are documented in this log.

---

## [Unreleased / Latest] — 2026-11-15

### 1. Infrastructure, Security & Vercel Deployment
- **Security Vulnerability Resolution (CVE-2025-66478 / CVE-2025-55182)**: Upgraded Next.js from `15.3.3` to the secured patch release `15.3.9` and `eslint-config-next` to `15.3.9`, eliminating the React Server Components deserialization RCE vulnerability.
- **Node.js 22 LTS Engine & Overrides**: Configured `"engines": { "node": ">=22.0.0" }` and `"overrides": { "@types/node": "$@types/node" }` with `@types/node: "^22.13.0"` to guarantee zero `ERESOLVE` peer dependency conflicts across Vitest, Vite, and Vercel's build runner.
- **Environment Template & Git Configuration**: Created comprehensive `.env.example` listing all active data modes, NASA FIRMS, and Earthdata configuration variables, and un-ignored it in `.gitignore`.
- **Production Verification**: Confirmed clean TypeScript compilation (0 errors), ESLint (0 errors, 0 warnings), 33/33 Vitest tests passing, and successful Next.js 15.3.9 optimized production build with 19 generated routes.

### 2. Earth Intelligence System (5 Domains)
Expanded Planetary Pulse into a multi-domain Earth observation and climate intelligence platform:
- **Atmosphere Domain**:
  - Near-surface Air Temperature (°C)
  - NASA GISTEMP v4 Historical Temperature Anomaly (°C, baseline 1951–1980)
  - US EPA Air Quality Index (AQI) with pollutant breakdown (PM2.5, PM10, O3, NO2)
  - 10m Wind Velocity (m/s) with dynamic animated vector streamlines
  - Aerosol Optical Depth (AOD)
  - Relative Humidity (%)
- **Oceans & Water Intelligence (NASA SWOT)**:
  - Sea Surface Temperature (SST, °C) with calibrated thermal gradients
  - Significant Wave Height (m) and Global Ocean Currents (m/s)
  - **NASA / CNES SWOT (KaRIn Altimeter)**: Interactive monitoring of global lakes, reservoirs, river reaches, and ocean topography.
  - Reservoir storage change tracking ($\text{Mcm}$ / million cubic meters) with multi-year overpass charts (e.g., Lake Mead, Lake Powell, Lake Victoria, Lake Baikal).
  - River discharge measurements ($\text{m}^3/\text{s}$) for major river reaches (Mississippi, Amazon, Congo, Danube).
- **Agriculture & Vegetation (NASA USDA GLAM & SMAP)**:
  - MODIS / VIIRS Normalized Difference Vegetation Index (NDVI) with scientific greenness color ramps.
  - Crop Condition Index (VCI) comparing current vigor against 20-year historical baselines.
  - NASA SMAP $0\text{--}5\,\text{cm}$ Volumetric Soil Moisture ($\text{m}^3/\text{m}^3$).
- **Forestry & Wetlands (NASA GEDI & MEaSUREs)**:
  - NASA GEDI L2A/L4A RH98 Canopy Height ($m$) and Aboveground Biomass Density ($\text{Mg/ha}$).
  - NASA MEaSUREs Global Inundated Wetland Dynamics and seasonal hydroperiod classifications.
- **Disaster Situational Awareness (NASA Disasters Program)**:
  - NASA FIRMS Active Wildfire Hotspots with Fire Radiative Power (FRP in $MW$) and detection confidence.
  - Global flood extent situational mapping and population exposure estimation.
  - NASA LHASA (Landslide Hazard Assessment for Situational Awareness) nowcasts.
  - Tropical cyclone track coordinates, wind radius, and pressure.
  - Post-disaster recovery tracking using NASA Black Marble VIIRS nighttime lights.
  - Clear emergency disclaimers clarifying scientific situational awareness vs. civil alerts.
- **Synthetic Aperture Radar (Alaska Satellite Facility - ASF)**:
  - Sentinel-1 C-band SAR swath footprint discovery and polygon outlines.
  - Dual polarization backscatter analysis ($VV$ and $VH$ in $dB$).
  - InSAR ground deformation rates ($\text{mm/year}$) and interferometric coherence indicators.
  - Integrated NASA Earthdata Login authentication guidance for direct granule downloads.
- **Canadian Geospatial Intelligence (Geo.ca)**:
  - Strict geographic bounding enforcement ($41.67^\circ\text{N} - 83.11^\circ\text{N}, -141.00^\circ\text{W} - -52.62^\circ\text{W}$).
  - Canadian national flood risks, boreal caribou ranges, and Arctic permafrost thaw degradation indicators.

### 3. Satellite Tracking & Orbital Mechanics
- **Real-Time SGP4 Propagator**: Integrated server-side SGP4 orbital mechanics with CelesTrak TLE catalog.
- **3D Satellite Constellations**: Small 3D satellites rendered with orbital paths and category filtering (Weather, Earth Observation, Navigation, Scientific, Communications).
- **Satellite Search & Follow Camera**: Search satellites by name or NORAD catalog ID (ISS, Landsat 8, Sentinel-2A, Terra, Aqua, Suomi NPP) and smoothly follow their orbital trajectories.
- **Pass Prediction Engine**: Ground-track predictions calculating rise, culmination, and set times for observer coordinates.

### 4. Interactive Visualizations & 2D/3D Synchronization
- **Photorealistic 3D Globe**: Added slow autonomous rotation with pause/resume controls, animated cloud layer, atmospheric Rayleigh rim scattering, and procedural deep-space starfield.
- **2D Flat Map Vector Overlays**: Leaflet equirectangular projection completely synchronized with vector markers for SWOT lakes, active disaster incidents, SAR swaths, Canadian Geo.ca stations, and FIRMS thermal hotspots.
- **Earth Through Time (1880–Present)**: Interactive historical timeline scrubber featuring NASA GISTEMP v4 anomaly data and dual-year delta comparison.
- **Multi-Location Scientific Comparison**: Side-by-side comparative inspector evaluating telemetry across any two global coordinates.

### 5. Test Suite & Code Quality
- **33/33 Unit Tests Passing**:
  - `tests/earth-intelligence.test.ts`: Verification of SWOT, GLAM/SMAP, GEDI, Disasters, ASF SAR, and Geo.ca boundary clamping.
  - `tests/satellites.test.ts`: SGP4 orbital position and velocity calculations.
  - `tests/calibration.test.ts`: Physical range and geographical calibration consistency.
  - `tests/math.test.ts`: Geo-coordinate transforms and bilinear interpolation math.
- **Strict TypeScript & ESLint**: 0 errors, 0 warnings across all files.

---

## [Initial Release] — 2026-11-09
- Initial prototype for NASA Space Apps Challenge 2026.
- 3D WebGL Earth globe using React Three Fiber.
- 7 initial environmental layers (Temperature, Anomaly, AQI, Wind, SST, Waves, Currents).
- Open-Meteo live API bridge.
- Drilldown analytical deck with 30-day historical trends and CSV export.
