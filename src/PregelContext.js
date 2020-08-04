import React, {useState, createContext} from 'react';

export const PregelContext = createContext();

export const PregelProvider = props => {
  const [pregels, setPregels] = useState([
    {
      "pid": 123,
      "state": "done"
    },
    {
      "pid": 456,
      "state": "running"
    }
  ]);

  return (
    <PregelContext.Provider value={[pregels, setPregels]}>
      {props.children}
    </PregelContext.Provider>
  );
}