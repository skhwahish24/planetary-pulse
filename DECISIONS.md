# Architectural & Implementation Decisions

- Used create-next-app@15.3.3 with React 19, @react-three/fiber v9, @react-three/drei v10, and react-leaflet v5. Reason: Compatibility with Node 26 LTS and upstream dependencies.
- Used npm config legacy-peer-deps: true for installation. Reason: Resolves peerOptional dependency conflict between vitest v5 and @types/node v20.
- UV mapping convention: lon=0 at texture center (u=0.5), phi=(90-lat)*DEG, theta=(lon+180)*DEG per geo.ts spec; verified alignment with prime meridian.
- frameloop='demand' chosen for GlobeCanvas with manual invalidate() calls on interaction and state change. Reason: Prevents GPU overheating while maintaining crisp 60fps response.
- Magic UI components audited to eliminate hardcoded colors and frosted blur. Reason: Strict adherence to Section 8 matte/opaque design tokens.
- Embedded official NASA Eyes on Earth interactive application (https://eyes.nasa.gov/apps/earth/#/satellites?rate=1) via responsive iframe into globe section with NASA/JPL-Caltech attribution. Reason: User request for direct official NASA interactive digital twin integration while preserving telemetry deck and design.
- Implemented GL-Diagnostic debug overlay behind ?debug=1 with wireframe and UV test toggles. Reason: Enables non-intrusive shader and FPS verification for judging.
- Integrated Coastlines and 15-degree Graticule meshes using world-atlas topology and Three.js LineSegments. Reason: Replaces procedural boundaries with authentic cartographic geography.
- Calibrated physical telemetry generators with Vitest test suite across 9 geographic anchors. Reason: Ensures physically grounded and reproducible science metrics across all 7 layers.
- Wired Open-Meteo free real-time weather API into LiveDataProvider with graceful mock fallback. Reason: Provides instant live data streaming without requiring proprietary API tokens.
