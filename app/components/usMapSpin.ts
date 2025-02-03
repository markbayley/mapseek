// useMapSpin.ts
import { useEffect, useRef } from "react";
import mapboxgl from "mapbox-gl";

const useMapSpin = (map: React.RefObject<mapboxgl.Map | null>, spinEnabled: boolean) => {
  const userInteracting = useRef(false);
  const secondsPerRevolution = 120;
  const maxSpinZoom = 5;
  const slowSpinZoom = 3;

  useEffect(() => {
    if (!map.current) return;

    const spinGlobe = () => {
      const zoom = map.current.getZoom();
      if (spinEnabled && !userInteracting.current && zoom < maxSpinZoom) {
        let distancePerSecond = 360 / secondsPerRevolution;

        if (zoom > slowSpinZoom) {
          const zoomDif = (maxSpinZoom - zoom) / (maxSpinZoom - slowSpinZoom);
          distancePerSecond *= zoomDif;
        }

        const center = map.current.getCenter();
        center.lng -= distancePerSecond;

        map.current.easeTo({ center, duration: 1000, easing: (n) => n });
      }
    };

    map.current.on("mousedown", () => {
      userInteracting.current = true;
    });

    map.current.on("mouseup", () => {
      userInteracting.current = false;
      spinGlobe();
    });

    map.current.on("dragend", spinGlobe);
    map.current.on("pitchend", spinGlobe);
    map.current.on("rotateend", spinGlobe);
    map.current.on("moveend", spinGlobe);

    const interval = setInterval(spinGlobe, 1000); // Spin every second

    return () => {
      clearInterval(interval);
      map.current.off("mousedown");
      map.current.off("mouseup");
      map.current.off("dragend", spinGlobe);
      map.current.off("pitchend", spinGlobe);
      map.current.off("rotateend", spinGlobe);
      map.current.off("moveend", spinGlobe);
    };
  }, [map, spinEnabled]);
};

export default useMapSpin;