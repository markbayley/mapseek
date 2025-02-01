import React from 'react'

export const InfoPanel = async ({setSelectedEconomy, setSelectedSociety, continentKey}) => {

    const url = `https://raw.githubusercontent.com/factbook/factbook.json/refs/heads/master/${continentKey}/${FIPS_10?.toLowerCase()}.json`;
    console.log("url", url);

    const res = await fetch(url);
    const result = await res.json();

    const feature = e.features[0] as mapboxgl.MapboxGeoJSONFeature;
    const properties = feature.properties as {
      NAME?: string;
      GDP_MD?: number;
      POP_EST?: number;
      GDP_per_capita?: number;
      FIPS_10?: string;
      SUBREGION?: string;
    };

    console.log("properties", properties.SUBREGION, properties.FIPS_10);

    const { NAME, GDP_MD, POP_EST, GDP_per_capita, FIPS_10, SUBREGION } =
      properties;

    // Close existing popup
    if (popupRef.current) {
      popupRef.current.remove();
    }

    // Ensure CONTINENT is defined before using it
    const continentKey =
      SUBREGION && continentMapping[SUBREGION]
        ? continentMapping[SUBREGION]
        : SUBREGION?.toLowerCase();

    if (!continentKey) {
      console.error("Undefined continent key");
      return; // Handle the error as necessary
    }

    

    console.log("res", result["Economy"]["Exports - commodities"]["text"]);

    const overview =
      result["Economy"]?.["Economic overview"]?.["text"] || "";
    const exports = result["Economy"]["Exports - commodities"]["text"];
    const imports = result["Economy"]["Imports - commodities"]["text"];
    const industries = result["Economy"]["Industries"]["text"];
    const inflation =
      result["Economy"]?.["Inflation rate (consumer prices)"]?.[
        "Inflation rate (consumer prices) 2023"
      ]?.["text"] || "";
    const unemployment =
      result["Economy"]?.["Unemployment rate"]?.[
        "Unemployment rate 2023"
      ]?.["text"] || "";

    const introduction = result["Introduction"]["Background"]["text"];
    const demographics =
      result["People and Society"]?.["Demographic profile"]?.["text"] ||
      introduction;
    const age = result["People and Society"]["Median age"]["total"]["text"];
    const lifeExpectancy =
      result["People and Society"]["Life expectancy at birth"][
        "total population"
      ]["text"];
    const urbanization =
      result["People and Society"]["Urbanization"]["urban population"][
        "text"
      ];
    const literacy =
      result["People and Society"]["Literacy"]["total population"]["text"];
    const fertility =
      result["People and Society"]["Total fertility rate"]["text"];
    const pop = result["People and Society"]["Population"]["total"]["text"];

    const infoEoconomy = (
        <div className="bg-white shadow-lg rounded-lg p-4 max-w-xs border-l-4 border-emerald-500 animate-fade-in transition duration-300 ease-in-out">
        <h3 className="text-lg font-semibold text-gray-800">{NAME} </h3>
        <p className="text-xs font-semibold text-gray-500 mb-2">
          {SUBREGION}
        </p>
        <p className="text-sm text-gray-600">
          <strong>Overview:</strong> {overview}
        </p>
        <p className="text-sm text-gray-600">
          <strong>Industries:</strong> {industries}
        </p>
        <p className="text-sm text-gray-600">
          <strong>GDP:</strong>{" "}
          {GDP_MD ? (GDP_MD / 1000000).toFixed(2).toLocaleString() : "N/A"}{" "}
          trillion USD
        </p>
        {/* <p className="text-sm text-gray-600">
          <strong>Population:</strong>{" "}
          {POP_EST
            ? (POP_EST / 1000000).toFixed(0).toLocaleString()
            : "N/A"}{" "}
          million
        </p> */}

        <p className="text-sm text-gray-600">
          <strong>GDP Per Capita:</strong>{" "}
          {GDP_per_capita ? GDP_per_capita.toFixed(2) : "N/A"}k
        </p>
        <p className="text-sm text-gray-600">
          <strong>Exports:</strong> {exports}
        </p>
        <p className="text-sm text-gray-600">
          <strong>Imports:</strong> {imports}
        </p>
        <p className="text-sm text-gray-600">
          <strong>Inflation Rate:</strong> {inflation}
        </p>
        <p className="text-sm text-gray-600">
          <strong>Unemployment Rate:</strong> {unemployment}
        </p>
      </div>
      );


      const infoSociety = (
        <div className="bg-white shadow-lg rounded-lg p-4 max-w-xs border-l-4 border-emerald-500 animate-fade-in transition duration-300 ease-in-out">
          <h3 className="text-lg font-semibold text-gray-800">{NAME} </h3>
          <p className="text-xs font-semibold text-gray-500 mb-2">
            {SUBREGION}
          </p>

          {/* <p className="text-sm text-gray-600">
            <strong>Population:</strong>{" "}
            {POP_EST
              ? (POP_EST / 1000000).toFixed(0).toLocaleString()
              : "N/A"}{" "}
            million
          </p> */}
          <p className="text-sm text-gray-600">
            <strong>Population:</strong> {pop}
          </p>
          <p className="text-sm text-gray-600">
            <strong>Life Expectancy:</strong> {lifeExpectancy}
          </p>
          <p className="text-sm text-gray-600">
            <strong>Median Age:</strong> {age}
          </p>
          <p className="text-sm text-gray-600">
            <strong>Demography:</strong> {demographics.substring(3, 700)}...
          </p>

          <p className="text-sm text-gray-600">
            <strong>Urbanization:</strong> {urbanization}
          </p>
          <p className="text-sm text-gray-600">
            <strong>Literacy:</strong> {literacy}
          </p>
          <p className="text-sm text-gray-600">
            <strong>Fertility Rate:</strong> {fertility}
          </p>
        </div>
      );

      setSelectedEconomy(infoEoconomy);
      setSelectedSociety(infoSociety);

  return (
 <div></div>
  )
}
