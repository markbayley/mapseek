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

    const mapInstance = map.current;

    const spinGlobe = () => {
      if (!mapInstance) return;
      const zoom = mapInstance.getZoom();
      if (spinEnabled && !userInteracting.current && zoom < maxSpinZoom) {
        let distancePerSecond = 360 / secondsPerRevolution;

        if (zoom > slowSpinZoom) {
          const zoomDif = (maxSpinZoom - zoom) / (maxSpinZoom - slowSpinZoom);
          distancePerSecond *= zoomDif;
        }

        const center = mapInstance.getCenter();
        center.lng -= distancePerSecond;

        mapInstance.easeTo({ center, duration: 1000, easing: (n) => n });
      }
    };

    const handleMouseDown = () => {
      userInteracting.current = true;
    };

    const handleMouseUp = () => {
      userInteracting.current = false;
      spinGlobe();
    };

    mapInstance.on("mousedown", handleMouseDown);
    mapInstance.on("mouseup", handleMouseUp);
    mapInstance.on("dragend", spinGlobe);
    mapInstance.on("pitchend", spinGlobe);
    mapInstance.on("rotateend", spinGlobe);
    mapInstance.on("moveend", spinGlobe);

    const interval = setInterval(spinGlobe, 1000); // Spin every second

    return () => {
      clearInterval(interval);
      if (mapInstance) {
        mapInstance.off("mousedown", handleMouseDown);
        mapInstance.off("mouseup", handleMouseUp);
        mapInstance.off("dragend", spinGlobe);
        mapInstance.off("pitchend", spinGlobe);
        mapInstance.off("rotateend", spinGlobe);
        mapInstance.off("moveend", spinGlobe);
      }
    };
  }, [map, spinEnabled]);
};

export default useMapSpin;