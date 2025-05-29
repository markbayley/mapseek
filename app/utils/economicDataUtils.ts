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

// Load labor force data from CSV file
export const loadLaborForceData = async (): Promise<EconomicData> => {
  try {
    const response = await fetch('/data/Labor force.csv');
    const csvText = await response.text();
    const lines = csvText.split('\n').slice(1); // Skip header
    const data: EconomicData = {};
    
    console.log('Loading Labor Force data, total lines:', lines.length);
    
    const sampleCsvNames: string[] = [];
    
    lines.forEach((line, index) => {
      if (line.trim()) {
        const [name, , value] = line.split(',');
        if (name && value) {
          const csvCountryName = name.replace(/"/g, '').trim();
          const mappedCountryName = createCountryNameMapping(csvCountryName);
          
          // Collect sample names for debugging
          if (index < 10) {
            sampleCsvNames.push(csvCountryName);
          }
          
          // Remove commas and convert to number
          const laborForce = parseFloat(value.replace(/[",]/g, ''));
          if (!isNaN(laborForce)) {
            data[mappedCountryName] = laborForce;
            // Also store with original name as fallback
            data[csvCountryName] = laborForce;
            if (index < 5) { // Log first 5 entries for debugging
              console.log(`Labor Force: ${csvCountryName} -> ${mappedCountryName}: ${laborForce}`);
            }
          }
        }
      }
    });
    
    console.log('Sample CSV country names:', sampleCsvNames);
    console.log('Labor Force data loaded:', Object.keys(data).length, 'countries');
    return data;
  } catch (error) {
    console.error('Error loading labor force data:', error);
    return {};
  }
};

// Load public debt data from CSV file
export const loadPublicDebtData = async (): Promise<EconomicData> => {
  try {
    const response = await fetch('/data/Public debt.csv');
    const csvText = await response.text();
    const lines = csvText.split('\n').slice(1); // Skip header
    const data: EconomicData = {};
    
    console.log('Loading Public Debt data, total lines:', lines.length);
    
    const sampleCsvNames: string[] = [];
    
    lines.forEach((line, index) => {
      if (line.trim()) {
        const columns = line.split(',');
        if (columns.length >= 3) {
          const name = columns[0];
          const value = columns[2]; // "% of GDP" column
          if (name && value) {
            const csvCountryName = name.replace(/"/g, '').trim();
            const mappedCountryName = createCountryNameMapping(csvCountryName);
            
            // Collect sample names for debugging
            if (index < 10) {
              sampleCsvNames.push(csvCountryName);
            }
            
            // Remove quotes and convert to number
            const publicDebt = parseFloat(value.replace(/"/g, ''));
            if (!isNaN(publicDebt)) {
              data[mappedCountryName] = publicDebt;
              // Also store with original name as fallback
              data[csvCountryName] = publicDebt;
              if (index < 5) { // Log first 5 entries for debugging
                console.log(`Public Debt: ${csvCountryName} -> ${mappedCountryName}: ${publicDebt}%`);
              }
            }
          }
        }
      }
    });
    
    console.log('Sample CSV country names:', sampleCsvNames);
    console.log('Public Debt data loaded:', Object.keys(data).length, 'countries');
    return data;
  } catch (error) {
    console.error('Error loading public debt data:', error);
    return {};
  }
};

// Load real GDP per capita data from CSV file
export const loadRealGdpPerCapitaData = async (): Promise<EconomicData> => {
  try {
    const response = await fetch('/data/Real GDP per capita.csv');
    const csvText = await response.text();
    const lines = csvText.split('\n').slice(1); // Skip header
    const data: EconomicData = {};
    
    console.log('Loading Real GDP Per Capita data, total lines:', lines.length);
    
    const sampleCsvNames: string[] = [];
    
    lines.forEach((line, index) => {
      if (line.trim()) {
        const [name, , value] = line.split(',');
        if (name && value) {
          const csvCountryName = name.replace(/"/g, '').trim();
          const mappedCountryName = createCountryNameMapping(csvCountryName);
          
          // Collect sample names for debugging
          if (index < 10) {
            sampleCsvNames.push(csvCountryName);
          }
          
          // Remove dollar signs, commas and convert to number
          const realGdpPerCapita = parseFloat(value.replace(/[$",]/g, ''));
          if (!isNaN(realGdpPerCapita)) {
            data[mappedCountryName] = realGdpPerCapita;
            // Also store with original name as fallback
            data[csvCountryName] = realGdpPerCapita;
            if (index < 5) { // Log first 5 entries for debugging
              console.log(`Real GDP Per Capita: ${csvCountryName} -> ${mappedCountryName}: ${realGdpPerCapita}`);
            }
          }
        }
      }
    });
    
    console.log('Sample CSV country names:', sampleCsvNames);
    console.log('Real GDP Per Capita data loaded:', Object.keys(data).length, 'countries');
    return data;
  } catch (error) {
    console.error('Error loading real GDP per capita data:', error);
    return {};
  }
};

// Helper function to add economic data to GeoJSON features
export const addEconomicDataToFeatures = (
  features: any[],
  inflationData: EconomicData,
  unemploymentData: EconomicData,
  laborForceData?: EconomicData,
  publicDebtData?: EconomicData,
  realGdpPerCapitaData?: EconomicData
): void => {
  let laborForceMatches = 0;
  let publicDebtMatches = 0;
  let realGdpPerCapitaMatches = 0;
  
  // Log some sample GeoJSON country names for debugging
  console.log('Sample GeoJSON country names:', features.slice(0, 10).map(f => f.properties.NAME));
  
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
    
    // Add labor force data
    if (laborForceData && laborForceData[countryName]) {
      feature.properties.LABOR_FORCE = laborForceData[countryName];
      laborForceMatches++;
      if (laborForceMatches <= 5) {
        console.log(`Matched labor force data for ${countryName}: ${laborForceData[countryName]}`);
      }
    }
    
    // Add public debt data
    if (publicDebtData && publicDebtData[countryName]) {
      feature.properties.PUBLIC_DEBT = publicDebtData[countryName];
      publicDebtMatches++;
      if (publicDebtMatches <= 5) {
        console.log(`Matched public debt data for ${countryName}: ${publicDebtData[countryName]}`);
      }
    }
    
    // Add real GDP per capita data
    if (realGdpPerCapitaData && realGdpPerCapitaData[countryName]) {
      feature.properties.REAL_GDP_PER_CAPITA = realGdpPerCapitaData[countryName];
      realGdpPerCapitaMatches++;
      if (realGdpPerCapitaMatches <= 5) {
        console.log(`Matched real GDP per capita data for ${countryName}: ${realGdpPerCapitaData[countryName]}`);
      }
    }
  });
  
  console.log('Inflation data loaded:', Object.keys(inflationData).length, 'countries');
  console.log('Unemployment data loaded:', Object.keys(unemploymentData).length, 'countries');
  if (laborForceData) console.log('Labor force data loaded:', Object.keys(laborForceData).length, 'countries, matched:', laborForceMatches);
  if (publicDebtData) console.log('Public debt data loaded:', Object.keys(publicDebtData).length, 'countries, matched:', publicDebtMatches);
  if (realGdpPerCapitaData) console.log('Real GDP per capita data loaded:', Object.keys(realGdpPerCapitaData).length, 'countries, matched:', realGdpPerCapitaMatches);
}; 