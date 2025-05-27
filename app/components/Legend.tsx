import React from "react";

function Legend() {



  return (
    <div
      id="legend"
      className="bg-white  p-2 rounded-lg absolute bottom-4 left-4 z-10 shadow-md text-xs w-80 border-l-4 border-amber-500"
    >
      <div id="gdp-legend" >
        <h5 className="font-semibold pb-1 ">GDP</h5>
        <div className="flex items-center justify-end gap-x-2">
          <div className="bg-gray-200 h-5 w-5 inline-block rounded"></div> 
          10b <br />
          <div className="bg-yellow-200 h-5 w-5 inline-block rounded"></div>{" "}
          100b+
          <br />
          <div className="bg-yellow-400 h-5 w-5 inline-block rounded"></div>{" "}
          500b+
          <br />
          <div className="bg-orange-400 h-5 w-5 inline-block rounded"></div>{" "}
          1.0t+
          <br />
          <div className="bg-red-600 h-5 w-5 inline-block rounded"></div> 10t+
        </div>
      </div>
      <div id="population-legend" className="hidden">
        <h5 className="font-semibold pb-1">Population</h5>
        <div className="flex items-center gap-x-2">
          <div className="bg-teal-100 h-5 w-5 inline-block rounded"></div>0m
          <br />
          <div className="bg-teal-300 h-5 w-5 inline-block rounded"></div>10m
          <br />
          <div className="bg-teal-500 h-5 w-5 inline-block rounded"></div>100m
          <br />
          <div className="bg-teal-700 h-5 w-5 inline-block rounded"></div>500m
          <br />
          <div className="bg-teal-800 h-5 w-5 inline-block rounded"></div>1b+
        </div>
      </div>

      <div id="gdp-capita-legend" className="hidden">
        <h5 className="font-semibold pb-1">GDP Per Capita</h5>
        <div className="flex items-center gap-x-2">
          <div className="bg-blue-100 h-5 w-5 inline-block rounded"></div> {"<"}
          2k
          <br />
          <div className="bg-blue-200 h-5 w-5 inline-block rounded"></div> 2k+
          <br />
          <div className="bg-blue-400 h-5 w-5 inline-block rounded"></div> 20k+
          <br />
          <div className="bg-blue-600 h-5 w-5 inline-block rounded"></div> 50k+
        </div>
      </div>

      <div id="inflation-legend" className="hidden">
        <h5 className="font-semibold pb-1">Inflation Rate</h5>
        <div className="flex items-center justify-end gap-x-2">
          <div style={{ backgroundColor: '#1e40af' }} className="h-5 w-5 inline-block rounded"></div> 
          -10%
          <br />
          <div style={{ backgroundColor: '#3b82f6' }} className="h-5 w-5 inline-block rounded"></div> 
          0%
          <br />
          <div style={{ backgroundColor: '#fbbf24' }} className="h-5 w-5 inline-block rounded"></div> 
          5%
          <br />
          <div style={{ backgroundColor: '#f59e0b' }} className="h-5 w-5 inline-block rounded"></div> 
          10%
          <br />
          <div style={{ backgroundColor: '#dc2626' }} className="h-5 w-5 inline-block rounded"></div> 
          20%
          <br />
          <div style={{ backgroundColor: '#7f1d1d' }} className="h-5 w-5 inline-block rounded"></div> 
          30%+
        </div>
      </div>

      <div id="unemployment-legend" className="hidden">
        <h5 className="font-semibold pb-1">Unemployment Rate</h5>
        <div className="flex items-center justify-end gap-x-2">
          <div style={{ backgroundColor: '#fef3c7' }} className="h-5 w-5 inline-block rounded"></div> 
          0%
          <br />
          <div style={{ backgroundColor: '#f59e0b' }} className="h-5 w-5 inline-block rounded"></div> 
          5%
          <br />
          <div style={{ backgroundColor: '#dc2626' }} className="h-5 w-5 inline-block rounded"></div> 
          10%
          <br />
          <div style={{ backgroundColor: '#991b1b' }} className="h-5 w-5 inline-block rounded"></div> 
          15%
          <br />
          <div style={{ backgroundColor: '#7f1d1d' }} className="h-5 w-5 inline-block rounded"></div> 
          25%+
        </div>
      </div>

      {/* Mineral Legend */}
      {/* <div id="mineral-legend" className="mt-4">
        <h5 className="font-semibold pb-1">Critical Minerals</h5>
        <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
          <span className="flex items-center gap-x-1">
            <span style={{ color: '#a78bfa', fontSize: '1.3em' }}>
              <span className="inline-block align-middle">REE</span></span>
            <span className="text-xs text-gray-700">Rare Earths</span>
          </span>
          <span className="flex items-center gap-x-1">
            <span style={{ color: '#222', fontSize: '1.3em' }}>Mn</span>
            <span className="text-xs text-gray-700">Manganese</span>
          </span>
          <span className="flex items-center gap-x-1">
            <span style={{ color: '#888', fontSize: '1.3em' }}>Ni</span>
            <span className="text-xs text-gray-700">Nickel</span>
          </span>
          <span className="flex items-center gap-x-1">
            <span style={{ color: '#fb923c', fontSize: '1.3em' }}>Cu</span>
            <span className="text-xs text-gray-700">Copper</span>
          </span>
          <span className="flex items-center gap-x-1">
            <span style={{ color: '#22d3ee', fontSize: '1.3em' }}>Co</span>
            <span className="text-xs text-gray-700">Cobalt</span>
          </span>
          <span className="flex items-center gap-x-1">
            <span style={{ color: '#a3e635', fontSize: '1.3em' }}>Li</span>
            <span className="text-xs text-gray-700">Lithium</span>
          </span>
        </div>
      </div> */}
    </div>
  );
}

export default Legend;
