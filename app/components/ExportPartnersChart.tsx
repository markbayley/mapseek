import React, { useEffect, useState } from 'react';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import { Pie } from 'react-chartjs-2';

ChartJS.register(ArcElement, Tooltip, Legend);

interface ExportPartnersChartProps {
  exportsPartners: string;
}

interface PartnerData {
  country: string;
  percentage: number;
}

const ExportPartnersChart: React.FC<ExportPartnersChartProps> = ({ exportsPartners }) => {
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

  // Parse export partners data from string format like "China 33%, India 17%, Turkey 8%..."
  useEffect(() => {
    if (!exportsPartners) {
      setChartData(null);
      return;
    }

    try {
      // Extract country-percentage pairs
      const regex = /([A-Za-z\s]+)\s+(\d+(?:\.\d+)?)%/g;
      const matches = [...exportsPartners.matchAll(regex)];
      
      const partners: PartnerData[] = matches.map(match => ({
        country: match[1].trim(),
        percentage: parseFloat(match[2])
      }));
      
      // Sort by percentage (highest first)
      partners.sort((a, b) => b.percentage - a.percentage);
      
      // Prepare colors - one for each partner
      const backgroundColors = [
        '#ef4444', // blue-500
  '#f87171', // red-500
  '#fca5a5', // amber-500
  '#fecaca', // emerald-500
  '#fee2e2', // indigo-500
        '#EC4899', // pink-500
        '#8B5CF6', // violet-500
        '#14B8A6', // teal-500
        '#F97316', // orange-500
        '#84CC16', // lime-500
      ];
      
      // Generate chart data
      setChartData({
        labels: partners.map(p => `${p.country} (${p.percentage}%)`),
        datasets: [
          {
            label: 'Export Share (%)',
            data: partners.map(p => p.percentage),
            backgroundColor: partners.map((_, i) => backgroundColors[i % backgroundColors.length]),
            borderColor: partners.map((_, i) => backgroundColors[i % backgroundColors.length]),
            borderWidth: 1,
          },
        ],
      });
    } catch (error) {
      console.error('Error parsing export partners data:', error);
      setChartData(null);
    }
  }, [exportsPartners]);

  if (!chartData) {
    return <div>No export partners data available</div>;
  }

  return (
    <div className="bg-white  p-4 rounded-lg shadow-md max-w-md mx-auto mt-2">
      <h3 className="text-md font-semibold text-center mb-4 text-gray-700">Export Partners</h3>
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

export default ExportPartnersChart; 