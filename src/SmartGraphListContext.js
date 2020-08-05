import React, {useState, createContext, useEffect} from 'react';
import {get} from "axios";

export const SmartGraphListContext = createContext();


export const SmartGraphListProvider = props => {
  const [graphs, setGraphs] = useState([
  ]);

  const fetchData = function () {
    get('http://localhost:8529/_db/_system/pregeli/graphs')
      .then(res => setGraphs(res.data))
  }

  useEffect(() => {
    fetchData();
  }, []);

  return (
    <SmartGraphListContext.Provider value={[graphs, setGraphs]}>
      {props.children}
    </SmartGraphListContext.Provider>
  );
}