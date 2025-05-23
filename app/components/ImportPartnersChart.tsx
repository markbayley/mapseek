import React, { useEffect, useState } from 'react';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import { Pie } from 'react-chartjs-2';

ChartJS.register(ArcElement, Tooltip, Legend);

interface ImportPartnersChartProps {
  importsPartners: string;
}

interface PartnerData {
  country: string;
  percentage: number;
}

const ImportPartnersChart: React.FC<ImportPartnersChartProps> = ({ importsPartners }) => {
  const [chartData, setChartData] = useState<{
    labels: string[];
    datasets: {
      label: string;
      data: number[];
      backgroundColor: string[];
      borderColor: string[];
      borderWidth: number;
    }[];
  } | null>(null);

  // Parse import partners data from string format like "China 33%, India 17%, Turkey 8%..."
  useEffect(() => {
    if (!importsPartners) {
      setChartData(null);
      return;
    }

    try {
      // Extract country-percentage pairs
      const regex = /([A-Za-z\s]+)\s+(\d+(?:\.\d+)?)%/g;
      const matches = [...importsPartners.matchAll(regex)];
      
      const partners: PartnerData[] = matches.map(match => ({
        country: match[1].trim(),
        percentage: parseFloat(match[2])
      }));
      
      // Sort by percentage (highest first)
      partners.sort((a, b) => b.percentage - a.percentage);
      
      // Prepare colors - one for each partner
      const backgroundColors = [
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
      
      // Generate chart data
      setChartData({
        labels: partners.map(p => `${p.country} (${p.percentage}%)`),
        datasets: [
          {
            label: 'Import Share (%)',
            data: partners.map(p => p.percentage),
            backgroundColor: partners.map((_, i) => backgroundColors[i % backgroundColors.length]),
            borderColor: partners.map((_, i) => backgroundColors[i % backgroundColors.length]),
            borderWidth: 1,
          },
        ],
      });
    } catch (error) {
      console.error('Error parsing import partners data:', error);
      setChartData(null);
    }
  }, [importsPartners]);

  if (!chartData) {
    return <div>No import partners data available</div>;
  }

  return (
    <div className="bg-white p-4 rounded-lg shadow-md max-w-md mx-auto mt-2">
      <h3 className="text-md font-semibold text-center mb-4 text-gray-700">Import Partners</h3>
      <div style={{ height: '150px' }}>
        <Pie 
          data={chartData} 
          options={{
            maintainAspectRatio: false,
            plugins: {
              legend: {
                position: 'right',
                labels: {
                  boxWidth: 15,
                  font: {
                    size: 12
                  }
                }
              },
              tooltip: {
                callbacks: {
                  label: (context) => {
                    const label = context.label || '';
                    const value = context.raw as number;
                    return `${label.split(' (')[0]}: ${value}%`;
                  }
                }
              }
            }
          }}
        />
      </div>
    </div>
  );
};

export default ImportPartnersChart; 