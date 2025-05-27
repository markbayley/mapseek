import React, { useEffect, useState } from 'react';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend } from 'chart.js';
import { Line } from 'react-chartjs-2';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

interface ImportsChartProps {
  importSeries: string[];
}

interface ImportData {
  year: number;
  value: number;
  originalValue: string;
}

const ImportsChart: React.FC<ImportsChartProps> = ({ importSeries }) => {
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

  // Transform the import series data into chart format
  useEffect(() => {
    // Debug logging
    console.log('ImportsChart received data:', importSeries);
    
    // Ensure importSeries is an array
    if (!Array.isArray(importSeries)) {
      console.log('ImportsChart: importSeries is not an array:', typeof importSeries);
      setChartData(null);
      return;
    }

    try {
      // Transform the import series data into chart format
      const processedData: ImportData[] = importSeries
        .map((value, index) => {
          // Handle empty or null values
          if (!value || typeof value !== 'string') {
            return null;
          }
          
          // Extract numeric value from strings like "$123.4 billion", "$12.3 million", etc.
          const cleanValue = value.replace(/[\$,\s]/g, '').toLowerCase();
          let numericValue = 0;
          
          if (cleanValue.includes('billion')) {
            numericValue = parseFloat(cleanValue.replace('billion', '')) * 1000;
          } else if (cleanValue.includes('million')) {
            numericValue = parseFloat(cleanValue.replace('million', ''));
          } else {
            // Try to parse as a direct number
            numericValue = parseFloat(cleanValue);
          }
          
          return {
            year: 2024 - index, // Start from 2024 and go backwards
            value: isNaN(numericValue) ? null : numericValue,
            originalValue: value.trim()
          };
        })
        .filter((item): item is ImportData => item !== null && item.value !== null) // Remove invalid data points
        .reverse(); // Reverse to show chronological order (2017, 2018, 2019, etc.)

      console.log('ImportsChart processed data:', processedData);

      // Don't render if no valid data
      if (processedData.length === 0) {
        console.log('ImportsChart: No valid data, setting chartData to null');
        setChartData(null);
        return;
      }

      // Generate chart data
      setChartData({
        labels: processedData.map(item => item.year.toString()),
        datasets: [
          {
            label: 'Imports ($ millions)',
            data: processedData.map(item => item.value),
            borderColor: '#059669',
            backgroundColor: 'rgba(5, 150, 105, 0.1)',
            borderWidth: 3,
            pointBackgroundColor: '#ffffff',
            pointBorderColor: '#047857',
            pointBorderWidth: 2,
            pointRadius: 4,
            pointHoverRadius: 6,
            tension: 0.1, // Smooth curve
          },
        ],
      });
    } catch (error) {
      console.error('Error parsing import data:', error);
      setChartData(null);
    }
  }, [importSeries]);

  if (!chartData) {
    return (
      <div className="bg-white text-black p-3 rounded-lg icon-container mt-2">
        <div className="text-md font-semibold mb-3">Import Trend</div>
        <div className="text-gray-500 text-center py-8">
          No import data available for this country
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white text-black p-2 rounded-lg icon-container mt-2">
      <div className="text-md font-semibold">Imports</div>
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
                    return `${year}: $${value.toFixed(1)}M`;
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
                hoverBorderColor: '#047857',
                hoverBorderWidth: 2,
              }
            }
          }}
        />
      </div>
    </div>
  );
};

export default ImportsChart; 