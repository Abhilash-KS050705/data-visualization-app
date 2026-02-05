import React, { createContext, useEffect, useState } from "react";

export const DataContext = createContext();

export function DataProvider({ children }) {
  const [dataInfo, setDataInfo] = useState(() => {
    try {
      const raw = localStorage.getItem("dataInfo");
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  });

  useEffect(() => {
    if (dataInfo) localStorage.setItem("dataInfo", JSON.stringify(dataInfo));
    else localStorage.removeItem("dataInfo");
  }, [dataInfo]);

  return (
    <DataContext.Provider value={{ dataInfo, setDataInfo }}>
      {children}
    </DataContext.Provider>
  );
}

export default DataContext;
