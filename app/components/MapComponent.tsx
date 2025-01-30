"use client";

import { useEffect, useRef, useState } from "react";
import mapboxgl from "mapbox-gl";

mapboxgl.accessToken = process.env.NEXT_PUBLIC_MAPBOX_TOKEN || "";

interface MapComponentProps {
  searchTerm: string;
  gdpFilter: number;
}

export default function Map({ }: MapComponentProps) {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const popupRef = useRef<mapboxgl.Popup | null>(null); // Store active popup

  const [searchTerm, setSearchTerm] = useState('');
  const [gdpFilter, setGdpFilter] = useState<number>(0);

  useEffect(() => {
    if (!mapContainer.current) return;

    const initializeMap = async () => {
      map.current = new mapboxgl.Map({
        container: mapContainer.current!,
        style: "mapbox://styles/mapbox/light-v11",
        center: [20, 40],
        zoom: 2,
      });

      map.current.on("load", async () => {
        await addDataLayers();
        updateLayerVisibility();
        // Set Fog after map style loads
        map.current.setFog({
          color: 'rgb(186, 210, 235)', // Lower atmosphere
          'high-color': 'rgb(36, 92, 223)', // Upper atmosphere
          'horizon-blend': 0.001, // Atmosphere thickness
          'space-color': 'rgb(11, 11, 25)', // Background color
          'star-intensity': 0.1, // Background star brightness
        });
        setupClickEvents(); // ✅ Add country click event
      });
    };

    initializeMap();
    return () => {
      if (map.current) {
        map.current.remove();
        map.current = null;
      }
    };
  }, []);

  // ✅ Function to update the data dynamically when searchTerm changes
  const updateGeoJSONData = async () => {
    const response = await fetch(
      "https://raw.githubusercontent.com/nvkelso/natural-earth-vector/master/geojson/ne_110m_admin_0_countries.geojson"
    );
    const geojson = await response.json();

    const filteredData = {
      ...geojson,
      features: geojson.features.filter((feature: any) =>
        feature.properties.NAME.toLowerCase().includes(searchTerm.toLowerCase())
      ),
    };

    // ✅ Instead of reloading the whole map, just update the source
    if (map.current?.getSource("countries")) {
      (map.current.getSource("countries") as mapboxgl.GeoJSONSource).setData(
        filteredData
      );
    }
  };

  useEffect(() => {
    if (map.current) updateGeoJSONData();
  }, [searchTerm]); // ✅ Runs only when searchTerm changes

  const addDataLayers = async () => {
    const response = await fetch(
      "https://raw.githubusercontent.com/nvkelso/natural-earth-vector/master/geojson/ne_110m_admin_0_countries.geojson"
    );
    const countriesGeoJSON = await response.json();

    countriesGeoJSON.features.forEach((feature: any) => {
      const gdp = feature.properties.GDP_MD;
      const population = feature.properties.POP_EST;
      if (gdp && population && population > 0) {
        feature.properties.GDP_per_capita = (gdp * 1000) / population;
      }
    });

    if (map.current && map.current.isStyleLoaded()) {
      map.current.addSource("countries", {
        type: "geojson",
        data: countriesGeoJSON,
      });

      map.current.addLayer({
        id: "gdp-fill",
        type: "fill",
        source: "countries",
        paint: {
          "fill-color": [
            "interpolate",
            ["linear"],
            ["get", "GDP_MD"],
            0,
            "#f0f0f0",
            100000,
            "#ffffb2",
            1000000,
            "#fd8d3c",
            10000000,
            "#e31a1c",
          ],
          "fill-opacity": 0.7,
        },
      });

      map.current.addLayer({
        id: "population-fill",
        type: "fill",
        source: "countries",
        paint: {
          "fill-color": [
            "interpolate",
            ["linear"],
            ["get", "POP_EST"],
            0,
            "#f0f0f0",
            10000000,
            "#ffffb2",
            100000000,
            "#fd8d3c",
            1000000000,
            "#e31a1c",
          ],
          "fill-opacity": 0.7,
        },
      });

      map.current.addLayer({
        id: "gdpcapita-fill",
        type: "fill",
        source: "countries",
        paint: {
          "fill-color": [
            "interpolate",
            ["linear"],
            ["get", "GDP_per_capita"],
            0,
            "#f0f0f0",
            2,
            "#ffffb2",
            20,
            "#fd8d3c",
            50,
            "#e31a1c",
          ],
          "fill-opacity": 0.7,
        },
      });
    } else {
      console.error("Map style is not loaded yet");
    }
  };

  // ✅ Click event for displaying country information
  const setupClickEvents = () => {
    if (!map.current) return;

    const layers = ["gdp-fill", "population-fill", "gdpcapita-fill"];
    layers.forEach((layer) => {
      map.current.on("click", layer, (e) => {
        if (!map.current || !e.features || e.features.length === 0) return;

        const feature = e.features[0] as mapboxgl.MapboxGeoJSONFeature;
        const properties = feature.properties as {
          NAME?: string;
          GDP_MD?: number;
          POP_EST?: number;
          GDP_per_capita?: number;
        };

        const { NAME, GDP_MD, POP_EST, GDP_per_capita } = properties;

        // Close existing popup
        if (popupRef.current) {
          popupRef.current.remove();
        }

        // Create a new popup
        popupRef.current = new mapboxgl.Popup({ closeOnClick: true })
          .setLngLat(e.lngLat)
          .setHTML(
            `
             <div class="bg-white shadow-lg rounded-lg p-4 max-w-xs border-l-4 border-blue-500 animate-fade-in transition duration-1000 ease-in-out">

                <h3 class="text-lg font-semibold text-gray-800 mb-2">${NAME}</h3>
                <p class="text-sm text-gray-600"><strong>GDP:</strong> $${
                  GDP_MD ? (GDP_MD/1000000).toFixed(2).toLocaleString() : "N/A"
                } trillion USD</p>
                <p class="text-sm text-gray-600"><strong>Population:</strong> ${
                  POP_EST ? (POP_EST/1000000).toFixed(0).toLocaleString() : "N/A"
                } million</p>
                <p class="text-sm text-gray-600"><strong>GDP Per Capita:</strong> $${
                  GDP_per_capita ? GDP_per_capita.toFixed(2) : "N/A"
                }k</p>
              </div>
            `
          )
          .addTo(map.current);
      });
    });

    // ✅ Change cursor to pointer when hovering over a country
    map.current.on("mouseenter", "gdp-fill", () => {
      if (map.current) map.current.getCanvas().style.cursor = "pointer";
    });
    map.current.on("mouseenter", "population-fill", () => {
      if (map.current) map.current.getCanvas().style.cursor = "pointer";
    });
    map.current.on("mouseenter", "gdpcapita-fill", () => {
      if (map.current) map.current.getCanvas().style.cursor = "pointer";
    });

    map.current.on("mouseleave", "gdp-fill", () => {
      if (map.current) map.current.getCanvas().style.cursor = "";
    });
    map.current.on("mouseleave", "population-fill", () => {
      if (map.current) map.current.getCanvas().style.cursor = "";
    });
    map.current.on("mouseleave", "gdpcapita-fill", () => {
      if (map.current) map.current.getCanvas().style.cursor = "";
    });
  };

  const updateLayerVisibility = () => {
    if (!map.current || !map.current.isStyleLoaded()) return;

    map.current.setLayoutProperty("gdp-fill", "visibility", "none");
    map.current.setLayoutProperty("population-fill", "visibility", "none");
    map.current.setLayoutProperty("gdpcapita-fill", "visibility", "none");

    switch (gdpFilter) {
      case 0:
        map.current.setLayoutProperty("gdp-fill", "visibility", "visible");
        break;
      case 1000000000000:
        map.current.setLayoutProperty(
          "population-fill",
          "visibility",
          "visible"
        );
        break;
      case 3000000000000:
        map.current.setLayoutProperty(
          "gdpcapita-fill",
          "visibility",
          "visible"
        );
        break;
      default:
        break;
    }
  };

  useEffect(() => {
    const timeout = setTimeout(() => {
      updateLayerVisibility();
    }, 1000);

    return () => clearTimeout(timeout);
  }, [gdpFilter]);

  return (
    <div className="relative h-screen w-screen">
      {/* Map Container */}
      <div ref={mapContainer} className="absolute inset-0 h-full w-full" />

      {/* Filter/Search Overlay */}
      <div className="absolute bg-transparent top-0 p-4 flex gap-4 rounded-md z-10 w-full justify-between">
        <input
          type="text"
          placeholder="Search countries..."
          className="p-2 border rounded"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <select
          className="p-2 border rounded"
          value={gdpFilter}
          onChange={(e) => setGdpFilter(Number(e.target.value))}
        >
          <option value="0">GDP</option>
          <option value="1000000000000">Population</option>
          <option value="3000000000000">GDP Per Capita</option>
        </select>
      </div>
    </div>
  );
}
