"use client";

import { useEffect, useRef, useState } from "react";
import mapboxgl from "mapbox-gl";
import Search from "./Search";
import Legend from "./Legend";
import Dropdowns from "./Dropdowns";
import InfoPanel from "./InfoPanel";
import useMapSpin from "./usMapSpin";
import { truncate } from "node:fs";

mapboxgl.accessToken = process.env.NEXT_PUBLIC_MAPBOX_TOKEN || "";

interface MapComponentProps {
  searchTerm: string;
  gdpFilter: number;
}

export default function Map({}: MapComponentProps) {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const [spinEnabled, setSpinEnabled] = useState(false);
  const popupRef = useRef<mapboxgl.Popup | null>(null); // Store active popup
  const [searchTerm, setSearchTerm] = useState("");
  const [click, setClick] = useState("");
  const [countryOption, setCountryOption] = useState("");
  const [panelOpen, setPanelOpen] = useState(false);
  const [gdpFilter, setGdpFilter] = useState<number>(0);
  const [selectedEconomy, setSelectedEconomy] = useState<string | null>(null);
  const [selectedSociety, setSelectedSociety] = useState<string | null>(null);
  const [selectedGovernment, setSelectedGovernment] = useState<string | null>(
    null
  );
  const [exportPartners, setExportPartners] = useState<string | null>(null);
  const [importPartners, setImportPartners] = useState<string | null>(null);
  const [subFilter, setSubFilter] = useState("");
  const [highlightedCountryId, setHighlightedCountryId] = useState<
    string | null
  >(null);

  useMapSpin(map, spinEnabled);
  const handleSpinButtonClick = () => {
    setSpinEnabled((prev) => !prev); // Toggle spinning state
  };

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

        setSpinEnabled(true);
        setupClickEvents();
        //setupHoverEvents();
        updateLayerVisibility();
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

  // const setupHoverEvents = () => {
  //   let hoveredPolygonId: string | null = null;

  //   map.current?.on("mousemove", "country-fills", (e) => {
  //     if (e.features.length > 0) {
  //       if (hoveredPolygonId !== null) {
  //         map.current.setFeatureState(
  //           { source: "data", id: hoveredPolygonId },
  //           { hover: false }
  //         );
  //       }
  //       hoveredPolygonId = e.features[0].id;
  //       map.current.setFeatureState(
  //         { source: "data", id: hoveredPolygonId },
  //         { hover: true }
  //       );
  //     } else {
  //       // Reset if no features are found
  //       if (hoveredPolygonId !== null) {
  //         map.current.setFeatureState(
  //           { source: "data", id: hoveredPolygonId },
  //           { hover: false }
  //         );
  //         hoveredPolygonId = null;
  //       }
  //     }
  //   });

  //   map.current.on("mouseleave", "country-fills", () => {
  //     if (hoveredPolygonId !== null) {
  //       map.current.setFeatureState(
  //         { source: "data", id: hoveredPolygonId },
  //         { hover: false }
  //       );
  //     }
  //     hoveredPolygonId = null;
  //   });
  // };

  //  const handleMouseMove = (e) => {
  //     if (e.features.length > 0) {
  //         const clickedCountryId = e.features[0].id; // Adjust based on your feature structure

  //         if (highlightedCountryId === clickedCountryId) {
  //             // If the clicked country is already highlighted, unhighlight it
  //             map.current?.setFeatureState(
  //                 {
  //                     source: "countries",
  //                     sourceLayer: "country_boundaries",
  //                     id: highlightedCountryId,
  //                 },
  //                 { click: false } // Set to false for unhighlighting
  //             );
  //             setHighlightedCountryId(null); // Reset the state
  //         } else {
  //             // Unhighlight the previously highlighted country
  //             if (highlightedCountryId) {
  //                 map.current?.setFeatureState(
  //                     {
  //                         source: "countries",
  //                         sourceLayer: "country_boundaries",
  //                         id: highlightedCountryId,
  //                     },
  //                     { click: false }
  //                 );
  //             }
  //             // Highlight the newly clicked country
  //             map.current?.setFeatureState(
  //                 {
  //                     source: "countries",
  //                     sourceLayer: "country_boundaries",
  //                     id: clickedCountryId,
  //                 },
  //                 { click: true }
  //             );
  //             setHighlightedCountryId(clickedCountryId); // Update the state
  //         }
  //     }
  // };

  //  map.current?.on("mousemove", "country-fills", handleMouseMove);
  // map.current?.off("mousemove", "country-fills", handleMouseMove);

  useEffect(() => {
    const handleClick = (e) => {
      if (e.features.length > 0) {
        const clickedCountryId = e.features[0].id; // Adjust based on your feature structure
console.log("EEE", e.features)
        if (highlightedCountryId === clickedCountryId) {
          // If the clicked country is already highlighted, unhighlight it
          if (map.current?.getLayer("export-fill")) {
            map.current.removeLayer("export-fill");
          }
          if (map.current?.getLayer("import-fill")) {
            map.current.removeLayer("import-fill")
          }
          setPanelOpen(false)
          map.current?.setFeatureState(
            {
              source: "countries",
              sourceLayer: "country_boundaries",
              id: highlightedCountryId,
            },
            { click: false } // Set to false for unhighlighting
          );
          setHighlightedCountryId(null); // Reset the state
        } else {
          // Unhighlight the previously highlighted country
      
          if (highlightedCountryId) {
          
            map.current?.setFeatureState(
              {
                source: "countries",
                sourceLayer: "country_boundaries",
                id: highlightedCountryId,
              },
              { click: false }
            );
          }
          // Highlight the newly clicked country
          
          map.current?.setFeatureState(
            {
              source: "countries",
              sourceLayer: "country_boundaries",
              id: clickedCountryId,
            },
            { click: true }
          );
          setHighlightedCountryId(clickedCountryId); // Update the state
          setPanelOpen(true);
          if (map.current?.getLayer("export-fill")) {
            map.current.removeLayer("export-fill");
            setSubFilter("default");
          }
          if (map.current?.getLayer("import-fill")) {
            map.current.removeLayer("import-fill");
            setSubFilter("default");
          }
        }
      }
    };

    map.current?.on("click", "country-fills", handleClick);

    // Cleanup function to remove event listeners
    return () => {
      map.current?.off("click", "country-fills", handleClick);
    };
  }, [highlightedCountryId]); // Dependency array ensures effect runs when highlightedCountryId changes

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
    // console.log("E", e.features)
      const feature = e.features[0] as mapboxgl.MapboxGeoJSONFeature;
      const { NAME, GDP_MD, POP_EST, GDP_per_capita, FIPS_10, SUBREGION, REGION_UN } =
        feature.properties || {};

      // Remove any existing popup
      if (popupRef.current) popupRef.current.remove();

      // Get continent key from mapping or fallback to lowercased SUBREGION
      const continentKey =
        FIPS_10 == "MX"
          ? "north-america"
          : FIPS_10 == "RS"
          ? "central-asia"
          : FIPS_10 == "IR"
          ? "middle-east"
          : SUBREGION
          ? continentMapping[SUBREGION] || SUBREGION.toLowerCase()
          : null;
      if (!continentKey) {
        console.error("Undefined continent key");
        return;
      }

      const countryCode = 
         FIPS_10 == "-99"
         ? "NO"
         : FIPS_10

      // Build the URL and fetch data
      const url = `https://raw.githubusercontent.com/factbook/factbook.json/refs/heads/master/${continentKey}/${countryCode?.toLowerCase()}.json`;
      console.log("url", url);
      const res = await fetch(url);
      const result = await res.json();

      const title =
        result["Government"]?.["Country name"]?.["conventional short form"]?.[
          "text"
        ] || "";

      const overview = result["Economy"]?.["Economic overview"]?.["text"] || "";
      const exports =
        result["Economy"]?.["Exports - commodities"]?.["text"] || "";
      const exportsPartners =
        result["Economy"]?.["Exports - partners"]?.["text"] || "";
      setExportPartners(exportsPartners);

      const imports =
        result["Economy"]?.["Imports - commodities"]?.["text"] || "";
      const importsPartners =
        result["Economy"]?.["Imports - partners"]?.["text"] || "";
      setImportPartners(importsPartners);
      const industries = result["Economy"]?.["Industries"]?.["text"] || "";
      const inflation =
        result["Economy"]?.["Inflation rate (consumer prices)"]?.[
          "Inflation rate (consumer prices) 2023"
        ]?.["text"] || "";
      const unemployment =
        result["Economy"]?.["Unemployment rate"]?.["Unemployment rate 2023"]?.[
          "text"
        ] || "";
      const debt =
        result["Economy"]?.["Public debt"]?.["Public debt 2023"]?.["text"] ||
        "";

      const introduction =
        result["Introduction"]?.["Background"]?.["text"] || "";
      const demographics =
        result["People and Society"]?.["Demographic profile"]?.["text"] ||
        introduction;
      const age =
        result["People and Society"]?.["Median age"]?.["total"]?.["text"] || "";
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

      const govt = result["Government"]?.["Government type"]?.["text"] || "";
      const parties =
        result["Government"]?.["Political parties"]?.["text"] || "";
      const capital =
        result["Government"]?.["Capital"]?.["name"]?.["text"] || "";

      const infoEconomy = (
        <div className="bg-white shadow-lg rounded-lg p-4 max-w-xs border-l-4 border-amber-500 animate-fade-in transition duration-300 ease-in-out">
          <div className="flex justify-between">
            <h3 className="text-lg font-semibold text-gray-800">{NAME}</h3>
            <button
              onClick={() => setPanelOpen(false)}
              className="text-gray-600 rounded-full flex items-center justify-center w-5 h-5 text-md "
            >
              x
            </button>
          </div>
          <p className="text-xs font-semibold text-gray-500 mb-2">
            {SUBREGION}
          </p>
          <p className="text-sm text-gray-600">
            <strong>Economic Overview:</strong> {overview}
          </p>
          <p className="text-sm text-gray-600">
            <strong>Industries:</strong> {industries.substring(0, 100)}
          </p>
          <p className="text-sm text-gray-600">
            <strong>GDP:</strong>{" "}
            {GDP_MD ? (GDP_MD / 1000000).toFixed(2).toLocaleString() : "N/A"}{" "}
            trillion USD
          </p>
          <p className="text-sm text-gray-600">
            <strong>GDP Per Capita:</strong>{" "}
            {GDP_per_capita ? GDP_per_capita.toFixed(2) : "N/A"}k
          </p>
          <p
            className={
              subFilter == "exports"
                ? "text-sm text-red-600"
                : "text-sm text-gray-600"
            }
          >
            <strong>Exports:</strong> {exports}
          </p>
          <p className="text-sm text-gray-600">
            <strong>Exports Partners:</strong> {exportsPartners}
          </p>

          <p className="text-sm text-gray-600">
            <strong>Imports:</strong> {imports}
          </p>
          <p className="text-sm text-gray-600">
            <strong>Imports Partners:</strong> {importsPartners}
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
          <div className="flex justify-between">
            <h3 className="text-lg font-semibold text-gray-800">{NAME}</h3>
            <button
              onClick={() => setPanelOpen(false)}
              className="text-gray-600 rounded-full flex items-center justify-center w-5 h-5 text-md "
            >
              x
            </button>
          </div>
          <p className="text-xs font-semibold text-gray-500 mb-2">
            {SUBREGION}
          </p>
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

      const infoGovernment = (
        <div className="bg-white shadow-lg rounded-lg p-4 max-w-xs border-l-4 border-emerald-500 animate-fade-in transition duration-300 ease-in-out">
          <div className="flex justify-between">
            <h3 className="text-lg font-semibold text-gray-800">{NAME}</h3>
            <button
              onClick={() => setPanelOpen(false)}
              className="text-gray-600 rounded-full flex items-center justify-center w-5 h-5 text-md hover:bg-amber-500"
            >
              x
            </button>
          </div>
          <p className="text-xs font-semibold text-gray-500 mb-2">
            {SUBREGION}
          </p>
          <p className="text-sm text-gray-600">
            <strong>Capital:</strong> {capital}
          </p>
          <p className="text-sm text-gray-600">
            <strong>Govt. Type:</strong> {govt}
          </p>

          <p className="text-sm text-gray-600">
            <strong>Political Overview:</strong> {parties.substring(0, 700)}...
          </p>
          <p className="text-sm text-gray-600">
            <strong>Public Debt:</strong> {debt}
          </p>
        </div>
      );

      setSelectedEconomy(infoEconomy);
      setSelectedSociety(infoSociety);
      setSelectedGovernment(infoGovernment);
      setClick(title);
      setCountryOption(title);
    
    };

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

  const addDataLayers = async () => {
    try {
      const response = await fetch(
        "https://raw.githubusercontent.com/nvkelso/natural-earth-vector/master/geojson/ne_110m_admin_0_countries.geojson"
      );
      const countriesGeoJSON = await response.json();

      countriesGeoJSON.features.forEach((feature) => {
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

        const govtLayer = {
          id: "gdpcapita-fill",
          type: "fill",
          source: "data",
          paint: {
              "fill-color": [
                  "case",
                  ["==", ["get", "SUBREGION"], "Central Asia"], "#ed5151", // Color for Asia
                  ["==", ["get", "SUBREGION"], "Western Asia"], "#9e559c", // Color for Americas
                  ["==", ["get", "SUBREGION"], "Southern Asia"], "#a7c636", // Color for Africa
                  ["==", ["get", "SUBREGION"], "Eastern Asia"], "#9e559c", // Color for Oceania
                  ["==", ["get", "SUBREGION"], "South-Eastern Asia"], "#ed5151", // Color for Oceania

                  ["==", ["get", "SUBREGION"], "Middle Africa"], "#9e559c", // Color for Asia
                  ["==", ["get", "SUBREGION"], "Western Africa"], "#a7c636", // Color for Americas
                  ["==", ["get", "SUBREGION"], "Southern Africa"], "#a7c636", // Color for Africa
                  ["==", ["get", "SUBREGION"], "Eastern Africa"], "#fc921f", // Color for Oceania
                  ["==", ["get", "SUBREGION"], "Northern Africa"], "#ed5151", // Color for Africa

              
                  ["==", ["get", "SUBREGION"], "Western Europe"], "#9e559c", // Color for Americas
                  ["==", ["get", "SUBREGION"], "Southern Europe"], "#a7c636", // Color for Africa
                  ["==", ["get", "SUBREGION"], "Eastern Europe"], "#fc921f", // Color for Oceania
                  ["==", ["get", "SUBREGION"], "Northern Europe"], "#ed5151", // Color for Oceania

                  ["==", ["get", "SUBREGION"], "Central America"], "#9e559c", // Color for Americas
                  ["==", ["get", "SUBREGION"], "South America"], "#a7c636", // Color for Africa
                  ["==", ["get", "SUBREGION"], "Caribbean"], "#fc921f", // Color for Oceania
                  ["==", ["get", "SUBREGION"], "Northern America"], "#ed5151", // Color for Oceania

                  ["==", ["get", "SUBREGION"], "Australia and New Zealand"], "#fc921f", // Color for Oceania
                  ["==", ["get", "SUBREGION"], "Melanesia"], "#ed5151", // Color for Oceania
                 
                  "#Ffffff" // Default color (white or any fallback color)
              ],
              "fill-opacity": 1,
          },
      };

        const populationLayer = {
          id: "population-fill",
          type: "fill",
          source: "data",
          paint: {
            "fill-color": [
              "interpolate",
              ["linear"],
              ["get", "POP_EST"],
              0,
              "#D1D5DB",
              10000000,
              "#FBBF24",
              100000000,
              "#F97316",
              1000000000,
              "#dc2626",
            ],
            "fill-opacity": 1,
          },
        };

        const gdpLayer = {
          id: "gdp-fill",
          type: "fill",
          source: "data",
          paint: {
            "fill-color": [
              "interpolate",
              ["linear"],
              ["get", "GDP_MD"],
              0,
              "#D1D5DB",
              100000,
              "#FBBF24",
              1000000,
              "#F97316",
              10000000,
              "#dc2626",
            ],
            "fill-opacity": 1,
          },
        };

        map.current.addLayer(govtLayer);
        map.current.addLayer(populationLayer);
        map.current.addLayer(gdpLayer);

        map.current?.setFog({
          color: "rgb(186, 210, 235)", // Lower atmosphere
          "high-color": "rgb(36, 92, 223)", // Upper atmosphere
          "horizon-blend": 0.001, // Atmosphere thickness
          "space-color": "rgb(11, 11, 25)", // Background color
          "star-intensity": 0.1, // Background star brightness
        });

        map.current?.addSource("countries", {
          type: "vector",
          url: "mapbox://mapbox.country-boundaries-v1",
        });

        const exportLayer = {
          id: "export-fill",
          type: "fill",
          source: "countries",
          "source-layer": "country_boundaries",
          layout: {},
          paint: {
            "fill-color": "#14B8A6",
            //"line-width": 0.5,
            "fill-opacity": 1,
          },
        };

        const importLayer = {
          id: "import-fill",
          type: "fill",
          source: "countries",
          "source-layer": "country_boundaries",
          paint: {
            "fill-color": "#8B5CF6",
            "fill-opacity": 1,
          },
        };

        // map.current.countryLayer = countryLayer;

        map.current.exportLayer = exportLayer;
        map.current.importLayer = importLayer;

        map.current?.addLayer({
          id: "country-fills",
          type: "fill",
          source: "countries",
          "source-layer": "country_boundaries",
          layout: {},
          paint: {
            "fill-color": "#000",
            // 'line-width': 1,
            "fill-opacity": [
              "case",
              ["boolean", ["feature-state", "click"], false],
              0.7,
              0,
            ],
          },
        });

        // let hoveredPolygonId: string | null = null;

        // map.current?.on("mousemove", "highlight", (e) => {
        //   if (e.features.length > 0) {
        //     if (hoveredPolygonId !== null) {
        //       map.current.setFeatureState(
        //         { source: "data", id: hoveredPolygonId },
        //         { hover: false }
        //       );
        //     }
        //     hoveredPolygonId = e.features[0].id;
        //     map.current.setFeatureState(
        //       { source: "data", id: hoveredPolygonId },
        //       { hover: true }
        //     );
        //   } else {
        //     // Reset if no features are found
        //     if (hoveredPolygonId !== null) {
        //       map.current.setFeatureState(
        //         { source: "data", id: hoveredPolygonId },
        //         { hover: false }
        //       );
        //       hoveredPolygonId = null;
        //     }
        //   }
        // });

        // map.current.on("mouseleave", "highlight", () => {
        //   if (hoveredPolygonId !== null) {
        //     map.current.setFeatureState(
        //       { source: "data", id: hoveredPolygonId },
        //       { hover: false }
        //     );
        //   }
        //   hoveredPolygonId = null;
        // });

        updateLayerVisibility();
      } else {
        console.error("Map style is not loaded yet");
      }
    } catch (error) {
      console.error("Error fetching or processing GeoJSON data:", error);
    }
  };

  const updateLayerVisibility = () => {
    if (!map.current || !map.current.isStyleLoaded()) return;

    const layers = ["gdp-fill", "population-fill", "gdpcapita-fill"];
    layers.forEach((layer) => {
      if (map.current?.getLayer(layer)) {
        map.current?.setLayoutProperty(layer, "visibility", "none");
      }
    });

    if (map.current.getLayer("export-fill")) {
      map.current.removeLayer("export-fill");
    }
    if (map.current.getLayer("import-fill")) {
      map.current.removeLayer("import-fill");
    }

    switch (gdpFilter) {
      case 0:
        if (map.current.getLayer("gdp-fill")) {
          showLegend("gdp");

          map.current.setLayoutProperty("gdp-fill", "visibility", "visible");
        }
        break;
      case 1000000000000:
        if (map.current.getLayer("population-fill")) {
          showLegend("population");

          map.current.setLayoutProperty(
            "population-fill",
            "visibility",
            "visible"
          );
        }
        break;
      case 3000000000000:
        if (map.current.getLayer("gdpcapita-fill")) {
          showLegend("gdp-capita");

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

  const showLegend = (layer: string) => {
    // Hide all legends first
    document.getElementById("gdp-legend").style.display = "none";
    document.getElementById("population-legend").style.display = "none";
    document.getElementById("gdp-capita-legend").style.display = "none";

    // Show the selected legend
    if (layer === "gdp") {
      document.getElementById("gdp-legend").style.display = "block";
    } else if (layer === "population") {
      document.getElementById("population-legend").style.display = "block";
    } else if (layer === "gdp-capita") {
      console.log("GDPCAP", layer);
      document.getElementById("gdp-capita-legend").style.display = "block";
    } else return;

    // Add click events to show legends
    map.current?.on("click", "gdp-fill", () => showLegend("gdp"));
    map.current?.on("click", "population-fill", () => showLegend("population"));
    map.current?.on("click", "gdpcapita-fill", () => showLegend("gdp-capita"));
  };

  useEffect(() => {
    const timeout = setTimeout(() => {
      updateLayerVisibility();
    }, 1000);

    return () => clearTimeout(timeout);
  }, [gdpFilter]);

  useEffect(() => {
    setCountryOption(click);
  }, [countryOption]);

  const highlightExportPartners = (
    event: React.ChangeEvent<HTMLSelectElement>
  ) => {
    const selectedValue = event.target.value;
    setSubFilter(selectedValue);

    const parseExportPartners = (exports: string): string[] => {
      const countryNameMapping: Record<string, string> = {
        Afghanistan: "افغانستان",
        Albania: "Shqipëri",
        Algeria: "الجزائر",
        Andorra: "Andorra",
        Angola: "Angola",
        "Antigua and Barbuda": "Antigua e Barbuda",
        Argentina: "Argentina",
        Armenia: "Հայաստան",
        Australia: "Australia",
        Austria: "Österreich",
        Azerbaijan: "Azərbaycan",
        Bahamas: "The Bahamas",
        Bahrain: "البحرين",
        Bangladesh: "বাংলাদেশ",
        Barbados: "Barbados",
        Belarus: "Беларусь",
        Belgium: "België",
        Belize: "Belize",
        Benin: "Bénin",
        Bhutan: "འབྲུག",
        Bolivia: "Bolivia",
        "Bosnia and Herzegovina": "Bosna i Hercegovina",
        Botswana: "Botswana",
        Brazil: "Brasil",
        Brunei: "Brunei",
        Bulgaria: "България",
        "Burkina Faso": "Burkina Faso",
        Burundi: "Burundi",
        "Cabo Verde": "Cabo Verde",
        Cambodia: "កម្ពុជា",
        Cameroon: "Cameroun",
        Canada: "Canada",
        "Central African Republic": "République centrafricaine",
        Chad: "Tchad",
        Chile: "Chile",
        China: "中国",
        Colombia: "Colombia",
        Comoros: "جزر القمر",
        "Congo, Democratic Republic of the": "République démocratique du Congo",
        "Congo, Republic of the": "Congo",
        "Costa Rica": "Costa Rica",
        Croatia: "Hrvatska",
        Cuba: "Cuba",
        Cyprus: "Κύπρος",
        Czechia: "Česká republika",
        Denmark: "Danmark",
        Djibouti: "Djibouti",
        Dominica: "Dominica",
        "Dominican Republic": "República Dominicana",
        Ecuador: "Ecuador",
        Egypt: "مصر",
        "El Salvador": "El Salvador",
        "Equatorial Guinea": "Guinea Ecuatorial",
        Eritrea: "إريتريا",
        Estonia: "Eesti",
        Eswatini: "eSwatini",
        Ethiopia: "ኢትዮጵያ",
        Fiji: "Fiji",
        Finland: "Suomi",
        France: "France",
        Gabon: "Gabon",
        Gambia: "The Gambia",
        Georgia: "საქართველო",
        Germany: "Deutschland",
        Ghana: "Ghana",
        Greece: "Ελλάδα",
        Grenada: "Grenada",
        Guatemala: "Guatemala",
        Guinea: "Guinée",
        "Guinea-Bissau": "Guiné-Bissau",
        Guyana: "Guyana",
        Haiti: "Haïti",
        Honduras: "Honduras",
        Hungary: "Magyarország",
        Iceland: "Ísland",
        India: "India",
        Indonesia: "Indonesia",
        Iran: "ایران",
        Iraq: "العراق",
        Ireland: "Éire",
        Israel: "ישראל",
        Italy: "Italia",
        Jamaica: "Jamaica",
        Japan: "日本",
        Jordan: "الأردن",
        Kazakhstan: "Қазақстан",
        Kenya: "Kenya",
        Kiribati: "Kiribati",
        Kuwait: "الكويت",
        Kyrgyzstan: "Кыргызстан",
        Laos: "ປະເທດລາວ",
        Latvia: "Latvija",
        Lebanon: "لبنان",
        Lesotho: "Lesotho",
        Liberia: "Liberia",
        Libya: "ليبيا",
        Liechtenstein: "Liechtenstein",
        Lithuania: "Lietuva",
        Luxembourg: "Luxembourg",
        Madagascar: "Madagasikara",
        Malawi: "Malawi",
        Malaysia: "Malaysia",
        Maldives: "Maldives",
        Mali: "Mali",
        Malta: "Malta",
        "Marshall Islands": "Mărșal Insule",
        Mauritania: "مورتانيا",
        Mauritius: "Maurice",
        Mexico: "México",
        Micronesia: "Micronesia",
        Moldova: "Moldova",
        Monaco: "Monaco",
        Mongolia: "Монгол",
        Montenegro: "Crna Gora",
        Morocco: "المغرب",
        Mozambique: "Moçambique",
        Myanmar: "မြန်မာ",
        Namibia: "Namibia",
        Nauru: "Nauru",
        Nepal: "नेपाल",
        Netherlands: "Nederland",
        NZ: "New Zealand",
        Nicaragua: "Nicaragua",
        Niger: "Niger",
        Nigeria: "Nigeria",
        "North Korea": "조선 민주주의 인민 공화국",
        "North Macedonia": "Северна Македонија",
        Norway: "Norge",
        Oman: "عمان",
        Pakistan: "پاکستان",
        Palau: "Belau",
        Palestine: "فلسطين",
        Panama: "Panamá",
        "Papua New Guinea": "Papua Niugini",
        Paraguay: "Paraguay",
        Peru: "Perú",
        Philippines: "Pilipinas",
        Poland: "Polska",
        Portugal: "Portugal",
        Qatar: "قطر",
        Romania: "România",
        Russia: "Россия",
        Rwanda: "Rwanda",
        "Saint Kitts and Nevis": "Saint Kitts and Nevis",
        "Saint Lucia": "Saint Lucia",
        "Saint Vincent and the Grenadines": "Saint Vincent and the Grenadines",
        Samoa: "Sāmoa",
        "San Marino": "San Marino",
        "Saudi Arabia": "السعودية",
        Senegal: "Sénégal",
        Serbia: "Србија",
        Seychelles: "Seychelles",
        "Sierra Leone": "Sierra Leone",
        Singapore: "Singapore",
        Slovakia: "Slovensko",
        Slovenia: "Slovenija",
        "Solomon Islands": "Solomon Islands",
        Somalia: "Soomaaliya",
        "South Africa": "South Africa",
        "South Korea": "대한민국",
        "South Sudan": "جنوب السودان",
        Spain: "España",
        "Sri Lanka": "ශ්‍රී ලංකාව",
        Sudan: "السودان",
        Suriname: "Suriname",
        Sweden: "Sverige",
        Switzerland: "Switzerland",
        Syria: "سوريا",
        Taiwan: "臺灣",
        Tajikistan: "Тоҷикистон",
        Tanzania: "Tanzania",
        Thailand: "ประเทศไทย",
        Togo: "Togo",
        Tonga: "Tonga",
        "Trinidad and Tobago": "Trinidad and Tobago",
        Tunisia: "تونس",
        Turkey: "Türkiye",
        Turkmenistan: "Türkmenistan",
        Tuvalu: "Tuvalu",
        Uganda: "Uganda",
        Ukraine: "Україна",
        UAE: "الإمارات العربية المتحدة",
        UK: "United Kingdom",
        US: "United States",
        Uruguay: "Uruguay",
        Uzbekistan: "Oʻzbekiston",
        Vanuatu: "Vanuatu",
        "Vatican City": "Città del Vaticano",
        Venezuela: "Venezuela",
        Vietnam: "Việt Nam",
        Yemen: "اليمن",
        Zambia: "Zambia",
        Zimbabwe: "Zimbabwe",
      };
      return exports
        .split(",")
        .map((country) => {
          const countryName = country.split(/\s*\d+%/)[0].trim();
          return countryNameMapping[countryName] || countryName; // Map to the correct name or return the original
        })
        .filter(Boolean);
    };

    if (map.current) {
      if (selectedValue === "exports") {
        // Show the export-fill layer
        if (!map.current.getLayer("export-fill")) {
          map.current.addLayer(map.current.exportLayer);
          // Call the function to highlight export partners here
          const partners = parseExportPartners(exportPartners);
          if (!map.current || partners.length === 0) return;

          // Create a filter to highlight all partners
          const filter = [
            "any",
            ...partners.map((country) => ["==", "name", country]),
          ];

          console.log("Export Partners:", partners);
          console.log("Filter being applied EXPORTS:", filter);

          // Apply the filter to the country layer
          map.current.setFilter("export-fill", filter);
        }
        if (map.current.getLayer("import-fill")) {
          map.current.removeLayer("import-fill");
        }
      }

      // Remove the export-fill layer if it's currently added
      if (map.current.getLayer("import-fill")) {
        map.current.removeLayer("import-fill");
      }

      if (selectedValue === "imports") {
        // Show the export-fill layer
        if (!map.current.getLayer("import-fill")) {
          map.current.addLayer(map.current.importLayer);
          // Call the function to highlight export partners here
          const partners = parseExportPartners(importPartners);
          if (!map.current || partners.length === 0) return;

          // Create a filter to highlight all partners
          const filter = [
            "any",
            ...partners.map((country) => ["==", "name", country]),
          ];

          console.log("Import Partners:", partners);
          console.log("Filter being applied IMPORTS:", filter);

          // Apply the filter to the country layer
          map.current.setFilter("import-fill", filter);
        }

        if (map.current.getLayer("export-fill")) {
          map.current.removeLayer("export-fill");
        }
      }
      // Handle other options if necessary
      if (selectedValue === "default") {
        if (map.current.getLayer("export-fill")) {
          map.current.removeLayer("export-fill");
          //setSubFilter("default");
        }
        if (map.current.getLayer("import-fill")) {
          map.current.removeLayer("import-fill");
          // setSubFilter("default");
        }
      }
    }
  };

  return (
    <div className="relative h-screen w-screen">
      <div ref={mapContainer} className="absolute inset-0 h-full w-full " />

      <div className="relative h-screen w-screen">
        <div ref={mapContainer} className="absolute inset-0 h-full w-full" />
      </div>

      <div className="absolute bg-transparent top-0 p-4 flex gap-4 rounded-md z-10 w-full justify-between">
        <Search
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          map={map}
        />

        <Dropdowns
          countryOption={countryOption}
          map={map}
          gdpFilter={gdpFilter}
          setGdpFilter={setGdpFilter}
          setPanelOpen={setPanelOpen}
          panelOpen={panelOpen}
          setCountryOption={setCountryOption}
          //showLegend={showLegend}
          highlightExportPartners={highlightExportPartners}
          exportPartners={exportPartners}
          setSubFilter={setSubFilter}
          subFilter={subFilter}
          setHighlightedCountryId={setHighlightedCountryId}
          highlightedCountryId={highlightedCountryId}
        />
      </div>

      {panelOpen && (
        <InfoPanel
          gdpFilter={gdpFilter}
          selectedEconomy={selectedEconomy}
          selectedSociety={selectedSociety}
          selectedGovernment={selectedGovernment}
        />
      )}
      <Legend />

      <button
        id="btn-spin"
        onClick={handleSpinButtonClick}
        className="absolute bottom-6 right-4 bg-violet-800 text-white p-2 px-4 rounded-full"
      >
        {spinEnabled ? "Pause Rotation" : "Start Rotation"}
      </button>
    </div>
  );
}
