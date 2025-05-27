// Utility function to map CSV country names to GeoJSON country names
export const createCountryNameMapping = (csvName: string): string => {
  // Map CSV country names to GeoJSON country names
  const nameMapping: { [key: string]: string } = {
    'United States': 'United States of America',
    'Korea, South': 'South Korea',
    'Korea, North': 'North Korea',
    'Czechia': 'Czech Republic',
    'Burma': 'Myanmar',
    'Cote d\'Ivoire': 'Côte d\'Ivoire',
    'Congo, Republic of the': 'Republic of the Congo',
    'Congo, Democratic Republic of the': 'Democratic Republic of the Congo',
    'Bahamas, The': 'The Bahamas',
    'Gambia, The': 'Gambia',
    'Turkey (Turkiye)': 'Turkey',
    'Cabo Verde': 'Cape Verde',
    'Eswatini': 'Swaziland',
    'North Macedonia': 'Macedonia',
    'Bosnia and Herzegovina': 'Bosnia and Herz.',
    'Central African Republic': 'Central African Rep.',
    'Dominican Republic': 'Dominican Rep.',
    'Equatorial Guinea': 'Eq. Guinea',
    'Solomon Islands': 'Solomon Is.',
    'South Sudan': 'S. Sudan',
    'Trinidad and Tobago': 'Trinidad and Tobago',
    'United Kingdom': 'United Kingdom',
    'New Zealand': 'New Zealand',
    'Papua New Guinea': 'Papua New Guinea',
    'Saudi Arabia': 'Saudi Arabia',
    'United Arab Emirates': 'United Arab Emirates',
    'Sri Lanka': 'Sri Lanka',
    'Costa Rica': 'Costa Rica',
    'El Salvador': 'El Salvador',
    'New Caledonia': 'New Caledonia',
    'Puerto Rico': 'Puerto Rico',
    'French Polynesia': 'French Polynesia',
    'West Bank': 'West Bank',
    'Gaza Strip': 'Gaza',
  };
  
  return nameMapping[csvName] || csvName;
}; 