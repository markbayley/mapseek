import React, { useEffect, useRef } from 'react';
import mapboxgl from 'mapbox-gl';

import 'mapbox-gl/dist/mapbox-gl.css';

const MapboxExample = () => {
  const mapContainerRef = useRef();
  const mapRef = useRef();

  useEffect(() => {
    // TO MAKE THE MAP APPEAR YOU MUST
    // ADD YOUR ACCESS TOKEN FROM
    // https://account.mapbox.com
    mapboxgl.accessToken = 'pk.eyJ1IjoiaW5ibG9jayIsImEiOiJjbTZlaWY2NmYxNmw0MnZxMTJ2bHg2OGFpIn0.AUqpYUrBxOhW_5lMxE5C7w';

    mapRef.current = new mapboxgl.Map({
      container: mapContainerRef.current,
      // Choose from Mapbox's core styles, or make your own style with Mapbox Studio
      style: 'mapbox://styles/mapbox/streets-v12',
      center: [-100.486052, 37.830348],
      zoom: 2
    });

    let hoveredPolygonId = null;

    mapRef.current.on('load', () => {
        mapRef.current.addSource('countries', {
            type: 'vector',
            url: 'mapbox://mapbox.country-boundaries-v1'
          });

      // The feature-state dependent fill-opacity expression will render the hover effect
      // when a feature's hover state is set to true.
      mapRef.current.addLayer({
        id: 'country-fills',
        type: 'fill',
        source: 'countries',
        'source-layer': 'country_boundaries',
        layout: {},
        paint: {
          'fill-color': '#627BC1',
          'fill-opacity': [
            'case',
            ['boolean', ['feature-state', 'hover'], false],
            1,
            0.5
          ]
        }
      });

      mapRef.current.addLayer({
        id: 'country-borders',
        type: 'line',
        source: 'countries',
        'source-layer': 'country_boundaries',
        layout: {},
        paint: {
          'line-color': '#627BC1',
          'line-width': 2
        }
      });

      mapRef.current.on('mousemove', 'country-fills', (e) => {
        if (e.features.length > 0) {
          if (hoveredPolygonId !== null) {
            mapRef.current.setFeatureState(
              { source: 'countries', sourceLayer: 'country_boundaries', id: hoveredPolygonId },
              { hover: false }
            );
          }
          hoveredPolygonId = e.features[0].id;
          mapRef.current.setFeatureState(
            { source: 'countries',  sourceLayer: 'country_boundaries', id: hoveredPolygonId },
            { hover: true }
          );
        }
      });

      mapRef.current.on('mouseleave', 'country-fills', () => {
        if (hoveredPolygonId !== null) {
          mapRef.current.setFeatureState(
            { source: 'countries',  sourceLayer: 'country_boundaries', id: hoveredPolygonId },
            { hover: false }
          );
        }
        hoveredPolygonId = null;
      });
    });
  }, []);

  return <div id="map" ref={mapContainerRef} style={{ height: '100%' }} />;
};

export default MapboxExample;