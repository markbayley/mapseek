// app/api/economic-data/route.ts
import { NextResponse } from 'next/server';

// Example mock data. You can replace this with your actual data source or database.
const economicData = [
  {
    isoCode: 'US',
    country: 'United States',
    gdp: 21_000_000_000_000, // $21 trillion
    exportValue: 1_600_000_000_000, // $1.6 trillion
    importValue: 2_500_000_000_000, // $2.5 trillion
    resources: ['oil', 'gas', 'coal']
  },
  {
    isoCode: 'CN',
    country: 'China',
    gdp: 14_000_000_000_000, // $14 trillion
    exportValue: 2_500_000_000_000, // $2.5 trillion
    importValue: 2_100_000_000_000, // $2.1 trillion
    resources: ['coal', 'rare minerals']
  },
  {
    isoCode: 'AU',
    country: 'Australia',
    gdp: 4_000_000_000_000, // $14 trillion
    exportValue: 500_000_000_000, // $2.5 trillion
    importValue: 100_000_000_000, // $2.1 trillion
    resources: ['coal', 'rare minerals']
  },
  {
    isoCode: 'BR',
    country: 'Brazil',
    gdp: 4_000_000_000_000, // $14 trillion
    exportValue: 500_000_000_000, // $2.5 trillion
    importValue: 100_000_000_000, // $2.1 trillion
    resources: ['coal', 'rare minerals']
  },
  {
    isoCode: 'ES',
    country: 'Spain',
    gdp: 4_000_000_000_000, // $14 trillion
    exportValue: 500_000_000_000, // $2.5 trillion
    importValue: 100_000_000_000, // $2.1 trillion
    resources: ['coal', 'rare minerals']
  },
  // Add more countries and data as needed
];

export async function GET() {
  return NextResponse.json(economicData);
}
