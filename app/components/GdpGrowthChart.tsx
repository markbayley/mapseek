import React, { useEffect, useState } from 'react';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend } from 'chart.js';
import { Line } from 'react-chartjs-2';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

interface GdpGrowthChartProps {
  gdpSeries: string[];
}

interface GdpGrowthData {
  year: number;
  gdpGrowth: number;
  originalValue: string;
}

const GdpGrowthChart: React.FC<GdpGrowthChartProps> = ({ gdpSeries }) => {
  const [chartData, setChartData] = useState<{
    labels: string[];
    datasets: {
      label: string;
      data: number[];
      borderColor: string;
      backgroundColor: string;
      borderWidth: number;
      pointBackgroundColor: string;
      pointBorderColor: string;
      pointBorderWidth: number;
      pointRadius: number;
      pointHoverRadius: number;
      tension: number;
    }[];
  } | null>(null);

  // Transform the GDP growth series data into chart format
  useEffect(() => {
    // Debug logging
    console.log('GdpGrowthChart received data:', gdpSeries);
    
    // Ensure gdpSeries is an array
    if (!Array.isArray(gdpSeries)) {
      console.log('GdpGrowthChart: gdpSeries is not an array:', typeof gdpSeries);
      setChartData(null);
      return;
    }

    try {
      // Transform the GDP growth series data into chart format
      const processedData: GdpGrowthData[] = gdpSeries
        .map((value, index) => {
          // Handle empty or null values
          if (!value || typeof value !== 'string') {
            return null;
          }
          
          // Extract numeric value from strings like "2.5%", "2.5", "-1.2%", etc.
          const cleanValue = value.replace(/[%\s]/g, '').trim();
          const numericValue = parseFloat(cleanValue);
          
          return {
            year: 2024 - index, // Start from 2024 and go backwards
            gdpGrowth: isNaN(numericValue) ? null : numericValue,
            originalValue: value.trim()
          };
        })
        .filter((item): item is GdpGrowthData => item !== null && item.gdpGrowth !== null) // Remove invalid data points
        .reverse(); // Reverse to show chronological order (2021, 2022, 2023, 2024)

      console.log('GdpGrowthChart processed data:', processedData);

      // Don't render if no valid data
      if (processedData.length === 0) {
        console.log('GdpGrowthChart: No valid data, setting chartData to null');
        setChartData(null);
        return;
      }

      // Generate chart data
      setChartData({
        labels: processedData.map(item => item.year.toString()),
        datasets: [
          {
            label: 'GDP Growth Rate (%)',
            data: processedData.map(item => item.gdpGrowth),
            borderColor: '#6366f1',
            backgroundColor: 'rgba(99, 102, 241, 0.1)',
            borderWidth: 3,
            pointBackgroundColor: '#ffffff',
            pointBorderColor: '#6366f1',
            pointBorderWidth: 2,
            pointRadius: 4,
            pointHoverRadius: 6,
            tension: 0.1, // Smooth curve
          },
        ],
      });
    } catch (error) {
      console.error('Error parsing GDP growth data:', error);
      setChartData(null);
    }
  }, [gdpSeries]);

  if (!chartData) {
    return (
      <div className="bg-white text-black p-3 rounded-lg icon-container mt-2">
        <div className="text-md font-semibold mb-3">GDP Growth Rate Trend</div>
        <div className="text-gray-500 text-center py-8">
          No GDP growth data available for this country
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white text-black p-2 rounded-lg icon-container mt-2">
      <div className="text-md font-semibold mb-2">GDP Growth</div>
      <div style={{ width: '100%', height: '120px' }}>
        <Line 
          data={chartData} 
          options={{
            maintainAspectRatio: false,
            responsive: true,
            plugins: {
              legend: {
                display: false, // Hide legend to save space
              },
              tooltip: {
                callbacks: {
                  label: (context) => {
                    const dataIndex = context.dataIndex;
                    const year = context.label;
                    const value = context.raw as number;
                    return `${year}: ${value}%`;
                  }
                }
              }
            },
            scales: {
              x: {
                display: true,
                grid: {
                  display: true,
                  color: '#f0f0f0',
                },
                ticks: {
                  font: {
                    size: 12
                  },
                  color: '#666'
                }
              },
              y: {
                display: false, // Hide Y-axis to save space like the original
                grid: {
                  display: true,
                  color: '#f0f0f0',
                }
              }
            },
            elements: {
              point: {
                hoverBackgroundColor: '#ffffff',
                hoverBorderColor: '#6366f1',
                hoverBorderWidth: 2,
              }
            }
          }}
        />
      </div>
    </div>
  );
};

export default GdpGrowthChart; 