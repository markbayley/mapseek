import mapboxgl from "mapbox-gl";

// Type definitions for layer configuration
export interface LayerVisibilityConfig {
  gdpFilter: number;
  activeTab: 'inflation' | 'unemployment' | 'gdp';
}

// Layer definitions for different economic indicators
export const createGdpCapitaLayer = (): mapboxgl.FillLayer => ({
  id: "gdpcapita-fill",
  type: "fill",
  source: "data",
  layout: {
    "visibility": "none"  // Start hidden, will be shown by visibility functions
  },
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
});

export const createPopulationLayer = (): mapboxgl.FillLayer => ({
  id: "population-fill",
  type: "fill",
  source: "data",
  layout: {
    "visibility": "none"  // Start hidden, will be shown by visibility functions
  },
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
});

export const createGdpLayer = (): mapboxgl.FillLayer => ({
  id: "gdp-fill",
  type: "fill",
  source: "data",
  layout: {
    "visibility": "none"  // Start hidden, will be shown by visibility functions
  },
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
});

export const createInflationLayer = (): mapboxgl.FillLayer => ({
  id: "inflation-fill",
  type: "fill",
  source: "data",
  layout: {
    "visibility": "visible"  // Explicitly set to visible for debugging
  },
  paint: {
    "fill-color": [
      "interpolate",
      ["linear"],
      ["coalesce", ["get", "INFLATION_RATE"], 0],
      -10,
      "#1e40af",      // Deep blue for deflation
      0,
      "#3b82f6",      // Blue for low inflation
      5,
      "#fbbf24",      // Yellow for moderate inflation
      10,
      "#f59e0b",      // Orange for high inflation
      20,
      "#dc2626",      // Red for very high inflation
      30,
      "#7f1d1d",      // Dark red for extreme inflation
    ],
    "fill-opacity": 0.5,
  },
});

export const createUnemploymentLayer = (): mapboxgl.FillLayer => ({
  id: "unemployment-fill",
  type: "fill",
  source: "data",
  layout: {
    "visibility": "none"  // Start hidden, will be shown by visibility functions
  },
  paint: {
    "fill-color": [
      "interpolate",
      ["linear"],
      ["coalesce", ["get", "UNEMPLOYMENT_RATE"], 0],
      0,
      "#fef3c7",      // Light yellow for low unemployment
      5,
      "#f59e0b",      // Orange for moderate unemployment
      10,
      "#dc2626",      // Red for high unemployment
      15,
      "#991b1b",      // Dark red for very high unemployment
      25,
      "#7f1d1d",      // Very dark red for extreme unemployment
    ],
    "fill-opacity": 0.5,
  },
});

export const createCountryFillsLayer = (): mapboxgl.FillLayer => ({
  id: "country-fills",
  type: "fill",
  source: "countries",
  "source-layer": "country_boundaries",
  layout: {},
  paint: {
    "fill-color": "#f59e0b",
    "fill-opacity": [
      "case",
      ["boolean", ["feature-state", "click"], false],
      0.7,
      0,
    ],
  },
});

export const createExportLayer = (): mapboxgl.FillLayer => ({
  id: "export-fill",
  type: "fill",
  source: "countries",
  "source-layer": "country_boundaries",
  paint: {
    "fill-color": "#8B5CF6",
    "fill-opacity": 1,
  },
});

export const createImportLayer = (): mapboxgl.FillLayer => ({
  id: "import-fill",
  type: "fill",
  source: "countries",
  "source-layer": "country_boundaries",
  paint: {
    "fill-color": "#8B5CF6",
    "fill-opacity": 1,
  },
});

// Function to add all data layers to the map
export const addAllDataLayers = (map: mapboxgl.Map): void => {
  const layers = [
    { name: 'population', layer: createPopulationLayer() },
    { name: 'gdp', layer: createGdpLayer() },
    { name: 'inflation', layer: createInflationLayer() },
    { name: 'unemployment', layer: createUnemploymentLayer() },
    { name: 'gdpCapita', layer: createGdpCapitaLayer() },
    { name: 'countryFills', layer: createCountryFillsLayer() }
  ];

  layers.forEach(({ name, layer }) => {
    try {
      map.addLayer(layer);
    } catch (error) {
      console.error(`Error adding ${name} layer:`, error);
    }
  });
};

// Function to set map fog
export const setMapFog = (map: mapboxgl.Map): void => {
  map.setFog({
    color: "rgb(186, 210, 235)",
    "high-color": "rgb(36, 92, 223)",
    "horizon-blend": 0.001,
    "space-color": "rgb(11, 11, 25)",
    "star-intensity": 0.1,
  });
};

