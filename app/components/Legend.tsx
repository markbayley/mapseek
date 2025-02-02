import React from "react";

function Legend({ map }) {
  const showLegend = (layer: string) => {
    // Hide all legends first
    document.getElementById("gdp-legend").style.display = "none";
    document.getElementById("population-legend").style.display = "none";
    document.getElementById("gdp-capita-legend").style.display = "none";

    // Show the selected legend
    if (layer === "gdp") {
      document.getElementById("gdp-legend").style.display = "block";
    } else if (layer === "population") {
      document.getElementById("population-legend").style.display = "block";
    } else if (layer === "gdp-capita") {
      document.getElementById("gdp-capita-legend").style.display = "block";
    }
  };

  // Example usage when a layer is selected
  map.current?.on("click", "gdp-fill", () => showLegend("gdp"));
  map.current?.on("click", "population-fill", () => showLegend("population"));
  map.current?.on("click", "gdpcapita-fill", () => showLegend("gdp-capita"));

  // Add click events to show legends
  map.current?.on("click", "gdp-fill", () => showLegend("gdp"));
  map.current?.on("click", "population-fill", () => showLegend("population"));
  map.current?.on("click", "gdpcapita-fill", () => showLegend("gdp-capita"));

  return (
    <div
      id="legend"
      className="bg-white  p-2 rounded-lg absolute bottom-6 left-4 z-10 shadow-md text-xs w-80"
    >
      <div id="gdp-legend" className="hidden">
        <h5 className="font-semibold pb-1">GDP</h5>
        <div className="flex items-center gap-x-2">
          <div className="bg-gray-200 h-5 w-5 inline-block rounded"></div> {"<"}
          100b <br />
          <div className="bg-yellow-200 h-5 w-5 inline-block rounded"></div>{" "}
          100b+
          <br />
          <div className="bg-orange-400 h-5 w-5 inline-block rounded"></div>{" "}
          1.0t+
          <br />
          <div className="bg-red-600 h-5 w-5 inline-block rounded"></div> 10t+
        </div>
      </div>
      <div id="population-legend">
        <h5 className="font-semibold pb-1">Population</h5>
        <div className="flex items-center gap-x-2">
          <div className="bg-teal-100 h-5 w-5 inline-block rounded"></div> {"<"}
          10m
          <br />
          <div className="bg-teal-300 h-5 w-5 inline-block rounded"></div> 10m+
          <br />
          <div className="bg-teal-600 h-5 w-5 inline-block rounded"></div> 100m+
          <br />
          <div className="bg-teal-800 h-5 w-5 inline-block rounded"></div> 1b+
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
