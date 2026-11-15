# Audit and Root Cause Analysis for Defects D1 - D20

## Summary
Audit conducted across existing Next.js, Three.js shaders, colormap pipelines, physics modeling, UI hierarchy, and drill-down panels.

| ID | Issue Observed | Confirmed Root Cause | Target Fix Location |
|---|---|---|---|
| **D1** | Next.js dev overlay with hydration error | Client state (`window.location.search`, `Date().toISOString()`) read on server during hydration in store init & Leaflet/R3F components | `store/useExplorerStore.ts`, `components/Explorer.tsx` |
| **D2** | Blocky brown/green blob continent on dark ball | Low-res procedural 512x256 fallback noise in `Globe.tsx` rather than real NASA satellite blue marble & topojson coastline rasterization | `components/scene/Globe.tsx`, `public/textures/earth-blue-marble.jpg` |
| **D3** | Data layers do not show on 3D globe | Shader material in `Globe.tsx` had uniform mismatch, unnormalized dynamic range clamp, and missing texture unit updates during slot transitions | `components/scene/Globe.tsx`, `components/scene/LayerManager.tsx` |
| **D4** | Hard vertical edge cutting landmass | Texture wrapping discontinuity at u=0/u=1 (antimeridian); equirectangular grid was not sampled with periodic circular boundary conditions in shader | `components/scene/Globe.tsx`, `lib/sampling.ts` |
| **D5** | Flat white/grey elliptical disc at poles | Pole UV singularity where triangles collapse to vertex; polar latitudes clamped incorrectly without zenith interpolation | `components/scene/Globe.tsx`, `lib/geo.ts` |
| **D6** | Half globe in darkness, rim thick grey ring | Light was purely directional with 0.05 min diffuse; atmosphere shader used thick BackSide sphere with harsh power factor | `components/scene/Globe.tsx`, `components/scene/Atmosphere.tsx` |
| **D7** | Globe stays centered when drill-down opens; fly-to zooms in too close | Camera rig target did not offset for drawer width (`x` screen offset); fly-to minDistance was set to 1.85 which clips screen | `components/scene/CameraRig.tsx` |
| **D8** | Everything is grayscale | `styles/tokens.css` had neutral grayscale placeholder values (`#1a1a1a` to `#d0d0d0`) for all ramps and accents | `styles/tokens.css`, `lib/layers.ts` |
| **D9** | Type tiny (~10px), low contrast, rail bare, top bar empty | HUD components lacked visual hierarchy, icon sets, structured cards, status indicators, and clear typography | `components/hud/TopBar.tsx`, `components/hud/LayerRail.tsx` |
| **D10** | Header clipped/overlaps close button; content cut off | Fixed height with `overflow: hidden` on panel wrapper; header missing flex wrap and margin safety | `components/panels/DrilldownPanel.tsx` |
| **D11** | SST of 26.1 °C at 41.1°S 170.5°E | Mock generator used broad cos(lat) without real oceanographic zonal gradients and southern hemisphere cold currents | `services/mock/MockDataProvider.ts` |
| **D12** | Anomaly +9.4 with percentile 30% | Anomaly, z-score, and percentiles were generated with decoupled random functions instead of unified normal CDF model | `lib/stats.ts`, `services/mock/MockDataProvider.ts` |
| **D13** | Monthly standardized anomalies all positive, J-D only | Month series used absolute offsets without seasonal signed baseline deviations; single character labels | `components/panels/AnomalyBars.tsx` |
| **D14** | Factor chart labels overlap, nonsense factors for ocean | Hardcoded factors ("Topographical Forcing") used everywhere regardless of domain; fixed bar height caused label collision | `components/panels/FactorBreakdown.tsx`, `services/mock/MockDataProvider.ts` |
| **D15** | Negative values in charts nearly invisible | Diverging token for negative was dark `#1a1a1a` on `#141414` surface | `styles/tokens.css`, `components/panels/AnomalyBars.tsx` |
| **D16** | Charts look identical across locations | Seed had low variance and coarse spatial hashing, returning same series | `services/mock/MockDataProvider.ts` |
| **D17** | Particles toggle shows no particles | ParticleField was checking `particlesOn` without activating R3F invalidate loop; alpha blending was disabled | `components/scene/ParticleField.tsx` |
| **D18** | 2D mode black blobs, default leaflet white controls | Missing custom basemap canvas styling and dark matte leaflet control overrides | `components/map2d/FlatMap.tsx` |
| **D19** | No search, featured places, onboarding, time play | Features were omitted from MVP HUD | `components/hud/TopBar.tsx`, `components/hud/SearchModal.tsx`, `components/hud/Onboarding.tsx` |
| **D20** | Nothing tells viewer data is synthetic | Data provenance badge missing from HUD and drill-down summary | `components/hud/TopBar.tsx`, `components/panels/SourceFootnote.tsx` |
