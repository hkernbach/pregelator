import React, {useState, createContext, useContext} from 'react';

export const PregelContext = createContext();

export const PregelProvider = props => {
  const [pregels, setPregels] = useState({});

  return (
    <PregelContext.Provider value={[pregels, setPregels]}>
      {props.children}
    </PregelContext.Provider>
  );
}

export const usePregel = () => useContext(PregelContext);