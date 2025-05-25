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
import { LuMilk, LuBeef, LuBean  } from 'react-icons/lu';
import {GiWoodPile, GiCorn, GiGoldMine, GiMedicines, GiDoubleFish, GiMetalBar, GiBeetleShell, GiTurbine, GiWireCoil, GiBowlOfRice, GiSugarCane, GiSheep, GiButter, GiBeerStein, GiCoconuts, GiBananaBunch, GiPearlNecklace, GiCigarette, GiRubberBoot, GiChemicalDrop, GiOre } from "react-icons/gi";
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

mapboxgl.accessToken = process.env.NEXT_PUBLIC_MAPBOX_TOKEN || "";

interface MapComponentProps {
  searchTerm: string;
  gdpFilter: number;
}

// Generate arc from start point to the end point.
// The segments parameter tell us how many
// new point should we generate.
function generateArc(start: Feature<Point>, end: Feature<Point>, segments: number): number[][] {
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
    for (let angle = 0; angle < 180; angle += (180/ (segments))) {
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

// Helper function to normalize country names for robust comparison
const normalizeCountryName = (name: string): string => {
  return name.toLowerCase().replace(/[^a-z0-9]/g, '');
};

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
  const [countriesFeatures, setCountriesFeatures] = useState<any[] | null>(null); // State to store GeoJSON features
  const [isCountriesDataReady, setIsCountriesDataReady] = useState(false); // State to indicate if country data is loaded
  // Now these are correctly inside the component
  const [animationPaused, setAnimationPaused] = useState(false);
  const animatedPointIds = useRef<Set<string>>(new Set()); // Track all active animated point IDs
  const currentAnimationContext = useRef<string>(''); // Track the current animation context (country+filter)
  const animationFrameIds = useRef<number[]>([]); // Track animation frame IDs for cancellation
  const [mapReady, setMapReady] = useState(false);

  // Generate a unique context key for the current country and filter
  // This allows us to track which animations belong to the current context
  const getAnimationContextKey = (countryId: string | null, filterType: string): string => {
    return `${countryId || 'none'}-${filterType}`;
  };

  // Helper function to cancel all animation frames
  const cancelAllAnimationFrames = () => {
    animationFrameIds.current.forEach(frameId => {
      window.cancelAnimationFrame(frameId);
    });
    animationFrameIds.current = [];
  };

  // Enhanced cleanup function for animations
  const cleanupAllAnimations = () => {
    if (!map.current || !map.current.isStyleLoaded()) return; // Only run if style is loaded
    try {
      // Cancel all animation frames first
      cancelAllAnimationFrames();
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
          animatedPointIds.current.delete(sourceId);
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
      animatedPointIds.current.clear();
      
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
      currentAnimationContext.current = '';
      
      console.log("Animation cleanup complete, removed all animation sources and layers");
    } catch (error) {
      console.error("Error cleaning up animations:", error);
    }
  };

  // Animation function for moving points along arcs
  const animate = (
    mapInstance: mapboxgl.Map, 
    counter: number, 
    arcData: any, 
    pointData: any, 
    sourceId: string, 
    segments: number,
    contextKey: string // Add context key parameter
  ) => {
    // Skip animation if paused
    if (animationPaused) return;

    // Check if animation context has changed
    if (contextKey !== currentAnimationContext.current) {
      console.log(`Animation context changed. Expected: ${currentAnimationContext.current}, Got: ${contextKey}`);
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
      animatedPointIds.current.delete(sourceId);
      return; // Exit early if the animation context has changed
    }

    // Check if the source still exists (prevents errors when cleaning up)
    if (!mapInstance.getSource(sourceId)) {
      console.log("Animation source removed:", sourceId);
      animatedPointIds.current.delete(sourceId);
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
        animate(mapInstance, counter + 1, arcData, pointData, sourceId, segments, contextKey);
      });
      animationFrameIds.current.push(frameId);
    }
  };

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
        updateLayerVisibility();
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
      cancelAllAnimationFrames();

      // Clean up previous animations
      cleanupAllAnimations();

      const clickedCountryId = e.features[0].id; // Adjust based on your feature structure
      console.log("Country click detected:", clickedCountryId);

      // Get the country center coordinates with fallbacks and validation
      let centerLng = 0, centerLat = 0;
      
      // Try to get coordinates from feature properties
      if (e.features[0] && e.features[0].properties) {
        const props = e.features[0].properties;
        if (props.LABEL_X && props.LABEL_Y) {
          centerLng = parseFloat(props.LABEL_X);
          centerLat = parseFloat(props.LABEL_Y);
        }
      }
      
      // If coordinates are invalid, use click position
      if (isNaN(centerLng) || isNaN(centerLat) || !centerLng || !centerLat) {
        if (e.lngLat) {
          centerLng = e.lngLat.lng;
          centerLat = e.lngLat.lat;
        } else {
          // Default values as last resort
          centerLng = 20;
          centerLat = 40;
        }
      }
      
      // Final validation to prevent NaN errors
      if (isNaN(centerLng) || isNaN(centerLat)) {
        centerLng = 20;
        centerLat = 40;
      }
      
      // Create a properly typed coordinate tuple
      const coordinates: [number, number] = [centerLng, centerLat];
      
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
        cleanupAllAnimations();
        
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
        cleanupAllAnimations();
        
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
             
      const unemployment =
        result["Economy"]?.["Unemployment rate"]?.["Unemployment rate 2023"]?.[
          "text"
        ] || "";
      const debt =
        result["Economy"]?.["Public debt"]?.["Public debt 2023"]?.["text"] ||
        "";
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
      const pop =
        result["People and Society"]?.["Population"]?.["total"]?.["text"] || "";

      const govt = result["Government"]?.["Government type"]?.["text"] || "";
      const parties =
        result["Government"]?.["Political parties"]?.["text"] || "";
      const capital =
        result["Government"]?.["Capital"]?.["name"]?.["text"] || "";

      console.log("Generated economy info for:", NAME);
      const infoEconomy = [title , overview, unemployment, debt, inflation, gdpcapita, industries, resources, inflationSeries]
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

      // Store only the features array in the ref for coordinate lookup
      setCountriesFeatures(countriesGeoJSON.features);
      console.log("countriesFeatures set in addDataLayers:", countriesGeoJSON.features);

      // Set data ready state to true after data is loaded and state is set
      setIsCountriesDataReady(true);

      // Temporary log to inspect feature names
      // countriesGeoJSON.features.forEach((feature: any) => {
      //   console.log("Feature name:", feature.properties.NAME);
      // });

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
          data: countriesGeoJSON, // Pass the original fetched object here
        });

        const govtLayer: mapboxgl.FillLayer = {
          id: "gdpcapita-fill",
          type: "fill",
          source: "data",
          paint: {
            "fill-color": [
              "case",
              ["==", ["get", "SUBREGION"], "Central Asia"],
              "#ed5151", // Color for Asia
              ["==", ["get", "SUBREGION"], "Western Asia"],
              "#9e559c", // Color for Americas
              ["==", ["get", "SUBREGION"], "Southern Asia"],
              "#a7c636", // Color for Africa
              ["==", ["get", "SUBREGION"], "Eastern Asia"],
              "#9e559c", // Color for Oceania
              ["==", ["get", "SUBREGION"], "South-Eastern Asia"],
              "#ed5151", // Color for Oceania

              ["==", ["get", "SUBREGION"], "Middle Africa"],
              "#9e559c", // Color for Asia
              ["==", ["get", "SUBREGION"], "Western Africa"],
              "#a7c636", // Color for Americas
              ["==", ["get", "SUBREGION"], "Southern Africa"],
              "#a7c636", // Color for Africa
              ["==", ["get", "SUBREGION"], "Eastern Africa"],
              "#fc921f", // Color for Oceania
              ["==", ["get", "SUBREGION"], "Northern Africa"],
              "#ed5151", // Color for Africa

              ["==", ["get", "SUBREGION"], "Western Europe"],
              "#9e559c", // Color for Americas
              ["==", ["get", "SUBREGION"], "Southern Europe"],
              "#a7c636", // Color for Africa
              ["==", ["get", "SUBREGION"], "Eastern Europe"],
              "#fc921f", // Color for Oceania
              ["==", ["get", "SUBREGION"], "Northern Europe"],
              "#ed5151", // Color for Oceania

              ["==", ["get", "SUBREGION"], "Central America"],
              "#9e559c", // Color for Americas
              ["==", ["get", "SUBREGION"], "South America"],
              "#a7c636", // Color for Africa
              ["==", ["get", "SUBREGION"], "Caribbean"],
              "#fc921f", // Color for Oceania
              ["==", ["get", "SUBREGION"], "Northern America"],
              "#ed5151", // Color for Oceania

              ["==", ["get", "SUBREGION"], "Australia and New Zealand"],
              "#fc921f", // Color for Oceania
              ["==", ["get", "SUBREGION"], "Melanesia"],
              "#ed5151", // Color for Oceania

              "#Ffffff", // Default color (white or any fallback color)
            ],
            "fill-opacity": 0.1,
          },
        };

        const populationLayer: mapboxgl.FillLayer = {
          id: "population-fill",
          type: "fill",
          source: "data",
         // maxzoom: 3,
          paint: {
            "fill-color": [
              "interpolate",
              ["linear"],
              ["get", "POP_EST"],
              0,
              "#fef3c7",      // Light yellow
              10000000,
              "#f59e0b",      // Orange
              100000000,
              "#dc2626",      // Red
              1000000000,
              "#7f1d1d",  
            ],
            "fill-opacity": 0.5,
          },
        };

        const gdpLayer: mapboxgl.FillLayer = {
          id: "gdp-fill",
          type: "fill",
          source: "data",
          //maxzoom: 3,
          paint: {
            "fill-color": [
              "interpolate",
              ["linear"],
              ["get", "GDP_MD"],
              0,
              "#d1fae5",      // Light emerald
              100000,
              "#6ee7b7",      // Medium emerald
              1000000,
              "#10b981",      // Emerald
              10000000,
              "#047857", 
            ],
            "fill-opacity": 0.5,
          },
        };

        //map.current.addLayer(govtLayer);
        map.current.addLayer(populationLayer);
        map.current.addLayer(gdpLayer);

        map.current?.setFog({
          color: "rgb(186, 210, 235)",
          "high-color": "rgb(36, 92, 223)",
          "horizon-blend": 0.001,
          "space-color": "rgb(11, 11, 25)",
          "star-intensity": 0.1,
        });

        map.current?.addSource("countries", {
          type: "vector",
          url: "mapbox://mapbox.country-boundaries-v1",
        });

        const exportLayerDefinition: mapboxgl.FillLayer = {
          id: "export-fill",
          type: "fill",
          source: "countries",
          "source-layer": "country_boundaries",
          paint: {
            "fill-color": "#8B5CF6",
            "fill-opacity": 1,
          },
        };

        const importLayerDefinition: mapboxgl.FillLayer = {
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

       // map.current.exportLayer = exportLayerDefinition;
       // map.current.importLayer = importLayerDefinition;
        map.current?.addLayer({
          id: "country-fills",
          type: "fill",
          source: "countries",
          "source-layer": "country_boundaries",
          layout: {},
          paint: {
            "fill-color": "#f59e0b",
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
    const gdpLegend = document.getElementById("gdp-legend");
    if (gdpLegend) gdpLegend.style.display = "none";
    const populationLegend = document.getElementById("population-legend");
    if (populationLegend) populationLegend.style.display = "none";
    const gdpCapitaLegend = document.getElementById("gdp-capita-legend");
    if (gdpCapitaLegend) gdpCapitaLegend.style.display = "none";

    // Show the selected legend
    if (layer === "gdp") {
      if (gdpLegend) gdpLegend.style.display = "block";
    } else if (layer === "population") {
      if (populationLegend) populationLegend.style.display = "block";
    } else if (layer === "gdp-capita") {
      console.log("GDPCAP", layer);
      if (gdpCapitaLegend) gdpCapitaLegend.style.display = "block";
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

  // Function to parse export/import partners string
  const parseExportPartners = (exports: string): string[] => {
    // Use the global countryNameMapping
    return exports
      .split(",")
      .map((country) => {
        const countryName = country.split(/\s*\d+%/)[0].trim();
        return countryNameMapping[countryName] || countryName;
      })
      .filter(Boolean);
  };

  // Enhanced highlightExportPartners to use the improved cleanup
  const highlightExportPartners = (
    event: React.ChangeEvent<HTMLSelectElement>
  ) => {
    const selectedValue = event.target.value;
    console.log("Selected filter:", selectedValue);
    setActiveOverlays({ ...activeOverlays, exports: true });

    // --- Start Cleanup for previous animations ---
    cleanupAllAnimations();
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
      const exportLayerDefinition: mapboxgl.FillLayer = {
        id: "export-fill",
        type: "fill",
        source: "countries",
        "source-layer": "country_boundaries",
        paint: {
          "fill-color": "#8B5CF6", // Initial color, will be updated by data-driven style
          "fill-opacity": 1,
        },
      };
      map.current?.addLayer(exportLayerDefinition);

      const partners = parseExportPartners(exportPartners || '');
      if (!map.current || partners.length === 0) {
        // If no partners, keep the layer but set its visibility to none
        if (map.current?.getLayer("export-fill")) {
           map.current.setLayoutProperty("export-fill", "visibility", "none");
        }
        return;
      }

      const filter = ["any", ...partners.map((country) => ["==", "name", country])];
      console.log("Export filter selected, export data:", exportPartners);

      // Create country-color mapping for highlighting
      const countryColorMap: { [country: string]: string } = {};
      partners.forEach((partner, index) => {
        countryColorMap[partner] = exportChartColors[index % exportChartColors.length];
      });

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
      const importLayerDefinition: mapboxgl.FillLayer = {
        id: "import-fill",
        type: "fill",
        source: "countries",
        "source-layer": "country_boundaries",
        paint: {
          "fill-color": "#8B5CF6", // Initial color, will be updated by data-driven style
          "fill-opacity": 1,
        },
      };
      map.current?.addLayer(importLayerDefinition);

      const partners = parseExportPartners(importPartners || '');
      if (!map.current || partners.length === 0) {
        // If no partners, keep the layer but set its visibility to none
         if (map.current?.getLayer("import-fill")) {
           map.current.setLayoutProperty("import-fill", "visibility", "none");
         }
        return;
      }

      const filter = ["any", ...partners.map((country) => ["==", "name", country])];

      // Create country-color mapping for highlighting
      const countryColorMap: { [country: string]: string } = {};
      partners.forEach((partner, index) => {
        countryColorMap[partner] = importChartColors[index % importChartColors.length];
      });

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
      updateLayerVisibility();
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
      const layerDefinition: mapboxgl.FillLayer = {
        id: layerId,
        type: "fill",
        source: "countries",
        "source-layer": "country_boundaries",
        paint: {
          "fill-color": "#8B5CF6", // Initial color, will be updated by data-driven style
          "fill-opacity": 1,
        },
      };
      map.current.addLayer(layerDefinition);
    }

    if (partners.length === 0) {
       if (map.current?.getLayer(layerId)) {
           map.current.setLayoutProperty(layerId, "visibility", "none");
        }
        return;
    }

    const filter = ["any", ...partners.map((country) => ["==", "name", country])];
    console.log(`Applying filter for ${activeOverlays}:`, filter);

    // Create country-color mapping for highlighting
    const countryColorMap: { [country: string]: string } = {};
    partners.forEach((partner, index) => {
      countryColorMap[partner] = colorPalette[index % colorPalette.length];
    });

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

  // Helper function to find country coordinates by name
  const getCountryCoordinates = (countryName: string): [number, number] | null => {
    if (!countriesFeatures) {
      console.log("countriesFeatures state is null"); // Log if state is null
      return null;
    }
    // Translate the country name using the mapping
    const geojsonCountryName = countryNameMapping[countryName] || countryName;

    const normalizedSearchName = normalizeCountryName(geojsonCountryName);

    // Manually loop through features to debug Hong Kong S.A.R.
    for (const feature of countriesFeatures) {
        const normalizedFeatureName = normalizeCountryName(feature.properties.NAME);

        // Log comparison specifically for Hong Kong S.A.R.
        if (normalizedSearchName === normalizeCountryName('Hong Kong S.A.R.')) {
             console.log(`Manual comparison: '${normalizedFeatureName}' === '${normalizedSearchName}'`);
             console.log(`Manual comparison result: ${normalizedFeatureName === normalizedSearchName}`);
        }

        if (normalizedFeatureName === normalizedSearchName) {
            if (feature && feature.properties.LABEL_X && feature.properties.LABEL_Y) {
              const lng = parseFloat(feature.properties.LABEL_X);
              const lat = parseFloat(feature.properties.LABEL_Y);
              if (!isNaN(lng) && !isNaN(lat)) {
                console.log(`Found coordinates for ${countryName} using manual lookup: [${lng}, ${lat}]`); // Log found coordinates
                return [lng, lat];
              }
            }
        }
    }

    console.log(`Could not find coordinates for ${countryName} after manual search`); // Log if coordinates not found
    return null;
  };

  // New useEffect to handle arc drawing
  useEffect(() => {
    console.log("Arc drawing useEffect triggered");

    // Cancel any existing animation frames
    cancelAllAnimationFrames();

    // Always remove existing arcs before drawing new ones
    if (map.current?.getLayer('arcs-layer')) map.current.removeLayer('arcs-layer');
    if (map.current?.getSource('arcs-source')) map.current.removeSource('arcs-source');

    // --- Start Cleanup for previous animated points ---
    cleanupAllAnimations();
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
        const partnerCoords = getCountryCoordinates(partner);
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
              newContextKey
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
      cancelAllAnimationFrames();
      
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

  // Add mine site coordinates and names
  const mineSites = [
    {
      name: "Bingham Canyon Mine",
      coordinates: [-112.1500, 40.5200],
      resources: ["copper", "gold", "silver", "molybdenum", "rare earth elements"],
      ownership: "Rio Tinto Group",
      location: "Southwest of Salt Lake City, Utah, USA",
      details: "Largest man-made excavation, primarily copper, also produces gold, silver, and molybdenum. Over 19 million tons of copper produced since 1906. Depth of 1,200 meters, employs ~2,500 people."
    },
    {
      name: "Grasberg Mine",
      coordinates: [137.1167, -4.0533],
      resources: ["gold", "copper", "silver"],
      ownership: "Freeport-McMoRan (48.76%), PT Mineral Industri Indonesia (51.24%)",
      location: "Papua, Indonesia",
      details: "World's largest gold mine and second-largest copper mine, with open-pit and underground operations. Produced ~1.861 million ounces of gold in 2024. Covers 27,400 acres, employs ~19,500 people."
    },
    {
      name: "Muruntau Mine",
      coordinates: [64.5833, 41.4667],
      resources: ["gold"],
      ownership: "Navoi Mining and Metallurgical Company",
      location: "Kyzylkum Desert, Navoiy Viloyati, Uzbekistan",
      details: "One of the largest open-pit gold mines, producing ~1.8 million ounces of gold in 2023. Estimated reserves of 4,500 metric tons of gold. Operations expected to continue into the 2030s."
    },
    {
      name: "Chuquicamata Mine",
      coordinates: [-68.9000, -22.3000],
      resources: ["copper"],
      ownership: "Codelco",
      location: "Northern Chile, near Calama",
      details: "Largest open-pit copper mine by volume, producing ~500,000 tonnes of copper annually. Second-deepest open-pit mine at 850 meters. Nationalized by Chile in the 1960s."
    },
    {
      name: "El Teniente Mine",
      coordinates: [-70.3833, -34.0833],
      resources: ["copper"],
      ownership: "Codelco",
      location: "Andes Mountains, 100 km southeast of Santiago, Chile",
      details: "World's largest underground copper mine, with over 3,000 km of tunnels. Produces ~500,000 tonnes of copper yearly."
    },
    {
      name: "Mirny Diamond Mine",
      coordinates: [113.9931, 62.5289],
      resources: ["diamonds"],
      ownership: "Mirny GOK (Alrosa)",
      location: "Eastern Siberia, Russia",
      details: "Massive open-pit diamond mine, now primarily underground. Measures 1.25 km wide, 525m deep, producing ~2,000 kg of diamonds annually."
    },
    {
      name: "Black Thunder Mine",
      coordinates: [-105.3167, 43.6667],
      resources: ["coal"],
      ownership: "Arch Resources",
      location: "Southern Powder River Basin, Wyoming, USA",
      details: "World's largest coal mine by production, yielding ~62.68 million tonnes in 2023. Produces low-sulfur sub-bituminous coal."
    },
    {
      name: "Gevra OC Mine",
      coordinates: [82.5500, 22.3333],
      resources: ["coal"],
      ownership: "South Eastern Coalfields Limited",
      location: "Korba district, Chhattisgarh, India",
      details: "India's largest coal mine, producing ~60 million tonnes in 2023. Operates as an open-cast mine."
    },
    {
      name: "North Antelope Rochelle Mine",
      coordinates: [-105.2000, 43.7167],
      resources: ["coal"],
      ownership: "Peabody Energy",
      location: "Campbell County, Wyoming, USA",
      details: "World's third-largest coal mine by production, with ~56.25 million tonnes in 2023. Known for low-sulfur sub-bituminous coal."
    },
    {
      name: "Olimpiada Gold Mine",
      coordinates: [93.5000, 64.0000],
      resources: ["gold"],
      ownership: "Polyus",
      location: "Krasnoyarsk Krai, Russia",
      details: "Russia's largest gold mine, producing ~1.441 million ounces in 2024. Holds ~26 million ounces in reserves."
    },
    {
      name: "Carajás Mine",
      coordinates: [-50.1667, -6.0667],
      resources: ["iron ore", "gold", "copper", "nickel"],
      ownership: "Vale",
      location: "Pará state, Brazil",
      details: "World's largest iron ore mine, producing ~150 million tonnes of iron ore annually. Also produces gold, copper, and nickel. Discovered in the 1960s, employs self-driving trucks."
    },
    {
      name: "Oyu Tolgoi Mine",
      coordinates: [106.8667, 43.0167],
      resources: ["copper", "gold"],
      ownership: "Rio Tinto (66%), Government of Mongolia (34%)",
      location: "South Gobi Desert, Mongolia",
      details: "Combined open-pit and underground mine, producing ~450,000 tonnes of copper and ~1.7 million ounces of gold to date. Discovered in 2001."
    },
    {
      name: "Kiruna Mine",
      coordinates: [20.2000, 67.8500],
      resources: ["iron ore"],
      ownership: "Luossavaara-Kiirunavaara AB (LKAB)",
      location: "Kiruna, Sweden",
      details: "Largest and most modern underground iron ore mine, producing ~27 million tonnes annually. Ore body is 4 km long, up to 2 km deep."
    },
    {
      name: "Garzweiler Mine",
      coordinates: [6.5000, 51.0500],
      resources: ["coal"],
      ownership: "RWE Power",
      location: "North Rhine-Westphalia, Germany",
      details: "One of Europe's largest open-pit lignite mines, producing ~35 million tonnes of coal annually. Covers ~48 square kilometers."
    },
    {
      name: "Batu Hijau Mine",
      coordinates: [116.9333, -8.9667],
      resources: ["copper", "gold"],
      ownership: "PT Amman Mineral Nusa Tenggara",
      location: "Sumbawa, Indonesia",
      details: "Produced ~1.009 million ounces of gold in 2024. Significant copper producer, employs advanced mining technology."
    },
    {
      name: "Kazzinc Consolidated",
      coordinates: [69.1000, 50.4000],
      resources: ["gold", "zinc", "lead", "silver"],
      ownership: "Kazzinc Ltd (Glencore 70%)",
      location: "East Kazakhstan",
      details: "Produced ~1 million ounces of gold in 2024. Major zinc and lead producer, with significant precious metals output."
    },
    {
      name: "Ahafo Mine",
      coordinates: [-2.3167, 7.3167],
      resources: ["gold"],
      ownership: "Newmont (90%), Government of Ghana (10%)",
      location: "Brong-Ahafo Region, Ghana",
      details: "Produced ~798,000 ounces of gold in 2024. Newmont's only operation in Africa, with both surface and underground mining."
    },
    {
      name: "Kibali Mine",
      coordinates: [29.6000, 3.1333],
      resources: ["gold"],
      ownership: "AngloGold Ashanti (45%), Barrick (45%), Societe Miniere de Kilo-Moto (10%)",
      location: "Haut-Uele Province, Democratic Republic of Congo",
      details: "Produced ~686,667 ounces of gold in 2024. Africa's largest bullion operation, with recent discoveries extending mine life."
    },
    {
      name: "Detour Lake Mine",
      coordinates: [-79.6667, 50.0167],
      resources: ["gold"],
      ownership: "Agnico Eagle Mines",
      location: "Ontario, Canada",
      details: "Produced ~671,950 ounces of gold in 2024. Investments aim to increase production to 1 million ounces annually, with mine life to 2054."
    },
    {
      name: "Canadian Malartic Mine",
      coordinates: [-78.1333, 48.1333],
      resources: ["gold"],
      ownership: "Agnico Eagle Mines",
      location: "Abitibi Region, Quebec, Canada",
      details: "Produced ~655,654 ounces of gold in 2024. Significant open-pit and underground operations, with exploration potential."
    },
    
      // Lithium
      {
        name: "Greenbushes Mine",
        coordinates: [115.9500, -33.8667],
        resources: ["lithium"],
        ownership: "Talison Lithium (Tianqi Lithium 51%, Albemarle 49%)",
        location: "Western Australia, Australia",
        details: "World's largest hard-rock lithium mine, producing ~1.95 million tonnes of lithium concentrate annually. Supplies ~40% of global lithium. Operational since 1983."
      },
      {
        name: "Salar del Hombre Muerto",
        coordinates: [-66.9167, -25.4167],
        resources: ["lithium"],
        ownership: "Arcadium Lithium",
        location: "Catamarca, Argentina",
        details: "Major lithium brine operation, producing ~25,000 tonnes of lithium carbonate equivalent (LCE) annually. Part of Rio Tinto's portfolio post-Arcadium acquisition."
      },
      {
        name: "Olaroz Mine",
        coordinates: [-66.7500, -23.4167],
        resources: ["lithium"],
        ownership: "Arcadium Lithium",
        location: "Jujuy, Argentina",
        details: "Produces ~17,500 tonnes of LCE annually. Part of Lithium Triangle, key for EV battery production. Expanding capacity to 42,500 tonnes by 2026."
      },
      {
        name: "Mount Holland Mine",
        coordinates: [119.7167, -32.1167],
        resources: ["lithium"],
        ownership: "SQM (50%), Wesfarmers (50%)",
        location: "Western Australia, Australia",
        details: "One of world's largest hard-rock lithium deposits, producing ~50,000 tonnes of spodumene concentrate annually. Began production in 2024."
      },
      {
        name: "Bikita Mine",
        coordinates: [31.9167, -20.0833],
        resources: ["lithium"],
        ownership: "Sinomine Resource Group",
        location: "Masvingo Province, Zimbabwe",
        details: "Africa's richest lithium reserve, targeting ~300,000 tonnes of spodumene concentrate annually post-2022 upgrade. Acquired by China's Sinomine for $180M."
      },
    
      // Cobalt
      {
        name: "Katanga Mine",
        coordinates: [27.2500, -11.6667],
        resources: ["cobalt", "copper"],
        ownership: "Glencore",
        location: "Katanga Province, Democratic Republic of Congo",
        details: "Major cobalt producer, yielding ~22,000 tonnes of cobalt in 2023. By-product of copper mining, significant for EV batteries."
      },
      {
        name: "Mutanda Mine",
        coordinates: [27.3333, -11.7333],
        resources: ["cobalt", "copper"],
        ownership: "Glencore",
        location: "Katanga Province, Democratic Republic of Congo",
        details: "Produced ~15,000 tonnes of cobalt in 2023. Temporarily closed in 2019 due to low prices, resumed in 2021. Key for global cobalt supply."
      },
      {
        name: "Murrin Murrin Mine",
        coordinates: [121.8833, -28.7167],
        resources: ["cobalt", "nickel"],
        ownership: "Glencore",
        location: "Western Australia, Australia",
        details: "Produces ~2,000 tonnes of cobalt annually as nickel by-product. Significant laterite deposit, operational since 1999."
      },
      {
        name: "Tenke Fungurume Mine",
        coordinates: [26.3167, -10.5667],
        resources: ["cobalt", "copper"],
        ownership: "China Molybdenum (80%), Gécamines (20%)",
        location: "Lualaba Province, Democratic Republic of Congo",
        details: "One of world's largest cobalt mines, producing ~10,000 tonnes annually. Major copper-cobalt operation."
      },
    
      // Manganese
      {
        name: "Kalahari Manganese Field (South 32)",
        coordinates: [24.8000, -27.1167],
        resources: ["manganese"],
        ownership: "South32",
        location: "Northern Cape, South Africa",
        details: "World's largest manganese deposit, producing ~3.5 million tonnes annually. Supplies 25% of global manganese for steel and batteries."
      },
      {
        name: "Moanda Mine",
        coordinates: [13.2000, -1.6667],
        resources: ["manganese"],
        ownership: "Comilog (Eramet)",
        location: "Haut-Ogooué Province, Gabon",
        details: "Produces ~4 million tonnes of manganese ore annually. One of Africa's largest manganese operations, key for battery-grade manganese."
      },
      {
        name: "Bootu Creek Mine",
        coordinates: [131.1667, -18.6667],
        resources: ["manganese"],
        ownership: "OM Holdings",
        location: "Northern Territory, Australia",
        details: "Produces ~800,000 tonnes of manganese ore annually. Supplies steel and battery industries, operational since 2005."
      },
      {
        name: "Bondoukou Mine",
        coordinates: [-2.8000, 8.0333],
        resources: ["manganese"],
        ownership: "Taurus Gold Limited",
        location: "Zanzan District, Côte d'Ivoire",
        details: "One of four operating manganese mines in Côte d'Ivoire, producing ~500,000 tonnes annually. Exports primarily to China."
      },
    
      // Uranium
      {
        name: "Cigar Lake Mine",
        coordinates: [-104.5333, 58.0667],
        resources: ["uranium"],
        ownership: "Cameco (50.02%), Orano (37.1%), Idemitsu (7.88%), TEPCO (5%)",
        location: "Saskatchewan, Canada",
        details: "World's highest-grade uranium mine, producing ~7,000 tonnes of uranium annually. Supplies ~10% of global uranium."
      },
      {
        name: "Husab Mine",
        coordinates: [15.0333, -22.9167],
        resources: ["uranium"],
        ownership: "Swakop Uranium (CGN 90%, Epangelo Mining 10%)",
        location: "Namib Desert, Namibia",
        details: "Produces ~3,500 tonnes of uranium annually. One of world's largest uranium mines, operational since 2016."
      },
      {
        name: "Olympic Dam Mine",
        coordinates: [136.8833, -30.4333],
        resources: ["uranium", "copper", "gold", "silver"],
        ownership: "BHP",
        location: "South Australia, Australia",
        details: "Produces ~3,500 tonnes of uranium annually as by-product of copper mining. World's largest known uranium deposit."
      },
      {
        name: "Karatau Mine",
        coordinates: [68.8333, 43.6333],
        resources: ["uranium"],
        ownership: "Kazatomprom",
        location: "South Kazakhstan",
        details: "Produces ~3,000 tonnes of uranium annually. Part of Kazakhstan's dominant uranium industry, supplying ~40% of global uranium."
      },
    
      // Nickel
      {
        name: "Norilsk Nickel Mines",
        coordinates: [88.2000, 69.3333],
        resources: ["nickel", "copper", "palladium", "platinum"],
        ownership: "Nornickel",
        location: "Krasnoyarsk Krai, Russia",
        details: "World's largest nickel producer, yielding ~200,000 tonnes annually. Also produces significant palladium and platinum."
      },
      {
        name: "Kambalda Nickel Operations",
        coordinates: [121.6667, -31.2000],
        resources: ["nickel"],
        ownership: "IGO Limited",
        location: "Western Australia, Australia",
        details: "Produces ~30,000 tonnes of nickel annually. Historic nickel belt, operational since the 1960s."
      },
      {
        name: "Sorowako Mine",
        coordinates: [121.3667, -2.5333],
        resources: ["nickel"],
        ownership: "PT Vale Indonesia",
        location: "South Sulawesi, Indonesia",
        details: "Produces ~75,000 tonnes of nickel annually. Major laterite deposit, key for EV battery supply."
      },
      {
        name: "Raglan Mine",
        coordinates: [-73.6667, 61.6667],
        resources: ["nickel", "cobalt"],
        ownership: "Glencore",
        location: "Nunavik, Quebec, Canada",
        details: "Produces ~40,000 tonnes of nickel annually. Underground operation in Arctic region, also yields cobalt."
      },
    
      // Zinc
      {
        name: "Rampura Agucha Mine",
        coordinates: [74.7333, 25.8333],
        resources: ["zinc", "lead"],
        ownership: "Hindustan Zinc Limited (Vedanta)",
        location: "Rajasthan, India",
        details: "World's largest zinc mine, producing ~650,000 tonnes of zinc annually. Operational since 1991, also significant lead producer."
      },
      {
        name: "Red Dog Mine",
        coordinates: [-162.8333, 68.0667],
        resources: ["zinc", "lead"],
        ownership: "Teck Resources",
        location: "Alaska, USA",
        details: "Produces ~600,000 tonnes of zinc annually. One of world's largest zinc mines, located in remote Arctic region."
      },
      {
        name: "McArthur River Mine",
        coordinates: [136.0833, -16.4333],
        resources: ["zinc", "lead", "silver"],
        ownership: "Glencore",
        location: "Northern Territory, Australia",
        details: "Produces ~250,000 tonnes of zinc annually. Major zinc-lead deposit, operational since 1995."
      },
      {
        name: "Antamina Mine",
        coordinates: [-77.3167, -9.5333],
        resources: ["zinc", "copper", "silver", "molybdenum", "rare earth elements"],
        ownership: "BHP (33.75%), Glencore (33.75%), Teck (22.5%), Mitsubishi (10%)",
        location: "Ancash Region, Peru",
        details: "Produces ~400,000 tonnes of zinc annually. One of world's largest copper-zinc mines."
      },
    
      // Rare Earths
      {
        name: "Bayan Obo Mine",
        coordinates: [109.9667, 41.7833],
        resources: ["rare earth elements"],
        ownership: "China Northern Rare Earth High-Tech",
        location: "Inner Mongolia, China",
        details: "World's largest rare earth mine, producing ~120,000 tonnes of rare earth oxides annually. Supplies ~50% of global rare earths."
      },
      {
        name: "Mountain Pass Mine",
        coordinates: [-115.5333, 35.4833],
        resources: ["rare earth elements"],
        ownership: "MP Materials",
        location: "California, USA",
        details: "Produces ~40,000 tonnes of rare earth oxides annually, focusing on neodymium and praseodymium. Restarted in 2018 after bankruptcy."
      },
      {
        name: "Mount Weld Mine",
        coordinates: [122.1333, -28.8667],
        resources: ["rare earth elements"],
        ownership: "Lynas Rare Earths",
        location: "Western Australia, Australia",
        details: "Produces ~22,000 tonnes of rare earth oxides annually. Key source of neodymium and praseodymium for magnets."
      },
      {
        name: "Kvanefjeld Project",
        coordinates: [-46.0333, 60.9667],
        resources: ["rare earth elements", "uranium"],
        ownership: "Greenland Minerals",
        location: "Southern Greenland",
        details: "Development-stage project with 10.2 million tonnes of rare earth oxides. Uranium by-product halted by Greenland's 2021 ban."
      },
    
      // Potash
      {
        name: "Nutrien Allan Mine",
        coordinates: [-106.0667, 51.9333],
        resources: ["potash"],
        ownership: "Nutrien",
        location: "Saskatchewan, Canada",
        details: "Produces ~3 million tonnes of potash annually. Part of Saskatchewan's vast potash basin, key for fertilizer production."
      },
      {
        name: "Uralkali Berezniki Mine",
        coordinates: [56.8333, 59.4167],
        resources: ["potash"],
        ownership: "Uralkali",
        location: "Perm Krai, Russia",
        details: "Produces ~2.5 million tonnes of potash annually. One of Russia's largest potash operations, supplying global fertilizer markets."
      },
      {
        name: "Mosaic Esterhazy Mine",
        coordinates: [-102.1833, 50.6667],
        resources: ["potash"],
        ownership: "Mosaic Company",
        location: "Saskatchewan, Canada",
        details: "World's largest potash mine, producing ~5.5 million tonnes annually. Operational since 1962, key for agricultural fertilizers."
      },

        // Lithium (Additional Mines)
  {
    name: "Goulamina Mine",
    coordinates: [4.6667, 11.0833],
    resources: ["lithium"],
    ownership: "Ganfeng Lithium (50%), Firefinch Limited (50%)",
    location: "Bamako Region, Mali",
    details: "One of Africa's largest lithium projects, targeting ~400,000 tonnes of spodumene concentrate annually. Production started in 2024, key for EV battery supply."
  },
  {
    name: "Salar de Atacama",
    coordinates: [-68.2000, -23.7500],
    resources: ["lithium"],
    ownership: "SQM (50%), Albemarle (50%)",
    location: "Atacama Region, Chile",
    details: "World's largest lithium brine operation, producing ~70,000 tonnes of lithium carbonate equivalent annually. Supplies ~25% of global lithium."
  },
  {
    name: "Pilgangoora Mine",
    coordinates: [118.8833, -21.0333],
    resources: ["lithium"],
    ownership: "Pilbara Minerals",
    location: "Western Australia, Australia",
    details: "Produces ~300,000 tonnes of spodumene concentrate annually. One of Australia's largest hard-rock lithium mines, operational since 2018."
  },

  // Cobalt (Additional Mines)
  {
    name: "Kamoto Mine",
    coordinates: [25.3833, -10.7167],
    resources: ["cobalt", "copper"],
    ownership: "Katanga Mining (Glencore 75%, Gécamines 25%)",
    location: "Katanga Province, Democratic Republic of Congo",
    details: "Produces ~20,000 tonnes of cobalt annually. Major copper-cobalt operation, critical for EV battery supply."
  },
  {
    name: "Ambatovy Mine",
    coordinates: [48.3167, -18.8333],
    resources: ["cobalt", "nickel"],
    ownership: "Sherritt International (40%), Sumitomo (32.5%), Korea Resources (27.5%)",
    location: "Toamasina, Madagascar",
    details: "Produces ~5,000 tonnes of cobalt annually as a nickel by-product. One of Madagascar's largest mining operations."
  },

  // Manganese (Additional Mines)
  {
    name: "Nsuta Mine",
    coordinates: [-1.9667, 5.2833],
    resources: ["manganese"],
    ownership: "Consolidated Minerals (Tianjin Tewoo 90%, Ghana Manganese Company 10%)",
    location: "Western Region, Ghana",
    details: "Produces ~1.5 million tonnes of manganese ore annually. Operational since 1916, key for steel and battery industries."
  },
  {
    name: "Tshipi Borwa Mine",
    coordinates: [24.7667, -27.3667],
    resources: ["manganese"],
    ownership: "Tshipi é Ntle Manganese Mining (Jupiter Mines 49.9%, Ntsimbintle Mining 50.1%)",
    location: "Northern Cape, South Africa",
    details: "Produces ~3 million tonnes of manganese ore annually. One of South Africa's largest manganese exporters."
  },

  // Uranium (Additional Mines)
  {
    name: "McArthur River Mine",
    coordinates: [-105.0333, 57.7667],
    resources: ["uranium"],
    ownership: "Cameco (69.805%), Orano (30.195%)",
    location: "Saskatchewan, Canada",
    details: "World's largest high-grade uranium mine, producing ~6,800 tonnes annually. Temporarily suspended in 2018, resumed in 2022."
  },
  {
    name: "Rössing Mine",
    coordinates: [15.0333, -22.4833],
    resources: ["uranium"],
    ownership: "China National Uranium Corporation (68.62%), Rio Tinto (15.24%)",
    location: "Erongo Region, Namibia",
    details: "Produces ~2,500 tonnes of uranium annually. One of world's longest-running uranium mines, operational since 1976."
  },

  // Nickel (Additional Mines)
  {
    name: "Mincor Kambalda Operations",
    coordinates: [121.6667, -31.2000],
    resources: ["nickel"],
    ownership: "Wyloo Metals",
    location: "Western Australia, Australia",
    details: "Produces ~20,000 tonnes of nickel annually. Revived in 2021, key for EV battery supply."
  },
  {
    name: "Voisey's Bay Mine",
    coordinates: [-56.3167, 56.3333],
    resources: ["nickel", "copper", "cobalt"],
    ownership: "Vale",
    location: "Labrador, Canada",
    details: "Produces ~40,000 tonnes of nickel annually. Significant cobalt by-product, operational since 2005."
  },

  // Zinc (Additional Mines)
  {
    name: "Tara Mine",
    coordinates: [-6.7167, 53.5833],
    resources: ["zinc", "lead"],
    ownership: "Boliden",
    location: "County Meath, Ireland",
    details: "Produces ~200,000 tonnes of zinc annually. Europe's largest zinc mine, operational since 1977."
  },
  {
    name: "Cerro Lindo Mine",
    coordinates: [-76.1333, -14.5167],
    resources: ["zinc", "copper", "lead", "silver"],
    ownership: "Nexa Resources",
    location: "Ica Region, Peru",
    details: "Produces ~150,000 tonnes of zinc annually. Major polymetallic mine in Latin America."
  },

  // Rare Earths (Additional Mines)
  {
    name: "Wicheeda Project",
    coordinates: [-122.0667, 54.5000],
    resources: ["rare earth elements"],
    ownership: "Defense Metals Corp",
    location: "British Columbia, Canada",
    details: "Development-stage project with ~27 million tonnes of rare earth oxides. Focus on neodymium and praseodymium, potential start by 2028."
  },
  {
    name: "Halleck Creek Project",
    coordinates: [-105.6667, 41.3333],
    resources: ["rare earth elements"],
    ownership: "American Rare Earths",
    location: "Wyoming, USA",
    details: "Contains ~4.7 million tonnes of rare earth oxides. Low-thorium deposit, under exploration for future production."
  },

  // Potash (Additional Mines)
  {
    name: "Cory Mine",
    coordinates: [-104.3167, 52.0833],
    resources: ["potash"],
    ownership: "Nutrien",
    location: "Saskatchewan, Canada",
    details: "Produces ~3 million tonnes of potash annually. Part of Saskatchewan's potash belt, key for fertilizer production."
  },
  {
    name: "Belaruskali Soligorsk Mine",
    coordinates: [27.5667, 52.7833],
    resources: ["potash"],
    ownership: "Belaruskali",
    location: "Minsk Region, Belarus",
    details: "Produces ~7 million tonnes of potash annually. One of world's largest potash operations, supplying global fertilizer markets."
  },

  //Silver (Additional Mines)
  {
    name: "San Cristobal Mine",
    coordinates: [-69.6667, -17.4667],
    resources: ["silver"],
    ownership: "Pan American Silver",
    location: "Potosí, Bolivia",
    details: "Produces ~100 million ounces of silver annually. One of world's largest silver mines, operational since 1921."
  },
  {
    name: "Polkowice-Sieroszowice Mine",
    coordinates: [16.7667, 51.3667],
    resources: ["silver"],
    ownership: "KGHM",
    location: "Silesia, Poland",
    details: "The Polkowice-Sieroszowice Mine is a silver mine located in Silesia, Poland. Owned by KGHM, the greenfield project produced an estimated 1.000Mt of ROM in 2023. It had an estimated production of 1.000Mt of silver in 2023"
  },
  {
    name: "Peñasquito Mine",
    coordinates: [-101.716414, 24.657013],
    resources: ["silver"],
    ownership: "Newmont/Silver Standard Resources",
    location: "San Dimas, Mexico",
    details: "The Peñasquito Mine is a silver mine located in San Dimas, Mexico. Owned by Newmont/Silver Standard Resources, the greenfield project produced an estimated 1.000Mt of ROM in 2023. It had an estimated production of 1.000Mt of silver in 2023"
  },
  {
    name: "Cannington Mine",
    coordinates: [140.906505, -21.856488],
    resources: ["silver"],
    ownership: "Newmont",
    location: "Queensland, Australia",
    details: "The Cannington Mine is a gold mine located in Queensland, Australia. Owned by Newmont, the greenfield project produced an estimated 1.000Mt of ROM in 2023. It had an estimated production of 1.000Mt of gold in 2023"
  },
  {
    name: "Nevada Gold Mines",
    coordinates: [-115.783889, 40.829256],
    resources: ["gold"],
    ownership: "Newmont",
    location: "Nevada, USA",
    details: "The Nevada Gold Mines is a gold mine located in Nevada, USA. Owned by Newmont, the greenfield project produced an estimated 1.000Mt of ROM in 2023. It had an estimated production of 1.000Mt of gold in 2023"
  },
  {
    name: "Lihir Mine",
    coordinates: [147.3667, -7.3667],
    resources: ["gold"],
    ownership: "Newcrest",
    location: "Papua New Guinea",
    details: "The Lihir Mine is a gold mine located in Papua New Guinea. Owned by Newcrest, the greenfield project produced an estimated 1.000Mt of ROM in 2023. It had an estimated production of 1.000Mt of gold in 2023"
  },
  //Diamond mines
  {
    name: "Kao Mine",
    coordinates: [28.629570, -29.021307],
    resources: ["diamonds"],
    ownership: "Storm Mountain Diamonds",
    location: "Butha-Buthe, Lesotho",
    details: "The Kao Mine is a surface mine situated in Butha-Buthe, Lesotho. Owned by Namakwa Diamonds, the brownfield mine produced an estimated 13.31 million carats of diamond in 2023. The mine will operate until 2034"
  },
  {
    name: "Jwaneng Mine",
    coordinates: [24.695647, -24.532317],
    resources: ["diamonds"],
    ownership: "State of Botswana",
    location: "Botswana",
    details: "Located in Kgalagadi District, Botswana, the Jwaneng Mine is owned by Government of Botswana. The surface mine produced an estimated 11.86 million carats of diamond in 2023. The mine will operate until 2036"
  },
  //Africa mines
  {
    name: "Catoca Mine",
    coordinates: [20.300057, -9.407280],
    resources: ["diamonds"],
    ownership: "Endiama EP",
    location: "Angola",
    details: "The Catoca Mine is a surface mine situated in Lunda Sul, Angola. The greenfield mine produced an estimated 6.42 million carats of diamond in 2023. The expected mine closure date is 2037"
  },

  //Asia mines
  {
    name: "Green Mine",
    coordinates: [104.2667, 30.6667],
    resources: ["phosphate"],
    ownership: "China National Gold Group",
    location: "Sichuan, China",
    details: "The Green Mine is a phosphate mine owned by Sichuan Lomon. Located in Sichuan, China, the greenfield mine produced approximately 61.933Mt of ROM in 2023. It had an estimated production of 37.16 mtpa of phosphate in 2023"
  },

  {
    name: "Northern Shaanxi Mine",
    coordinates: [110.1667, 34.0667],
    resources: ["coal"],
    ownership: "Shaanxi Gold Mining",
    location: "Shaanxi, China",
    details: "The Northern Shaanxi Mine is a coal mine located in Shaanxi, China. Owned by Shaanxi Coal Industry Group, the greenfield project produced an estimated 10.000Mt of ROM in 2023. It had an estimated production of 1.5 million tonnes of coal in 2023"
  },
  {
    name: "Julong Copper Mine",
    coordinates: [91.090073, 29.636152],
    resources: ["copper"],
    ownership: "China National Gold Group",
    location: "Tibet, China",
    details: "The Julong Copper Mine is a copper mine located in Tibet, China. Owned by Zijin Mining Group, the greenfield project produced an estimated 43.566Mt of ROM in 2023."
  },
  {
    name: "Weda Bay Project",
    coordinates: [127.957318, 0.548746],
    resources: ["nickel"],
    ownership: "PT Vale Indonesia Tbk",
    location: "Sulawesi, Indonesia",
    details: "The Weda Bay Project is a nickel mining project in Maluku, Indonesia. The greenfield project is owned by Tsingshan Holding Group and is due to operate until 2069. The mine produced an estimated 39.709Mt of ROM in 2023. It had an estimated production of 516.7 thousand tonnes of nickel in 2023"
  },
  // Oil Operations
  {
    name: "Orinoco Belt",
  coordinates: [-64.826469, 7.699111],
  resources: ["petroleum"],
  ownership: "State Owned",
  location: "Venuezala",
details: "The Orinoco Belt is a territory in the southern strip of the eastern Orinoco River Basin in Venezuela which overlies the world's largest deposits of petroleum."
  },
  {
    name: "Ghawar Field",
    coordinates: [49.9833, 25.4333],
    resources: ["petroleum"],
    ownership: "Saudi Aramco",
    location: "Eastern Province, Saudi Arabia",
    details: "World's largest oil field, producing ~3.8 million barrels per day (bpd). Discovered in 1948, holds ~70 billion barrels of reserves."
  },
  {
    name: "Burgan Field",
    coordinates: [47.9833, 29.0667],
    resources: ["petroleum"],
    ownership: "Kuwait Oil Company",
    location: "Kuwait",
    details: "Second-largest oil field globally, producing ~1.7 million bpd. Discovered in 1938, holds ~66 billion barrels of reserves."
  },
  {
    name: "Prudhoe Bay Oil Field",
    coordinates: [-148.3333, 70.3167],
    resources: ["petroleum", "natural gas"],
    ownership: "BP (26%), ExxonMobil (36%), ConocoPhillips (36%)",
    location: "North Slope, Alaska, USA",
    details: "Largest oil field in North America, producing ~500,000 bpd. Discovered in 1968, also produces natural gas."
  },
  {
    name: "Safaniya Field",
    coordinates: [49.3167, 28.1333],
    resources: ["petroleum"],
    ownership: "Saudi Aramco",
    location: "Persian Gulf, Saudi Arabia",
    details: "World's largest offshore oil field, producing ~1.2 million bpd. Discovered in 1951, holds ~37 billion barrels of reserves."
  },
  {
    name: "Rumaila Field",
    coordinates: [47.4167, 30.1667],
    resources: ["petroleum"],
    ownership: "Iraq National Oil Company, BP, CNPC",
    location: "Basra, Iraq",
    details: "Produces ~1.5 million bpd. One of Iraq's largest oil fields, operational since 1953, with ~17 billion barrels of reserves."
  },

  // Gas Operations
  {
    name: "South Pars/North Dome Field",
    coordinates: [52.5833, 26.2833],
    resources: ["natural gas", "petroleum"],
    ownership: "QatarEnergy (Qatar), NIOC (Iran)",
    location: "Persian Gulf, Qatar/Iran",
    details: "World's largest gas field, producing ~1.8 trillion cubic feet of gas annually. Shared between Qatar and Iran, holds ~1,800 trillion cubic feet of reserves."
  },
  {
    name: "Urengoy Field",
    coordinates: [74.5333, 65.9667],
    resources: ["natural gas", "petroleum"],
    ownership: "Gazprom",
    location: "Yamal-Nenets Region, Russia",
    details: "Produces ~250 billion cubic meters of gas annually. One of world's largest gas fields, operational since 1978."
  },
  {
    name: "Turkmenistan Galkynysh Field",
    coordinates: [53.8333, 37.6667],
    resources: ["natural gas"],
    ownership: "Türkmengaz",
    location: "Mary Province, Turkmenistan",
    details: "Produces ~80 billion cubic meters of gas annually. Second-largest gas field globally, with ~700 trillion cubic feet of reserves."
  },
  {
    name: "Troll Field",
    coordinates: [3.7167, 60.6667],
    resources: ["natural gas", "petroleum"],
    ownership: "Equinor (30.58%), Petoro (56%), Shell (8.1%)",
    location: "North Sea, Norway",
    details: "Produces ~40 billion cubic meters of gas annually. Europe's largest offshore gas field, operational since 1996."
  },
  {
    name: "Ichthys Field",
    coordinates: [123.6167, -12.6667],
    resources: ["natural gas", "condensate"],
    ownership: "INPEX (62.245%), TotalEnergies (30%)",
    location: "Timor Sea, Australia",
    details: "Produces ~8.9 million tonnes of LNG annually. Operational since 2018, with ~12 trillion cubic feet of gas reserves."
  }
    
  ]

  // Mine gear icon effect: only run when map is ready and style is loaded
  useEffect(() => {
    if (!map.current || !mapReady) return;
    
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
      if (!map.current || mineLayersAdded) return;
      
      // Add mine sites as a GeoJSON source
      if (!map.current.getSource('mine-sites')) {
        map.current.addSource('mine-sites', {
          type: 'geojson',
          data: { type: 'FeatureCollection', features: mineFeatures },
        });
        console.log('Added mine-sites source');
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
          },
          paint: {
            'icon-opacity': 0.3, // Make dot semi-transparent
          },
        });
        console.log('Added mine-dots layer');
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
          },
        });
        console.log('Added mine-resources layer');
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
          },
          paint: {
            'text-color': '#111111',
            'text-halo-width': 0,
          },
        });
        console.log('Added mine-labels layer');
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
      if (!mineLayersAdded) {
        console.log('Map style loaded, adding mine sites and dot icons');
        addDotImageAndLayer();
      }
    }
    
    mapInstance.on('styledata', handleStyleData);
    // Initial add
    handleStyleData();

    // Cleanup function
    return () => {
      if (mapInstance) {
        mapInstance.off('styledata', handleStyleData);
      }
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

  console.log('[MapComponent] Map component rendered');

  

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

      {panelOpen && (
        <InfoPanel
          gdpFilter={gdpFilter}
          selectedEconomy={selectedEconomy}
          selectedSociety={selectedSociety}
          selectedGovernment={selectedGovernment}
          exports={exports || ""}
          imports={imports || ""}
          subFilter={Object.keys(activeOverlays).find(key => activeOverlays[key]) || ""}
          exportsPartners={exportPartners || ""}
          importsPartners={importPartners || ""}
          infoPanelIcons={infoPanelIcons}
          infoPanelIconElements={infoPanelIconElementsState}
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