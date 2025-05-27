import { createCountryNameMapping } from './countryNameMappingUtils';

// Type definitions for economic data
export interface EconomicData {
  [key: string]: number;
}

// Load inflation data from CSV file
export const loadInflationData = async (): Promise<EconomicData> => {
  try {
    const response = await fetch('/data/Inflation rate (consumer prices).csv');
    const csvText = await response.text();
    const lines = csvText.split('\n').slice(1); // Skip header
    const data: EconomicData = {};
    
    lines.forEach(line => {
      if (line.trim()) {
        const [name, , percentage] = line.split(',');
        if (name && percentage) {
          const csvCountryName = name.replace(/"/g, '').trim();
          const mappedCountryName = createCountryNameMapping(csvCountryName);
          const rate = parseFloat(percentage.replace(/"/g, ''));
          if (!isNaN(rate)) {
            data[mappedCountryName] = rate;
            // Also store with original name as fallback
            data[csvCountryName] = rate;
          }
        }
      }
    });
    
    return data;
  } catch (error) {
    console.error('Error loading inflation data:', error);
    return {};
  }
};

// Load unemployment data from CSV file
export const loadUnemploymentData = async (): Promise<EconomicData> => {
  try {
    const response = await fetch('/data/Unemployment rate.csv');
    const csvText = await response.text();
    const lines = csvText.split('\n').slice(1); // Skip header
    const data: EconomicData = {};
    
    lines.forEach(line => {
      if (line.trim()) {
        const [name, , percentage] = line.split(',');
        if (name && percentage) {
          const csvCountryName = name.replace(/"/g, '').trim();
          const mappedCountryName = createCountryNameMapping(csvCountryName);
          const rate = parseFloat(percentage.replace(/"/g, ''));
          if (!isNaN(rate)) {
            data[mappedCountryName] = rate;
            // Also store with original name as fallback
            data[csvCountryName] = rate;
          }
        }
      }
    });
    
    return data;
  } catch (error) {
    console.error('Error loading unemployment data:', error);
    return {};
  }
};

// Helper function to add economic data to GeoJSON features
export const addEconomicDataToFeatures = (
  features: any[],
  inflationData: EconomicData,
  unemploymentData: EconomicData
): void => {
  features.forEach((feature: any) => {
    const countryName = feature.properties.NAME;
    const gdp = feature.properties.GDP_MD;
    const population = feature.properties.POP_EST;
    
    // Add GDP per capita calculation
    if (gdp && population && population > 0) {
      feature.properties.GDP_per_capita = (gdp * 1000) / population;
    }
    
    // Add inflation rate
    if (inflationData[countryName]) {
      feature.properties.INFLATION_RATE = inflationData[countryName];
      //console.log(`Matched inflation data for ${countryName}: ${inflationData[countryName]}%`);
    } else {
     // console.log(`No inflation data found for: ${countryName}`);
    }
    
    // Add unemployment rate
    if (unemploymentData[countryName]) {
      feature.properties.UNEMPLOYMENT_RATE = unemploymentData[countryName];
     // console.log(`Matched unemployment data for ${countryName}: ${unemploymentData[countryName]}%`);
    } else {
      //console.log(`No unemployment data found for: ${countryName}`);
    }
  });
  
  console.log('Inflation data loaded:', Object.keys(inflationData).length, 'countries');
  console.log('Unemployment data loaded:', Object.keys(unemploymentData).length, 'countries');
}; 