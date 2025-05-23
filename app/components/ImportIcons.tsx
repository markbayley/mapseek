import React from 'react';
import { FaOilWell, FaMicrochip, FaTowerBroadcast, FaGears, FaSheetPlastic } from 'react-icons/fa6';
import { FaCar, FaCoffee, FaTruck, FaTshirt } from 'react-icons/fa';
import { LuMilk, LuBeef, LuBean } from 'react-icons/lu';
import { GiCorn, GiGoldMine, GiMedicines, GiDoubleFish } from 'react-icons/gi';
import { BsMinecartLoaded } from "react-icons/bs";

interface ImportIconsProps {
  imports: string;
  onIconsGenerated?: (icons: Array<{ keyword: string; color: string }>) => void;
}

const ImportIcons: React.FC<ImportIconsProps> = ({ imports, onIconsGenerated }) => {
  // Map of import keywords to their corresponding colors (same as export colors for consistency)
  const importColors: { [key: string]: string } = {
    petroleum: "#334155", // slate-700
    crude: "#334155", // slate-700
    gas: "#52525b", // zinc-500
    coal: "#78716c", // stone-500

   
    oil: "#F59E0B",

    iron: "#6B7280", // gray-500
    steel: "#6B7280",
    machinery: "#6B7280",
    wheat: "#22C55E", // green-500 (agricultural)
    grain: "#22C55E", // green-500 (agricultural)
    corn: "#22C55E", // green-500 (agricultural)
    maize: "#22C55E", // green-500 (agricultural)
    gold: "#F59E0B", // amber-500 for gold
    silver: "#D1D5DB", // gray-200 for silver
    copper: "#FB923C", // orange-400 for copper
    zinc: "#94A3B8", // slate-400 for zinc
    metal: "#6B7280", // gray-500 for metal
    minerals: "#9CA3AF", // gray-400 for minerals
    vehicles: "#EF4444", // red-500
    cars: "#EF4444", // red-500
    ships: "#2563EB",
    fertilizers: "#22C55E", // green-500
    milk: "#22C55E", // green-500 (agricultural)
    beef: "#22C55E", // green-500 (agricultural)
    soybeans: "#22C55E", // green-500 (agricultural)
    coffee: "#22C55E", // green-500 (agricultural)
    trucks: "#374151", // gray-700
    textiles: "#22C55E", // green-500
    garments: "#22C55E", // green-500
    aircraft: "#374151", // gray-700
    computers: "#1F2937", // gray-800
    phones: "#1F2937",
    broadcast: "#1F2937",
    circuits: "#1F2937",
    parts: "#4B5563",
    clothing: "#22C55E",
    fruits: "#22C55E", // green-500 (agricultural)
    food: "#22C55E", // green-500 (agricultural)
    plastics: "#9333EA", // purple-600
    chemicals: "#9333EA",
    pharmaceuticals: "#0EA5E9", // sky-500
    medicine: "#0EA5E9", // sky-500
    fish: "#0891B2", // cyan-600
    shellfish: "#0891B2", // cyan-600
    wood: "#22C55E", // green-500 for wood
    pulp: "#22C55E", // green-500 for pulp
    paper: "#22C55E", // green-500 for pulp
    turbines: "#60a5fa",
    wire: "#fbbf24",
    electrical: "#fbbf24",
    electricity: "#fbbf24",
    equipment: "#fbbf24",
    appliances: "#fbbf24",
    rice: "#fde68a",
    sugar: "#f9fafb",
    spice: "#f9fafb",
    nuts: "#f9fafb",
    sheep: "#a3e635",
    butter: "#fde68a",
    beer: "#fbbf24",
    liquor: "#fbbf24",
    alcohols: "#fbbf24",
    cocoa: "#a3e635",
    coconuts: "#a3e635",
    bananas: "#fde047",
    jewelry: "#f472b6",
    tobacco: "#fbbf24",
    rubber: "#a3e635",
    tires: "#a3e635",
    footwear: "#a3e635",
    phosphates: "#818cf8",
    acids: "#818cf8",
    pesticides: "#818cf8",
    nitrogen: "#818cf8",
    carbonates: "#818cf8",
    ore: "#6b7280",
    ores: "#6b7280",
    lignite: "#6b7280",
    aluminum: "#6b7280",
    cement: "#6b7280",
    nickel: "#6b7280",
  };

  // Function to find matching imports
  const getImportIcons = () => {
    if (!imports) return [];
    
    // console.log("Processing imports:", imports);
    const importList = imports.toLowerCase().split(',').map(item => item.trim());
    // console.log("Import list:", importList);
    const matchedIcons: Array<{ keyword: string; color: string }> = [];
    const processedKeywords = new Set<string>();
    
    importList.forEach(importItem => {
      Object.entries(importColors).forEach(([keyword, color]) => {
        if (importItem.includes(keyword) && !processedKeywords.has(keyword)) {
          processedKeywords.add(keyword);
          matchedIcons.push({ keyword, color });
          // console.log("Matched import keyword:", keyword);
        }
      });
    });

    if (onIconsGenerated) {
      onIconsGenerated(matchedIcons);
    }
    
    return matchedIcons;
  };

  // Call getImportIcons when imports changes
  React.useEffect(() => {
    getImportIcons();
  }, [imports]);

  return null; // This component doesn't render anything directly
};

export default ImportIcons; 