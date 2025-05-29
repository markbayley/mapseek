import React, { useEffect, useRef, useState } from "react";
import ExportIcons from "./ExportIcons";
import ImportIcons from "./ImportIcons";
import ExportPartnersChart from "./ExportPartnersChart";
import ImportPartnersChart from "./ImportPartnersChart";
import { CircularProgress } from "./CircularProgress";
import { iconMap } from '../utils/iconMap';
import InflationChart from './InflationChart';
import UnemploymentChart from './UnemploymentChart';
import GdpGrowthChart from './GdpGrowthChart';
import GdpCompositionChart from './GdpCompositionChart';
import LabourParticipationChart from './LabourParticipationChart';
import GovernmentDebtChart from './GovernmentDebtChart';
import ExportsChart from './ExportsChart';
import ImportsChart from './ImportsChart';
import { GiAges, GiChart } from "react-icons/gi";
import { FaBabyCarriage, FaBalanceScaleLeft, FaChartLine, FaChartPie, FaPeopleCarry } from "react-icons/fa";
import { GrUserWorker } from "react-icons/gr";
import { FaChartSimple, FaPeopleGroup } from "react-icons/fa6";

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
  activeTab: 'inflation' | 'unemployment' | 'gdp' | 'gdpcapita' | 'laborforce' | 'publicdebt' | 'population' | 'fertility' | 'medianage';
  setActiveTab: (tab: 'inflation' | 'unemployment' | 'gdp' | 'gdpcapita' | 'laborforce' | 'publicdebt' | 'population' | 'fertility' | 'medianage') => void;
  selectedMine?: {
    name: string;
    location: string;
    details: string;
    ownership: string;
    resources: string[];
  } | null;
  onClearMine?: () => void;
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
  ExportIcons,
  activeTab,
  setActiveTab,
  selectedMine,
  onClearMine
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
      // Show all sections for Overview, Resources, or default state
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
      // Display both ExportsChart and ExportPartnersChart
      return (
        <>
          {Array.isArray(selectedEconomy) && selectedEconomy[13] && (
            <ExportsChart exportSeries={selectedEconomy[13]} />
          )}
          <ExportPartnersChart exportsPartners={exportsPartners || ''} />
        </>
      );
    } else if (subFilter === 'imports') {
      // Display both ImportsChart and ImportPartnersChart
      return (
        <>
          {Array.isArray(selectedEconomy) && selectedEconomy[14] && (
            <ImportsChart importSeries={selectedEconomy[14]} />
          )}
          <ImportPartnersChart importsPartners={importsPartners || ''} />
        </>
      );
    } else if (subFilter === 'Overview') {
      // Overview: don't show any specific partner charts
      return null;
    }
    // Default case (Resources or other): don't show charts
    return null;
  };
  
  // Custom component to render the economy info with conditional sections
  const renderEconomyInfo = () => {
    // console.log("renderEconomyInfo called with subFilter:", subFilter);
    // console.log("Using renderedIconElements:", renderedIconElements);
    
    // Show mine information when Resources subfilter is active and a mine is selected
    if (subFilter === 'Resources' && selectedMine) {
      return (
        <>
          <div className="bg-white text-black p-2 rounded-lg icon-container">
            <div className="flex justify-between items-start mb-2">
              <div className="text-2xl font-semibold">{selectedMine.name}</div>
              <button
                onClick={() => {
                  if (onClearMine) {
                    onClearMine();
                  }
                }}
                className="text-gray-500 hover:text-gray-700 text-lg font-bold"
                title="Close mine details"
              >
                ×
              </button>
            </div>
            <div className="text-sm text-gray-600 mb-2">{selectedMine.location}</div>
            {selectedMine.ownership && (
              <div className="text-sm text-gray-700 mb-2">
                <strong>Owner:</strong> {selectedMine.ownership}
              </div>
            )}
            <div className="text-sm text-gray-700 leading-relaxed">
              {selectedMine.details}
            </div>
          </div>
          
          {/* Display mine resources as icons */}
          {selectedMine.resources.length > 0 && (
            <div className="icon-container grid grid-cols-4 gap-x-3 gap-y-2 bg-white p-2 rounded-lg mt-2">
              {selectedMine.resources.map((resource, index) => {
                const iconKey = Object.keys(iconMap).find(k => k.toLowerCase() === resource.toLowerCase());
                const IconComponent = iconKey ? (iconMap as any)[iconKey]?.component : null;
                const iconColor = iconKey ? (iconMap as any)[iconKey]?.color : '#9CA3AF';
                
                return (
                  <div 
                    key={`mine-resource-${index}-${resource}`} 
                    className="flex flex-col items-center text-xs rounded-lg aspect-square pt-3"  
                    style={{ background: iconColor, color: 'white' }}
                  >
                    {IconComponent && React.createElement(IconComponent, { style: { background: iconColor, fontSize: '2.4em' } })}
                    <span>{resource.slice(0,11)}</span>
                  </div>
                );
              })}
            </div>
          )}
        </>
      );
    }
    
    // Show economic tabs even when no country is selected (for global view)
    if (!selectedEconomy || !Array.isArray(selectedEconomy)) {
      return (
        <>
          {/* <div className="bg-white text-black p-2 rounded-lg icon-container">
            <div className="text-2xl font-semibold">Global Economic Overview</div>
            <div className="pt-2">
              <div className="text-[16px]">Select an economic indicator to view global data</div>
            </div>
          </div> */}
          
          {/* Show economic tabs for global view */}
          <div className="bg-white text-black p-3 rounded-lg icon-container mt-2">
            <div className="text-md font-semibold mb-3">GLOBAL ECONOMIC MAP OVERLAYS</div>
            <div className="grid grid-cols-3 justify-around items-center gap-4">
              <div 
                className={`cursor-pointer transition-all duration-200 py-3 px-5 rounded-lg ${
                  activeTab === 'inflation' 
                    ? 'transform scale-100 ring-2 ring-yellow-500 p-3 rounded' 
                    : 'hover:transform hover:scale-105'
                }`}
                onClick={() => setActiveTab('inflation')}
              >
                <div className="flex flex-col items-center">
                <div className="text-3xl text-yellow-500">  <FaChartLine/></div>
                  <div className="text-md font-semibold text-grey-500">Inflation</div>
                 
                </div>
              </div>
            

              <div 
                className={`cursor-pointer transition-all duration-200 py-3 px-2 rounded-lg ${
                  activeTab === 'unemployment' 
                  ? 'transform scale-100 ring-2 ring-orange-500' 
                    : 'hover:transform hover:scale-105'
                }`}
                onClick={() => setActiveTab('unemployment')}
              >
                <div className="flex flex-col items-center">
                <div className="text-3xl  text-orange-500">  <GrUserWorker/></div>
                  <div className="text-md font-semibold text-grey-500">Employment</div>
                
                </div>
              </div>
             
              <div 
                className={`cursor-pointer transition-all duration-200 py-3 px-7 rounded-lg ${
                  activeTab === 'gdp' 
                  ? 'transform scale-100 ring-2 ring-teal-500 ' 
                    : 'hover:transform hover:scale-105'
                }`}
                onClick={() => setActiveTab('gdp')}
              >
                <div className="flex flex-col items-center">
                <div className="text-3xl text-teal-500">  <FaChartPie/></div>
                  <div className="text-md font-semibold text-grey-500">GDP</div>
               
                </div>
              </div>

              <div 
                className={`cursor-pointer transition-all duration-200 py-3 px-2 rounded-lg ${
                  activeTab === 'gdpcapita' 
                  ? 'transform scale-100 ring-2 ring-blue-500 ' 
                    : 'hover:transform hover:scale-105'
                }`}
                onClick={() => setActiveTab('gdpcapita')}
              >
                <div className="flex flex-col items-center">
                <div className="text-3xl text-blue-500">  <FaChartSimple/></div>
                  <div className="text-md font-semibold text-grey-500">GDP Capita</div>
               
                </div>
              </div>

              <div 
                className={`cursor-pointer transition-all duration-200 py-3 px-2 rounded-lg ${
                  activeTab === 'publicdebt' 
                  ? 'transform scale-100 ring-2 ring-yellow-500 ' 
                    : 'hover:transform hover:scale-105'
                }`}
                onClick={() => setActiveTab('publicdebt')}
              >
                <div className="flex flex-col items-center">
                <div className="text-3xl text-yellow-500">  <FaBalanceScaleLeft/></div>
                  <div className="text-md font-semibold text-grey-500">Govt. Debt</div>
               
                </div>
              </div>

              <div 
                className={`cursor-pointer transition-all duration-200 py-3 px-2 rounded-lg ${
                  activeTab === 'laborforce' 
                  ? 'transform scale-100 ring-2 ring-orange-500 ' 
                    : 'hover:transform hover:scale-105'
                }`}
                onClick={() => setActiveTab('laborforce')}
              >
                <div className="flex flex-col items-center">
                <div className="text-3xl text-orange-500">  <FaPeopleCarry/></div>
                  <div className="text-md font-semibold text-grey-500">Labor Force</div>
               
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white text-black p-3 rounded-lg icon-container mt-2">
            <div className="text-md font-semibold mb-3">GLOBAL SOCIAL MAP OVERLAYS</div>
            <div className="grid grid-cols-3 justify-around items-center gap-4">
              <div 
                className={`cursor-pointer transition-all duration-200 py-3 px-5 rounded-lg ${
                  activeTab === 'population' 
                    ? 'transform scale-100 ring-2 ring-yellow-500 p-3 rounded' 
                    : 'hover:transform hover:scale-105'
                }`}
                onClick={() => setActiveTab('population')}
              >
                <div className="flex flex-col items-center">
                <div className="text-3xl text-yellow-500">  <FaPeopleGroup/></div>
                  <div className="text-md font-semibold text-grey-500">Population</div>
                 
                </div>
              </div>
            

              <div 
                className={`cursor-pointer transition-all duration-200 py-3 px-2 rounded-lg ${
                  activeTab === 'fertility' 
                  ? 'transform scale-100 ring-2 ring-orange-500' 
                    : 'hover:transform hover:scale-105'
                }`}
                onClick={() => setActiveTab('fertility')}
              >
                <div className="flex flex-col items-center">
                <div className="text-3xl  text-orange-500">  < FaBabyCarriage/></div>
                  <div className="text-md font-semibold text-grey-500">Fertility</div>
                
                </div>
              </div>
             
              <div 
                className={`cursor-pointer transition-all duration-200 py-3 px-7 rounded-lg ${
                  activeTab === 'medianage' 
                  ? 'transform scale-100 ring-2 ring-teal-500 ' 
                    : 'hover:transform hover:scale-105'
                }`}
                onClick={() => setActiveTab('medianage')}
              >
                <div className="flex flex-col items-center">
                <div className="text-3xl text-teal-500">  <GiAges/></div>
                  <div className="text-md font-semibold text-grey-500">Ageing</div>
               
                </div>
              </div>

              <div 
                className={`cursor-pointer transition-all duration-200 py-3 px-2 rounded-lg ${
                  activeTab === 'gdpcapita' 
                  ? 'transform scale-100 ring-2 ring-blue-500 ' 
                    : 'hover:transform hover:scale-105'
                }`}
                onClick={() => setActiveTab('gdpcapita')}
              >
                <div className="flex flex-col items-center">
                <div className="text-3xl text-blue-500">  <FaChartSimple/></div>
                  <div className="text-md font-semibold text-grey-500">GDP Capita</div>
               
                </div>
              </div>

              <div 
                className={`cursor-pointer transition-all duration-200 py-3 px-2 rounded-lg ${
                  activeTab === 'publicdebt' 
                  ? 'transform scale-100 ring-2 ring-yellow-500 ' 
                    : 'hover:transform hover:scale-105'
                }`}
                onClick={() => setActiveTab('publicdebt')}
              >
                <div className="flex flex-col items-center">
                <div className="text-3xl text-yellow-500">  <FaBalanceScaleLeft/></div>
                  <div className="text-md font-semibold text-grey-500">Govt. Debt</div>
               
                </div>
              </div>

              <div 
                className={`cursor-pointer transition-all duration-200 py-3 px-2 rounded-lg ${
                  activeTab === 'laborforce' 
                  ? 'transform scale-100 ring-2 ring-orange-500 ' 
                    : 'hover:transform hover:scale-105'
                }`}
                onClick={() => setActiveTab('laborforce')}
              >
                <div className="flex flex-col items-center">
                <div className="text-3xl text-orange-500">  <FaPeopleCarry/></div>
                  <div className="text-md font-semibold text-grey-500">Labor Force</div>
               
                </div>
              </div>
            </div>
          </div>
        </>
      );
    }
    
    // Defensive: handle both array and non-array selectedEconomy
    if (Array.isArray(selectedEconomy)) {
      return (
        <>
         <div className="bg-white text-black p-2 rounded-lg icon-container ">
          <div className="text-2xl font-semibold"> {selectedEconomy[0]}</div>
          {subFilter === 'Overview' && (
            <div className=" pt-2">
              <div className="text-[16px] capitalize-first-letter">{typeof selectedEconomy[1] === 'string' ? selectedEconomy[1].replace(/^<p>|<\/p>$/gi, '') : selectedEconomy[1]}</div>
            </div>
          )}
        
        
           </div>
           {(subFilter !== 'exports' && subFilter !== 'imports' && subFilter !== 'Resources') && (
           <>
           <div className="bg-white text-black p-2 rounded-lg icon-container mt-2">
           <div className="flex flex-row justify-around items-center gap-2" >
            
           <div 
              className={`cursor-pointer transition-all duration-200 ${
                activeTab === 'inflation' 
                  ? 'transform scale-105 ring-2 ring-blue-300 px-3 rounded' 
                  : 'hover:transform hover:scale-102'
              }`}
              onClick={() => setActiveTab('inflation')}
            >
              <CircularProgress
                value={parseFloat(selectedEconomy[4])}
                label="Inflation"
                color="#38bdf8"
                unit="%"
                max={20}
              />
            </div>

            <div 
              className={`cursor-pointer transition-all duration-200 ${
                activeTab === 'unemployment' 
                  ? 'transform scale-105 ring-2 ring-orange-300 px-3 rounded' 
                  : 'hover:transform hover:scale-102'
              }`}
              onClick={() => setActiveTab('unemployment')}
            >
              <CircularProgress
                value={parseFloat(selectedEconomy[2])}
                label="Unemployment"
                color="#f59e42"
                unit="%"
                max={20}
              />
            </div>
           
            <div 
              className={`cursor-pointer transition-all duration-200 ${
                activeTab === 'gdp' 
                  ? 'transform scale-105 ring-2 ring-indigo-300 px-3 rounded' 
                  : 'hover:transform hover:scale-102'
              }`}
              onClick={() => setActiveTab('gdp')}
            >
              <CircularProgress
                value={parseFloat(selectedEconomy[10])}
                label="GDP"
                color="#6366f1"
                unit="%"
                max={100}
              />
            </div>
          </div>
          </div>
          
          {/* Render the corresponding chart based on active tab */}
          {activeTab === 'inflation' && (
            <>
              {selectedEconomy[8] && (
                <InflationChart inflationSeries={selectedEconomy[8]} />
              )}
              {selectedEconomy[3] && (
                <GovernmentDebtChart debtPercentage={selectedEconomy[3]} />
              )}
            </>
          )}
          {activeTab === 'unemployment' && (
            <>
              {selectedEconomy[10] && (
                <UnemploymentChart unemploymentSeries={selectedEconomy[10]} />
              )}
              {selectedEconomy[12] && (
                <LabourParticipationChart labourParticipation={selectedEconomy[12]} />
              )}
            </>
          )}
          {activeTab === 'gdp' && selectedEconomy[11] && (
            <>
              <GdpGrowthChart gdpSeries={selectedEconomy[11]} />
              <GdpCompositionChart gdpComposition={selectedEconomy[9]} />
            </>
          )}
          </>
           )}
          {/* <div className="text-black"> {selectedEconomy[7]}</div> */}
         { subFilter !== 'Overview' && (
          <div key={`icon-container-${subFilter}`} className="icon-container grid grid-cols-4 gap-x-3 gap-y-2 bg-white p-2 rounded-lg mt-2 ">
            {infoPanelIcons &&
              (subFilter === 'Resources'
                ? infoPanelIcons
                    .filter((icon) => {
                      if (typeof selectedEconomy[7] !== 'string') return false;
                      const resources = selectedEconomy[7]
                        .split(',')
                        .map(r => r.trim().toLowerCase());
                      return resources.some(resource => resource.includes(icon.keyword.toLowerCase()));
                    })
                   .slice(0, 24)
                : infoPanelIcons
              ).map((icon, index) => {
                const IconComponent = (iconMap as any)?.[icon.keyword]?.component;
                const iconColor = (iconMap as any)?.[icon.keyword]?.color || icon.color;
                return (
                  <div key={`${subFilter}-icon-${index}-${icon.keyword}`} className="flex flex-col items-center text-xs rounded-lg aspect-square pt-3"  style={{ background: iconColor, color: 'white' }}  >
                    {IconComponent && React.createElement(IconComponent, { style: { background: iconColor, fontSize: '2.4em' } })}
                    <span >{icon.keyword.slice(0,11)}</span>
                  </div>
                );
              })}
            </div>
    )  }
            {/* {selectedEconomy[9] && subFilter === 'Overview' && (
              <GdpCompositionChart gdpComposition={selectedEconomy[9]} />
              
            )} */}
            {renderPartnerCharts()}
          </>
        );
      } else if (selectedEconomy) {
        return (
          <>
            <div className="bg-white text-black text-lg p-3 rounded-lg icon-container">{selectedEconomy}</div>
            <div key={`icon-container-${subFilter}`} className="icon-container rounded-lg">
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
        className="bg-transparent rounded absolute top-16 left-4 z-10 text-xs text-white max-w-xs"
        ref={panelRef}
      >
        <div className="text-xs text-white">
     
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