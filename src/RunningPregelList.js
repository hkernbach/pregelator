import React, {useState, useContext} from 'react';
import {
  Heading,
  List
} from 'grommet';

import Pregel from './Pregel';
import {PregelContext} from './PregelContext';

const getRunning = (pregels) => {
  let filteredArr = [{"pid": "ID", "resultField": "Resultfield"}];
  for (let [key, pregel] of Object.entries(pregels)) {
    if (pregel.state === 'running') {
      filteredArr.push(pregel);
    }
  }
  return filteredArr;
};

const getDone = (pregels) => {
  let filteredArr = [{"pid": "ID", "totalRuntime": "Status"}];
  for (let [key, pregel] of Object.entries(pregels)) {
    if (pregel.state === 'done') {
      filteredArr.push(pregel);
    }
  }
  return filteredArr;
};

const RunningPregelList = () => {
  const [pregels, setPregels] = useContext(PregelContext);
  return (
    <div>
      <Heading level={5}>Running:</Heading>
      <List
        primaryKey="pid"
        secondaryKey="resultField"
        data={getRunning(pregels)}
        onClickItem={(datum, index) => {
          console.log(datum);
          console.log(index);
        }}
      />
      <Heading level={5}>Done:</Heading>
      <List
        primaryKey="pid"
        secondaryKey="totalRuntime"
        data={getDone(pregels)}
        onClickItem={(datum, index) => {
          console.log(datum);
          console.log(index);
        }}
      />
    </div>
  );
}

export default RunningPregelList;