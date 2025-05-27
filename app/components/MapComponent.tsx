"use client";

import { useEffect, useRef, useState } from "react";
import mapboxgl from "mapbox-gl";
import Search from "./Search";
import Legend from "./Legend";
import Dropdowns from "./Dropdowns";
import InfoPanel from "./InfoPanel";
import useMapSpin from "./usMapSpin";
import { truncate } from "node:fs";
import ExportIcons from "./ExportIcons";
import ImportIcons from "./ImportIcons";
import { addReactIconsToMapbox } from '../utils/addReactIconsToMapbox';
import { FaOilCan, FaFire, FaIndustry, FaSeedling, FaGem, FaCar, FaShip, FaPlane, FaTruck, FaLaptop, FaMobile, FaTshirt, FaAppleAlt, FaGasPump, FaCoffee } from 'react-icons/fa';
import { FaOilWell, FaMicrochip, FaTowerBroadcast, FaGears, FaSheetPlastic } from 'react-icons/fa6';
import { LuMilk, LuBeef, LuBean } from 'react-icons/lu';
import { GiWoodPile, GiCorn, GiGoldMine, GiMedicines, GiDoubleFish, GiMetalBar, GiBeetleShell, GiTurbine, GiWireCoil, GiBowlOfRice, GiSugarCane, GiSheep, GiButter, GiBeerStein, GiCoconuts, GiBananaBunch, GiPearlNecklace, GiCigarette, GiRubberBoot, GiChemicalDrop, GiOre } from "react-icons/gi";
import { BsMinecartLoaded } from "react-icons/bs";
import { MdOilBarrel } from "react-icons/md";
import React from "react";
import * as turf from '@turf/turf'; // Import turf.js for functions
import type { Feature, Point } from 'geojson'; // Import turf types
import { GiMinerals, GiStoneBlock } from 'react-icons/gi';
import { TbHexagonLetterR, TbHexagonLetterM, TbHexagonLetterN, TbHexagonLetterC, TbHexagonLetterL } from 'react-icons/tb';
import { TbHexagonLetterU } from 'react-icons/tb';
import { useArcAnimation } from "../hooks/ArcAnimation";
import { useMineralOverlay } from "../hooks/useMineralOverlay";
import {
  topCopperProducers,
  topNickelProducers,
  topManganeseProducers,
  topLithiumProducers,
  topUraniumProducers,
  topREEProducers,
  topCoalProducers,
  topGasProducers,
  topPetroleumProducers,
  topCobaltProducers,
  topDiamondProducers,
  topGoldProducers,
  topAluminiumProducers,
  topIronOreProducers,
  topSilverProducers,
  formatProduction,
  formatCoal,
  formatGas,
  formatPetroleum,
  formatCobalt,
  formatDiamond,
  formatGold,
  formatAluminium,
  formatIronOre,
  formatSilver
} from "../utils/mineralOverlayData";
import { iconMap } from '../utils/iconMap';
import { exportChartColors, importChartColors } from '../utils/chartColors';
import { countryNameMapping } from '../utils/countryNameMapping';
import { FaGear } from 'react-icons/fa6';
import { IconType } from 'react-icons';
import { mineSites } from '../data/mineSites';
import {
  getAnimationContextKey,
  cancelAllAnimationFrames,
  cleanupAllAnimations,
  animate,
  generateArc,
  type AnimationContext
} from '../utils/animationUtils';
import { createCountryNameMapping } from '../utils/countryNameMappingUtils';
import {
  loadInflationData,
  loadUnemploymentData,
  addEconomicDataToFeatures,
  type EconomicData
} from '../utils/economicDataUtils';
import {
  normalizeCountryName,
  parseExportPartners,
  getCountryCoordinates,
  createCountryColorMapping,
  createCountryFilter,
  extractCoordinates,
  type CountryFeature
} from '../utils/countryDataUtils';
import {
  updateLayerVisibility,
  updateEconomicLayerVisibility,
  showLegend,
  addAllDataLayers,
  setMapFog,
  addCountriesSource,
  addLegendClickEvents,
  createExportLayer,
  createImportLayer,
  type LayerVisibilityConfig
} from '../utils/mapLayerUtils';

mapboxgl.accessToken = process.env.NEXT_PUBLIC_MAPBOX_TOKEN || "";

interface MapComponentProps {
  searchTerm: string;
  gdpFilter: number;
}





