import { countryNameMapping } from './countryNameMapping';

// Type definitions
export interface CountryFeature {
  properties: {
    NAME: string;
    LABEL_X: string;
    LABEL_Y: string;
    [key: string]: any;
  };
  [key: string]: any;
}

// Helper function to normalize country names for robust comparison
export const normalizeCountryName = (name: string): string => {
  return name.toLowerCase().replace(/[^a-z0-9]/g, '');
};

// Function to parse export/import partners string
export const parseExportPartners = (exports: string): string[] => {
  // Use the global countryNameMapping
  return exports
    .split(",")
    .map((country) => {
      const countryName = country.split(/\s*\d+%/)[0].trim();
      return countryNameMapping[countryName] || countryName;
    })
    .filter(Boolean);
};

// Helper function to find country coordinates by name
export const getCountryCoordinates = (
  countryName: string,
  countriesFeatures: CountryFeature[] | null
): [number, number] | null => {
  if (!countriesFeatures) {
    console.log("countriesFeatures state is null"); // Log if state is null
    return null;
  }
  
  // Translate the country name using the mapping
  const geojsonCountryName = countryNameMapping[countryName] || countryName;
  const normalizedSearchName = normalizeCountryName(geojsonCountryName);

  // Manually loop through features to find matching country
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

// Helper function to create country-color mapping for highlighting
export const createCountryColorMapping = (
  partners: string[],
  colorPalette: string[]
): { [country: string]: string } => {
  const countryColorMap: { [country: string]: string } = {};
  partners.forEach((partner, index) => {
    countryColorMap[partner] = colorPalette[index % colorPalette.length];
  });
  return countryColorMap;
};

// Helper function to create Mapbox filter for countries
export const createCountryFilter = (partners: string[]): any[] => {
  return ["any", ...partners.map((country) => ["==", "name", country])];
};

// Helper function to validate and extract coordinates from feature properties or click event
export const extractCoordinates = (
  feature: any,
  clickEvent?: { lngLat?: { lng: number; lat: number } }
): [number, number] => {
  let lng = 0, lat = 0;

  // Try to get coordinates from feature properties
  if (feature && feature.properties) {
    const props = feature.properties;
    if (props.LABEL_X && props.LABEL_Y) {
      lng = parseFloat(props.LABEL_X);
      lat = parseFloat(props.LABEL_Y);
    }
  }

  // If coordinates are invalid, use click position
  if (isNaN(lng) || isNaN(lat) || !lng || !lat) {
    if (clickEvent?.lngLat) {
      lng = clickEvent.lngLat.lng;
      lat = clickEvent.lngLat.lat;
    } else {
      // Default values as last resort
      lng = 20;
      lat = 40;
    }
  }

  // Final validation to prevent NaN errors
  if (isNaN(lng) || isNaN(lat)) {
    lng = 20;
    lat = 40;
  }

  return [lng, lat];
}; 