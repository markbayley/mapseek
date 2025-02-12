import React, { useEffect } from "react";

const Dropdowns = ({
  setHighlightedCountryId,
  highlightedCountryId,
  setSubFilter,
  subFilter,
  exportPartners,
  map,
  gdpFilter,
  setGdpFilter,
  countryOption,
  setPanelOpen,
  panelOpen,
  setCountryOption,
  highlightExportPartners,
}) => {
  // Handle country selection from the dropdown
  const handleCountrySelect = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedCountryName = event.target.value;
    const selectedCountry = majorCountries.find(
      (country) => country.name === selectedCountryName
    );

    if (selectedCountry) {
      const [lng, lat] = selectedCountry.coordinates;

      // Fly to the selected country
      map.current?.flyTo({
        center: [lng, lat],
        zoom: 3,
        essential: true,
      });

      // Highlight the selected country
      if (highlightedCountryId) {
        map.current?.setFeatureState(
          {
            source: "countries",
            sourceLayer: "country_boundaries",
            id: highlightedCountryId,
          },
          { click: false } // Unhighlight the previously highlighted country
        );
      }

      // Highlight the newly selected country
      map.current?.setFeatureState(
        {
          source: "countries",
          sourceLayer: "country_boundaries",
          id: selectedCountry, // Use the appropriate ID here
        },
        { click: true }
      );

      // Update state
      setCountryOption(selectedCountryName);
      setHighlightedCountryId(selectedCountry); // Set the highlighted country ID
      setPanelOpen(!panelOpen);
    }
  };

  const majorCountries = [
    { name: "United States", coordinates: [-95.7129, 37.0902] },
    { name: "Canada", coordinates: [-106.3468, 56.1304] },
    { name: "Mexico", coordinates: [-102.5528, 23.6345] },
    { name: "Brazil", coordinates: [-51.9253, -14.235] },

    { name: "Japan", coordinates: [138.2529, 36.2048] },
    { name: "India", coordinates: [78.9629, 20.5937] },
    { name: "China", coordinates: [104.1954, 35.8617] },
    { name: "Australia", coordinates: [133.7751, -25.2744] },
    //{ name: "Indonesia", coordinates: [113.9213, -0.7893] },

    { name: "United Kingdom", coordinates: [-3.435, 55.378] },
    { name: "Germany", coordinates: [10.4515, 51.1657] },
    { name: "France", coordinates: [2.3522, 48.8566] },
    { name: "Sweden", coordinates: [18.6435, 60.1282] },
    { name: "Spain", coordinates: [-3.7038, 40.4168] },
    { name: "Italy", coordinates: [12.4964, 41.9028] },
    { name: "Russia", coordinates: [105.3188, 61.524] },

    { name: "Turkey", coordinates: [35.2433, 38.9637] },
    { name: "Egypt", coordinates: [30.8025, 26.8206] },
    { name: "Saudi Arabia", coordinates: [45.0792, 23.8859] },

    { name: "South Africa", coordinates: [22.9375, -30.5595] },
  ];

  return (
    <div className=" flex  w-full justify-between">
      <div className="space-x-5">
        {! highlightedCountryId &&
        <select
          className="p-2 border rounded"
          onChange={handleCountrySelect}
          value={countryOption}
        >
          <option value="Select Country">Select Country</option>
          {majorCountries.map((country) => (
            <option key={country.name} value={country.name}>
              {country.name}
            </option>
          ))}
        </select>
}
        <select
          className="p-2 border rounded w-36"
          value={gdpFilter}
          onChange={(e) => setGdpFilter(Number(e.target.value))}
        >
          {/* <option value="Filter">Filter</option> */}
          <option value="0">Economy</option>
          <option value="1000000000000" id="population">
            Society
          </option>
          {/* <option value="3000000000000">GDP Per Capita</option> */}
          <option value="3000000000000">Government</option>
        </select>
      </div>
      <div>
    {  gdpFilter == 0 && highlightedCountryId &&
        <select
          className="p-2 border rounded "
          value={subFilter}
          onChange={highlightExportPartners}
        >
          <option value="default">Sub Filter</option>
          <option value="exports">Export Partners</option>
          <option value="imports">Import Partners</option>
          <option value="3000000000000">GDP Per Capita</option>
        </select>
}
      </div>
    </div>
  );
};

export default Dropdowns;
