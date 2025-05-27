import React from 'react';

interface LabourParticipationChartProps {
  labourParticipation: number;
}

const LabourParticipationChart: React.FC<LabourParticipationChartProps> = ({ labourParticipation }) => {
  // Convert to percentage and ensure it's a valid number
  const participationRate = typeof labourParticipation === 'number' && !isNaN(labourParticipation) 
    ? (labourParticipation * 100) 
    : 0;

  // Cap at 100% for display purposes
  const displayRate = Math.min(participationRate, 100);
  const progressWidth = Math.max(displayRate, 5); // Minimum 5% width for visibility

  if (!labourParticipation || isNaN(labourParticipation)) {
    return (
      <div className="bg-white text-black p-3 rounded-lg icon-container mt-2">
        <div className="text-md font-semibold mb-3">Labour Participation</div>
        <div className="text-gray-500 text-center py-8">
          No labour participation data available for this country
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white text-black p-3 rounded-lg icon-container mt-2">
      <div className="text-md font-semibold mb-3">Labour Participation</div>
      
      {/* Main metric display */}
      <div className="text-center mb-4">
        <div className="text-lg font-bold text-orange-600">
          {displayRate.toFixed(1)}%
        </div>
        {/* <div className="text-sm text-gray-600">
          of population in labour force
        </div> */}
      </div>

      {/* Progress bar visualization */}
      <div className="mb-4">
        <div className="w-full bg-gray-200 rounded-full h-3">
          <div 
            className="bg-gradient-to-r from-orange-400 to-orange-600 h-3 rounded-full transition-all duration-500 ease-out"
            style={{ width: `${progressWidth}%` }}
          ></div>
        </div>
        <div className="flex justify-between text-xs text-gray-500 mt-1">
          <span>0%</span>
          <span>50%</span>
          <span>100%</span>
        </div>
      </div>

      {/* Additional context */}
      <div className="text-xs text-gray-600 text-center">
        {displayRate < 30 && "Low participation rate"}
        {displayRate >= 30 && displayRate < 60 && "Moderate participation rate"}
        {displayRate >= 60 && displayRate < 80 && "High participation rate"}
        {displayRate >= 80 && "Very high participation rate"}
      </div>
    </div>
  );
};

export default LabourParticipationChart; 