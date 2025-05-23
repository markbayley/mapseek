import React from "react";
import ReactDOMServer from "react-dom/server";
import mapboxgl from "mapbox-gl";

interface IconDef {
  component: React.ReactElement;
  name: string;
  size?: number;
  color?: string;
}

// Color palette inspired by the reference image
const palette = ["#6FCF97", "#F2C94C", "#F2994A", "#B5DE8C"];

// Optionally assign by export type for consistency  (map icon colors)
const exportTypeToColor: Record<string, string> = {
  petroleum: "#334155", 
  crude: "#334155", 
  gas: "#52525b",
  coal: "#78716c", 

  cars: "#f87171", 
  machinery: "#6B7280",
  vehicles: "#EF4444", 
  ships: "#ef4444", 
  aircraft: "#fca5a5", 
  transport: "#374151", 
  trucks: "#fb7185",
  parts: "#f87171", 

  wheat: "#facc15", 
  grain: "#fde047", 
  corn: "#fde047",
  maize: "#fde047", 
  milk: "#fdba74", 
  beef: "#fdba74", 
  soybeans: "#B5DE8C", 
  soy: "#B5DE8C", 
  coffee: "#ca8a04", 
  oil: "#eab308",
  fruits: "#84CC16", 
  food: "#fdba74", 
  fish: "#7dd3fc", 
  shellfish: "#93c5fd", 

  gold: "#facc15", 
  silver: "#E5E7EB", 
  copper: "#FB923C", 
  zinc: "#94A3B8", 
  metal: "#6B7280", 
  iron: "#6B7280", 
  steel: "#6B7280",
  minerals: "#9CA3AF", 
  diamonds: "#bfdbfe", 
  gems: "#3B82F6",
  wood: "#059669", 
  paper: "#059669", 
  pulp: "#059669", 

  electronics: "#0d9488", 
  broadcast: "#14b8a6", 
  computers: "#2dd4bf", 
  phones: "#2dd4bf", 
  circuits: "#14b8a6", 
  
  textiles: "#d8b4fe",
  clothing: "#d8b4fe", 
  garments: "#d8b4fe", 
  fertilizers: "#4D7C0F", 

  medicine: "#818cf8", 
  pharmaceuticals: "#818cf8", 
  plastics: "#d8b4fe", 
  chemicals: "#c4b5fd",
  
  REE:  "#fca5a5" , 
  Mn:  "#B5DE8C" ,  
  Ni:  "#d8b4fe" ,
  Cu:"#fdba74" , 
  Co: "#a5b4fc" , 
  Li: "#c7d2fe" , 
  U: "#fcd34d" , 
};

/**
 * Adds multiple React icon components as Mapbox images.
 * @param map - The Mapbox map instance.
 * @param icons - List of icon definitions.
 * @returns Promise<void[]> - Resolves when all icons are added.
 */
export async function addReactIconsToMapbox(map: mapboxgl.Map, icons: IconDef[]): Promise<void[]> {
  const promises = icons.map(({ component, name, size = 50 }, idx) => {
    // Pick color by export type or cycle through palette
    const bgColor = exportTypeToColor[name] || palette[idx % palette.length];
    const iconColor = "#fff";

    const svgString = ReactDOMServer.renderToStaticMarkup(
      React.cloneElement(component as any, { size: size * 0.76, color: iconColor })
    );
    const svgBlob = new Blob([svgString], { type: "image/svg+xml;charset=utf-8" });
    const url = URL.createObjectURL(svgBlob);

    return new Promise<void>((resolve, reject) => {
      const img = new window.Image();
      img.onload = function () {
        const canvas = document.createElement("canvas");
        canvas.width = size;
        canvas.height = size;
        const ctx = canvas.getContext("2d");
        if (!ctx) {
          URL.revokeObjectURL(url);
          reject(new Error("Could not get canvas context"));
          return;
        }
        // Draw a rounded square background
        const radius = 10; // corner radius
        ctx.beginPath();
        ctx.moveTo(radius, 0);
        ctx.lineTo(size - radius, 0);
        ctx.quadraticCurveTo(size, 0, size, radius);
        ctx.lineTo(size, size - radius);
        ctx.quadraticCurveTo(size, size, size - radius, size);
        ctx.lineTo(radius, size);
        ctx.quadraticCurveTo(0, size, 0, size - radius);
        ctx.lineTo(0, radius);
        ctx.quadraticCurveTo(0, 0, radius, 0);
        ctx.closePath();
        ctx.fillStyle = bgColor;
        ctx.fill();

        // Draw the icon (centered, white, with margin)
        const margin = size * 0.12;
        ctx.drawImage(img, margin, margin, size - 2 * margin, size - 2 * margin);

        const imageData = ctx.getImageData(0, 0, size, size);
        if (map.hasImage(name)) {
          map.removeImage(name);
        }
        map.addImage(name, {
          width: size,
          height: size,
          data: new Uint8Array(imageData.data.buffer),
        });
        URL.revokeObjectURL(url);
        resolve();
      };
      img.onerror = reject;
      img.src = url;
    });
  });

  return Promise.all(promises);
} 