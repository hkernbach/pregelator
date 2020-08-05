import React, {useState, createContext, useContext, useEffect} from 'react';

export const ExecutionContext = createContext();

export const ExecutionProvider = props => {
  const [execution, setExecution] = useState({});
  
  return (
    <ExecutionContext.Provider value={[execution, setExecution]}>
      {props.children}
    </ExecutionContext.Provider>
  );
}

export const useExecution = () => useContext(ExecutionContext);