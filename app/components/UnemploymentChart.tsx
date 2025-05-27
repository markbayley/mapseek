import React, { useEffect, useState } from 'react';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend } from 'chart.js';
import { Line } from 'react-chartjs-2';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

interface UnemploymentChartProps {
  unemploymentSeries: string[];
}

interface UnemploymentData {
  year: number;
  unemployment: number;
  originalValue: string;
}

const UnemploymentChart: React.FC<UnemploymentChartProps> = ({ unemploymentSeries }) => {
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

  // Transform the unemployment series data into chart format
  useEffect(() => {
    // Debug logging
    console.log('UnemploymentChart received data:', unemploymentSeries);
    
    // Ensure unemploymentSeries is an array
    if (!Array.isArray(unemploymentSeries)) {
      console.log('UnemploymentChart: unemploymentSeries is not an array:', typeof unemploymentSeries);
      setChartData(null);
      return;
    }

    try {
      // Transform the unemployment series data into chart format
      const processedData: UnemploymentData[] = unemploymentSeries
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
            unemployment: isNaN(numericValue) ? null : numericValue,
            originalValue: value.trim()
          };
        })
        .filter((item): item is UnemploymentData => item !== null && item.unemployment !== null) // Remove invalid data points
        .reverse(); // Reverse to show chronological order (2021, 2022, 2023, 2024)

      console.log('UnemploymentChart processed data:', processedData);

      // Don't render if no valid data
      if (processedData.length === 0) {
        console.log('UnemploymentChart: No valid data, setting chartData to null');
        setChartData(null);
        return;
      }

      // Generate chart data
      setChartData({
        labels: processedData.map(item => item.year.toString()),
        datasets: [
          {
            label: 'Unemployment Rate (%)',
            data: processedData.map(item => item.unemployment),
            borderColor: '#f59e42',
            backgroundColor: 'rgba(245, 158, 66, 0.1)',
            borderWidth: 3,
            pointBackgroundColor: '#ffffff',
            pointBorderColor: '#f59e42',
            pointBorderWidth: 2,
            pointRadius: 4,
            pointHoverRadius: 6,
            tension: 0.1, // Smooth curve
          },
        ],
      });
    } catch (error) {
      console.error('Error parsing unemployment data:', error);
      setChartData(null);
    }
  }, [unemploymentSeries]);

  if (!chartData) {
    return (
      <div className="bg-white text-black p-3 rounded-lg icon-container mt-2">
        <div className="text-xl font-semibold mb-3">Unemployment Rate Trend</div>
        <div className="text-gray-500 text-center py-8">
          No unemployment data available for this country
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white text-black p-2 rounded-lg icon-container mt-2">
      <div className="text-md font-semibold mb-2">Unemployment</div>
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
                hoverBorderColor: '#f59e42',
                hoverBorderWidth: 2,
              }
            }
          }}
        />
      </div>
    </div>
  );
};

export default UnemploymentChart; 