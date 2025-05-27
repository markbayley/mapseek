import React from 'react';

interface GovernmentDebtChartProps {
  debtPercentage: number;
}

const GovernmentDebtChart: React.FC<GovernmentDebtChartProps> = ({ debtPercentage }) => {
  // Ensure it's a valid number
  const debtRatio = typeof debtPercentage === 'number' && !isNaN(debtPercentage) 
    ? debtPercentage 
    : 0;

  // Cap at 200% for display purposes (some countries have very high debt ratios)
  const displayRate = Math.min(debtRatio, 200);
  const progressWidth = Math.max((displayRate / 200) * 100, 2); // Scale to 200% max, minimum 2% width for visibility

  // Determine debt level category
  const getDebtLevel = (debt: number) => {
    if (debt < 30) return { label: "Low debt level", color: "from-green-400 to-green-600" };
    if (debt < 60) return { label: "Moderate debt level", color: "from-blue-400 to-blue-600" };
    if (debt < 90) return { label: "High debt level", color: "from-yellow-400 to-yellow-600" };
    if (debt < 120) return { label: "Very high debt level", color: "from-orange-400 to-orange-600" };
    return { label: "Critical debt level", color: "from-red-400 to-red-600" };
  };

  const debtLevel = getDebtLevel(displayRate);

  if (!debtPercentage || isNaN(debtPercentage)) {
    return (
      <div className="bg-white text-black p-3 rounded-lg icon-container mt-2">
        <div className="text-md font-semibold mb-3">Government Debt/GDP</div>
        <div className="text-gray-500 text-center py-8">
          No government debt data available for this country
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white text-black p-3 rounded-lg icon-container mt-2">
      <div className="text-md font-semibold mb-3">Government Debt/GDP</div>
      
      {/* Main metric display */}
      <div className="text-center mb-4">
        <div className="text-lg font-bold text-[#38bdf8]">
          {displayRate.toFixed(1)}%
        </div>
        {/* <div className="text-sm text-gray-600">
          of GDP
        </div> */}
      </div>

      {/* Progress bar visualization */}
      <div className="mb-4">
        <div className="w-full bg-gray-200 rounded-full h-3">
          <div 
            className={`bg-gradient-to-r ${debtLevel.color} h-3 rounded-full transition-all duration-500 ease-out`}
            style={{ width: `${progressWidth}%` }}
          ></div>
        </div>
        <div className="flex justify-between text-xs text-gray-500 mt-1">
          <span>0%</span>
          <span>60%</span>
          <span>120%</span>
          <span>200%</span>
        </div>
      </div>

      {/* Additional context */}
      <div className="text-xs text-gray-600 text-center">
        {debtLevel.label}
      </div>
      
      {/* Reference note */}
      {/* <div className="text-xs text-gray-400 text-center mt-2">
        EU target: &lt;60% • US: ~100% • Japan: ~260%
      </div> */}
    </div>
  );
};

export default GovernmentDebtChart; 