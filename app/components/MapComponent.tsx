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

mapboxgl.accessToken = process.env.NEXT_PUBLIC_MAPBOX_TOKEN || "";

interface MapComponentProps {
  searchTerm: string;
  gdpFilter: number;
}

// Icon mapping for export types (info panel colors)
const iconMap = {
  petroleum: { component: <FaOilWell />, name: "petroleum", color: "#334155" },
  crude: { component: <MdOilBarrel />, name: "crude", color: "#334155" },
  oil: { component: <FaOilCan />, name: "oil", color: "#eab308" },
  gas: { component: <FaFire />, name: "gas", color: "#52525b" },
  coal: { component: <BsMinecartLoaded />, name: "coal", color: "#78716c" },
  cars: { component: <FaCar />, name: "cars", color: "#f87171" },
  iron: { component: <GiMetalBar />, name: "iron", color: "#6B7280" },
  steel: { component: <FaIndustry />, name: "steel", color: "#6B7280" },
  machinery: { component: <FaIndustry />, name: "machinery", color: "#6B7280" },
  wheat: { component: <FaSeedling />, name: "wheat", color: "#facc15" },
  grain: { component: <FaSeedling />, name: "grain", color: "#fde047" },
  gold: { component: <GiMetalBar  />, name: "gold", color: "#facc15" },
  silver: { component: <GiMetalBar  />, name: "silver", color: "#E5E7EB" },
  copper: { component: <GiMetalBar  />, name: "copper", color: "#FB923C" },
  zinc: { component: <GiGoldMine />, name: "zinc", color: "#94A3B8" },
  metal: { component: <GiGoldMine />, name: "metal", color: "#6B7280" },
  minerals: { component: <GiGoldMine />, name: "minerals", color: "#9CA3AF" },
  diamonds: { component: <FaGem />, name: "diamonds", color: "#bfdbfe" },
  gems: { component: <FaGem />, name: "gems", color: "#3B82F6" },
  vehicles: { component: <FaCar />, name: "vehicles", color: "#EF4444" },
  ships: { component: <FaShip />, name: "ships", color: "#ef4444" },
  aircraft: { component: <FaPlane />, name: "aircraft", color: "#fca5a5" },
  transport: { component: <FaTruck />, name: "transport", color: "#374151" },
  fertilizers: { component: <FaSeedling />, name: "fertilizers", color: "#4D7C0F" },
  milk: { component: <LuMilk />, name: "milk", color: "#fdba74" },
  beef: { component: <LuBeef />, name: "beef", color: "#fdba74" },
  soybeans: { component: <LuBean />, name: "soybeans", color: "#B5DE8C" },
  soy: { component: <LuBean />, name: "soy", color: "#B5DE8C" },
  coffee: { component: <FaCoffee />, name: "coffee", color: "#ca8a04" },
  wood: { component: <GiWoodPile />, name: "wood", color: "#059669" },
  paper: { component: <GiWoodPile />, name: "paper", color: "#059669" },
  pulp: { component: <GiWoodPile />, name: "pulp", color: "#059669" },
  trucks: { component: <FaTruck />, name: "trucks", color: "#fb7185" },
  electronics: { component: <FaLaptop />, name: "electronics", color: "#0d9488" },
  broadcast: { component: <FaTowerBroadcast />, name: "broadcast", color: "#14b8a6" },
  computers: { component: <FaLaptop />, name: "computers", color: "#2dd4bf" },
  phones: { component: <FaMobile />, name: "phones", color: "#2dd4bf" },
  circuits: { component: <FaMicrochip />, name: "circuits", color: "#14b8a6" },
  parts: { component: <FaGears />, name: "parts", color: "#f87171" },
  garments: { component: <FaTshirt />, name: "garments", color: "#d8b4fe" },
  clothing: { component: <FaTshirt />, name: "clothing", color: "#d8b4fe" },
  fruits: { component: <FaAppleAlt />, name: "fruits", color: "#84CC16" },
  corn: { component: <GiCorn />, name: "corn", color: "#fde047" },
  maize: { component: <GiCorn />, name: "maize", color: "#fde047" },
  medicine: { component: <GiMedicines />, name: "medicine", color: "#818cf8" },
  plastics: { component: <FaSheetPlastic />, name: "plastics", color: "#d8b4fe" },
  fish: { component: <GiDoubleFish />, name: "fish", color: "#7dd3fc" },
  shellfish: { component: <GiBeetleShell />, name: "shellfish", color: "#93c5fd" },
  REE: { component: <TbHexagonLetterR />, name: "REE", color: "#fca5a5" },
  Mn: { component: <TbHexagonLetterM />, name: "Mn", color: "#B5DE8C" },
  Ni: { component: <TbHexagonLetterN />, name: "Ni", color: "#d8b4fe" },
  Cu: { component: <TbHexagonLetterC />, name: "Cu", color: "#fdba74" },
  Co: { component: <GiMinerals />, name: "Co", color: "#a5b4fc" },
  Li: { component: <TbHexagonLetterL />, name: "Li", color: "#c7d2fe" },
  U: { component: <TbHexagonLetterU />, name: "U", color: "#fcd34d" },
  turbines: { component: <GiTurbine />, name: "turbines", color: "#60a5fa" },
  wire: { component: <GiWireCoil />, name: "wire", color: "#fbbf24" },
  electrical: { component: <GiWireCoil />, name: "electrical", color: "#fbbf24" },
  electricity: { component: <GiWireCoil />, name: "electricity", color: "#fbbf24" },
  equipment: { component: <GiWireCoil />, name: "equipment", color: "#fbbf24" },
  appliances: { component: <GiWireCoil />, name: "appliances", color: "#fbbf24" },
  rice: { component: <GiBowlOfRice />, name: "rice", color: "#fde68a" },
  sugar: { component: <GiSugarCane />, name: "sugar", color: "#f9fafb" },
  spice: { component: <GiSugarCane />, name: "spice", color: "#f9fafb" },
  nuts: { component: <GiSugarCane />, name: "nuts", color: "#f9fafb" },
  sheep: { component: <GiSheep />, name: "sheep", color: "#a3e635" },
  butter: { component: <GiButter />, name: "butter", color: "#fde68a" },
  beer: { component: <GiBeerStein />, name: "beer", color: "#fbbf24" },
  liquor: { component: <GiBeerStein />, name: "liquor", color: "#fbbf24" },
  alcohols: { component: <GiBeerStein />, name: "alcohols", color: "#fbbf24" },
  cocoa: { component: <GiCoconuts />, name: "cocoa", color: "#a3e635" },
  coconuts: { component: <GiCoconuts />, name: "coconuts", color: "#a3e635" },
  bananas: { component: <GiBananaBunch />, name: "bananas", color: "#fde047" },
  jewelry: { component: <GiPearlNecklace />, name: "jewelry", color: "#f472b6" },
  tobacco: { component: <GiCigarette />, name: "tobacco", color: "#fbbf24" },
  rubber: { component: <GiRubberBoot />, name: "rubber", color: "#a3e635" },
  tires: { component: <GiRubberBoot />, name: "tires", color: "#a3e635" },
  footwear: { component: <GiRubberBoot />, name: "footwear", color: "#a3e635" },
  chemicals: { component: <GiChemicalDrop />, name: "chemicals", color: "#818cf8" },
  phosphates: { component: <GiChemicalDrop />, name: "phosphates", color: "#818cf8" },
  acids: { component: <GiChemicalDrop />, name: "acids", color: "#818cf8" },
  pesticides: { component: <GiChemicalDrop />, name: "pesticides", color: "#818cf8" },
  nitrogen: { component: <GiChemicalDrop />, name: "nitrogen", color: "#818cf8" },
  carbonates: { component: <GiChemicalDrop />, name: "carbonates", color: "#818cf8" },
  ore: { component: <GiOre />, name: "ore", color: "#6b7280" },
  ores: { component: <GiOre />, name: "ores", color: "#6b7280" },
  lignite: { component: <GiOre />, name: "lignite", color: "#6b7280" },
  aluminum: { component: <GiOre />, name: "aluminum", color: "#6b7280" },
  aluminium: { component: <GiMetalBar />, name: "aluminium", color: "#6b7280" },
  cement: { component: <GiOre />, name: "cement", color: "#6b7280" },
  nickel: { component: <GiOre />, name: "nickel", color: "#6b7280" },
};

