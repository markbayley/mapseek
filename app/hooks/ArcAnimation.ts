import { useEffect } from "react";
import * as turf from "@turf/turf";

interface ArcAnimationProps {
  map: any;
  selectedCountryCenter: [number, number] | null;
  isCountriesDataReady: boolean;
  activeOverlays: { [key: string]: boolean };
  exportPartners: string | null;
  importPartners: string | null;
  exportIcons: Array<{ keyword: string; color: string }>;
  importIcons: Array<{ keyword: string; color: string }>;
  highlightedCountryId: string | null;
  getAnimationContextKey: (countryId: string | null, filterType: string) => string;
  animate: (...args: any[]) => void;
  cleanupAllAnimations: () => void;
  cancelAllAnimationFrames: () => void;
  getCountryCoordinates: (countryName: string) => [number, number] | null;
  exportChartColors: string[];
  importChartColors: string[];
  animationPaused: boolean;
}

export function useArcAnimation({
  map,
  selectedCountryCenter,
  isCountriesDataReady,
  activeOverlays,
  exportPartners,
  importPartners,
  exportIcons,
  importIcons,
  highlightedCountryId,
  getAnimationContextKey,
  animate,
  cleanupAllAnimations,
  cancelAllAnimationFrames,
  getCountryCoordinates,
  exportChartColors,
  importChartColors,
  animationPaused,
}: ArcAnimationProps) {
  useEffect(() => {
    console.log('[ArcAnimation] Effect running');
    console.log('[ArcAnimation] selectedCountryCenter:', selectedCountryCenter);
    console.log('[ArcAnimation] isCountriesDataReady:', isCountriesDataReady);
    console.log('[ArcAnimation] activeOverlays:', activeOverlays);
    if (!map?.current) {
      console.log('[ArcAnimation] map.current is not ready');
      return;
    }
    if (!map.current.isStyleLoaded()) {
      console.log('[ArcAnimation] map style not loaded');
      return;
    }
    // Cancel any existing animation frames
    cancelAllAnimationFrames();

    // Always remove existing arcs before drawing new ones
    if (map?.current?.getLayer('arcs-layer')) { map.current.removeLayer('arcs-layer'); console.log('[ArcAnimation] Removed arcs-layer'); }
    if (map?.current?.getSource('arcs-source')) { map.current.removeSource('arcs-source'); console.log('[ArcAnimation] Removed arcs-source'); }

    // Cleanup previous animated points
    cleanupAllAnimations();

    if (!selectedCountryCenter || !isCountriesDataReady || !(activeOverlays.exports || activeOverlays.imports)) {
      if (map?.current?.getLayer('arcs-layer')) map.current.removeLayer('arcs-layer');
      if (map?.current?.getSource('arcs-source')) map.current.removeSource('arcs-source');
      console.log('[ArcAnimation] Prerequisites not met, exiting');
      return;
    }

    const newContextKey = getAnimationContextKey(highlightedCountryId, 'exports');

    const partners = activeOverlays.exports
      ? (exportPartners ? exportPartners.split(',').map(s => s.trim()).filter(Boolean) : [])
      : (importPartners ? importPartners.split(',').map(s => s.trim()).filter(Boolean) : []);
    console.log('[ArcAnimation] partners:', partners);

    const iconsToUse = activeOverlays.exports ? exportIcons : importIcons;
    const colorPalette = activeOverlays.exports ? exportChartColors : importChartColors;

    const arcFeatures: any[] = [];

    if (selectedCountryCenter && partners.length > 0) {
      partners.forEach((partner: string, index: number) => {
        const partnerCoords = getCountryCoordinates(partner);
        if (partnerCoords) {
          const startPoint = turf.point(selectedCountryCenter);
          const endPoint = turf.point(partnerCoords);
          let curvedCoordinates = generateArc(startPoint, endPoint, 1000);
          if (activeOverlays.imports) {
            curvedCoordinates = curvedCoordinates.reverse();
          }
          const arcColor = colorPalette[index % colorPalette.length];
          const arcFeature = {
            type: 'Feature' as const,
            geometry: {
              type: 'LineString' as const,
              coordinates: curvedCoordinates
            },
            properties: {
              color: arcColor,
              partnerName: partner,
              subFilterType: activeOverlays,
              countryId: highlightedCountryId,
              contextKey: newContextKey
            }
          };
          arcFeatures.push(arcFeature);

          const pointSourceId = `point-${activeOverlays}-${index}-${highlightedCountryId}`;
          let iconName = 'aircraft';
          if (iconsToUse.length > 0) {
            iconName = iconsToUse[index % iconsToUse.length].keyword;
          } else {
            iconName = activeOverlays.exports ? 'aircraft' : 'ships';
          }
          const initialPointFeature = {
            type: 'Feature' as const,
            properties: {
              bearing: 0,
              icon: iconName,
              partnerName: partner,
              subFilterType: activeOverlays,
              countryId: highlightedCountryId,
              contextKey: newContextKey
            },
            geometry: {
              type: 'Point' as const,
              coordinates: curvedCoordinates[0]
            }
          };
          if (map.current) {
            if (map.current.getLayer(pointSourceId)) map.current.removeLayer(pointSourceId);
            if (map.current.getSource(pointSourceId)) map.current.removeSource(pointSourceId);
            map.current.addSource(pointSourceId, {
              type: 'geojson',
              data: {
                type: 'FeatureCollection',
                features: [initialPointFeature]
              }
            });
            map.current.addLayer({
              id: pointSourceId,
              type: 'symbol',
              source: pointSourceId,
              layout: {
                'icon-image': ['get', 'icon'],
                'icon-rotate': ['get', 'bearing'],
                'icon-keep-upright': false,
                'icon-allow-overlap': true,
                'icon-ignore-placement': true,
                'icon-size': 0.5
              }
            });
            console.log('[ArcAnimation] Added animated point layer:', pointSourceId);
            animate(map.current, 0,
              { type: 'FeatureCollection', features: [arcFeature] },
              { type: 'FeatureCollection', features: [initialPointFeature] },
              pointSourceId,
              1000,
              newContextKey
            );
          }
        } else {
          console.log('[ArcAnimation] No coordinates found for partner:', partner);
        }
      });
    }

    console.log('[ArcAnimation] arcFeatures:', arcFeatures);

    if (arcFeatures.length > 0) {
      if (map.current?.getSource('arcs-source')) {
        (map.current.getSource('arcs-source') as any).setData({
          type: 'FeatureCollection',
          features: arcFeatures
        });
        console.log('[ArcAnimation] Updated arcs-source data');
      } else {
        map.current.addSource('arcs-source', {
          type: 'geojson',
          data: {
            type: 'FeatureCollection',
            features: arcFeatures
          }
        });
        map.current.addLayer({
          id: 'arcs-layer',
          type: 'line',
          source: 'arcs-source',
          paint: {
            'line-color': ['get', 'color'],
            'line-width': 2,
            'line-opacity': 0.7
          }
        });
        console.log('[ArcAnimation] Added arcs-layer and arcs-source');
      }
    } else {
      if (map.current?.getLayer('arcs-layer')) map.current.removeLayer('arcs-layer');
      if (map.current?.getSource('arcs-source')) map.current.removeSource('arcs-source');
      console.log('[ArcAnimation] No arc features, removed arcs-layer/source');
    }

    return () => {
      cancelAllAnimationFrames();
      if (map.current && arcFeatures.length > 0) {
        arcFeatures.forEach((_, index) => {
          const pointSourceId = `point-${activeOverlays}-${index}-${highlightedCountryId}`;
          if (map.current?.getLayer(pointSourceId)) {
            map.current.removeLayer(pointSourceId);
          }
          if (map.current?.getSource(pointSourceId)) {
            map.current.removeSource(pointSourceId);
          }
        });
      }
      if (map.current?.getLayer('arcs-layer')) map.current.removeLayer('arcs-layer');
      if (map.current?.getSource('arcs-source')) map.current.removeSource('arcs-source');
      console.log('[ArcAnimation] Cleanup complete');
    };
  }, [selectedCountryCenter, activeOverlays, isCountriesDataReady, exportPartners, importPartners, animationPaused, exportIcons, importIcons, highlightedCountryId]);
}

// Helper function to generate arc (copy from MapComponent or import if shared)
function generateArc(start: any, end: any, segments: number): number[][] {
  let midPoint = turf.midpoint(start, end);
  let bearing = turf.bearing(end, start);
  let distance = turf.distance(start, end) / 2;
  let arc = [start.geometry.coordinates];
  for (let angle = 0; angle < 180; angle += (180 / segments)) {
    let rotatedPoint = turf.transformTranslate(midPoint, distance, bearing - angle);
    arc.push(rotatedPoint.geometry.coordinates);
  }
  return arc;
} 