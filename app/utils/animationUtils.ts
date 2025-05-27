import mapboxgl from "mapbox-gl";
import * as turf from '@turf/turf';

export interface AnimationContext {
  animatedPointIds: React.MutableRefObject<Set<string>>;
  currentAnimationContext: React.MutableRefObject<string>;
  animationFrameIds: React.MutableRefObject<number[]>;
}

// Generate a unique context key for the current country and filter
export const getAnimationContextKey = (countryId: string | null, filterType: string): string => {
  return `${countryId || 'none'}-${filterType}`;
};

// Helper function to cancel all animation frames
export const cancelAllAnimationFrames = (animationFrameIds: React.MutableRefObject<number[]>) => {
  animationFrameIds.current.forEach(frameId => {
    window.cancelAnimationFrame(frameId);
  });
  animationFrameIds.current = [];
};

// Enhanced cleanup function for animations
export const cleanupAllAnimations = (
  map: React.MutableRefObject<mapboxgl.Map | null>,
  animationContext: AnimationContext
) => {
  if (!map.current || !map.current.isStyleLoaded()) return; // Only run if style is loaded
  try {
    // Cancel all animation frames first
    cancelAllAnimationFrames(animationContext.animationFrameIds);
    // Get all sources from the map
    const mapStyle = map.current.getStyle();
    const sources = mapStyle && mapStyle.sources ? mapStyle.sources : {};

    // Identify and cleanup animation sources and layers
    Object.keys(sources).forEach(sourceId => {
      // Check for both old format (point-0) and new format (point-export-partners-0, point-import-partners-0)
      if (sourceId.startsWith('point-')) {
        console.log("Cleaning up animation source:", sourceId);
        if (map.current && map.current.getLayer(sourceId)) {
          try {
            map.current.removeLayer(sourceId);
          } catch (error) {
            console.warn(`Error removing layer ${sourceId}:`, error);
          }
        }
        if (map.current && map.current.getSource(sourceId)) {
          try {
            map.current.removeSource(sourceId);
          } catch (error) {
            console.warn(`Error removing source ${sourceId}:`, error);
          }
        }
        animationContext.animatedPointIds.current.delete(sourceId);
      }
    });

    // Get all layers from the map to ensure we catch any that might be missed
    const layers = mapStyle && mapStyle.layers ? mapStyle.layers : [];
    for (let i = 0; i < layers.length; i++) {
      const layer = layers[i];
      const layerId = layer.id;
      if (layerId && layerId.startsWith('point-')) {
        console.log("Cleaning up animation layer:", layerId);
        if (map.current && map.current.getLayer(layerId)) {
          try {
            map.current.removeLayer(layerId);
          } catch (error) {
            console.warn(`Error removing layer ${layerId}:`, error);
          }
        }
      }
    }

    // Clear the tracking set
    animationContext.animatedPointIds.current.clear();

    // Also remove arc layers if they exist
    if (map.current && map.current.getLayer('arcs-layer')) {
      try {
        map.current.removeLayer('arcs-layer');
      } catch (error) {
        console.warn("Error removing arcs-layer:", error);
      }
    }
    if (map.current && map.current.getSource('arcs-source')) {
      try {
        map.current.removeSource('arcs-source');
      } catch (error) {
        console.warn("Error removing arcs-source:", error);
      }
    }

    // Reset animation context
    animationContext.currentAnimationContext.current = '';

    console.log("Animation cleanup complete, removed all animation sources and layers");
  } catch (error) {
    console.error("Error cleaning up animations:", error);
  }
};

// Animation function for moving points along arcs
export const animate = (
  mapInstance: mapboxgl.Map,
  counter: number,
  arcData: any,
  pointData: any,
  sourceId: string,
  segments: number,
  contextKey: string,
  animationContext: AnimationContext,
  animationPaused: boolean
) => {
  // Skip animation if paused
  if (animationPaused) return;

  // Check if animation context has changed
  if (contextKey !== animationContext.currentAnimationContext.current) {
    console.log(`Animation context changed. Expected: ${animationContext.currentAnimationContext.current}, Got: ${contextKey}`);
    // Remove the layer and source if it's from an old context
    if (mapInstance.getLayer(sourceId)) {
      try {
        mapInstance.removeLayer(sourceId);
      } catch (error) {
        console.warn(`Error removing layer ${sourceId}:`, error);
      }
    }
    if (mapInstance.getSource(sourceId)) {
      try {
        mapInstance.removeSource(sourceId);
      } catch (error) {
        console.warn(`Error removing source ${sourceId}:`, error);
      }
    }
    animationContext.animatedPointIds.current.delete(sourceId);
    return; // Exit early if the animation context has changed
  }

  // Check if the source still exists (prevents errors when cleaning up)
  if (!mapInstance.getSource(sourceId)) {
    console.log("Animation source removed:", sourceId);
    animationContext.animatedPointIds.current.delete(sourceId);
    return; // Exit early if the source has been removed
  }

  // Get the point coordinates for this frame
  const point = counter >= segments
    ? arcData.features[0].geometry.coordinates[segments - 1] // Stay at last point
    : arcData.features[0].geometry.coordinates[counter % segments];

  // If we've reached the end, restart from beginning
  if (counter >= segments) {
    counter = 0;
  }

  // Update point position
  if (pointData && pointData.features && pointData.features.length > 0) {
    pointData.features[0].geometry.coordinates = point;

    // Calculate bearing for rotation (direction of travel)
    if (counter < arcData.features[0].geometry.coordinates.length - 1) {
      const currentPoint = arcData.features[0].geometry.coordinates[counter];
      const nextPoint = arcData.features[0].geometry.coordinates[counter + 1];
      if (currentPoint && nextPoint) {
        const bearing = turf.bearing(
          turf.point(currentPoint),
          turf.point(nextPoint)
        );
        pointData.features[0].properties.bearing = bearing;
      }
    }

    // Update the source with the new point position
    if (mapInstance.getSource(sourceId)) {
      (mapInstance.getSource(sourceId) as mapboxgl.GeoJSONSource).setData(pointData);
    }
  }

  // Continue animation only if the source still exists and animation isn't paused
  if (mapInstance.getSource(sourceId) && !animationPaused) {
    const frameId = requestAnimationFrame(() => {
      animate(mapInstance, counter + 1, arcData, pointData, sourceId, segments, contextKey, animationContext, animationPaused);
    });
    animationContext.animationFrameIds.current.push(frameId);
  }
};

// Generate arc from start point to the end point.
// The segments parameter tell us how many
// new point should we generate.
export function generateArc(start: any, end: any, segments: number): number[][] {
  // Get the mid point between start and end
  let midPoint = turf.midpoint(start, end);

  // Get the bearing 
  let bearing = turf.bearing(end, start);

  // Get half of the distance, because we 
  // start from the midpoint.
  let distance = turf.distance(start, end) / 2;

  // Add the start coordinate
  let arc = [start.geometry.coordinates];

  // We devide 180 angle by segments, and for each angle
  // we transform the mid point by distance and an angle.
  for (let angle = 0; angle < 180; angle += (180 / (segments))) {
    let rotatedPoint = turf.transformTranslate(midPoint,
      distance,
      bearing - angle);
    arc.push(rotatedPoint.geometry.coordinates);
  }

  // Add the end coordinate
  // Commented out as per previous instruction to not add the end coordinate initially
  // arc.push(end.geometry.coordinates);

  return arc;
} 