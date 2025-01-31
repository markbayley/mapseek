'use client';

import Map from './components/MapComponent';
import MapboxExample from './components/Test';
//import { useState } from 'react';

export default function Home() {


  return (
    <main className="h-screen flex flex-col">
    
     
      <Map searchTerm={''} gdpFilter={0}  />
    {/* <MapboxExample  /> */}
    </main>
  );
}
