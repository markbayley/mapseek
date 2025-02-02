"use client";

import { useEffect, useRef, useState } from "react";
import mapboxgl from "mapbox-gl";
import Search from "./Search";
import Legend from "./Legend";
import SelectCountry from "./SelectCountry";
import SelectOption from "./SelectOption";

mapboxgl.accessToken = process.env.NEXT_PUBLIC_MAPBOX_TOKEN || "";

interface MapComponentProps {
  searchTerm: string;
  gdpFilter: number;
}

export default function Map({}: MapComponentProps) {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const popupRef = useRef<mapboxgl.Popup | null>(null); // Store active popup

  const [searchTerm, setSearchTerm] = useState("");
  const [click, setClick] = useState("");
  const [countryOption, setCountryOption] = useState("");
  const [panelOpen, setPanelOpen] = useState(false);
  const [gdpFilter, setGdpFilter] = useState<number>(0);
  const [selectedEconomy, setSelectedEconomy] = useState<string | null>(null);
  const [selectedSociety, setSelectedSociety] = useState<string | null>(null);

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

        let hoveredPolygonId: string | number | null | undefined = null;

        map.current?.addSource("countries", {
          type: "vector",
          url: "mapbox://mapbox.country-boundaries-v1",
        });

        // The feature-state dependent fill-opacity expression will render the hover effect
        // when a feature's hover state is set to true.
        map.current?.addLayer({
          id: "country-fills",
          type: "fill",
          source: "countries",
          "source-layer": "country_boundaries",
          layout: {},
          paint: {
            //'fill-color': '#627BC1',
            "fill-opacity": [
              "case",
              ["boolean", ["feature-state", "hover"], false],
              0.3,
              0.1,
            ],
          },
        });

        map.current?.addLayer({
          id: "country-borders",
          type: "line",
          source: "countries",
          "source-layer": "country_boundaries",
          layout: {},
          paint: {
            "line-color": "#e0f2f1",
            "line-width": 0.5,
          },
        });

        map.current?.on("mousemove", "country-fills", (e) => {
          if (e.features.length > 0) {
            if (hoveredPolygonId !== null) {
              map.current?.setFeatureState(
                {
                  source: "countries",
                  sourceLayer: "country_boundaries",
                  id: hoveredPolygonId,
                },
                { hover: false }
              );
            }
            hoveredPolygonId = e.features[0].id;
            map.current?.setFeatureState(
              {
                source: "countries",
                sourceLayer: "country_boundaries",
                id: hoveredPolygonId,
              },
              { hover: true }
            );
          }
        });

        map.current?.on("mouseleave", "country-fills", () => {
          if (hoveredPolygonId !== null) {
            map.current?.setFeatureState(
              {
                source: "countries",
                sourceLayer: "country_boundaries",
                id: hoveredPolygonId,
              },
              { hover: false }
            );
          }
          hoveredPolygonId = null;
        });

        map.current?.setFog({
          color: "rgb(186, 210, 235)", // Lower atmosphere
          "high-color": "rgb(36, 92, 223)", // Upper atmosphere
          "horizon-blend": 0.001, // Atmosphere thickness
          "space-color": "rgb(11, 11, 25)", // Background color
          "star-intensity": 0.1, // Background star brightness
        });

         // At low zooms, complete a revolution every two minutes.
    const secondsPerRevolution = 120;
    // Above zoom level 5, do not rotate.
    const maxSpinZoom = 5;
    // Rotate at intermediate speeds between zoom levels 3 and 5.
    const slowSpinZoom = 3;

    let userInteracting = false;
    let spinEnabled = true;

    function spinGlobe() {
        const zoom = map.current?.getZoom();
        if (spinEnabled && !userInteracting && zoom < maxSpinZoom) {
            let distancePerSecond = 360 / secondsPerRevolution;
            if (zoom > slowSpinZoom) {
                // Slow spinning at higher zooms
                const zoomDif =
                    (maxSpinZoom - zoom) / (maxSpinZoom - slowSpinZoom);
                distancePerSecond *= zoomDif;
            }
            const center = map.current?.getCenter();
            center.lng -= distancePerSecond;
            // Smoothly animate the map over one second.
            // When this animation is complete, it calls a 'moveend' event.
            map.current?.easeTo({ center, duration: 1000, easing: (n) => n });
        }
    }

    // Pause spinning on interaction
    map.current?.on('mousedown', () => {
        userInteracting = true;
    });

    // Restart spinning the globe when interaction is complete
    map.current?.on('mouseup', () => {
        userInteracting = false;
        spinGlobe();
    });

    // These events account for cases where the mouse has moved
    // off the map, so 'mouseup' will not be fired.
    map.current?.on('dragend', () => {
        userInteracting = false;
        spinGlobe();
    });
    map.current?.on('pitchend', () => {
        userInteracting = false;
        spinGlobe();
    });
    map.current?.on('rotateend', () => {
        userInteracting = false;
        spinGlobe();
    });

    // When animation is complete, start spinning if there is no ongoing interaction
    map.current?.on('moveend', () => {
        spinGlobe();
    });

    document?.getElementById('btn-spin').addEventListener('click', (e) => {
        spinEnabled = !spinEnabled;
        if (spinEnabled) {
            spinGlobe();
            e.target.innerHTML = 'Pause rotation';
        } else {
            map.stop(); // Immediately end ongoing animation
            e.target.innerHTML = 'Start rotation';
        }
    });

    spinGlobe();






        setupClickEvents(); // Add country click event
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
      map.current.addSource("data", {
        type: "geojson",
        data: countriesGeoJSON,
      });

      map.current.addLayer({
        id: "gdp-fill",
        type: "fill",
        source: "data",
        // 'source-layer': 'country_boundaries',
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
        source: "data",
        //'source-layer': 'country_boundaries',
        paint: {
          "fill-color": [
            "interpolate",
            ["linear"],
            ["get", "POP_EST"],

            0,
            "#e0f2f1", // Light Emerald
            10000000,
            "#b2dfdb", // Soft Emerald
            100000000,
            "#4db6ac", // Emerald
            1000000000,
            "#e31a1c", // Dark Emerald
          ],
          "fill-opacity": 0.9,
        },
      });

      map.current.addLayer({
        id: "gdpcapita-fill",
        type: "fill",
        source: "data",
        // 'source-layer': 'country_boundaries',
        paint: {
          "fill-color": [
            "interpolate",
            ["linear"],
            ["get", "GDP_per_capita"],

            0,
            "#e0f7fa", // Light Blue
            2,
            "#b2ebf2", // Soft Blue
            20,
            "#4dd0e1", // Blue
            50,
            "#fd8d3c", // Dark Blue
          ],
          //"fill-opacity": 0.6,
        },
      });

      // Add other layers (population, GDP per capita) here...

      // Call updateLayerVisibility after the layers are added
      updateLayerVisibility();
    } else {
      console.error("Map style is not loaded yet");
    }
  };

  // Function to update layer visibility
  const updateLayerVisibility = () => {
    if (!map.current || !map.current.isStyleLoaded()) return;

    const layers = ["gdp-fill", "population-fill", "gdpcapita-fill"];
    layers.forEach((layer) => {
      if (map.current?.getLayer(layer)) {
        map.current?.setLayoutProperty(layer, "visibility", "none");
      }
    });

    switch (gdpFilter) {
      case 0:
        if (map.current.getLayer("gdp-fill")) {
          map.current.setLayoutProperty("gdp-fill", "visibility", "visible");
        }
        break;
      case 1000000000000:
        if (map.current.getLayer("population-fill")) {
          map.current.setLayoutProperty(
            "population-fill",
            "visibility",
            "visible"
          );
        }
        break;
      case 3000000000000:
        if (map.current.getLayer("gdpcapita-fill")) {
          map.current.setLayoutProperty(
            "gdpcapita-fill",
            "visibility",
            "visible"
          );
        }
        break;
      default:
        break;
    }
  };

  const setupClickEvents = async () => {
    if (!map.current) return;
  
    const layers = ["gdp-fill", "population-fill", "gdpcapita-fill"];
  
    // Mapping of continent names to the required format
    const continentMapping: { [key: string]: string } = {
      "South America": "south-america",
      "Northern America": "north-america",
      Caribbean: "central-america-n-caribbean",
      "Central America": "central-america-n-caribbean",
      "Australia and New Zealand": "australia-oceania",
      Melanesia: "australia-oceania",
      "South-Eastern Asia": "east-n-southeast-asia",
      "Eastern Asia": "east-n-southeast-asia",
      "Southern Asia": "south-asia",
      "Western Asia": "middle-east",
      "Central Asia": "central-asia",
      "Southern Europe": "europe",
      "Northern Europe": "europe",
      "Eastern Europe": "europe",
      "Western Europe": "europe",
      "Southern Africa": "africa",
      "Middle Africa": "africa",
      "Eastern Africa": "africa",
      "Western Africa": "africa",
      "Northern Africa": "africa",
    };
  
    // Single click handler for all layers
    const onLayerClick = async (e: mapboxgl.MapLayerMouseEvent) => {
      if (!map.current || !e.features?.length) return;
      
      const feature = e.features[0] as mapboxgl.MapboxGeoJSONFeature;
      const { NAME, GDP_MD, POP_EST, GDP_per_capita, FIPS_10, SUBREGION } =
        feature.properties || {};
  
      // Remove any existing popup
      if (popupRef.current) popupRef.current.remove();
  
      // Get continent key from mapping or fallback to lowercased SUBREGION
      const continentKey = SUBREGION
        ? continentMapping[SUBREGION] || SUBREGION.toLowerCase()
        : null;
      if (!continentKey) {
        console.error("Undefined continent key");
        return;
      }


  
      // Build the URL and fetch data
      const url = `https://raw.githubusercontent.com/factbook/factbook.json/refs/heads/master/${continentKey}/${FIPS_10?.toLowerCase()}.json`;
      console.log("url", url);
      const res = await fetch(url);
      const result = await res.json();

      const title =
        result["Government"]?.["Country name"]?.["conventional short form"]?.["text"] || "";

      setClick(title)  
  
      // Extract Economy data with optional chaining and fallback values
      const overview =
        result["Economy"]?.["Economic overview"]?.["text"] || "";
      const exports = result["Economy"]?.["Exports - commodities"]?.["text"] || "";
      const imports = result["Economy"]?.["Imports - commodities"]?.["text"] || "";
      const industries = result["Economy"]?.["Industries"]?.["text"] || "";
      const inflation =
        result["Economy"]?.["Inflation rate (consumer prices)"]?.[
          "Inflation rate (consumer prices) 2023"
        ]?.["text"] || "";
      const unemployment =
        result["Economy"]?.["Unemployment rate"]?.[
          "Unemployment rate 2023"
        ]?.["text"] || "";
  
      const introduction =
        result["Introduction"]?.["Background"]?.["text"] || "";
      const demographics =
        result["People and Society"]?.["Demographic profile"]?.["text"] ||
        introduction;
      const age = result["People and Society"]?.["Median age"]?.["total"]?.["text"] ||
        "";
      const lifeExpectancy =
        result["People and Society"]?.["Life expectancy at birth"]?.[
          "total population"
        ]?.["text"] || "";
      const urbanization =
        result["People and Society"]?.["Urbanization"]?.["urban population"]?.[
          "text"
        ] || "";
      const literacy =
        result["People and Society"]?.["Literacy"]?.["total population"]?.[
          "text"
        ] || "";
      const fertility =
        result["People and Society"]?.["Total fertility rate"]?.["text"] || "";
      const pop =
        result["People and Society"]?.["Population"]?.["total"]?.["text"] || "";
  
      // Create simplified JSX for Economy and Society info panels
      const infoEconomy = (
        <div className="bg-white shadow-lg rounded-lg p-4 max-w-xs border-l-4 border-emerald-500 animate-fade-in transition duration-300 ease-in-out">
          <h3 className="text-lg font-semibold text-gray-800">{NAME}</h3>
          <p className="text-xs font-semibold text-gray-500 mb-2">{SUBREGION}</p>
          <p className="text-sm text-gray-600">
            <strong>Overview:</strong> {overview}
          </p>
          <p className="text-sm text-gray-600">
            <strong>Industries:</strong> {industries}
          </p>
          <p className="text-sm text-gray-600">
            <strong>GDP:</strong>{" "}
            {GDP_MD ? (GDP_MD / 1000000).toFixed(2).toLocaleString() : "N/A"} trillion USD
          </p>
          <p className="text-sm text-gray-600">
            <strong>GDP Per Capita:</strong>{" "}
            {GDP_per_capita ? GDP_per_capita.toFixed(2) : "N/A"}k
          </p>
          <p className="text-sm text-gray-600">
            <strong>Exports:</strong> {exports}
          </p>
          <p className="text-sm text-gray-600">
            <strong>Imports:</strong> {imports}
          </p>
          <p className="text-sm text-gray-600">
            <strong>Inflation Rate:</strong> {inflation}
          </p>
          <p className="text-sm text-gray-600">
            <strong>Unemployment Rate:</strong> {unemployment}
          </p>
        </div>
      );
  
      const infoSociety = (
        <div className="bg-white shadow-lg rounded-lg p-4 max-w-xs border-l-4 border-emerald-500 animate-fade-in transition duration-300 ease-in-out">
          <h3 className="text-lg font-semibold text-gray-800">{NAME}</h3>
          <p className="text-xs font-semibold text-gray-500 mb-2">{SUBREGION}</p>
          <p className="text-sm text-gray-600">
            <strong>Population:</strong> {pop}
          </p>
          <p className="text-sm text-gray-600">
            <strong>Life Expectancy:</strong> {lifeExpectancy}
          </p>
          <p className="text-sm text-gray-600">
            <strong>Median Age:</strong> {age}
          </p>
          <p className="text-sm text-gray-600">
            <strong>Demography:</strong> {demographics.substring(3, 700)}...
          </p>
          <p className="text-sm text-gray-600">
            <strong>Urbanization:</strong> {urbanization}
          </p>
          <p className="text-sm text-gray-600">
            <strong>Literacy:</strong> {literacy}
          </p>
          <p className="text-sm text-gray-600">
            <strong>Fertility Rate:</strong> {fertility}
          </p>
        </div>
      );
  
      // Set the state (assumes these state setters exist in your component)
      setSelectedEconomy(infoEconomy);
      setSelectedSociety(infoSociety);
      setCountryOption(title)
      setPanelOpen(true)
      
    
    };
  
    // Attach click and pointer events to each layer
    layers.forEach((layer) => {
      map.current?.on("click", layer, onLayerClick);
      
      map.current?.on("mouseenter", layer, () => {
        if (map.current) map.current.getCanvas().style.cursor = "pointer";
      });
      map.current?.on("mouseleave", layer, () => {
        if (map.current) map.current.getCanvas().style.cursor = "";
      });
    });
  };
  

  useEffect(() => {
    const timeout = setTimeout(() => {
      updateLayerVisibility();
    }, 1000);

    return () => clearTimeout(timeout);
  }, [gdpFilter]);



  console.log("countryOption", countryOption)

  return (
    <div className="relative h-screen w-screen">
      {/* Map Container */}
      <div ref={mapContainer} className="absolute inset-0 h-full w-full " />
      <button id="btn-spin">Pause rotation</button>
      <Legend map={map} />
      {panelOpen ?
      <SelectOption
        gdpFilter={gdpFilter}
        selectedEconomy={selectedEconomy}
        selectedSociety={selectedSociety}
       
      />
      : ""}

      <div className="absolute bg-transparent top-0 p-4 flex gap-4 rounded-md z-10 w-full justify-between">
        <Search
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          map={map}
        />
        <SelectCountry
        countryOption={countryOption}
          map={map}
          gdpFilter={gdpFilter}
          setGdpFilter={setGdpFilter}
          setPanelOpen={setPanelOpen}
          panelOpen={panelOpen}
          setCountryOption={setCountryOption}
        />
      </div>
    </div>
  );
}
