import React, {useState, createContext, useContext, useEffect} from 'react';

export const PregelContext = createContext();

export const PregelProvider = props => {
  const [pregels, setPregels] = useState({});

  useEffect(() => {
    console.log("RECEIVED A CHAGNE");
  }, []);

  return (
    <PregelContext.Provider value={[pregels, setPregels]}>
      {props.children}
    </PregelContext.Provider>
  );
}

export const usePregel = () => useContext(PregelContext);