export default function Map({ }: MapComponentProps) {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const [spinEnabled, setSpinEnabled] = useState(false);
  const popupRef = useRef<mapboxgl.Popup | null>(null); // Store active popup
  const [searchTerm, setSearchTerm] = useState("");
  const [click, setClick] = useState("");
  const [countryOption, setCountryOption] = useState("");
  const [panelOpen, setPanelOpen] = useState(false);
  const [gdpFilter, setGdpFilter] = useState<number>(0);
  const [selectedEconomy, setSelectedEconomy] = useState<React.ReactNode | null>(null);
  const [selectedSociety, setSelectedSociety] = useState<React.ReactNode | null>(null);
  const [selectedGovernment, setSelectedGovernment] = useState<React.ReactNode | null>(null);
  const [exportPartners, setExportPartners] = useState<string | null>(null);
  const [importPartners, setImportPartners] = useState<string | null>(null);
  const [exports, setExports] = useState<string | null>(null);
  const [imports, setImports] = useState<string | null>(null);
  const [exportIcons, setExportIcons] = useState<Array<{ keyword: string; color: string }>>([]);
  const [importIcons, setImportIcons] = useState<Array<{ keyword: string; color: string }>>([]);
  const [selectedCountryCenter, setSelectedCountryCenter] = useState<[number, number] | null>(null);
  const [activeOverlays, setActiveOverlays] = useState<{ [key: string]: boolean }>({ exports: false, imports: false, Resources: false, Overview: true });
  const [infoPanelIcons, setInfoPanelIcons] = useState<Array<{ keyword: string; color: string }>>([]);
  const [highlightedCountryId, setHighlightedCountryId] = useState<
    string | null
  >(null);
  const [infoPanelIconElementsState, setInfoPanelIconElementsState] = useState<React.ReactNode>(null);
  const [mapZoom, setMapZoom] = useState(2); // default zoom
  const [countriesFeatures, setCountriesFeatures] = useState<CountryFeature[] | null>(null); // State to store GeoJSON features
  const [isCountriesDataReady, setIsCountriesDataReady] = useState(false); // State to indicate if country data is loaded
  // Now these are correctly inside the component
  const [animationPaused, setAnimationPaused] = useState(false);
  const animatedPointIds = useRef<Set<string>>(new Set()); // Track all active animated point IDs
  const currentAnimationContext = useRef<string>(''); // Track the current animation context (country+filter)
  const animationFrameIds = useRef<number[]>([]); // Track animation frame IDs for cancellation
  const [mapReady, setMapReady] = useState(false);

  // Create animation context object for the utilities
  const animationContext: AnimationContext = {
    animatedPointIds,
    currentAnimationContext,
    animationFrameIds
  };

  // Add state for active tab to control which economic layer is shown
  const [activeTab, setActiveTab] = useState<'inflation' | 'unemployment' | 'gdp'>('inflation');

  // Add state for inflation and unemployment data
  const [inflationData, setInflationData] = useState<EconomicData>({});
  const [unemploymentData, setUnemploymentData] = useState<EconomicData>({});





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
      console.log('[MapComponent] Initializing Mapbox map');
      // Listen for styledata to set mapReady
      map.current.on("styledata", () => {
        setMapReady(true);
      });

      map.current.on("load", async () => {
        await addDataLayers();
        setSpinEnabled(false);
        setupClickEvents();
        // Layer visibility is now handled in addDataLayers with a timeout
        // Do NOT set mapReady here, set it in styledata
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

  useEffect(() => {
    const handleClick = (e: mapboxgl.MapLayerMouseEvent) => {
      if (!e.features || e.features.length === 0) return;

      // Cancel all animation frames first
      cancelAllAnimationFrames(animationFrameIds);

      // Clean up previous animations
      cleanupAllAnimations(map, animationContext);

      const clickedCountryId = e.features[0].id; // Adjust based on your feature structure
      console.log("Country click detected:", clickedCountryId);

      // Get the country center coordinates with fallbacks and validation
      const coordinates = extractCoordinates(e.features[0], e);

      if (highlightedCountryId === clickedCountryId) {
        // If the clicked country is already highlighted, unhighlight it
        console.log("Unhighlighting current country");

        // Reset the animation context
        currentAnimationContext.current = '';

        if (map.current?.getLayer("export-fill")) {
          map.current.removeLayer("export-fill");
        }
        if (map.current?.getLayer("import-fill")) {
          map.current.removeLayer("import-fill");
        }

        // Force a thorough cleanup of all animations when deselecting a country
        cleanupAllAnimations(map, animationContext);

        setPanelOpen(false);
        if (highlightedCountryId) {
          map.current?.setFeatureState(
            {
              source: "countries",
              sourceLayer: "country_boundaries",
              id: highlightedCountryId,
            } as any, // Type cast to resolve type error
            { click: false } // Set to false for unhighlighting
          );
        }

        // Return to default view
        map.current?.flyTo({
          zoom: 2,
          //center: [20, 40], // Return to default center
          essential: true,
        });

        setHighlightedCountryId(null); // Reset the state
        setSpinEnabled(true);
        // Clear icon states when deselecting a country
        setExportIcons([]);
        setImportIcons([]);

      } else {
        // Switching to a new country or selecting a country for the first time
        console.log("Highlighting new country:", clickedCountryId);

        // Reset the animation context before updating it
        currentAnimationContext.current = '';

        // Force a thorough cleanup of all animations before switching to a new country
        cleanupAllAnimations(map, animationContext);

        // Unhighlight the previously highlighted country
        if (highlightedCountryId) {
          map.current?.setFeatureState(
            {
              source: "countries",
              sourceLayer: "country_boundaries",
              id: highlightedCountryId,
            } as any, // Type cast to resolve type error
            { click: false }
          );
        }

        // Highlight the newly clicked country
        if (clickedCountryId) {
          map.current?.setFeatureState(
            {
              source: "countries",
              sourceLayer: "country_boundaries",
              id: clickedCountryId,
            } as any, // Type cast to resolve type error
            { click: true }
          );

          setHighlightedCountryId(clickedCountryId as string); // Type cast since we validated it exists
          setSpinEnabled(false);
          setPanelOpen(true);

          // Center and zoom to the selected country
          map.current?.flyTo({
            center: coordinates,
            zoom: 4,
            essential: true,
          });

          // Store the selected country center for icon positioning
          setSelectedCountryCenter(coordinates);

          // Remove highlight layers if they exist
          if (map.current?.getLayer("export-fill")) {
            map.current.removeLayer("export-fill");
          }
          if (map.current?.getLayer("import-fill")) {
            map.current.removeLayer("import-fill");
          }

          // Clear previous icons to ensure fresh icons for the new country
          setExportIcons([]);
          setImportIcons([]);

          // Set the new animation context after a short delay to ensure state update is processed
          setTimeout(() => {
            const newContextKey = getAnimationContextKey(clickedCountryId as string, 'exports');
            console.log(`Setting new animation context from click handler: ${newContextKey}`);
            currentAnimationContext.current = newContextKey;
          }, 50);
        }
      }
    };

    map.current?.on("click", "country-fills", handleClick);

    // Cleanup function to remove event listeners
    return () => {
      map.current?.off("click", "country-fills", handleClick);
    };
  }, [highlightedCountryId]); // Add highlightedCountryId as dependency

  const setupClickEvents = async () => {
    if (!map.current) return;

    const layers = ["gdp-fill", "population-fill", "gdpcapita-fill", "inflation-fill", "unemployment-fill"];

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
      const {
        NAME,
        GDP_MD,
        POP_EST,
        GDP_per_capita,
        FIPS_10,
        SUBREGION,
        REGION_UN,
        LABEL_X,
        LABEL_Y,
      } = feature.properties || {};
      console.log("E", e.features);


      console.log("population", POP_EST);


      // Remove any existing popup
      if (popupRef.current) popupRef.current.remove();

      // Get and validate coordinates
      let lng = parseFloat(LABEL_X);
      let lat = parseFloat(LABEL_Y);

      // If coordinates are invalid, try to use map click position as fallback
      if (isNaN(lng) || isNaN(lat) || !lng || !lat) {
        if (e.lngLat) {
          lng = e.lngLat.lng;
          lat = e.lngLat.lat;
        } else {
          // Find the center of the country's bounding box if available
          if (feature.geometry && feature.geometry.type === 'Polygon' && feature.geometry.coordinates && feature.geometry.coordinates.length > 0) {
            // Calculate center from polygon coordinates
            let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
            feature.geometry.coordinates[0].forEach(coord => {
              minX = Math.min(minX, coord[0]);
              minY = Math.min(minY, coord[1]);
              maxX = Math.max(maxX, coord[0]);
              maxY = Math.max(maxY, coord[1]);
            });
            lng = (minX + maxX) / 2;
            lat = (minY + maxY) / 2;
          } else {
            // Default values as last resort
            lng = 20;
            lat = 40;
          }
        }
      }

      // Final validation to prevent NaN errors
      if (isNaN(lng) || isNaN(lat)) {
        lng = 20;
        lat = 40;
      }

      // Create a properly typed coordinate tuple
      const coordinates: [number, number] = [lng, lat];

      // Store the coordinates for icon positioning
      setSelectedCountryCenter(coordinates);

      if (feature) {
        // Directly call flyTo without requestAnimationFrame
        console.log("Flying to coordinates:", coordinates);

        map.current?.flyTo({
          center: coordinates,
          zoom: 4,
          essential: true,
        });
      }

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

      const countryCode = FIPS_10 == "-99" ? "NO" : FIPS_10;

      // Build the URL and fetch data
      const url = `/api/factbook?continent=${continentKey}&country=${countryCode?.toLowerCase()}`;
      console.log("url", url);
      let result;
      try {
        const res = await fetch(url);
        if (!res.ok) {
          throw new Error(`Failed to fetch: ${res.status} ${res.statusText}`);
        }
        result = await res.json();
      } catch (err) {
        console.error('Failed to fetch country data:', err);
        // Optionally, you could show a user-facing error message here
        return;
      }

      const title =
        result["Government"]?.["Country name"]?.["conventional short form"]?.[
        "text"
        ] || "";

      const overview = result["Economy"]?.["Economic overview"]?.["text"] || "";
      const exports =
        result["Economy"]?.["Exports - commodities"]?.["text"] || "";
      setExports(exports);
      const exportsPartners =
        result["Economy"]?.["Exports - partners"]?.["text"] || "";
      setExportPartners(exportsPartners);

      const exportSeries = [
        result["Economy"]?.["Exports"]?.["Exports 2024"]?.["text"] || "",
        result["Economy"]?.["Exports"]?.["Exports 2023"]?.["text"] || "",
        result["Economy"]?.["Exports"]?.["Exports 2022"]?.["text"] || "",
        result["Economy"]?.["Exports"]?.["Exports 2021"]?.["text"] || "",
        result["Economy"]?.["Exports"]?.["Exports 2020"]?.["text"] || "",
        result["Economy"]?.["Exports"]?.["Exports 2019"]?.["text"] || "",
        result["Economy"]?.["Exports"]?.["Exports 2018"]?.["text"] || "",
        result["Economy"]?.["Exports"]?.["Exports 2017"]?.["text"] || "",
      ]
      console.log("exportSeries", exportSeries);
      const importSeries = [
        result["Economy"]?.["Imports"]?.["Imports 2024"]?.["text"] || "",
        result["Economy"]?.["Imports"]?.["Imports 2023"]?.["text"] || "",
        result["Economy"]?.["Imports"]?.["Imports 2022"]?.["text"] || "",
        result["Economy"]?.["Imports"]?.["Imports 2021"]?.["text"] || "",
        result["Economy"]?.["Imports"]?.["Imports 2020"]?.["text"] || "",
        result["Economy"]?.["Imports"]?.["Imports 2019"]?.["text"] || "",
        result["Economy"]?.["Imports"]?.["Imports 2018"]?.["text"] || "",
        result["Economy"]?.["Imports"]?.["Imports 2017"]?.["text"] || "",
      ]
      console.log("importSeries", importSeries);

      const imports =
        result["Economy"]?.["Imports - commodities"]?.["text"] || "";
      setImports(imports);
      const importsPartners =
        result["Economy"]?.["Imports - partners"]?.["text"] || "";
      setImportPartners(importsPartners);
      const industries = result["Economy"]?.["Industries"]?.["text"] || "";
      const inflation =
        result["Economy"]?.["Inflation rate (consumer prices)"]?.[
        "Inflation rate (consumer prices) 2023"
        ]?.["text"] || "";
      const inflationSeries = [
        result["Economy"]?.["Inflation rate (consumer prices)"]?.[
        "Inflation rate (consumer prices) 2024"
        ]?.["text"] || "",
        result["Economy"]?.["Inflation rate (consumer prices)"]?.[
        "Inflation rate (consumer prices) 2023"
        ]?.["text"] || "",
        result["Economy"]?.["Inflation rate (consumer prices)"]?.[
        "Inflation rate (consumer prices) 2022"
        ]?.["text"] || "",
        result["Economy"]?.["Inflation rate (consumer prices)"]?.[
        "Inflation rate (consumer prices) 2021"
        ]?.["text"] || ""
      ];

      const unemploymentSeries = [
        result["Economy"]?.["Unemployment rate"]?.[
        "Unemployment rate 2024"
        ]?.["text"] || "",
        result["Economy"]?.["Unemployment rate"]?.[
        "Unemployment rate 2023"
        ]?.["text"] || "",
        result["Economy"]?.["Unemployment rate"]?.[
        "Unemployment rate 2022"
        ]?.["text"] || "",
        result["Economy"]?.["Unemployment rate"]?.[
        "Unemployment rate 2021"
        ]?.["text"] || "",
      ];
      const pop =
        result["People and Society"]?.["Population"]?.["total"]?.["text"] || "";
      console.log("pop", pop);

      const labourForce = result["Economy"]?.["Labor force"]?.["text"] || "";
      console.log("labourForce", labourForce);
      //i.e. "24.15 million (2024 est.)"
      const cleanValue = labourForce.replace(/[million\s]/g, '').trim() || 0;
      const numericValue = parseFloat(cleanValue) * 1000000;
      const labourParticipation = (numericValue / POP_EST);
      console.log("numericValue", numericValue);
      //console.log("labourForce", labourForce);
      console.log("POP_EST", POP_EST);
      console.log("labourParticipation", labourParticipation);

      const debt =
        result["Economy"]?.["Public debt"]?.["Public debt 2024"]?.["text"] ||
        result["Economy"]?.["Public debt"]?.["Public debt 2023"]?.["text"] ||
        result["Economy"]?.["Public debt"]?.["Public debt 2022"]?.["text"] ||
        result["Economy"]?.["Public debt"]?.["Public debt 2021"]?.["text"] ||
        result["Economy"]?.["Public debt"]?.["Public debt 2020"]?.["text"] ||
        result["Economy"]?.["Public debt"]?.["Public debt 2019"]?.["text"] ||
        result["Economy"]?.["Public debt"]?.["Public debt 2018"]?.["text"] ||
        result["Economy"]?.["Public debt"]?.["Public debt 2017"]?.["text"] ||
        "";
      console.log("debt", debt);
      //107.3% of GDP (2023 est.)
      const debtPercentage = parseFloat(debt.replace(/[%]/g, '').trim()) || 0;
      console.log("debtPercentage", debtPercentage);

      const gdpSeries = [
        result["Economy"]?.["Real GDP growth rate"]?.[
        "Real GDP growth rate 2024"
        ]?.["text"] || "",
        result["Economy"]?.["Real GDP growth rate"]?.[
        "Real GDP growth rate 2023"
        ]?.["text"] || "",
        result["Economy"]?.["Real GDP growth rate"]?.[
        "Real GDP growth rate 2022"
        ]?.["text"] || "",
        result["Economy"]?.["Real GDP growth rate"]?.[
        "Real GDP growth rate 2021"
        ]?.["text"] || "",
      ]


      const gdpComposition = [
        result["Economy"]?.["GDP - composition, by sector of origin"]?.[
        "agriculture"]?.["text"] || "",
        result["Economy"]?.["GDP - composition, by sector of origin"]?.[
        "industry"]?.["text"] || "",
        result["Economy"]?.["GDP - composition, by sector of origin"]?.[
        "services"]?.["text"] || ""
      ];

      console.log("gdpComposition", gdpComposition);




      const unemployment =
        result["Economy"]?.["Unemployment rate"]?.["Unemployment rate 2023"]?.[
        "text"
        ] || "";

      const resources =
        result["Geography"]?.["Natural resources"]?.["text"] ||
        "";

      const gdpcapita = GDP_per_capita ? GDP_per_capita.toFixed(1) : "N/A"

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


      const govt = result["Government"]?.["Government type"]?.["text"] || "";
      const parties =
        result["Government"]?.["Political parties"]?.["text"] || "";
      const capital =
        result["Government"]?.["Capital"]?.["name"]?.["text"] || "";

      console.log("Generated economy info for:", NAME);
      const infoEconomy = [title,
        overview,
        unemployment,
        debtPercentage,
        inflation,
        gdpcapita,
        industries,
        resources,
        inflationSeries,
        gdpComposition,
        unemploymentSeries,
        gdpSeries,
        labourParticipation,
        exportSeries,
        importSeries,
        exports,
        imports]
      // (
      //   <div className="bg-white shadow-lg rounded-lg p-4 max-w-xs border-l-4 border-amber-500 animate-fade-in transition duration-300 ease-in-out">
      //     <div className="flex justify-between">
      //       <h3 className="text-lg font-semibold text-gray-800">{NAME}</h3>
      //       <button
      //         onClick={() => setPanelOpen(false)}
      //         className="text-gray-600 rounded-full flex items-center justify-center w-5 h-5 text-md "
      //       >
      //         x
      //       </button>
      //     </div>
      //     <p className="text-xs font-semibold text-gray-500 mb-2">
      //       {SUBREGION}
      //     </p>
      //     <p className="text-sm text-gray-600">
      //       <strong>Economic Overview:</strong> {overview}
      //     </p>
      //     <p className="text-sm text-gray-600">
      //       <strong>Industries:</strong> {industries.substring(0, 100)}
      //     </p>
      //     <p className="text-sm text-gray-600">
      //       <strong>GDP:</strong>{" "}
      //       {GDP_MD ? (GDP_MD / 1000000).toFixed(2).toLocaleString() : "N/A"}{" "}
      //       trillion USD
      //     </p>
      //     <p className="text-sm text-gray-600">
      //       <strong>GDP Per Capita:</strong>{" "}
      //       {GDP_per_capita ? GDP_per_capita.toFixed(2) : "N/A"}k
      //     </p>
      //     <p
      //       className={
      //         subFilter == "exports"
      //           ? "text-sm text-red-600 font-bold"
      //           : "text-sm text-gray-600"
      //       }
      //     >
      //       <strong>Exports:</strong> {exports}
      //     </p>
      //     <p    className={
      //         subFilter == "export-partners"
      //           ? "text-sm text-red-600 font-bold"
      //           : "text-sm text-gray-600"
      //       }>
      //       <strong>Exports Partners:</strong> {exportsPartners}
      //     </p>

      //     <p    className={
      //         subFilter == "imports"
      //           ? "text-sm text-red-600 font-bold"
      //           : "text-sm text-gray-600"
      //       }>
      //       <strong>Imports:</strong> {imports}
      //     </p>
      //     <p    className={
      //         subFilter == "import-partners"
      //           ? "text-sm text-red-600 font-bold"
      //           : "text-sm text-gray-600"
      //       }>
      //       <strong>Imports Partners:</strong> {importsPartners}
      //     </p>
      //     <p className="text-sm text-gray-600">
      //       <strong>Inflation Rate:</strong> {inflation}
      //     </p>
      //     <p className="text-sm text-gray-600">
      //       <strong>Unemployment Rate:</strong> {unemployment}
      //     </p>
      //     {/* Placeholder for icons - will be filled by useEffect */}
      //     <div id="info-panel-icons"></div>
      //   </div>
      // );

      const infoSociety = "infoSociety"
      //  (
      //   <div className="bg-white shadow-lg rounded-lg p-4 max-w-xs border-l-4 border-emerald-500 animate-fade-in transition duration-300 ease-in-out">
      //     <div className="flex justify-between">
      //       <h3 className="text-lg font-semibold text-gray-800">{NAME}</h3>
      //       <button
      //         onClick={() => setPanelOpen(false)}
      //         className="text-gray-600 rounded-full flex items-center justify-center w-5 h-5 text-md "
      //       >
      //         x
      //       </button>
      //     </div>
      //     <p className="text-xs font-semibold text-gray-500 mb-2">
      //       {SUBREGION}
      //     </p>
      //     <p className="text-sm text-gray-600">
      //       <strong>Population:</strong> {pop}
      //     </p>
      //     <p className="text-sm text-gray-600">
      //       <strong>Life Expectancy:</strong> {lifeExpectancy}
      //     </p>
      //     <p className="text-sm text-gray-600">
      //       <strong>Median Age:</strong> {age}
      //     </p>
      //     <p className="text-sm text-gray-600">
      //       <strong>Demography:</strong> {demographics.substring(3, 700)}...
      //     </p>
      //     <p className="text-sm text-gray-600">
      //       <strong>Urbanization:</strong> {urbanization}
      //     </p>
      //     <p className="text-sm text-gray-600">
      //       <strong>Literacy:</strong> {literacy}
      //     </p>
      //     <p className="text-sm text-gray-600">
      //       <strong>Fertility Rate:</strong> {fertility}
      //     </p>
      //   </div>
      // );

      const infoGovernment = "infoGovernment"
      //  (
      //   <div className="bg-white shadow-lg rounded-lg p-4 max-w-xs border-l-4 border-emerald-500 animate-fade-in transition duration-300 ease-in-out">
      //     <div className="flex justify-between">
      //       <h3 className="text-lg font-semibold text-gray-800">{NAME}</h3>
      //       <button
      //         onClick={() => setPanelOpen(false)}
      //         className="text-gray-600 rounded-full flex items-center justify-center w-5 h-5 text-md hover:bg-amber-500"
      //       >
      //         x
      //       </button>
      //     </div>
      //     <p className="text-xs font-semibold text-gray-500 mb-2">
      //       {SUBREGION}
      //     </p>
      //     <p className="text-sm text-gray-600">
      //       <strong>Capital:</strong> {capital}
      //     </p>
      //     <p className="text-sm text-gray-600">
      //       <strong>Govt. Type:</strong> {govt}
      //     </p>

      //     <p className="text-sm text-gray-600">
      //       <strong>Political Overview:</strong> {parties.substring(0, 700)}...
      //     </p>
      //     <p className="text-sm text-gray-600">
      //       <strong>Public Debt:</strong> {debt}
      //     </p>
      //   </div>
      // );

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

      // Load economic data
      const inflationDataLoaded = await loadInflationData();
      const unemploymentDataLoaded = await loadUnemploymentData();

      // Store the data in state
      setInflationData(inflationDataLoaded);
      setUnemploymentData(unemploymentDataLoaded);

      // Store only the features array in the ref for coordinate lookup
      setCountriesFeatures(countriesGeoJSON.features);
      console.log("countriesFeatures set in addDataLayers:", countriesGeoJSON.features.length, "features");

      // Set data ready state to true after data is loaded and state is set
      setIsCountriesDataReady(true);

      // Add economic data to GeoJSON features using utility function
      addEconomicDataToFeatures(countriesGeoJSON.features, inflationDataLoaded, unemploymentDataLoaded);

      if (map.current && map.current.isStyleLoaded()) {
        map.current.addSource("data", {
          type: "geojson",
          data: countriesGeoJSON, // Pass the original fetched object here
        });

        // Add all data layers using utility function with a small delay
        setTimeout(() => {
          if (map.current) {
            addAllDataLayers(map.current);
          }
        }, 50);

        // Set map fog
        setMapFog(map.current);

        // Add countries vector source
        addCountriesSource(map.current);

        // Add legend click events
        addLegendClickEvents(map.current);

        // Wait a bit for layers to be fully added before updating visibility
        setTimeout(() => {
          if (map.current) {
            updateLayerVisibility(map.current, { gdpFilter, activeTab });
          }
        }, 200);
      } else {
        console.error("Map style is not loaded yet");
      }
    } catch (error) {
      console.error("Error fetching or processing GeoJSON data:", error);
    }
  };





  useEffect(() => {
    const timeout = setTimeout(() => {
      if (map.current) {
        updateLayerVisibility(map.current, { gdpFilter, activeTab });
      }
    }, 1000);

    return () => clearTimeout(timeout);
  }, [gdpFilter, activeTab]);

  // Add useEffect to control mine sites visibility based on Resources overlay
  useEffect(() => {
    if (!map.current) return;

    const mineLayerIds = ['mine-dots', 'mine-resources', 'mine-labels', 'mine-clickable-circles'];
    const visibility = activeOverlays.Resources ? 'visible' : 'none';
    
    mineLayerIds.forEach(layerId => {
      if (map.current?.getLayer(layerId)) {
        map.current.setLayoutProperty(layerId, 'visibility', visibility);
      }
    });
  }, [activeOverlays.Resources]);

  useEffect(() => {
    setCountryOption(click);
  }, [countryOption]);

  // Add useEffect to respond to activeTab changes
  useEffect(() => {
    if (gdpFilter === 0 && map.current) { // Only update when in Overview mode
      updateEconomicLayerVisibility(map.current, activeTab);
    }
  }, [activeTab, gdpFilter]); // Add gdpFilter to dependencies

  // Add useEffect to handle updating visualization when a country is selected
  useEffect(() => {
    // This effect now primarily handles the initial application of the subfilter when it changes
    if (map.current) {
      // Re-apply the current subFilter visualization
      // Only call highlightExportPartners if a country is already selected. Otherwise, the click handler will handle it.
      if (highlightedCountryId) {
        // commented out useEffect // highlightExportPartners({ target: { value: subFilter } } as React.ChangeEvent<HTMLSelectElement>);
      }
    }
  }, [highlightedCountryId]); // Depend only on subFilter and highlightedCountryId



  // Enhanced highlightExportPartners to use the improved cleanup
  const highlightExportPartners = (
    event: React.ChangeEvent<HTMLSelectElement>
  ) => {
    const selectedValue = event.target.value;
    console.log("Selected filter:", selectedValue);
    setActiveOverlays({ ...activeOverlays, exports: true });

    // --- Start Cleanup for previous animations ---
    cleanupAllAnimations(map, animationContext);
    // --- End Cleanup ---

    // Always remove existing highlight layers
    if (map.current?.getLayer("export-fill")) {
      map.current.removeLayer("export-fill");
    }
    if (map.current?.getLayer("import-fill")) {
      map.current.removeLayer("import-fill");
    }

    // Handle Export Partners (highlight countries)
    if (selectedValue === "export-partners" || selectedValue === "exports") {
      // Always add the export layer
      map.current?.addLayer(createExportLayer());

      const partners = parseExportPartners(exportPartners || '');
      if (!map.current || partners.length === 0) {
        // If no partners, keep the layer but set its visibility to none
        if (map.current?.getLayer("export-fill")) {
          map.current.setLayoutProperty("export-fill", "visibility", "none");
        }
        return;
      }

      const filter = createCountryFilter(partners);
      console.log("Export filter selected, export data:", exportPartners);

      // Create country-color mapping for highlighting
      const countryColorMap = createCountryColorMapping(partners, exportChartColors);

      // Update layer paint property with data-driven styling
      map.current.setPaintProperty(
        "export-fill",
        "fill-color",
        [
          "match",
          ["get", "name"], // Use the 'name' property of the feature
          ...Object.entries(countryColorMap).flat(), // Flatten the map entries
          "#ccc" // Default color for non-partners
        ]
      );
      // Apply filter to show only the partner countries
      map.current.setFilter("export-fill", filter);
      map.current.setLayoutProperty("export-fill", "visibility", "visible"); // Ensure visible

    }
    // Handle Import Partners (highlight countries)
    else if (selectedValue === "import-partners" || selectedValue === "imports") {
      // Always add the import layer
      map.current?.addLayer(createImportLayer());

      const partners = parseExportPartners(importPartners || '');
      if (!map.current || partners.length === 0) {
        // If no partners, keep the layer but set its visibility to none
        if (map.current?.getLayer("import-fill")) {
          map.current.setLayoutProperty("import-fill", "visibility", "none");
        }
        return;
      }

      const filter = createCountryFilter(partners);

      // Create country-color mapping for highlighting
      const countryColorMap = createCountryColorMapping(partners, importChartColors);

      // Update layer paint property with data-driven styling
      map.current.setPaintProperty(
        "import-fill",
        "fill-color",
        [
          "match",
          ["get", "name"], // Use the 'name' property of the feature
          ...Object.entries(countryColorMap).flat(), // Flatten the map entries
          "#ccc" // Default color for non-partners
        ]
      );
      map.current.setFilter("import-fill", filter);
      map.current.setLayoutProperty("import-fill", "visibility", "visible"); // Ensure visible
    }
    // Handle default case (clear filters and highlighting)
    else if (selectedValue === "default") {
      // Layers are already removed at the start of the function
      if (map.current) {
        updateLayerVisibility(map.current, { gdpFilter, activeTab });
      }
    }

    // Arc drawing logic is now handled in a separate useEffect
    // Do NOT add arc drawing logic here.

  };

  // Add this function to handle export icons
  const handleExportIconsGenerated = (icons: Array<{ keyword: string; color: string }>) => {
    setExportIcons(icons);
  };

  // Add this function to handle import icons
  const handleImportIconsGenerated = (icons: Array<{ keyword: string; color: string }>) => {
    console.log("Import icons generated:", icons.length, "Current subFilter:", activeOverlays);
    setImportIcons(icons);
  };

  // Import icons are handled by the ImportIcons component

  // Add all icons to Mapbox on map load
  useEffect(() => {
    if (!map.current) return;
    const iconsToAdd = Object.values(iconMap).map(icon => ({
      component: icon.component,
      name: icon.name,
      color: icon.color,
    }));
    Object.entries(iconMap).forEach(([key, val]) => {
      if (!val.component || typeof val.component !== 'function') {
        console.error('Missing or invalid icon component for:', key, val);
      }
    });

    addReactIconsToMapbox(map.current, iconsToAdd);
  }, []);

  // Listen for zoom events and update mapZoom
  useEffect(() => {
    if (!map.current) return;
    const handleZoom = () => setMapZoom(map.current!.getZoom());
    map.current.on('zoom', handleZoom);
    // Set initial zoom
    setMapZoom(map.current.getZoom());
    return () => {
      map.current?.off('zoom', handleZoom);
    };
  }, []);

  // Add this new effect specifically to handle subFilter changes and icon updates
  useEffect(() => {
    console.log("subFilter changed effect triggered:", activeOverlays);
    // This effect ensures we recalculate icons when subFilter changes

    let iconsToUse: Array<{ keyword: string; color: string }> = [];
    if (activeOverlays.imports) {
      console.log("Using import icons for InfoPanel:", importIcons.length);
      iconsToUse = [...importIcons]; // Create a copy to ensure React detects the change
    } else if (activeOverlays.exports) {
      console.log("Using export icons for InfoPanel:", exportIcons.length);
      iconsToUse = [...exportIcons]; // Create a copy to ensure React detects the change
    } else if (activeOverlays.Resources && Array.isArray(selectedEconomy) && typeof selectedEconomy[7] === 'string') {
      // Resources subfilter: parse selectedEconomy[7] and match to iconMap
      const resources = selectedEconomy[7].split(',').map(r => r.trim().toLowerCase());
      const matched: Array<{ keyword: string; color: string }> = [];
      const usedKeywords = new Set<string>();
      resources.forEach(resource => {
        Object.entries(iconMap).forEach(([keyword, icon]) => {
          if (resource === keyword.toLowerCase() && !usedKeywords.has(keyword)) {
            matched.push({ keyword, color: icon.color });
            usedKeywords.add(keyword);
          }
        });
      });
      iconsToUse = matched.slice(0, 24);
    } else if (activeOverlays.Overview) {
      // Overview subfilter: show no specific icons, just the overview information
      iconsToUse = [];
    }

    if (iconsToUse.length > 0) {
      // Create icon elements for the InfoPanel with a key based on subFilter to force re-render
      const newInfoPanelIconElements = (
        <div className="grid grid-cols-4 gap-x-4 gap-y-2 bg-white p-2 rounded-lg shadow-md mt-2" key={`icon-panel-${Date.now()}`}>
          {iconsToUse.map((icon, index) => {
            const IconComponent = (iconMap as any)?.[icon.keyword]?.component;
            const iconColor = (iconMap as any)?.[icon.keyword]?.color || icon.color;
            return (
              <div key={`${activeOverlays.exports}-icon-${index}-${icon.keyword}`} className="flex flex-col items-center text-sm">
                {IconComponent && React.createElement(IconComponent, { style: { color: iconColor, fontSize: '1.8em' } })}
                <span style={{ color: iconColor, marginTop: '4px' }}>{icon.keyword}</span>
              </div>
            );
          })}
        </div>
      );

      console.log("Generated new infoPanelIconElements for subFilter:", activeOverlays);
      setInfoPanelIcons(iconsToUse);
      setInfoPanelIconElementsState(newInfoPanelIconElements);
    } else {
      setInfoPanelIcons([]);
      setInfoPanelIconElementsState(null);
    }
  }, [activeOverlays, exportIcons, importIcons, selectedEconomy]); // Only depend on subFilter and icon arrays

  // Update the circle features to use the new icon approach
  // useEffect(() => {
  //   // Choose which icons to show on the map (not for InfoPanel)
  //   let iconsToShow: Array<{ keyword: string; color: string, iconSize?: number }> = [];
  //   if (activeOverlays.imports) {
  //     console.log("Using import icons for MAP:", importIcons.length, "imports value:", imports);
  //     iconsToShow = importIcons;
  //   } else if (activeOverlays.exports) {
  //     console.log("Using export icons for MAP:", exportIcons.length, "exports value:", exports);
  //     iconsToShow = exportIcons;
  //   } else if (activeOverlays.Resources && infoPanelIcons.length > 0) {
  //     iconsToShow = infoPanelIcons;
  //   } else {
  //     iconsToShow = [];
  //   }

  //   console.log("useEffect (map icon rendering): iconsToShow", iconsToShow);

  //   // Don't show icons if no country is selected or if there are no icons to show
  //   if (!map.current || !selectedCountryCenter || iconsToShow.length === 0 || !highlightedCountryId) {
  //     // Remove icon/label layers if present
  //     if (map.current?.getLayer('export-labels')) map.current.removeLayer('export-labels');
  //     if (map.current?.getLayer('export-icons')) map.current.removeLayer('export-icons');
  //     if (map.current?.getSource('export-circles')) map.current.removeSource('export-circles');
  //     return;
  //   }

  //   // Sort icons by descending iconSize (if present)
  //   const sortedIcons = [...iconsToShow].sort((a, b) => (b.iconSize || 1) - (a.iconSize || 1));

  //   // Arc formation parameters
  //   const base = selectedCountryCenter;
  //   let n = sortedIcons.length;
  //   let angleStep = Math.PI / 8; // Default: 22.5deg between icons (tighter)
  //   let radius = 4.0; // Default: closer to center
  //   let minSizeArc = 0.4;
  //   let maxSizeArc = 0.6;
  //   // if (activeOverlays.Resources) {
  //   //   angleStep = Math.PI / 16; // 11.25deg between icons (even tighter)
  //   //   radius = 4; // Even closer
  //   //   minSizeArc = 0.3;
  //   //   maxSizeArc = 0.4;
  //   // }
  //   const iconFeatures = sortedIcons.map((icon, i) => {
  //     let iconLng, iconLat;
  //     if (activeOverlays.Resources) {
  //       // Random scatter within a small radius
  //       const scatterRadius = 3.5; // degrees, adjust for your map scale
  //       const theta = Math.random() * 2 * Math.PI;
  //       const dist = Math.random() * scatterRadius;
  //       iconLng = base[0] + dist * Math.cos(theta);
  //       iconLat = base[1] + dist * Math.sin(theta);
  //     } else {
  //       // Arc formation (default)
  //       let offset = [0, 0];
  //       if (n > 1) {
  //         const theta = (-(n-1)/2 + i) * angleStep;
  //         offset = [radius * Math.sin(theta), radius * Math.cos(theta)];
  //       }
  //       iconLng = base[0] + offset[0];
  //       iconLat = base[1] + offset[1];
  //     }
  //     const iconSize = maxSizeArc - (i / Math.max(1, n-1)) * (maxSizeArc - minSizeArc);
  //     const iconName = (iconMap as any)[icon.keyword]?.name || "default";
  //     return {
  //       type: 'Feature' as const,
  //       properties: {
  //         keyword: icon.keyword,
  //         icon: iconName,
  //         component: (iconMap as any)?.[icon.keyword]?.component,
  //         iconSize,
  //       },
  //       geometry: {
  //         type: 'Point' as const,
  //         coordinates: [iconLng, iconLat]
  //       }
  //     };
  //   });

  //   // Remove existing layers and source if they exist
  //   if (map.current.getLayer('export-labels')) map.current.removeLayer('export-labels');
  //   if (map.current.getLayer('export-icons')) map.current.removeLayer('export-icons');
  //   if (map.current.getSource('export-circles')) map.current.removeSource('export-circles');

  //   // Add new source and layers
  //   map.current.addSource('export-circles', {
  //     type: 'geojson',
  //     data: {
  //       type: 'FeatureCollection',
  //       features: iconFeatures
  //     }
  //   });

  //   map.current.addLayer({
  //     id: 'export-icons',
  //     type: 'symbol',
  //     source: 'export-circles',
  //     layout: {
  //       'icon-image': ['get', 'icon'],
  //       'icon-size': ['get', 'iconSize'],
  //       'icon-allow-overlap': true,
  //       'icon-ignore-placement': true,
  //       'icon-padding': 5,
  //       'symbol-spacing': 20
  //     }
  //   });

  //   map.current.addLayer({
  //     id: 'export-labels',
  //     type: 'symbol',
  //     source: 'export-circles',
  //     layout: {
  //       'text-field': ['get', 'keyword'],
  //       'text-size': 12,
  //       'text-offset': [0, 2.2],
  //       'text-anchor': 'bottom',
  //       'text-allow-overlap': true
  //     },
  //     paint: {
  //       'text-color': '#000000',
  //       'text-halo-color': '#ffffff',
  //       'text-halo-width': 2
  //     }
  //   });

  //   // Cleanup function
  //   return () => {
  //     if (map.current) {
  //       if (map.current.getLayer('export-labels')) {
  //         map.current.removeLayer('export-labels');
  //       }
  //       if (map.current.getLayer('export-icons')) {
  //         map.current.removeLayer('export-icons');
  //       }
  //       if (map.current.getSource('export-circles')) {
  //         map.current.removeSource('export-circles');
  //       }
  //     }
  //   };
  // }, [exportIcons, importIcons, selectedCountryCenter, mapZoom, activeOverlays, highlightedCountryId]);

  // Add useEffect to handle updating visualization when a country is selected or subFilter changes
  useEffect(() => {
    // This effect handles the application of the subfilter visualization (highlighting)
    // It should run when highlightedCountryId, subFilter, exportPartners, or importPartners change

    if (!map.current || !highlightedCountryId || !(activeOverlays.exports || activeOverlays.imports)) {
      // If prerequisites are not met, remove existing highlight layers
      // Overview and Resources should not show any highlighting
      if (map.current?.getLayer("export-fill")) {
        map.current.removeLayer("export-fill");
      }
      if (map.current?.getLayer("import-fill")) {
        map.current.removeLayer("import-fill");
      }
      return;
    }

    console.log(`Highlighting useEffect triggered for ${highlightedCountryId} with subFilter ${activeOverlays}`);

    // Determine which partners to highlight based on the current subFilter
    const partners = activeOverlays.exports ? parseExportPartners(exportPartners || '') : parseExportPartners(importPartners || '');

    // Determine which layer and color palette to use
    const layerId = activeOverlays.exports ? "export-fill" : "import-fill";
    const colorPalette = activeOverlays.exports ? exportChartColors : importChartColors;
    const partnerData = activeOverlays.exports ? exportPartners : importPartners;

    // Remove the other highlight layer if it exists
    const otherLayerId = activeOverlays.exports ? "import-fill" : "export-fill";
    if (map.current.getLayer(otherLayerId)) {
      map.current.removeLayer(otherLayerId);
    }

    // Add the relevant highlight layer if it doesn't exist
    if (!map.current.getLayer(layerId)) {
      const layerDefinition = activeOverlays.exports ? createExportLayer() : createImportLayer();
      map.current.addLayer(layerDefinition);
    }

    if (partners.length === 0) {
      if (map.current?.getLayer(layerId)) {
        map.current.setLayoutProperty(layerId, "visibility", "none");
      }
      return;
    }

    const filter = createCountryFilter(partners);
    console.log(`Applying filter for ${activeOverlays}:`, filter);

    // Create country-color mapping for highlighting
    const countryColorMap = createCountryColorMapping(partners, colorPalette);

    // Update layer paint property with data-driven styling
    map.current.setPaintProperty(
      layerId,
      "fill-color",
      [
        "match",
        ["get", "name"], // Use the 'name' property of the feature
        ...Object.entries(countryColorMap).flat(), // Flatten the map entries
        "#ccc" // Default color for non-partners
      ]
    );
    // Apply filter to show only the partner countries
    map.current.setFilter(layerId, filter);
    map.current.setLayoutProperty(layerId, "visibility", "visible"); // Ensure visible

  }, [highlightedCountryId, activeOverlays, exportPartners, importPartners, map.current]); // Depend on relevant state and map instance



  // New useEffect to handle arc drawing
  useEffect(() => {
    console.log("Arc drawing useEffect triggered");

    // Cancel any existing animation frames
    cancelAllAnimationFrames(animationFrameIds);

    // Always remove existing arcs before drawing new ones
    if (map.current?.getLayer('arcs-layer')) map.current.removeLayer('arcs-layer');
    if (map.current?.getSource('arcs-source')) map.current.removeSource('arcs-source');

    // --- Start Cleanup for previous animated points ---
    cleanupAllAnimations(map, animationContext);
    // --- End Cleanup ---

    // Ensure map, selected country, and GeoJSON data are available and countriesFeatures is populated
    if (!map.current || !selectedCountryCenter || !isCountriesDataReady || !(activeOverlays.exports || activeOverlays.imports)) {
      console.log("Arc drawing prerequisites not met.", { map: !!map.current, selectedCountryCenter: !!selectedCountryCenter, isCountriesDataReady, activeOverlays });

      // If prerequisites are not met, ensure arcs are removed (redundant with lines above, but safe)
      // Overview and Resources should not show any arcs
      if (map.current?.getLayer('arcs-layer')) map.current.removeLayer('arcs-layer');
      if (map.current?.getSource('arcs-source')) map.current.removeSource('arcs-source');
      return;
    }

    // Set the current animation context
    const newContextKey = getAnimationContextKey(highlightedCountryId, 'exports');
    console.log(`Setting new animation context: ${newContextKey}`);
    currentAnimationContext.current = newContextKey;

    console.log("Arc drawing prerequisites met.");

    // Determine which set of partners to use based on subFilter
    const partners = activeOverlays.exports ? parseExportPartners(exportPartners || '') : parseExportPartners(importPartners || '');

    // Determine which icons to use based on subFilter  
    const iconsToUse = activeOverlays.exports ? exportIcons : importIcons;

    console.log(`Arc drawing useEffect - Parsed ${activeOverlays} partners:`, partners);
    console.log(`Using ${activeOverlays.exports ? "export" : "import"} icons (${iconsToUse.length} icons)`);

    const selectedCountryCoords = selectedCountryCenter; // Use the stored selected country center
    const arcFeatures: any[] = [];

    // Determine which color palette to use
    const colorPalette = activeOverlays.exports ? exportChartColors : importChartColors;

    if (selectedCountryCoords && partners.length > 0) {
      partners.forEach((partner: string, index: number) => {
        const partnerCoords = getCountryCoordinates(partner, countriesFeatures);
        console.log(`Arc drawing useEffect - Partner: ${partner}, Coordinates: ${partnerCoords}`);
        if (partnerCoords) {
          // Create turf points from coordinates
          const startPoint = turf.point(selectedCountryCoords);
          const endPoint = turf.point(partnerCoords);

          // Generate curved coordinates using the generateArc function
          let curvedCoordinates = generateArc(startPoint, endPoint, 1000); // Increased to 100 segments

          // Reverse coordinates for import partners to animate towards the selected country
          if (activeOverlays.imports) {
            curvedCoordinates = curvedCoordinates.reverse();
          }

          // Get the color for this partner based on its index
          const arcColor = colorPalette[index % colorPalette.length];

          // Create a LineString feature for the arc
          const arcFeature = {
            type: 'Feature' as const,
            geometry: {
              type: 'LineString' as const,
              coordinates: curvedCoordinates // Use curved coordinates (potentially reversed)
            },
            properties: { // Add properties object
              color: arcColor, // Store the color here
              partnerName: partner,
              subFilterType: activeOverlays, // Store the subFilter type for identification
              countryId: highlightedCountryId, // Store the country ID for tracking
              contextKey: newContextKey // Store the context key for this animation
            }
          };
          arcFeatures.push(arcFeature);

          // Add animation for this arc
          const pointSourceId = `point-${activeOverlays}-${index}-${highlightedCountryId}`;

          // Get an appropriate icon from the icons collection for this subFilter
          let iconName = 'aircraft'; // Default fallback
          if (iconsToUse.length > 0) {
            const iconKeyword = iconsToUse[index % iconsToUse.length].keyword;
            iconName = (iconMap as any)?.[iconKeyword]?.name ||
              (activeOverlays.exports ? 'aircraft' : 'ships');
          } else {
            // Fallback icons if no icons are available
            iconName = activeOverlays.exports ? 'aircraft' : 'ships';
          }

          const initialPointFeature = {
            type: 'Feature' as const,
            properties: {
              bearing: 0,
              icon: iconName,
              partnerName: partner,
              subFilterType: activeOverlays, // Store the subFilter type for identification
              countryId: highlightedCountryId, // Store the current country ID to track ownership
              contextKey: newContextKey // Store the context key for this animation
            },
            // Start the animation from the beginning of the (potentially reversed) curved coordinates
            geometry: {
              type: 'Point' as const,
              coordinates: curvedCoordinates[0] // Start at the first coordinate of the arc
            }
          };

          if (map.current) {
            // Remove existing source and layer for this point if they exist
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
                'icon-size': 0.5 // Adjust icon size as needed
              }
            });

            // Track this animated point ID in our ref set
            animatedPointIds.current.add(pointSourceId);

            // Start the animation directly, letting the animate function wait for the source
            animate(map.current!, 0,
              { type: 'FeatureCollection', features: [arcFeature] },
              { type: 'FeatureCollection', features: [initialPointFeature] },
              pointSourceId,
              1000,
              newContextKey,
              animationContext,
              animationPaused
            );
          }
        }
      });
    }

    console.log("Arc drawing useEffect - Generated arc features:", arcFeatures.length);

    if (arcFeatures.length > 0) {
      // Add a new source and layer for the arcs, or update existing
      if (map.current?.getSource('arcs-source')) {
        (map.current.getSource('arcs-source') as mapboxgl.GeoJSONSource).setData({
          type: 'FeatureCollection',
          features: arcFeatures
        });
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
            'line-color': ['get', 'color'], // Use the color property from the feature
            'line-width': 2,
            'line-opacity': 0.7
          }
        });
      }
    }
    // If no arc features, remove the source and layer if they exist
    else {
      if (map.current?.getLayer('arcs-layer')) map.current.removeLayer('arcs-layer');
      if (map.current?.getSource('arcs-source')) map.current.removeSource('arcs-source');
    }

    return () => {
      console.log("Arc drawing useEffect cleanup triggered.");
      // Cancel all animation frames
      cancelAllAnimationFrames(animationFrameIds);

      // Remove dynamically created point sources and layers during cleanup
      if (map.current && arcFeatures.length > 0) {
        arcFeatures.forEach((_, index) => {
          const pointSourceId = `point-${activeOverlays}-${index}-${highlightedCountryId}`;
          if (map.current?.getLayer(pointSourceId)) {
            map.current.removeLayer(pointSourceId);
          }
          if (map.current?.getSource(pointSourceId)) {
            map.current.removeSource(pointSourceId);
          }
          animatedPointIds.current.delete(pointSourceId);
        });
      }
      // Also remove the arc layer and source during cleanup
      if (map.current?.getLayer('arcs-layer')) map.current.removeLayer('arcs-layer');
      if (map.current?.getSource('arcs-source')) map.current.removeSource('arcs-source');
    };

  }, [selectedCountryCenter, activeOverlays, isCountriesDataReady, exportPartners, importPartners, animationPaused, exportIcons, importIcons, highlightedCountryId]); // Add highlightedCountryId as dependency

  // Use the custom hook for mineral overlays (move this call here, after all dependencies are defined)
  useMineralOverlay({
    map,
    gdpFilter,
    activeOverlays,
    addReactIconsToMapbox,
    topCopperProducers,
    topNickelProducers,
    topManganeseProducers,
    topLithiumProducers,
    topUraniumProducers,
    topREEProducers,
    topCoalProducers,
    topGasProducers,
    topPetroleumProducers,
    topCobaltProducers,
    topDiamondProducers,
    topGoldProducers,
    topAluminiumProducers,
    topIronOreProducers,
    topSilverProducers,
    iconMap,
    formatProduction,
    formatCoal,
    formatGas,
    formatPetroleum,
    formatCobalt,
    formatDiamond,
    formatGold,
    formatAluminium,
    formatIronOre,
    formatSilver,
  });

  // Mine site coordinates and names are now imported from ../data/mineSites.ts

  // Mine gear icon effect: only run when map is ready and style is loaded
  useEffect(() => {
    if (!map.current || !mapReady) {
      return;
    }

    // Add a small delay to ensure style is fully loaded
    const timer = setTimeout(() => {
      if (!map.current) {
        return;
      }

      const mineFeatures = mineSites.map((site, i) => ({
        type: 'Feature' as const,
        geometry: {
          type: 'Point' as const,
          coordinates: site.coordinates // Dot icons at original position (above)
        },
        properties: { name: site.name, id: `mine-${i}`, details: site.details, location: site.location },
      }));
      let mineLayersAdded = false; // Flag to prevent repeated additions
      let clickHandlersAdded = false; // Flag to prevent repeated event listeners

      // Move addMineLayer definition here, before addDotImageAndLayer
      function addMineLayer() {
        if (!map.current || mineLayersAdded) {
          return;
        }

        // Add mine sites as a GeoJSON source
        if (!map.current.getSource('mine-sites')) {
          map.current.addSource('mine-sites', {
            type: 'geojson',
            data: { type: 'FeatureCollection', features: mineFeatures },
          });
        }

        // --- Add mine resource icons as a new layer ---
        // Prepare features for all resources at all mines, offset horizontally
        type ResourceFeature = GeoJSON.Feature<GeoJSON.Point, { resource: string; icon: string; offset: [number, number]; mine: string; iconSize: number }>;
        const resourceFeatures: ResourceFeature[] = [];
        const resourceIconNames = new Set<string>();

        mineSites.forEach(site => {
          site.resources.forEach((resource, idx) => {
            // Use iconMap to get the icon name
            const iconKey = Object.keys(iconMap).find(k => k.toLowerCase() === resource.toLowerCase());
            if (iconKey && (iconMap as any)[iconKey]) {
              const iconName = (iconMap as any)[iconKey].name;
              resourceIconNames.add(iconName);

              // Calculate horizontal offset for this resource (spread them out horizontally)
              const offsetX = (idx - (site.resources.length - 1) / 2) * 2 - 0.5; // Slightly left of dot
              const offsetY = 0.5; // Below the dot icon

              // Calculate descending icon size - first icon largest, then progressively smaller
              const baseSize = 1.2; // Starting size for first icon
              const sizeDecrement = 0.7; // How much smaller each subsequent icon gets
              const minSize = 0.7; // Minimum size to prevent icons from becoming too small
              const iconSize = Math.max(baseSize - (idx * sizeDecrement), minSize);

              resourceFeatures.push({
                type: 'Feature',
                geometry: {
                  type: 'Point',
                  coordinates: [site.coordinates[0] + offsetX, site.coordinates[1] + offsetY]
                },
                properties: {
                  resource: resource,
                  icon: iconName,
                  offset: [offsetX, offsetY],
                  mine: site.name,
                  iconSize: iconSize // Add size property to each feature
                }
              });
            }
          });
        });

        // Add all resource icons to Mapbox if not already present
        const iconsToAdd = Array.from(resourceIconNames)
          .map(name => {
            const iconDef = Object.values(iconMap).find(i => i.name === name);
            return iconDef ? { component: iconDef.component as IconType, name: iconDef.name, color: iconDef.color } : null;
          })
          .filter((iconDef): iconDef is { component: IconType; name: string; color: string } => iconDef !== null);

        // Add the dot icon to the icons to add
        const dotIcon = iconMap.dot;
        if (dotIcon) {
          iconsToAdd.push({ component: dotIcon.component as IconType, name: dotIcon.name, color: dotIcon.color });
        }

        if (iconsToAdd.length > 0) {
          addReactIconsToMapbox(map.current, iconsToAdd);
        }

        // Add resource features as a new GeoJSON source
        if (!map.current.getSource('mine-resources')) {
          map.current.addSource('mine-resources', {
            type: 'geojson',
            data: { type: 'FeatureCollection', features: resourceFeatures },
          });
        }

        // Add a symbol layer for the dot icons first (so they appear behind resource icons)
        if (!map.current.getLayer('mine-dots')) {
          map.current.addLayer({
            id: 'mine-dots',
            type: 'symbol',
            source: 'mine-sites',
            minzoom: 3, // Only show at zoom >= 3
            layout: {
              'icon-image': 'dot',
              'icon-size': 1.2,
              'icon-allow-overlap': true,
              'icon-ignore-placement': true,
              'visibility': activeOverlays.Resources ? 'visible' : 'none', // Set initial visibility
            },
            paint: {
              'icon-opacity': 0.3, // Make dot semi-transparent
            },
          });
        }

        // Add a symbol layer for the resource icons (added after dots to appear on top)
        if (!map.current.getLayer('mine-resources')) {
          map.current.addLayer({
            id: 'mine-resources',
            type: 'symbol',
            source: 'mine-resources',
            minzoom: 3, // Only show at zoom >= 3
            layout: {
              'icon-image': ['get', 'icon'],
              'icon-size': ['get', 'iconSize'], // Use the calculated size from feature properties
              'icon-allow-overlap': true,
              'icon-ignore-placement': true,
              'visibility': activeOverlays.Resources ? 'visible' : 'none', // Set initial visibility
            },
          });
        }

        // Add a symbol layer for the mine name labels (below the resource icons)
        if (!map.current.getLayer('mine-labels')) {
          map.current.addLayer({
            id: 'mine-labels',
            type: 'symbol',
            source: 'mine-sites',
            minzoom: 3, // Only show at zoom >= 3
            layout: {
              'text-field': ['get', 'name'],
              'text-size': 13,
              'text-offset': [0, 2.5], // Below the resource icons
              'text-anchor': 'top',
              'text-allow-overlap': true,
              'visibility': activeOverlays.Resources ? 'visible' : 'none', // Set initial visibility
            },
            paint: {
              'text-color': '#111111',
              'text-halo-width': 0,
            },
          });
        }

        // Add click handlers only once
        if (!clickHandlersAdded) {
          // Add invisible larger clickable areas for easier interaction
          if (!map.current.getSource('mine-clickable-areas')) {
            const clickableFeatures = mineSites.map((site, i) => ({
              type: 'Feature' as const,
              geometry: {
                type: 'Point' as const,
                coordinates: site.coordinates // Same position as dot icons (above)
              },
              properties: {
                name: site.name,
                id: `mine-clickable-${i}`,
                details: site.details,
                location: site.location,
                ownership: site.ownership
              },
            }));

            map.current.addSource('mine-clickable-areas', {
              type: 'geojson',
              data: { type: 'FeatureCollection', features: clickableFeatures },
            });

            // Add invisible larger circles for easier clicking
            map.current.addLayer({
              id: 'mine-clickable-circles',
              type: 'circle',
              source: 'mine-clickable-areas',
              minzoom: 3,
              layout: {
               'visibility': activeOverlays.Resources ? 'visible' : 'none', // Set initial visibility
              },
              paint: {
                'circle-radius': 35, // Much larger clickable area
                'circle-opacity': 0, // Invisible
                'circle-stroke-width': 0,
              },
            });
          }

          let currentPopup: mapboxgl.Popup | null = null;

          // Function to create and show popup
          const showPopup = (e: mapboxgl.MapLayerMouseEvent) => {
            if (!e.features || !e.features.length) return;

            // Prevent map interactions when clicking on mine areas
            e.preventDefault();

            const feature = e.features[0];
            const coordinates = (feature.geometry.type === 'Point' && Array.isArray(feature.geometry.coordinates) && feature.geometry.coordinates.length === 2)
              ? feature.geometry.coordinates as [number, number]
              : [0, 0];
            const props = feature.properties as { name?: string; location?: string; details?: string; ownership?: string };
            const name = props?.name || '';
            const location = props?.location || '';
            const details = props?.details || '';
            const ownership = props?.ownership || '';

            // Close existing popup
            if (currentPopup) {
              currentPopup.remove();
            }

            // Create popup content with hover-friendly styling
            const popupContent = `
            <div id="mine-popup" style="
              background: white;
              padding: 16px;
              border-radius: 12px;
              min-width: 280px;
              max-width: 350px;
              box-shadow: 0 8px 32px rgba(0,0,0,0.2);
              border: 1px solid #e5e7eb;
              font-family: system-ui, -apple-system, sans-serif;
              cursor: default;
            ">
              <div style="font-weight: bold; font-size: 1.2em; margin-bottom: 8px; color: #1f2937;">${name}</div>
              <div style="color: #6b7280; font-size: 0.95em; margin-bottom: 8px; font-weight: 500;">${location}</div>
              ${ownership ? `<div style="color: #374151; font-size: 0.9em; margin-bottom: 8px;"><strong>Owner:</strong> ${ownership}</div>` : ''}
              <div style="color: #374151; font-size: 0.95em; line-height: 1.4;">${details}</div>
              <div style="
                margin-top: 12px; 
                padding-top: 8px; 
                border-top: 1px solid #f3f4f6; 
                font-size: 0.8em; 
                color: #9ca3af;
                text-align: center;
              ">Click anywhere outside to close</div>
            </div>
          `;

            currentPopup = new mapboxgl.Popup({
              closeOnClick: false, // Don't auto-close on map click
              closeButton: true,   // Show close button
              maxWidth: '400px',
              className: 'mine-popup'
            })
              .setLngLat(coordinates as [number, number])
              .setHTML(popupContent)
              .addTo(map.current!);

            // Make popup hoverable - prevent it from closing when mouse is over it
            const popupElement = currentPopup.getElement();
            if (popupElement) {
              popupElement.addEventListener('mouseenter', () => {
                // Keep popup open when hovering over it
              });

              popupElement.addEventListener('mouseleave', () => {
                // Optional: auto-close after a delay when mouse leaves popup
                setTimeout(() => {
                  if (currentPopup && !popupElement.matches(':hover')) {
                    currentPopup.remove();
                    currentPopup = null;
                  }
                }, 1000); // 1 second delay
              });
            }
          };

          // Add click handlers for both the dot icons and larger clickable areas
          map.current.on('click', 'mine-dots', showPopup);
          map.current.on('click', 'mine-clickable-circles', showPopup);

          // Add hover functionality - show popup on hover
          map.current.on('mouseenter', 'mine-clickable-circles', showPopup);
          map.current.on('mouseenter', 'mine-dots', showPopup);

          // Add hover effects for better UX
          map.current.on('mouseenter', 'mine-clickable-circles', () => {
            if (map.current) {
              map.current.getCanvas().style.cursor = 'pointer';
            }
          });

          map.current.on('mouseleave', 'mine-clickable-circles', () => {
            if (map.current) {
              map.current.getCanvas().style.cursor = '';
            }
          });

          // Hide popup when mouse leaves the clickable area (with delay)
          map.current.on('mouseleave', 'mine-clickable-circles', () => {
            setTimeout(() => {
              if (currentPopup) {
                const popupElement = currentPopup.getElement();
                if (popupElement && !popupElement.matches(':hover')) {
                  currentPopup.remove();
                  currentPopup = null;
                }
              }
            }, 200); // Short delay to allow moving to popup
          });

          map.current.on('mouseleave', 'mine-dots', () => {
            setTimeout(() => {
              if (currentPopup) {
                const popupElement = currentPopup.getElement();
                if (popupElement && !popupElement.matches(':hover')) {
                  currentPopup.remove();
                  currentPopup = null;
                }
              }
            }, 200); // Short delay to allow moving to popup
          });

          // Close popup when clicking elsewhere on the map
          map.current.on('click', (e) => {
            const features = map.current?.queryRenderedFeatures(e.point, {
              layers: ['mine-dots', 'mine-clickable-circles']
            });
            if (!features || !features.length) {
              if (currentPopup) {
                currentPopup.remove();
                currentPopup = null;
              }
            }
          });

          clickHandlersAdded = true;
        }

        mineLayersAdded = true; // Mark as added to prevent repeated additions
      }

      // Now define addDotImageAndLayer, which can call addMineLayer
      function addDotImageAndLayer() {
        if (!map.current) return;
        // The dot icon is already added via addReactIconsToMapbox in addMineLayer
        addMineLayer();
      }

      // Add on style load only once
      const mapInstance = map.current;
      function handleStyleData() {
        if (!mineLayersAdded && map.current && map.current.isStyleLoaded()) {
          addDotImageAndLayer();
        }
      }

      // Only add the event listener if the style isn't already loaded
      if (!map.current.isStyleLoaded()) {
        mapInstance.on('styledata', handleStyleData);
      } else {
        // If style is already loaded, call immediately
        handleStyleData();
      }

      // Cleanup function for the inner timeout
      return () => {
        if (mapInstance) {
          mapInstance.off('styledata', handleStyleData);
        }
      };
    }, 100); // 100ms delay

    // Cleanup function for the useEffect
    return () => {
      clearTimeout(timer);
    };
  }, [mapReady]);

  useEffect(() => {
    if (!map.current || !mapReady || !map.current.isStyleLoaded()) return;
    // ... existing code for mine-gears, mine-labels, and mine resource icons ...
  }, [mapReady, highlightedCountryId, countryOption]);

  // Example for zoom-based layer visibility effect:
  useEffect(() => {
    if (!map.current || !mapReady || !map.current.isStyleLoaded()) return;
    // ... existing code for zoom-based visibility ...
  }, [mapZoom, mapReady]);

  // Apply this pattern to all useEffects that interact with the map (getStyle, add/remove layers/sources, etc.)
  // ... existing code ...

  //console.log('[MapComponent] Map component rendered');



  return (
    <div className="relative h-screen w-screen">
      <div ref={mapContainer} className="absolute inset-0 h-full w-full" />

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
          activeOverlays={activeOverlays}
          setActiveOverlays={setActiveOverlays}
          setHighlightedCountryId={setHighlightedCountryId}
          highlightedCountryId={highlightedCountryId}
        />
      </div>

      {(panelOpen || (gdpFilter === 0 && !highlightedCountryId)) && (
        <InfoPanel
          gdpFilter={gdpFilter}
          selectedEconomy={selectedEconomy}
          selectedSociety={selectedSociety}
          selectedGovernment={selectedGovernment}
          exports={exports || ""}
          imports={imports || ""}
          subFilter={Object.keys(activeOverlays).find(key => activeOverlays[key]) || "Overview"}
          exportsPartners={exportPartners || ""}
          importsPartners={importPartners || ""}
          infoPanelIcons={infoPanelIcons}
          infoPanelIconElements={infoPanelIconElementsState}
          activeTab={activeTab}
          setActiveTab={setActiveTab}
        />
      )}
      {/* Show Legend only if Resources or Overview is active and no country is selected */}
      {(activeOverlays.Resources || activeOverlays.Overview) && !highlightedCountryId && <Legend />}

      <button
        id="btn-spin"
        onClick={handleSpinButtonClick}
        className="absolute bottom-6 right-4 bg-violet-800 text-white p-2 px-4 rounded-lg"
      >
        {spinEnabled ? "Pause" : "Rotate"}
      </button>

      {/* Only render icon components when a country is selected */}
      {highlightedCountryId && (
        <>
          <ExportIcons exports={exports || ''} onIconsGenerated={handleExportIconsGenerated} />
          <ImportIcons imports={imports || ''} onIconsGenerated={handleImportIconsGenerated} />
        </>
      )}
    </div>
  );
}