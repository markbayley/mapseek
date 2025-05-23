import React, { useEffect, useRef, useState } from "react";
import ExportIcons from "./ExportIcons";
import ImportIcons from "./ImportIcons";
import ExportPartnersChart from "./ExportPartnersChart";
import ImportPartnersChart from "./ImportPartnersChart";

interface InfoPanelProps {
  gdpFilter: number;
  selectedEconomy: React.ReactNode;
  selectedSociety: React.ReactNode;
  selectedGovernment: React.ReactNode;
  exports?: string;
  imports?: string;
  subFilter?: string;
  exportsPartners?: string;
  importsPartners?: string;
  infoPanelIcons?: Array<{ keyword: string; color: string }>;
  infoPanelIconElements?: React.ReactNode;
  ExportIcons?: React.ReactNode;
}

const InfoPanel: React.FC<InfoPanelProps> = ({
  gdpFilter,
  selectedEconomy,
  selectedSociety,
  selectedGovernment,
  exports,
  imports,
  subFilter,
  exportsPartners,
  importsPartners,
  infoPanelIcons,
  infoPanelIconElements,
  ExportIcons
}) => {
  // console.log("InfoPanel render with subFilter:", subFilter);
  // console.log("InfoPanel received infoPanelIcons:", infoPanelIcons);
  // console.log("InfoPanel received infoPanelIconElements:", infoPanelIconElements);
  
  const panelRef = useRef<HTMLDivElement>(null);
  // Add a local state to track the actually rendered icons
  const [renderedIconElements, setRenderedIconElements] = useState<React.ReactNode>(null);
  
  // When infoPanelIconElements changes, update our local state
  useEffect(() => {
   // console.log("InfoPanel useEffect triggered for infoPanelIconElements update");
    setRenderedIconElements(infoPanelIconElements);
  }, [infoPanelIconElements]);
  
  // Use effect to manually modify the DOM and apply styling
  useEffect(() => {
   // console.log("InfoPanel useEffect triggered for DOM styling with subFilter:", subFilter);
    if (!panelRef.current || !subFilter) return;
    
    // Reset all styling first
    const allParagraphs = panelRef.current.querySelectorAll('p');
    allParagraphs.forEach(p => {
      if (p.classList.contains('text-red-600')) {
        p.classList.remove('text-red-600', 'font-bold');
        p.classList.add('text-gray-600');
      }
    });
    
    // Find and highlight the correct paragraph based on subFilter
    const paragraphs = panelRef.current.querySelectorAll('p');
    paragraphs.forEach(p => {
      const strongElement = p.querySelector('strong');
      if (strongElement) {
        const text = strongElement.textContent || '';
        
        if ((text === 'Imports:' && subFilter === 'imports') ||
            (text === 'Exports:' && subFilter === 'exports') ||
            (text === 'Imports Partners:' && subFilter === 'import-partners') ||
            (text === 'Exports Partners:' && subFilter === 'export-partners')) {
          p.classList.remove('text-gray-600');
          p.classList.add('text-red-600', 'font-bold');
        }
      }
    });
    
    // Hide/show sections based on subFilter
    if (subFilter === 'export-partners' || subFilter === 'import-partners' || subFilter === 'exports' || subFilter === 'imports') {
      // Hide economic overview, gdp, gdp per capita, inflation, unemployment, and the opposite trade sections
      const hideTexts = [
        'Economic Overview:',
        'GDP:',
        'GDP Per Capita:',
        'Inflation Rate:',
        'Unemployment Rate:',
      ];
      if (subFilter === 'export-partners' || subFilter === 'exports') {
        hideTexts.push('Imports:', 'Imports Partners:');
      } else if (subFilter === 'import-partners' || subFilter === 'imports') {
        hideTexts.push('Exports:', 'Exports Partners:');
      }
      paragraphs.forEach(p => {
        const strongElement = p.querySelector('strong');
        if (strongElement) {
          const text = strongElement.textContent || '';
          if (hideTexts.includes(text)) {
            p.style.display = 'none';
          } else {
            p.style.display = '';
          }
        }
      });
    } else {
      // Show all sections
      paragraphs.forEach(p => {
        p.style.display = '';
      });
    }
          
    }, [subFilter, selectedEconomy]);

  // Render partner charts based on subFilter
  const renderPartnerCharts = () => {
    if (subFilter === 'export-partners') {
      return <ExportPartnersChart exportsPartners={exportsPartners || ''} />; 
    } else if (subFilter === 'import-partners') {
      return <ImportPartnersChart importsPartners={importsPartners || ''}/>; 
    } else if (subFilter === 'exports') {
      return <ExportPartnersChart exportsPartners={exportsPartners || ''}/>; 
    } else if (subFilter === 'imports') {
      return <ImportPartnersChart importsPartners={importsPartners || ''}/>; 
    }
  };
  
  // Custom component to render the economy info with conditional sections
  const renderEconomyInfo = () => {
    // console.log("renderEconomyInfo called with subFilter:", subFilter);
    // console.log("Using renderedIconElements:", renderedIconElements);
    
    // Defensive: handle both array and non-array selectedEconomy
    if (Array.isArray(selectedEconomy)) {
      return (
        <>
         <div className="bg-white text-black text-lg p-3 rounded-lg icon-container">
          <div className="text-2xl font-semibold"> {selectedEconomy[0]}</div>
          <div> {selectedEconomy[1]}</div>
        
          <div><em>Unemployment Rate:</em> {selectedEconomy[2]}</div>
          <div><em>Debt:</em> {selectedEconomy[3]}</div>
          <div><em>Inflation Rate:</em> {selectedEconomy[4]}</div>
          {/* <div><em>Industries:</em> {selectedEconomy[6]}</div> */}
           
           </div>
          <div key={`icon-container-${subFilter}`} className="icon-container">
            {renderedIconElements}
           
          </div>
          {renderPartnerCharts()}
        </>
      );
    } else if (selectedEconomy) {
      return (
        <>
          <div className="bg-white text-black text-lg p-3 rounded-lg icon-container">{selectedEconomy}</div>
          <div key={`icon-container-${subFilter}`} className="icon-container rounded-lg shadow-md">
            {renderedIconElements}
          </div>
          {renderPartnerCharts()}
        </>
      );
    } else {
      return null;
    }
  };
  
  return (
    <div
      id="info"
      className="bg-transparent rounded absolute top-16 left-4 z-10 shadow-md text-xs mt-1 text-white max-w-xs"
      ref={panelRef}
    >
      <div className="text-xs text-white">
        {/* {gdpFilter == 0 && (
          <div style={{ position: 'absolute', top: '0', right: '0', background: 'black', color: 'white', padding: '5px', zIndex: 1000, maxWidth: '200px', overflow: 'hidden' }}>
            Debug - SubFilter: {subFilter}
          </div>
        )} */}
        {gdpFilter == 0 ? (
          renderEconomyInfo()
        ) : gdpFilter == 1000000000000 ? (
          selectedSociety
        ) : (
          selectedGovernment
        )}
      </div>
    </div>
  );
};

export default InfoPanel;
