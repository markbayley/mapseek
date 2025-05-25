import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface InflationChartProps {
  inflationSeries: string[];
}

const InflationChart: React.FC<InflationChartProps> = ({ inflationSeries }) => {
  // Debug logging
  console.log('InflationChart received data:', inflationSeries);
  
  // Ensure inflationSeries is an array
  if (!Array.isArray(inflationSeries)) {
    console.log('InflationChart: inflationSeries is not an array:', typeof inflationSeries);
    return null;
  }
  
  // Transform the inflation series data into chart format
  const chartData = inflationSeries
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
        inflation: isNaN(numericValue) ? null : numericValue,
        originalValue: value.trim()
      };
    })
    .filter(item => item !== null && item.inflation !== null) // Remove invalid data points
    .reverse(); // Reverse to show chronological order (2021, 2022, 2023, 2024)

  console.log('InflationChart processed data:', chartData);

  // Don't render if no valid data
  if (chartData.length === 0) {
    console.log('InflationChart: No valid data, showing fallback message');
    return (
      <div className="bg-white text-black p-3 rounded-lg icon-container mt-2">
        <div className="text-xl font-semibold mb-3">Inflation Rate Trend</div>
        <div className="text-gray-500 text-center py-8">
          No inflation data available for this country
        </div>
      </div>
    );
  }

  // Custom tooltip to show formatted values
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-2 border border-gray-300 rounded shadow-lg">
          <p className="font-semibold">{`Year: ${label}`}</p>
          <p className="text-blue-600">
            {`Inflation: ${payload[0].payload.originalValue}`}
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="bg-white text-black p-2 rounded-lg icon-container mt-2">
      <div className="text-md font-semibold">Inflation</div>
      <div style={{ width: '100%', height: '150px' }}>
        <ResponsiveContainer width="100%" height="100%">
          <LineChart
            data={chartData}
            margin={{
              top: 0,
              right: 10,
              left: 10,
              bottom: 0,
            }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis 
              dataKey="year" 
              stroke="#666"
              fontSize={12}
              tickLine={false}
            />
            {/* <YAxis 
              stroke="#666"
              fontSize={12}
              tickLine={false}
              axisLine={false}
              tickFormatter={(value) => `${value}%`}
            /> */}
            <Tooltip content={<CustomTooltip />} />
            <Line 
              type="monotone" 
              dataKey="inflation" 
              stroke="#38bdf8" 
              strokeWidth={3}
              dot={{ fill: '#3b82f6', strokeWidth: 2, r: 4 }}
              activeDot={{ r: 6, stroke: '#3b82f6', strokeWidth: 2, fill: '#ffffff' }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
      {/* <div className="text-xs text-gray-500 mt-2 text-center">
        Inflation rate over the past {chartData.length} years
      </div> */}
    </div>
  );
};

export default InflationChart; 