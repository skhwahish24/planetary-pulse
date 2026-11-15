# Planetary Pulse · NASA Space Apps Challenge 2026

[![Next.js 15](https://img.shields.io/badge/Next.js-15.3.9-black?logo=next.js)](https://nextjs.org/)
[![React 19](https://img.shields.io/badge/React-19.0.0-blue?logo=react)](https://react.dev/)
[![Three.js](https://img.shields.io/badge/Three.js-r187-black?logo=three.js)](https://threejs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x_Strict-blue?logo=typescript)](https://www.typescriptlang.org/)
[![Vitest](https://img.shields.io/badge/Tests-33%20Passing-brightgreen?logo=vitest)](https://vitest.dev/)

**Planetary Pulse** is a digital twin of Earth floating in deep space, developed for the **NASA Space Apps Challenge 2026**. Inspired by *NASA Eyes on Earth*, it combines high-performance 3D WebGL rendering with calibrated satellite telemetry, ecosystem monitoring, water intelligence, disaster situational awareness, and orbital satellite tracking.

---

## Architecture & Scientific Capabilities

```
                    ┌──────────────────────────────────────────────┐
                    │               PLANETARY PULSE                │
                    │         Earth Intelligence Platform          │
                    └──────────────────────┬───────────────────────┘
                                           │
         ┌──────────────────┬──────────────┴─────┬──────────────────┬─────────────────┐
         ▼                  ▼                    ▼                  ▼                 ▼
 ┌───────────────┐  ┌───────────────┐    ┌───────────────┐  ┌───────────────┐  ┌───────────────┐
 │  ATMOSPHERE   │  │ OCEANS & WATER│    │  ECOSYSTEMS   │  │   DISASTERS   │  │SATELLITE INTEL│
 ├───────────────┤  ├───────────────┤    ├───────────────┤  ├───────────────┤  ├───────────────┤
 │• Air Temp     │  │• Sea Surface  │    │• MODIS/VIIRS  │  │• NASA FIRMS   │  │• CelesTrak    │
 │• Anomaly      │  │  Temperature  │    │  NDVI Index   │  │  Wildfire FRP │  │  Live SGP4    │
 │  (GISTEMP v4) │  │• Currents &   │    │• USDA GLAM    │  │• Global Flood │  │  Orbits       │
 │• US EPA AQI   │  │  Wave Height  │    │  Crop Health  │  │  Extent Model │  │• ASF Sentinel │
 │• 10m Wind     │  │• NASA SWOT    │    │• SMAP Soil    │  │• NASA LHASA   │  │  SAR Footprint│
 │• Aerosol AOD  │  │  KaRIn Water  │    │  Moisture     │  │  Landslides   │  │  Backscatter  │
 │• Rel. Humidity│  │  Elevation    │    │• GEDI RH98    │  │• Tropical     │  │• Geo.ca Canada│
 └───────────────┘  │• Reservoirs & │    │  Forest Height│  │  Cyclone Wind │  │  Spatial Scope│
                    │  Storage Δ    │    │• MEaSUREs     │  │• Black Marble │  └───────────────┘
                    └───────────────┘    │  Wetlands     │  │  Recovery NTL │
                                         │• DSAS Coastal │  └───────────────┘
                                         │  Erosion Rate │
                                         └───────────────┘
```

---

## Key Features

### 1. Photorealistic 3D Globe & Autonomous Rotation
- Realistic NASA Blue Marble albedo, normal perturbation, and specular sun-glint ocean reflection.
- Atmospheric Rayleigh rim scattering with additive Fresnel blending.
- Independently animated procedural cloud layer and deep-space procedural starfield.
- Smooth autonomous rotation with pause/resume controls and variable rotation speeds (0.3x, 0.8x, 1.8x).
- Pause on user interaction with graceful auto-resume.

### 2. Five Comprehensive Earth Intelligence Domains
- **Atmosphere**: Near-surface Air Temperature (°C), NASA GISTEMP v4 Anomaly (°C), US EPA Air Quality Index (AQI), 10m Wind Velocity (m/s) with animated streamline particles, Aerosol Optical Depth, Relative Humidity.
- **Oceans & Water (NASA SWOT)**: Sea Surface Temperature (°C), Significant Wave Height (m), Ocean Currents (m/s), and SWOT KaRIn water surface elevations with reservoir storage change tracking ($\text{Mcm}$) and river discharge ($\text{m}^3/\text{s}$).
- **Ecosystems & Agriculture (NASA USDA GLAM & SMAP)**: MODIS/VIIRS NDVI vegetation greenness, Vegetation Condition Index (VCI), NASA SMAP Volumetric Soil Moisture ($\text{m}^3/\text{m}^3$), NASA GEDI RH98 Canopy Height ($m$), and MEaSUREs Inundated Wetlands.
- **Disasters Situational Awareness (NASA Disasters)**: NASA FIRMS Active Wildfires with Fire Radiative Power (FRP in $MW$), Global Flood Inundation extent, NASA LHASA Landslide hazards, Tropical Cyclone tracks, and VIIRS Black Marble recovery nightlights.
- **Satellite Intelligence & SAR (ASF & Geo.ca)**: Alaska Satellite Facility Sentinel-1 SAR acquisition polygons with dual-polarization backscatter ($VV/VH$ in $dB$), InSAR deformation rates, Earthdata authentication instructions, and Canadian Geo.ca national geospatial datasets.

### 3. Real-Time Satellite Tracking
- Server-side SGP4 orbital propagator powered by `satellite.js` and CelesTrak TLE catalogs.
- Identifiable 3D satellites with computed orbital trajectories and category filtering (Weather, Earth Observation, Navigation, Scientific, Communications).
- Real-time satellite search and camera-follow mode.
- Observer pass predictions calculating rise, culmination, and set times.

### 4. Dual Projection Synchronization (3D Globe ↔ 2D Flat Map)
- Full synchronization between the 3D WebGL Globe and 2D Equirectangular Flat Map (Leaflet).
- Interactive vector overlays in 2D mode for SWOT water bodies, active disaster incidents, SAR radar footprints, Canadian Geo.ca boundaries, and FIRMS thermal hotspots.
- Unified modal dialogs and control palette accessible across both projections.

### 5. Historical Analysis & Multi-Location Comparison
- **Earth Through Time (1880–2026)**: Historical timeline player with NASA GISTEMP v4 temperature anomaly datasets, delta comparisons, and play/pause controls.
- **Location Comparison Deck**: Side-by-side scientific comparison across any two global coordinates evaluating all environmental variables with units and sources.

---

## Keyboard Shortcuts

| Key | Action |
| :--- | :--- |
| `1` | Surface Air Temperature |
| `2` | Temperature Anomaly (GISTEMP v4) |
| `3` | US EPA Air Quality Index (AQI) |
| `4` | 10m Wind Velocity |
| `5` | Sea Surface Temperature (SST) |
| `6` | Significant Wave Height |
| `7` | Ocean Currents |
| `M` | Switch Projection (3D Globe ↔ 2D Flat Map) |
| `P` | Toggle Streamline Particles |
| `Space` | Pause / Resume Earth Auto-Rotation |
| `R` | Reset Camera to Default Frame |
| `Esc` | Close Drawer / Modals |
| `?` | Open Keyboard Shortcuts Guide |

---

## Quick Start

```bash
# Clone the repository
git clone https://github.com/skhwahish24/planetary-pulse.git
cd planetary-pulse

# Install dependencies (strictly compatible with @types/node ^22)
npm install

# Fetch cartographic topology assets
npm run geo

# Run unit test suite (33 tests)
npm run test

# Launch local development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.
Add `?debug=1` to the URL to enable the live GL-Diagnostic overlay.

---

## Testing & Code Verification

Planetary Pulse enforces strict code quality and scientific accuracy:
- **TypeScript**: Strict typechecking (`npm run typecheck`) — **0 errors**.
- **ESLint**: Next.js ESLint verification (`npm run lint`) — **0 errors, 0 warnings**.
- **Vitest Suite**: 33 passing unit tests (`npm run test`) validating:
  - Geophysical mathematical transformations and bilinear interpolation.
  - SGP4 orbital calculations and CelesTrak parsing.
  - Physical telemetry range calibration.
  - Earth Intelligence module contracts (SWOT, GLAM, GEDI, Disasters, ASF SAR, Canadian Geo.ca bounds).

---

## Scientific Data Attribution

- **NASA PO.DAAC / JPL**: SWOT KaRIn Altimetry & Hydrocron API (`https://hydrocron.jpl.nasa.gov/`)
- **NASA GISTEMP**: Goddard Institute for Space Studies Surface Temperature Analysis v4 (`https://data.giss.nasa.gov/gistemp/`)
- **NASA FIRMS**: Fire Information for Resource Management System (`https://firms.modaps.eosdis.nasa.gov/`)
- **NASA USDA GLAM & SMAP**: Global Agriculture Monitoring & Soil Moisture Active Passive (`https://glam1.gsfc.nasa.gov/`)
- **NASA GEDI**: Global Ecosystem Dynamics Investigation (`https://gedi.umd.edu/`)
- **NASA Disasters Program**: Science Data for Disaster Mitigation (`https://science.data.nasa.gov/disasters/`)
- **Alaska Satellite Facility (ASF)**: Sentinel-1 Synthetic Aperture Radar (`https://asf.alaska.edu/`)
- **Government of Canada (Geo.ca)**: Canadian Open Geospatial Platform (`https://geo.ca/`)
- **CelesTrak**: Satellite Orbital Elements & TLE Data (`https://celestrak.org/`)

---

## License
MIT License. Built for the NASA Space Apps Challenge 2026.
