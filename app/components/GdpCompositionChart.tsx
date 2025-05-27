import React, { useEffect, useState } from 'react';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import { Pie } from 'react-chartjs-2';

ChartJS.register(ArcElement, Tooltip, Legend);

interface GdpCompositionChartProps {
  gdpComposition: string[];
}

interface CompositionData {
  sector: string;
  percentage: number;
}

const GdpCompositionChart: React.FC<GdpCompositionChartProps> = ({ gdpComposition }) => {
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

  // Transform the GDP composition data into chart format
  useEffect(() => {
    // Debug logging
    console.log('GdpCompositionChart received data:', gdpComposition);
    
    // Ensure gdpComposition is an array with 3 elements
    if (!Array.isArray(gdpComposition) || gdpComposition.length !== 3) {
      console.log('GdpCompositionChart: invalid data format:', gdpComposition);
      setChartData(null);
      return;
    }

    try {
      const sectors: CompositionData[] = [
        {
          sector: 'Agriculture',
          percentage: parseFloat(gdpComposition[0]?.replace('%', '').trim()) || 0
        },
        {
          sector: 'Industry',
          percentage: parseFloat(gdpComposition[1]?.replace('%', '').trim()) || 0
        },
        {
          sector: 'Services',
          percentage: parseFloat(gdpComposition[2]?.replace('%', '').trim()) || 0
        }
      ].filter(item => item.percentage > 0); // Remove sectors with 0 or invalid values

      console.log('GdpCompositionChart processed data:', sectors);

      // Check if we have valid data
      if (sectors.length === 0) {
        setChartData(null);
        return;
      }

      // Sort by percentage (highest first)
      sectors.sort((a, b) => b.percentage - a.percentage);
      
      // Prepare colors - matching the style of other charts
      const backgroundColors = [
        '#10b981', // Green for Agriculture
        '#3b82f6', // Blue for Industry  
        '#8b5cf6', // Purple for Services
      ];
      
      // Generate chart data
      setChartData({
        labels: sectors.map(s => `${s.sector} (${s.percentage}%)`),
        datasets: [
          {
            label: 'GDP Share (%)',
            data: sectors.map(s => s.percentage),
            backgroundColor: sectors.map((_, i) => backgroundColors[i % backgroundColors.length]),
            borderColor: sectors.map((_, i) => backgroundColors[i % backgroundColors.length]),
            borderWidth: 1,
          },
        ],
      });
    } catch (error) {
      console.error('Error parsing GDP composition data:', error);
      setChartData(null);
    }
  }, [gdpComposition]);

  if (!chartData) {
    return (
      <div className="bg-white p-2 rounded-lg shadow-md mt-2">
        <h3 className="text-md font-semibold text-center mb-2 text-gray-700">GDP Composition</h3>
        <p className="text-gray-500 text-sm text-center">No composition data available</p>
      </div>
    );
  }

  return (
    <div className="bg-white p-2 rounded-lg shadow-md max-w-md mx-auto mt-2">
      <h3 className="text-md font-semibold text-center mb-2 text-gray-700">GDP Composition</h3>
      <div style={{ height: '120px' }}>
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

export default GdpCompositionChart; 