// Color palettes for charts - keep in sync with chart components
const exportChartColors = [
  '#ef4444', // blue-500
  '#f87171', // red-500
  '#fca5a5', // amber-500
  '#fecaca', // emerald-500
  '#fee2e2', // indigo-500
  '#EC4899', // pink-500
  '#8B5CF6', // violet-500
  '#14B8A6', // teal-500
  '#F97316', // orange-500
  '#84CC16', // lime-500
];

const importChartColors = [
  '#059669', // violet-500
  '#10b981', // orange-500
  '#34d399', // emerald-500
  '#6ee7b7', // blue-500
  '#a7f3d0', // pink-500
  '#EF4444', // red-500 
  '#14B8A6', // teal-500
  '#F59E0B', // amber-500
  '#6366F1', // indigo-500
  '#84CC16', // lime-500
];

// Mapping of country names from Factbook to GeoJSON
const countryNameMapping: Record<string, string> = {
  Afghanistan: "Afghanistan",
  Albania: "Albania",
  Algeria: "Algeria",
  Andorra: "Andorra",
  Angola: "Angola",
  "Antigua and Barbuda": "Antigua and Barbuda",
  Argentina: "Argentina",
  Armenia: "Armenia",
  Australia: "Australia",
  Austria: "Austria",
  Azerbaijan: "Azerbaijan",
  Bahamas: "The Bahamas", // Corrected mapping
  Bahrain: "البحرين", // Added mapping
  Bangladesh: "বাংলাদেশ", // Added mapping
  Barbados: "Barbados",
  Belarus: "Беларусь", // Added mapping
  Belgium: "België", // Corrected mapping
  Belize: "Belize",
  Benin: "Bénin", // Added mapping
  Bhutan: "འབྲུག", // Added mapping
  Bolivia: "Bolivia",
  "Bosnia and Herzegovina": "Bosna i Hercegovina", // Added mapping
  Botswana: "Botswana",
  Brazil: "Brasil", // Corrected mapping
  Brunei: "Brunei",
  Bulgaria: "България", // Added mapping
  "Burkina Faso": "Burkina Faso",
  Burundi: "Burundi",
  "Cabo Verde": "Cabo Verde",
  Cambodia: "កម្ពុជា", // Added mapping
  Cameroon: "Cameroun", // Added mapping
  Canada: "Canada",
  "Central African Republic": "République centrafricaine", // Added mapping
  Chad: "Tchad", // Added mapping
  Chile: "Chile",
  China: "中国", // Corrected mapping
  Colombia: "Colombia",
  Comoros: "جزر القمر", // Added mapping
  "Congo, Democratic Republic of the": "Dem. Rep. Congo",
  "Congo, Republic of the": "Congo",
  "Costa Rica": "Costa Rica",
  "Côte d'Ivoire": "Côte d'Ivoire",
  Croatia: "Hrvatska", // Added mapping
  Cuba: "Cuba",
  Cyprus: "Κύπρος", // Added mapping
  Czechia: "Česká republika", // Added mapping
  Denmark: "Danmark", // Added mapping
  Djibouti: "Djibouti",
  Dominica: "Dominica",
  "Dominican Republic": "Dominican Rep.",
  Ecuador: "Ecuador",
  Egypt: "مصر", // Corrected mapping
  "El Salvador": "El Salvador",
  "Equatorial Guinea": "Guinea Ecuatorial", // Added mapping
  Eritrea: "إريتريا", // Added mapping
  Estonia: "Eesti", // Corrected mapping
  Eswatini: "eSwatini", // Added mapping
  Ethiopia: "ኢትዮጵያ", // Added mapping
  Fiji: "Fiji",
  Finland: "Suomi", // Added mapping
  France: "France",
  Gabon: "Gabon",
  Gambia: "The Gambia", // Added mapping
  Georgia: "საქართველო", // Added mapping
  Germany: "Deutschland", // Corrected mapping
  Ghana: "Ghana",
  Greece: "Ελλάδα", // Corrected mapping
  Grenada: "Grenada",
  Guatemala: "Guatemala",
  Guinea: "Guinée", // Corrected mapping
  "Guinea-Bissau": "Guiné-Bissau", // Added mapping
  Guyana: "Guyana",
  Haiti: "Haïti", // Added mapping
  Honduras: "Honduras",
  Hungary: "Magyarország", // Corrected mapping
  Iceland: "Ísland", // Corrected mapping
  India: "India",
  Indonesia: "Indonesia",
  Iran: "ایران", // Added mapping
  Iraq: "العراق", // Corrected mapping
  Ireland: "Éire", // Corrected mapping
  Israel: "ישראל", // Added mapping
  Italy: "Italia", // Corrected mapping
  Jamaica: "Jamaica",
  Japan: "日本", // Corrected mapping
  Jordan: "الأردن", // Added mapping
  Kazakhstan: "Қазақстан", // Added mapping
  Kenya: "Kenya",
  Kiribati: "Kiribati",
  Kuwait: "الكويت", // Added mapping
  Kyrgyzstan: "Кыргызстан", // Added mapping
  Laos: "ປະເທດລາວ", // Added mapping
  Latvia: "Latvija", // Corrected Latvia mapping
  Lebanon: "لبنان", // Corrected mapping
  Lesotho: "Lesotho",
  Liberia: "Liberia",
  Libya: "ليبيا", // Added mapping
  Liechtenstein: "Liechtenstein",
  Lithuania: "Lietuva", // Corrected mapping
  Luxembourg: "Luxembourg",
  Madagascar: "Madagasikara", // Added mapping
  Malawi: "Malawi",
  Malaysia: "Malaysia",
  Maldives: "Maldives",
  Mali: "Mali",
  Malta: "Malta",
  "Marshall Islands": "Mărșal Insule", // Added mapping
  Mauritania: "مورتانيا", // Added mapping
  Mauritius: "Maurice", // Corrected mapping
  Mexico: "México", // Added mapping
  Micronesia: "Micronesia",
  Moldova: "Moldova",
  Monaco: "Monaco",
  Mongolia: "Монгол", // Added mapping
  Montenegro: "Montenegro",
  Morocco: "المغرب", // Added mapping
  Mozambique: "Moçambique", // Corrected mapping
  Myanmar: "မြန်မာ", // Added mapping
  Namibia: "Namibia",
  Nauru: "Nauru",
  Nepal: "नेपाल", // Added mapping
  Netherlands: "Nederland", // Corrected mapping
  NZ: "New Zealand",
  Nicaragua: "Nicaragua",
  Niger: "Niger",
  Nigeria: "Nigeria",
  "North Korea": "조선 민주주의 인민 공화국", // Added mapping
  "North Macedonia": "Северна Македонија", // Added mapping
  Norway: "Norge", // Added mapping
  Oman: "عمان", // Added mapping
  Pakistan: "پاکستان", // Added mapping
  Palau: "Belau", // Added mapping
  Palestine: "فلسطين", // Added mapping
  Panamá: "Panamá",
  "Papua New Guinea": "Papua Niugini", // Added mapping
  Paraguay: "Paraguay",
  Peru: "Perú", // Added mapping
  Philipines: "Philippines",
  Poland: "Polska", // Added mapping
  Portugal: "Portugal",
  Qatar: "قطر", // Added mapping
  Romania: "România", // Added mapping
  Russia: "Россия", // Corrected mapping
  Rwanda: "Rwanda",
  "Saint Kitts and Nevis": "Saint Kitts and Nevis", // Added mapping
  "Saint Lucia": "Saint Lucia", // Added mapping
  "Saint Vincent and the Grenadines": "Saint Vincent and the Grenadines", // Added mapping
  Samoa: "Sāmoa", // Added mapping
  "San Marino": "San Marino",
  "Saudi Arabia": "السعودية", // Corrected mapping
  Senegal: "Sénégal", // Corrected mapping
  Serbia: "Србија", // Added mapping
  Seychelles: "Seychelles",
  "Sierra Leone": "Sierra Leone",
  Singapore: "Singapore", // Ensuring this mapping exists
  Slovakia: "Slovensko", // Added mapping
  Slovenia: "Slovenija", // Added mapping
  "Solomon Islands": "Solomon Is.",
  Somalia: "Soomaaliya", // Added mapping
  "South Africa": "South Africa",
  "S. Korea": "대한민국", // Corrected mapping
  "South Sudan": "South Sudan",
  Spain: "España", // Corrected mapping
  "Sri Lanka": "ශ්‍රී ලංකාව", // Added mapping
  Sudan: "السودان", // Added mapping
  Suriname: "Suriname",
  Sweden: "Sverige", // Corrected mapping
  Switzerland: "Switzerland",
  Syria: "سوريا", // Added mapping
  Taiwan: "臺灣", // Corrected mapping
  Tajikistan: "Тоҷикистон", // Added mapping
  Tanzania: "Tanzania",
  Thailand: "ประเทศไทย", // Corrected mapping
  Togo: "Togo",
  Tonga: "Tonga",
  "Trinidad &amp; Tobago": "Trinidad and Tobago",
  Tunisia: "تونس", // Added mapping
  Turkey: "Türkiye", // Corrected mapping
  Turkmenistan: "Türkmenistan", // Corrected mapping
  Tuvalu: "Tuvalu",
  Uganda: "Uganda",
  Ukraine: "Україна", // Added mapping
  UAE: "الإمارات العربية المتحدة", // Corrected mapping
  UK: "United Kingdom",
  USA: "United States", // Corrected mapping based on GeoJSON
  "United States": "United States of America", // Added mapping for factbook name
  Uruguay: "Uruguay",
  Uzbekistan: "Oʻzbekiston", // Corrected mapping
  Vanuatu: "Vanuatu",
  "Vatican City": "Vatican",
  Venezuela: "Venezuela",
  Vietnam: "Vietnam",
  Yemen: "Yemen",
  Zambia: "Zambia",
  Zimbabwe: "Zimbabwe",
  // Added mappings for names seen in logs that were not in the parseExportPartners map or needed correction
  "Deutschland": "Germany",
  "Italia": "Italy",
  "België": "Belgium",
  "España": "Spain",
  "الإمارات العربية المتحدة": "United Arab Emirates",
  "العراق": "Iraq",
  "中国": "China",
  "Magyarország": "Hungary",
  "السعودية": "Saudi Arabia",
  "لبنان": "Lebanon",
  "Türkiye": "Turkey",
  "مصر": "Egypt",
  "대한민국": "South Korea",
  "日本": "Japan",
  "ประเทศไทย": "Thailand",
  "臺灣": "Taiwan",
  "Россия": "Russia",
  "Ελλάδα": "Greece",
  "Sverige": "Sweden",
  "Nederland": "Netherlands", // Corrected mapping
  "Hong Kong": "Hong Kong S.A.R.", // Added mapping
};

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
  const [activeOverlays, setActiveOverlays] = useState<{ [key: string]: boolean }>({ exports: false, imports: false, Resources: true });
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
          center: [20, 40], // Return to default center
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

      console.log("Generated economy info for:", NAME);
      const infoEconomy = [title , overview, unemployment, debt, inflation, industries]
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
            "fill-opacity": 0.1,
          },
        };

        const gdpLayer: mapboxgl.FillLayer = {
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
            "fill-opacity": 0.1,
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
    const iconsToAdd = Object.values(iconMap);
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
                {IconComponent && React.cloneElement(IconComponent, { style: { color: iconColor, fontSize: '1.8em' } })}
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
  }, [activeOverlays, exportIcons, importIcons]); // Only depend on subFilter and icon arrays

  // Update the circle features to use the new icon approach
  useEffect(() => {
    // Choose which icons to show on the map (not for InfoPanel)
    let iconsToShow: Array<{ keyword: string; color: string, iconSize?: number }> = [];
    if (activeOverlays.imports) {
      console.log("Using import icons for MAP:", importIcons.length, "imports value:", imports);
      iconsToShow = importIcons;
    } else if (activeOverlays.exports) {
      console.log("Using export icons for MAP:", exportIcons.length, "exports value:", exports);
      iconsToShow = exportIcons;
    } else {
      iconsToShow = [];
    }

    console.log("useEffect (map icon rendering): iconsToShow", iconsToShow);
    
    // Don't show icons if no country is selected or if there are no icons to show
    if (!map.current || !selectedCountryCenter || iconsToShow.length === 0 || !highlightedCountryId) {
      // Remove icon/label layers if present
      if (map.current?.getLayer('export-labels')) map.current.removeLayer('export-labels');
      if (map.current?.getLayer('export-icons')) map.current.removeLayer('export-icons');
      if (map.current?.getSource('export-circles')) map.current.removeSource('export-circles');
      return;
    }

    // Sort icons by descending iconSize (if present)
    const sortedIcons = [...iconsToShow].sort((a, b) => (b.iconSize || 1) - (a.iconSize || 1));

    // Arc formation parameters
    const n = sortedIcons.length;
    const angleStep = Math.PI / 4; // 45deg between icons
    const radius = 8.0; // degrees offset
    const base = selectedCountryCenter;
    const minSizeArc = 0.7;
    const maxSizeArc = 2.0;
    const iconFeatures = sortedIcons.map((icon, i) => {
      let offset = [0, 0];
      if (n > 1) {
        const theta = (-(n-1)/2 + i) * angleStep;
        offset = [radius * Math.sin(theta), radius * Math.cos(theta)];
      }
      const iconLng = base[0] + offset[0];
      const iconLat = base[1] + offset[1];
      // Scale icon size by position in sorted array (largest to smallest)
      const iconSize = maxSizeArc - (i / Math.max(1, n-1)) * (maxSizeArc - minSizeArc);
      const iconName = (iconMap as any)[icon.keyword]?.name || "default";
      return {
        type: 'Feature' as const,
        properties: {
          keyword: icon.keyword,
          icon: iconName,
          component: (iconMap as any)?.[icon.keyword]?.component,
          iconSize,
        },
        geometry: {
          type: 'Point' as const,
          coordinates: [iconLng, iconLat]
        }
      };
    });

    // Remove existing layers and source if they exist
    if (map.current.getLayer('export-labels')) map.current.removeLayer('export-labels');
    if (map.current.getLayer('export-icons')) map.current.removeLayer('export-icons');
    if (map.current.getSource('export-circles')) map.current.removeSource('export-circles');

    // Add new source and layers
    map.current.addSource('export-circles', {
      type: 'geojson',
      data: {
        type: 'FeatureCollection',
        features: iconFeatures
      }
    });

    map.current.addLayer({
      id: 'export-icons',
      type: 'symbol',
      source: 'export-circles',
      layout: {
        'icon-image': ['get', 'icon'],
        'icon-size': ['get', 'iconSize'],
        'icon-allow-overlap': true,
        'icon-ignore-placement': true,
        'icon-padding': 5,
        'symbol-spacing': 20
      }
    });

    map.current.addLayer({
      id: 'export-labels',
      type: 'symbol',
      source: 'export-circles',
      layout: {
        'text-field': ['get', 'keyword'],
        'text-size': 12,
        'text-offset': [0, 2.2],
        'text-anchor': 'bottom',
        'text-allow-overlap': true
      },
      paint: {
        'text-color': '#000000',
        'text-halo-color': '#ffffff',
        'text-halo-width': 2
      }
    });

    // Cleanup function
    return () => {
      if (map.current) {
        if (map.current.getLayer('export-labels')) {
          map.current.removeLayer('export-labels');
        }
        if (map.current.getLayer('export-icons')) {
          map.current.removeLayer('export-icons');
        }
        if (map.current.getSource('export-circles')) {
          map.current.removeSource('export-circles');
        }
      }
    };
  }, [exportIcons, importIcons, selectedCountryCenter, mapZoom, activeOverlays, highlightedCountryId]);

  // Add useEffect to handle updating visualization when a country is selected or subFilter changes
  useEffect(() => {
    // This effect handles the application of the subfilter visualization (highlighting)
    // It should run when highlightedCountryId, subFilter, exportPartners, or importPartners change

    if (!map.current || !highlightedCountryId || !(activeOverlays.exports || activeOverlays.imports)) {
      // If prerequisites are not met, remove existing highlight layers
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

  // Add handleAnimationToggle function
  const handleAnimationToggle = () => {
    setAnimationPaused(prev => !prev);
    
    // If we're resuming animations and have active arcs, redraw them
    if (animationPaused && highlightedCountryId && 
        (activeOverlays.exports || activeOverlays.imports)) {
      
      // Cancel existing animations and clear frames
      cancelAllAnimationFrames();
      
      // Trigger redraw by forcing the arc drawing useEffect to run
      // This is done by temporarily changing subFilter and then changing it back
      const currentActiveOverlays = activeOverlays;
      setActiveOverlays({ ...currentActiveOverlays, exports: !currentActiveOverlays.exports });
      setTimeout(() => {
        setActiveOverlays(currentActiveOverlays);
      }, 100);
    }
  };

  // 2. Create mineralDeposits array (approximate coordinates based on the screenshot)
  // (This overlay is now removed)
  // const mineralDeposits = [ ... ];

  // Top 10 copper producers (2024, in 1000 tons)
  const topCopperProducers = [
    { name: "Chile", coords: [-70, -30], production: 5300 },
    { name: "DR Congo", coords: [22, -3], production: 3300 },
    { name: "Peru", coords: [-75, -10], production: 2600 },
    { name: "China", coords: [105, 35], production: 1800 },
    { name: "USA", coords: [-110, 35], production: 1100 },
    { name: "Indonesia", coords: [120, -5], production: 1100 },
    { name: "Russia", coords: [100, 60], production: 930 },
    { name: "Australia", coords: [135, -25], production: 800 },
    { name: "Kazakhstan", coords: [68, 48], production: 740 },
    { name: "Mexico", coords: [-102, 23], production: 700 },
  ];

  // Top 10 nickel producers (2024, in tons)
  const topNickelProducers = [
    { name: "Indonesia", coords: [120, -5], production: 1600000 },
    { name: "Philippines", coords: [122, 12], production: 330000 },
    { name: "Russia", coords: [100, 60], production: 220000 },
    { name: "New Caledonia", coords: [165.5, -21.5], production: 190000 },
    { name: "Australia", coords: [135, -25], production: 160000 },
    { name: "Canada", coords: [-95, 60], production: 130000 },
    { name: "China", coords: [105, 35], production: 110000 },
    { name: "Brazil", coords: [-55, -10], production: 83000 },
    { name: "United States", coords: [-110, 35], production: 18000 },
  ];

  // Top 10 manganese producers (2024, in tons)
  const topManganeseProducers = [
    { name: "South Africa", coords: [25, -29], production: 6200000 },
    { name: "China", coords: [105, 35], production: 3000000 },
    { name: "Australia", coords: [135, -25], production: 2900000 },
    { name: "Gabon", coords: [11.7, -1], production: 1800000 },
    { name: "Brazil", coords: [-55, -10], production: 1000000 },
    { name: "India", coords: [78, 22], production: 950000 },
    { name: "Malaysia", coords: [102, 4], production: 400000 },
    { name: "Ukraine", coords: [32, 49], production: 390000 },
    { name: "Kazakhstan", coords: [68, 48], production: 390000 },
    { name: "Ghana", coords: [-1, 7.9], production: 390000 },
  ];

  // Top 10 lithium producers (2024, in tons)
  const topLithiumProducers = [
    { name: "Australia", coords: [135, -25], production: 88000 },
    { name: "Chile", coords: [-70, -30], production: 49000 },
    { name: "China", coords: [105, 35], production: 41000 },
    { name: "Argentina", coords: [-65, -25], production: 18000 },
    { name: "Brazil", coords: [-55, -10], production: 10000 },
    { name: "Zimbabwe", coords: [30.9, -19], production: 22000 },
    { name: "United States", coords: [-110, 35], production: 5000 },
    { name: "Bolivia", coords: [-65, -19], production: 700 },
    { name: "Canada", coords: [-95, 60], production: 4300 },
    { name: "Namibia", coords: [18, -22], production: 2700 },
  ];

  // Helper to format production numbers
  function formatProduction(n: number): string {
    if (n >= 1000000) return (n / 1000000).toFixed(1).replace(/\.0$/, '') + 'M t';
    if (n >= 1000) return (n / 1000).toFixed(0) + 'k t';
    return n + ' t';
  }

  // 3. Add useEffect for mineral icon overlay
  useEffect(() => {
    if (!map.current) return;

    const addMineralOverlay = () => {
      if (!map.current) return;
      // Remove previous mineral layer/source if they exist
      if (map.current.getLayer('mineral-icons')) map.current.removeLayer('mineral-icons');
      if (map.current.getSource('mineral-deposits')) map.current.removeSource('mineral-deposits');
      // Remove all old overlays
      if (map.current.getLayer('copper-production-icons')) map.current.removeLayer('copper-production-icons');
      if (map.current.getSource('copper-production')) map.current.removeSource('copper-production');
      if (map.current.getLayer('nickel-production-icons')) map.current.removeLayer('nickel-production-icons');
      if (map.current.getSource('nickel-production')) map.current.removeSource('nickel-production');
      if (map.current.getLayer('manganese-production-icons')) map.current.removeLayer('manganese-production-icons');
      if (map.current.getSource('manganese-production')) map.current.removeSource('manganese-production');
      if (map.current.getLayer('lithium-production-icons')) map.current.removeLayer('lithium-production-icons');
      if (map.current.getSource('lithium-production')) map.current.removeSource('lithium-production');
      if (map.current.getLayer('uranium-production-icons')) map.current.removeLayer('uranium-production-icons');
      if (map.current.getSource('uranium-production')) map.current.removeSource('uranium-production');

      if (gdpFilter !== 0 || !activeOverlays.Resources) return; // Only show when Economy filter is active and Resources overlay is selected

      // Register mineral icons with Mapbox
      const mineralIconDefs = ["REE", "Mn", "Ni", "Cu", "Co", "Li", "U"].map(key => ({
        component: (iconMap as any)[key].component,
        name: key,
      }));
      addReactIconsToMapbox(map.current, mineralIconDefs);

      // Combine all producers into a country->minerals map
      const allProducers = [
        ...topCopperProducers.map(x => ({...x, mineral: 'Cu', label: formatProduction(x.production), max: 5300000, prod: x.production*1000 })),
        ...topNickelProducers.map(x => ({...x, mineral: 'Ni', label: formatProduction(x.production), max: Math.max(...topNickelProducers.map(y=>y.production)), prod: x.production })),
        ...topManganeseProducers.map(x => ({...x, mineral: 'Mn', label: formatProduction(x.production), max: Math.max(...topManganeseProducers.map(y=>y.production)), prod: x.production })),
        ...topLithiumProducers.map(x => ({...x, mineral: 'Li', label: formatProduction(x.production), max: Math.max(...topLithiumProducers.map(y=>y.production)), prod: x.production })),
        ...topUraniumProducers.map(x => ({...x, mineral: 'U', label: formatProduction(x.production), max: Math.max(...topUraniumProducers.map(y=>y.production)), prod: x.production })),
        ...topREEProducers.map(x => ({...x, mineral: 'REE', label: formatProduction(x.production), max: Math.max(...topREEProducers.map(y=>y.production)), prod: x.production })),
        ...topCoalProducers.map(x => ({...x, mineral: 'coal', label: formatCoal(x.production), max: Math.max(...topCoalProducers.map(y=>y.production)), prod: x.production })),
        ...topGasProducers.map(x => ({...x, mineral: 'gas', label: formatGas(x.production), max: Math.max(...topGasProducers.map(y=>y.production)), prod: x.production })),
        ...topPetroleumProducers.map(x => ({...x, mineral: 'petroleum', label: formatPetroleum(x.production), max: Math.max(...topPetroleumProducers.map(y=>y.production)), prod: x.production })),
        ...topCobaltProducers.map(x => ({...x, mineral: 'Co', label: formatCobalt(x.production), max: Math.max(...topCobaltProducers.map(y=>y.production)), prod: x.production })),
        ...topDiamondProducers.map(x => ({...x, mineral: 'diamonds', label: formatDiamond(x.production), max: Math.max(...topDiamondProducers.map(y=>y.production)), prod: x.production })),
        ...topGoldProducers.map(x => ({...x, mineral: 'gold', label: formatGold(x.production), max: Math.max(...topGoldProducers.map(y=>y.production)), prod: x.production })),
        ...topAluminiumProducers.map(x => ({...x, mineral: 'aluminium', label: formatAluminium(x.production), max: Math.max(...topAluminiumProducers.map(y=>y.production)), prod: x.production })),
        ...topIronOreProducers.map(x => ({...x, mineral: 'iron', label: formatIronOre(x.production), max: Math.max(...topIronOreProducers.map(y=>y.production)), prod: x.production })),
        ...topSilverProducers.map(x => ({...x, mineral: 'silver', label: formatSilver(x.production), max: Math.max(...topSilverProducers.map(y=>y.production)), prod: x.production })),
      ];
      // Group by country
      const countryMinerals: {[country: string]: any[]} = {};
      allProducers.forEach(item => {
        if (!countryMinerals[item.name]) countryMinerals[item.name] = [];
        countryMinerals[item.name].push(item);
      });
      // For each country, fan out icons if >1 mineral
      const features: any[] = [];
      const minSize = 0.5;
      const maxSize = 1.5;
      Object.entries(countryMinerals).forEach(([country, minerals]) => {
        const base = minerals[0].coords;
        const n = minerals.length;
        const angleStep = Math.PI / 4; // 30deg between icons
        const radius = 8.0; // degrees offset
        minerals.forEach((min, i) => {
          let offset = [0,0];
          if (n > 1) {
            // Fan out in arc above the country center
            const theta = (-(n-1)/2 + i) * angleStep;
            offset = [radius * Math.sin(theta), radius * Math.cos(theta)];
          }
          const coords = [base[0] + offset[0], base[1] + offset[1]];
          // Scale icon size by production/max for that mineral
          const iconSize = minSize + (maxSize - minSize) * (min.prod / min.max);
          features.push({
            type: 'Feature',
            geometry: { type: 'Point', coordinates: coords },
            properties: {
              country: country,
              mineral: min.mineral,
              label: min.label,
              iconSize,
            }
          });
        });
      });
      map.current.addSource('mineral-deposits', {
        type: 'geojson',
        data: { type: 'FeatureCollection', features }
      });
      map.current.addLayer({
        id: 'mineral-icons',
        type: 'symbol',
        source: 'mineral-deposits',
        layout: {
          'icon-image': ['get', 'mineral'],
          'icon-size': ['get', 'iconSize'],
          'icon-allow-overlap': true,
          'icon-ignore-placement': true,
          // Always show element name instead of production quantity
          'text-field': [
            'match',
            ['get', 'mineral'],
            'Cu', 'Copper',
            'Ni', 'Nickel',
            'Mn', 'Manganese',
            'Li', 'Lithium',
            'U', 'Uranium',
            'REE', 'Rare Earths',
            'Co', 'Cobalt',
            'diamonds', 'Diamonds',
            'gold', 'Gold',
            'coal', 'Coal',
            'gas', 'Natural Gas',
            'petroleum', 'Petroleum',
            'aluminium', 'Aluminium',
            'iron', 'Iron Ore',
            'silver', 'Silver',
            'minerals', 'Minerals',
            ['get', 'mineral']
          ],
          'text-offset': [0, 2.2],
          'text-size': 14,
          'text-anchor': 'top'
        },
        paint: {
          'text-color': '#fff',
          'text-halo-color': '#000',
          'text-halo-width': 2
        }
      });

      // Add popup on hover for mineral icons (always enabled)
      map.current.on('mouseenter', 'mineral-icons', (e) => {
        if (!map.current) return;
        map.current.getCanvas().style.cursor = 'pointer';
        if (!e.features || !e.features.length) return;
        const feature = e.features[0];
        const props = feature.properties;
        console.log(e.features);
        if (!props || !feature.geometry || feature.geometry.type !== 'Point') return;
        const coords = feature.geometry.coordinates as [number, number];
        // Try to get the country name from feature properties or fallback to allProducers lookup
        let country = '';
        if (props.country) {
          country = props.country;
        } else if (props.NAME) {
          country = props.NAME;
        } else {
          country = allProducers.find(p => p.mineral === props.mineral && p.coords[0] === coords[0] && p.coords[1] === coords[1])?.name || '';
        }
        if (!country) {
          console.log('Mineral icon popup: Could not determine country name. Feature properties:', props);
        }
        const element = (() => {
          switch (props.mineral) {
            case 'Cu': return 'Copper';
            case 'Ni': return 'Nickel';
            case 'Mn': return 'Manganese';
            case 'Li': return 'Lithium';
            case 'U': return 'Uranium';
            case 'REE': return 'Rare Earths';
            case 'Co': return 'Cobalt';
            case 'diamonds': return 'Diamonds';
            case 'gold': return 'Gold';
            case 'coal': return 'Coal';
            case 'gas': return 'Natural Gas';
            case 'petroleum': return 'Petroleum';
            case 'aluminium': return 'Aluminium';
            case 'iron': return 'Iron Ore';
            case 'silver': return 'Silver';
            case 'minerals': return 'Minerals';
            default: return props.mineral;
          }
        })();
        const production = props.label;
        const popupHtml = `<div style='font-size:14px;min-width:120px;background:#fff;color:#222;padding:10px 14px;border-radius:10px;box-shadow:0 2px 8px rgba(0,0,0,0.08)'>
          <b>Country:</b> ${country}<br/>
          <b>Element:</b> ${element}<br/>
          <b>Production:</b> ${production}
        </div>`;
        new mapboxgl.Popup({ closeButton: false })
          .setLngLat(coords)
          .setHTML(popupHtml)
          .addTo(map.current!);
      });
      map.current.on('mouseleave', 'mineral-icons', () => {
        if (!map.current) return;
        map.current.getCanvas().style.cursor = '';
        const popups = document.getElementsByClassName('mapboxgl-popup');
        if (popups.length) {
          for (let i = 0; i < popups.length; i++) {
            popups[i].remove();
          }
        }
      });
    };

    if (map.current?.isStyleLoaded()) {
      addMineralOverlay();
    } else {
      map.current?.once('style.load', addMineralOverlay);
    }

    // Cleanup
    return () => {
      if (map.current?.isStyleLoaded()) {
        if (map.current?.getLayer('mineral-icons')) map.current.removeLayer('mineral-icons');
        if (map.current?.getSource('mineral-deposits')) map.current.removeSource('mineral-deposits');
        if (map.current?.getLayer('copper-production-icons')) map.current.removeLayer('copper-production-icons');
        if (map.current?.getSource('copper-production')) map.current.removeSource('copper-production');
        if (map.current?.getLayer('nickel-production-icons')) map.current.removeLayer('nickel-production-icons');
        if (map.current?.getSource('nickel-production')) map.current.removeSource('nickel-production');
        if (map.current?.getLayer('manganese-production-icons')) map.current.removeLayer('manganese-production-icons');
        if (map.current?.getSource('manganese-production')) map.current.removeSource('manganese-production');
        if (map.current?.getLayer('lithium-production-icons')) map.current.removeLayer('lithium-production-icons');
        if (map.current?.getSource('lithium-production')) map.current.removeSource('lithium-production');
        if (map.current?.getLayer('uranium-production-icons')) map.current.removeLayer('uranium-production-icons');
        if (map.current?.getSource('uranium-production')) map.current.removeSource('uranium-production');
      }
      if (map.current) {
        map.current.off('style.load', addMineralOverlay);
      }
    };
  }, [gdpFilter, activeOverlays]);

  // Top 10 uranium producers (2024, in tons)
  const topUraniumProducers = [
    { name: "Kazakhstan", coords: [68, 48], production: 21227 },
    { name: "Canada", coords: [-95, 60], production: 7351 },
    { name: "Namibia", coords: [18, -22], production: 5613 },
    { name: "Australia", coords: [135, -25], production: 4553 },
    { name: "Uzbekistan", coords: [64, 41], production: 3300 },
    { name: "Russia", coords: [100, 60], production: 2508 },
    { name: "Niger", coords: [8, 17], production: 2020 },
    { name: "China", coords: [105, 35], production: 1700 },
    { name: "India", coords: [78, 22], production: 600 },
    { name: "South Africa", coords: [25, -29], production: 200 },
  ];

  // Top 10 rare earths producers (2024, in tons)
  const topREEProducers = [
    { name: "United States", coords: [-110, 35], production: 45000 },
    { name: "Australia", coords: [135, -25], production: 13000 },
    { name: "Burma", coords: [96, 21], production: 31000 }, // Burma = Myanmar
    { name: "China", coords: [105, 35], production: 270000 },
    { name: "India", coords: [78, 22], production: 2900 },
    { name: "Madagascar", coords: [47, -20], production: 2000 },
    { name: "Nigeria", coords: [8, 9], production: 13000 },
    { name: "Russia", coords: [100, 60], production: 2500 },
    { name: "Thailand", coords: [100, 15], production: 13000 },
    { name: "Vietnam", coords: [108, 16], production: 300 },
  ];

  // Top 10 coal producers (2024, in million tonnes)
  const topCoalProducers = [
    { name: "China", coords: [105, 35], production: 4362 },
    { name: "India", coords: [78, 22], production: 968 },
    { name: "Indonesia", coords: [120, -5], production: 781 },
    { name: "United States", coords: [-110, 35], production: 524 },
    { name: "Russia", coords: [100, 60], production: 479 },
    { name: "Australia", coords: [135, -25], production: 442 },
    { name: "South Africa", coords: [25, -29], production: 238 },
    { name: "Kazakhstan", coords: [68, 48], production: 117 },
    { name: "Germany", coords: [10, 51], production: 102 },
    { name: "Poland", coords: [20, 52], production: 88 },
  ];

  // Top 10 natural gas producers (2024, in million m³)
  const topGasProducers = [
    { name: "United States", coords: [-110, 35], production: 967300 },
    { name: "Russia", coords: [100, 60], production: 701000 },
    { name: "Iran", coords: [53, 32], production: 237581 },
    { name: "China", coords: [105, 35], production: 179317 },
    { name: "Canada", coords: [-95, 60], production: 178725 },
    { name: "Qatar", coords: [51, 25], production: 167480 },
    { name: "Australia", coords: [135, -25], production: 142110 },
    { name: "Saudi Arabia", coords: [45, 24], production: 114000 },
    { name: "Norway", coords: [10, 61], production: 112000 },
    { name: "Algeria", coords: [3, 28], production: 87860 },
  ];

  // Top 10 petroleum producers (2024, in barrels/day)
  const topPetroleumProducers = [
    { name: "United States", coords: [-110, 35], production: 13401000 },
    { name: "Saudi Arabia", coords: [45, 24], production: 10815700 },
    { name: "Russia", coords: [100, 60], production: 10750000 },
    { name: "Canada", coords: [-95, 60], production: 5500000 },
    { name: "China", coords: [105, 35], production: 4715000 },
    { name: "Iraq", coords: [44, 33], production: 4162000 },
    { name: "Iran", coords: [53, 32], production: 4084000 },
    { name: "United Arab Emirates", coords: [54, 24], production: 3770000 },
    { name: "Brazil", coords: [-55, -10], production: 3630000 },
    { name: "Kuwait", coords: [48, 29], production: 2720000 },
  ];

  // Top 10 cobalt producers (2024, in metric tonnes)
  const topCobaltProducers = [
    { name: "DR Congo", coords: [22, -3], production: 130000 },
    { name: "Indonesia", coords: [120, -5], production: 10000 },
    { name: "Russia", coords: [100, 60], production: 8900 },
    { name: "Australia", coords: [135, -25], production: 5900 },
    { name: "Canada", coords: [-95, 60], production: 3900 },
    { name: "Cuba", coords: [-80, 21.5], production: 3800 },
    { name: "Philippines", coords: [122, 12], production: 3800 },
    { name: "Madagascar", coords: [47, -20], production: 3000 },
    { name: "Papua New Guinea", coords: [143, -6], production: 3000 },
    { name: "Turkey", coords: [35, 39], production: 2700 },
  ];

  // Top 10 diamond producers (2024, in million carats)
  const topDiamondProducers = [
    { name: "Russia", coords: [100, 60], production: 37.3 },
    { name: "Botswana", coords: [25, -22], production: 25.1 },
    { name: "Canada", coords: [-95, 60], production: 15.6 },
    { name: "DR Congo", coords: [22, -3], production: 9.9 },
    { name: "Angola", coords: [17, -12], production: 9.75 },
    { name: "South Africa", coords: [25, -29], production: 5.89 },
    { name: "Zimbabwe", coords: [30.9, -19], production: 4.91 },
    { name: "Namibia", coords: [17, -22], production: 2.39 },
    { name: "Sierra Leone", coords: [-11, 8.5], production: 0.52 },
    { name: "Lesotho", coords: [28, -29], production: 0.47 },
  ];

  // Top 10 gold producers (2024, in tonnes)
  const topGoldProducers = [
    { name: "China", coords: [105, 35], production: 380 },
    { name: "Russia", coords: [100, 60], production: 310 },
    { name: "Australia", coords: [135, -25], production: 290 },
    { name: "Canada", coords: [-95, 60], production: 200 },
    { name: "United States", coords: [-110, 35], production: 160 },
    { name: "Ghana", coords: [-1, 7.9], production: 130 },
    { name: "Mexico", coords: [-102, 23], production: 130 },
    { name: "Kazakhstan", coords: [68, 48], production: 130 },
    { name: "Uzbekistan", coords: [64, 41], production: 120 },
    { name: "South Africa", coords: [25, -29], production: 100 },
  ];

  // Top 10 aluminium producers (2024, in thousand tonnes)
  const topAluminiumProducers = [
    { name: "China", coords: [105, 35], production: 43000 },
    { name: "India", coords: [78, 22], production: 4200 },
    { name: "Russia", coords: [100, 60], production: 3800 },
    { name: "Canada", coords: [-95, 60], production: 3300 },
    { name: "United Arab Emirates", coords: [54, 24], production: 2700 },
    { name: "Bahrain", coords: [50.5, 26], production: 1600 },
    { name: "Australia", coords: [135, -25], production: 1500 },
    { name: "Norway", coords: [10, 61], production: 1300 },
    { name: "Brazil", coords: [-55, -10], production: 1100 },
    { name: "Malaysia", coords: [102, 4], production: 870 },
  ];

  // Top 10 iron ore producers (2024, in thousand tonnes)
  const topIronOreProducers = [
    { name: "Australia", coords: [135, -25], production: 930000 },
    { name: "Brazil", coords: [-55, -10], production: 440000 },
    { name: "China", coords: [105, 35], production: 270000 },
    { name: "India", coords: [78, 22], production: 270000 },
    { name: "Russia", coords: [100, 60], production: 91000 },
    { name: "Iran", coords: [53, 32], production: 90000 },
    { name: "South Africa", coords: [25, -29], production: 66000 },
    { name: "Canada", coords: [-95, 60], production: 54000 },
    { name: "United States", coords: [-110, 35], production: 48000 },
    { name: "Ukraine", coords: [32, 49], production: 42000 },
  ];

  // Top 10 silver producers (2024, in tonnes)
  const topSilverProducers = [
    { name: "Mexico", coords: [-102, 23], production: 6400 },
    { name: "China", coords: [105, 35], production: 3400 },
    { name: "Peru", coords: [-75, -10], production: 3100 },
    { name: "Chile", coords: [-70, -30], production: 1400 },
    { name: "Poland", coords: [20, 52], production: 1300 },
    { name: "Australia", coords: [135, -25], production: 1200 },
    { name: "Bolivia", coords: [-65, -19], production: 1200 },
    { name: "Russia", coords: [100, 60], production: 1200 },
    { name: "United States", coords: [-110, 35], production: 1000 },
    { name: "Kazakhstan", coords: [68, 48], production: 990 },
  ];

  // Helper to format production numbers for new overlays
  function formatCoal(n: number): string {
    return n + ' Mt';
  }
  function formatGas(n: number): string {
    return (n / 1000).toFixed(0) + ' B m³';
  }
  function formatPetroleum(n: number): string {
    return (n / 1000000).toFixed(1).replace(/\.0$/, '') + ' M bbl/d';
  }
  function formatCobalt(n: number): string {
    return n + ' t';
  }
  function formatDiamond(n: number): string {
    return n + ' M ct';
  }
  function formatGold(n: number): string {
    return n + ' t';
  }
  function formatAluminium(n: number): string {
    return n + 'k t';
  }
  function formatIronOre(n: number): string {
    return n + 'k t';
  }
  function formatSilver(n: number): string {
    return n + ' t';
  }

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
      <Legend />

      <button
        id="btn-spin"
        onClick={handleSpinButtonClick}
        className="absolute bottom-6 right-4 bg-violet-800 text-white p-2 px-4 rounded-lg"
      >
        {spinEnabled ? "Pause" : "Rotate"}
      </button>

      {/* Animation toggle button */}
      <button
        id="btn-animation-toggle"
        onClick={handleAnimationToggle}
        className="absolute bottom-6 left-1/2 transform -translate-x-1/2 bg-blue-600 text-white p-2 px-4 rounded-lg"
      >
        {animationPaused ? "Resume Animation" : "Pause Animation"}
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