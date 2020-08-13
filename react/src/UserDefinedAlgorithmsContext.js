import React, {useState, createContext, useEffect} from 'react';
import {get} from "axios";

export const UserDefinedAlgorithmsContext = createContext();

export const UserDefinedAlgorithmsProvider = props => {
  const [userDefinedAlgorithms, setUserDefinedAlgorithms] = useState({});

  const fetchData = function () {
    get(process.env.REACT_APP_ARANGODB_COORDINATOR_URL + 'userDefinedAlgorithms')
      .then(res => {
        setUserDefinedAlgorithms(res.data)
      })
  }

  useEffect(() => {
    fetchData();
  }, []);

  return (
    <UserDefinedAlgorithmsContext.Provider value={[userDefinedAlgorithms, setUserDefinedAlgorithms]}>
      {props.children}
    </UserDefinedAlgorithmsContext.Provider>
  );
}