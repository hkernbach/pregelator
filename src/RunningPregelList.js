import React, {useState, useContext} from 'react';
import {
  Heading,
  List
} from 'grommet';

import Pregel from './Pregel';
import {PregelContext} from './PregelContext';

const getRunning = (pregels) => {
  return pregels.filter(pregel => {
    return pregel.state === 'running';
  })
};

const getDone = (pregels) => {
  return pregels.filter(pregel => {
    return pregel.state === 'done';
  })
};

const RunningPregelList = () => {
  const [pregels, setPregels] = useContext(PregelContext);
  console.log(getRunning(pregels));
  return(
    <div>
      <Heading level={5}>Running:</Heading>
      <List
        primaryKey="pid"
        data={getRunning(pregels)}
      />
      <Heading level={5}>Done:</Heading>
      <List
        primaryKey="pid"
        data={getDone(pregels)}
      />

    </div>
  );
}

export default RunningPregelList;