// Function to add countries vector source
export const addCountriesSource = (map: mapboxgl.Map): void => {
  map.addSource("countries", {
    type: "vector",
    url: "mapbox://mapbox.country-boundaries-v1",
  });
};

// Function to update layer visibility based on configuration
export const updateLayerVisibility = (
  map: mapboxgl.Map,
  config: LayerVisibilityConfig
): void => {
  if (!map.isStyleLoaded()) return;

  // Remove export/import layers
  if (map.getLayer("export-fill")) {
    map.removeLayer("export-fill");
  }
  if (map.getLayer("import-fill")) {
    map.removeLayer("import-fill");
  }

  switch (config.gdpFilter) {
    case 0:
      // Show economic layers based on activeTab when in Overview mode
      updateEconomicLayerVisibility(map, config.activeTab);
      break;
    case 1000000000000:
      // Hide all economic layers first, then show population
      const economicLayers = ["gdp-fill", "inflation-fill", "unemployment-fill", "gdpcapita-fill"];
      economicLayers.forEach((layer) => {
        if (map.getLayer(layer)) {
          map.setLayoutProperty(layer, "visibility", "none");
        }
      });
      if (map.getLayer("population-fill")) {
        showLegend("population");
        map.setLayoutProperty("population-fill", "visibility", "visible");
      }
      break;
    case 3000000000000:
      // Hide all economic layers first, then show gdp capita
      const economicLayers2 = ["gdp-fill", "inflation-fill", "unemployment-fill", "population-fill"];
      economicLayers2.forEach((layer) => {
        if (map.getLayer(layer)) {
          map.setLayoutProperty(layer, "visibility", "none");
        }
      });
      if (map.getLayer("gdpcapita-fill")) {
        showLegend("gdp-capita");
        map.setLayoutProperty("gdpcapita-fill", "visibility", "visible");
      }
      break;
    default:
      break;
  }
};

// Function to handle economic layer visibility based on activeTab
export const updateEconomicLayerVisibility = (
  map: mapboxgl.Map,
  activeTab: 'inflation' | 'unemployment' | 'gdp'
): void => {
  if (!map.isStyleLoaded()) return;

  // Hide all economic layers first
  const economicLayers = ["gdp-fill", "inflation-fill", "unemployment-fill", "gdpcapita-fill", "population-fill"];
  economicLayers.forEach((layer) => {
    if (map.getLayer(layer)) {
      map.setLayoutProperty(layer, "visibility", "none");
    }
  });

  // Show the layer based on activeTab
  switch (activeTab) {
    case 'gdp':
      if (map.getLayer("gdp-fill")) {
        showLegend("gdp");
        map.setLayoutProperty("gdp-fill", "visibility", "visible");
      }
      break;
    case 'inflation':
      if (map.getLayer("inflation-fill")) {
        showLegend("inflation");
        map.setLayoutProperty("inflation-fill", "visibility", "visible");
      }
      break;
    case 'unemployment':
      if (map.getLayer("unemployment-fill")) {
        showLegend("unemployment");
        map.setLayoutProperty("unemployment-fill", "visibility", "visible");
      }
      break;
  }
};

// Function to show/hide legends
export const showLegend = (layer: string): void => {
  // Hide all legends first
  const legendIds = ["gdp-legend", "population-legend", "gdp-capita-legend", "inflation-legend", "unemployment-legend"];
  legendIds.forEach(id => {
    const legend = document.getElementById(id);
    if (legend) legend.style.display = "none";
  });

  // Show the selected legend
  const legendMap: { [key: string]: string } = {
    "gdp": "gdp-legend",
    "population": "population-legend",
    "gdp-capita": "gdp-capita-legend",
    "inflation": "inflation-legend",
    "unemployment": "unemployment-legend"
  };

  const legendId = legendMap[layer];
  if (legendId) {
    const legend = document.getElementById(legendId);
    if (legend) legend.style.display = "block";
  }
};

// Function to add legend click events
export const addLegendClickEvents = (map: mapboxgl.Map): void => {
  map.on("click", "gdp-fill", () => showLegend("gdp"));
  map.on("click", "population-fill", () => showLegend("population"));
  map.on("click", "gdpcapita-fill", () => showLegend("gdp-capita"));
  map.on("click", "inflation-fill", () => showLegend("inflation"));
  map.on("click", "unemployment-fill", () => showLegend("unemployment"));
}; 