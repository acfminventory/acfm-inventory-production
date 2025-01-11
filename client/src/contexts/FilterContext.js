import { createContext, useState } from "react";

export const FilterContext = createContext();

export function FilterProvider({ children }) {
  const [selectedProduct, setSelectedProduct] = useState("");
  const [selectedConcentration, setSelectedConcentration] = useState("");
  const [selectedProduct2, setSelectedProduct2] = useState("");
  const [selectedConcentration2, setSelectedConcentration2] = useState("");
  const [selectedTeam, setSelectedTeam] = useState("");
  const [filterExpiresSoon, setFilterExpiresSoon] = useState(false);

  const resetFilters = () => {
    setSelectedProduct("");
    setSelectedConcentration("");
    setSelectedProduct2("");
    setSelectedConcentration2("");
    setSelectedTeam("");
    setFilterExpiresSoon(false);
  };

  return (
    <FilterContext.Provider
      value={{
        selectedProduct,
        setSelectedProduct,
        selectedConcentration,
        setSelectedConcentration,
        selectedProduct2,
        setSelectedProduct2,
        selectedConcentration2,
        setSelectedConcentration2,
        selectedTeam,
        setSelectedTeam,
        filterExpiresSoon,
        setFilterExpiresSoon,
        resetFilters
      }}
    >
      {children}
    </FilterContext.Provider>
  );
}
