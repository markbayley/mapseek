import React, { useEffect } from "react";

function Search({ searchTerm, setSearchTerm, map }) {
  // Function to update the data dynamically when searchTerm changes
  const updateGeoJSONData = async () => {
    const response = await fetch(
      "https://raw.githubusercontent.com/nvkelso/natural-earth-vector/master/geojson/ne_110m_admin_0_countries.geojson"
    );
    const geojson = await response.json();

    const filteredData = {
      ...geojson,
      features: geojson.features.filter((feature: any) =>
        feature.properties.NAME.toLowerCase().includes(searchTerm.toLowerCase())
      ),
    };

    // Update the source data
    if (map.current?.getSource("data")) {
      (map.current.getSource("data") as mapboxgl.GeoJSONSource).setData(
        filteredData
      );
    }

    // If a country is found, zoom and rotate to it
    if (filteredData.features.length > 0) {
      const feature = filteredData.features[0]; // Get the first matching country
      const bbox = feature.bbox; // Get the bounding box of the country

      if (bbox) {
        const lng = (bbox[0] + bbox[2]) / 2; // Calculate longitude center
        const lat = (bbox[1] + bbox[3]) / 2; // Calculate latitude center

        map.current?.flyTo({
          center: [lng, lat],
          zoom: 2, // Adjust the zoom level as needed
          essential: true, // This animation is considered essential with respect to prefers-reduced-motion
        });
      }
    }
  };

  useEffect(() => {
    if (map.current) updateGeoJSONData();
  }, [searchTerm]); // Runs only when searchTerm changes

  return (
    <div className="hidden md-flex">
      {" "}
      <input
        type="text"
        placeholder="Search countries..."
        className="p-2 border rounded"
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
      />
    </div>
  );
}

export default Search;