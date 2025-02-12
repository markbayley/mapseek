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
    </div>
  );
}

export default Legend;
