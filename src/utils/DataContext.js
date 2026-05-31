import React, { createContext, useContext } from 'react';
import { useData } from './useData';

const Ctx = createContext(null);

export function DataProvider({ children }) {
  const data = useData();
  return <Ctx.Provider value={data}>{children}</Ctx.Provider>;
}

export const useStore = () => useContext(Ctx);
