import { useEffect } from "react";

interface MineralOverlayProps {
  map: any;
  gdpFilter: number;
  activeOverlays: { [key: string]: boolean };
  addReactIconsToMapbox: (map: any, icons: any[]) => void;
  topCopperProducers: any[];
  topNickelProducers: any[];
  topManganeseProducers: any[];
  topLithiumProducers: any[];
  topUraniumProducers: any[];
  topREEProducers: any[];
  topCoalProducers: any[];
  topGasProducers: any[];
  topPetroleumProducers: any[];
  topCobaltProducers: any[];
  topDiamondProducers: any[];
  topGoldProducers: any[];
  topAluminiumProducers: any[];
  topIronOreProducers: any[];
  topSilverProducers: any[];
  iconMap: any;
  formatProduction: (n: number) => string;
  formatCoal: (n: number) => string;
  formatGas: (n: number) => string;
  formatPetroleum: (n: number) => string;
  formatCobalt: (n: number) => string;
  formatDiamond: (n: number) => string;
  formatGold: (n: number) => string;
  formatAluminium: (n: number) => string;
  formatIronOre: (n: number) => string;
  formatSilver: (n: number) => string;
}

export function useMineralOverlay({
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
}: MineralOverlayProps) {
  useEffect(() => {
    if (!map.current) return;

    console.log("[MineralOverlay] useEffect triggered");

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

      if (gdpFilter !== 0 || !activeOverlays.Resources) {
        console.log("[MineralOverlay] Not rendering: gdpFilter != 0 or Resources overlay not active", { gdpFilter, activeOverlays });
        return;
      }

      // Register mineral icons with Mapbox
      const mineralIconDefs = ["REE", "Mn", "Ni", "Cu", "Co", "Li", "U"].map(key => ({
        component: iconMap[key].component,
        name: key,
      }));
      addReactIconsToMapbox(map.current, mineralIconDefs);

      // Combine all producers into a country->minerals map
      const allProducers = [
        ...topCopperProducers.map(x => ({...x, mineral: 'Cu', label: formatProduction(x.production), max: Math.max(...topCopperProducers.map(y=>y.production)), prod: x.production })),
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
      console.log("[MineralOverlay] allProducers count:", allProducers.length, allProducers);
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
      console.log("[MineralOverlay] features count:", features.length, features);
      map.current.addSource('mineral-deposits', {
        type: 'geojson',
        data: { type: 'FeatureCollection', features }
      });
      console.log("[MineralOverlay] Added source 'mineral-deposits'");
      map.current.addLayer({
        id: 'mineral-icons',
        type: 'symbol',
        source: 'mineral-deposits',
        maxzoom: 4, // Only show at zoom >= 4
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
          'text-color': '#000',
         // 'text-halo-color': '#000',
         // 'text-halo-width': 2
        }
      });
      console.log("[MineralOverlay] Added layer 'mineral-icons'");
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
} 