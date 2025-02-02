import React from 'react'

const SelectOption = ({gdpFilter, selectedEconomy, selectedSociety}) => {
  return (
 
    <div
    id="info"
    className="bg-transparent  rounded absolute top-16 left-4 z-10 shadow-md text-xs mt-1 text-white max-w-xs"
  >
    <div className="  text-xs text-white">
      {gdpFilter == 0 ? selectedEconomy : selectedSociety}
    </div>
  </div>
 
  )
}

export default SelectOption