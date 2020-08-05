import React, {useState, useContext} from 'react';
import {
  Heading,
  Box,
  Table,
  TableBody,
  TableCell,
  TableRow,
  TableHeader,
  Text
} from 'grommet';

import Pregel from './Pregel';
import {PregelContext} from './PregelContext';
import {useExecution} from "./ExecutionContext";
import {post} from "axios";

const getRunning = (pregels) => {
  let filteredArr = [];
  for (let [key, pregel] of Object.entries(pregels)) {
    if (pregel.state === 'running') {
      filteredArr.push(pregel);
    }
  }
  return filteredArr;
};

const getDone = (pregels) => {
  let filteredArr = [];
  for (let [key, pregel] of Object.entries(pregels)) {
    if (pregel.state === 'done') {
      filteredArr.push(pregel);
    }
  }
  return filteredArr;
};

const RunningPregelList = () => {
  const [execution, setExecution] = useExecution();
  const [pregels, setPregels] = useContext(PregelContext);

  const fetchExecutionResult = (execution) => {
    console.log(execution);
    post(
      'http://localhost:8529/_db/_system/pregeli/status',
      {
        pid: execution.pid
      },
      {
        headers:
          {'Content-Type': 'application/json'}
      }).then((responseStatus) => {
      if (responseStatus.data && responseStatus.data.state === 'done') {
        post(
          'http://localhost:8529/_db/_system/pregeli/resultDetails',
          {
            graphName: execution.selectedGraph,
            resultField: execution.resultField
          },
          {
            headers:
              {'Content-Type': 'application/json'}
          }).then((responseDetails) => {
          if (responseDetails.data) {
            let result = {
              summary: responseStatus.data,
              preview: responseDetails.data
            };
            result.summary.pid = execution.pid;

            setExecution(prevExecution => {
              return {...result};
            });
          }
        });
      }
    });
  };

  return (
    <div>

      <Heading level="3">Running ({Object.keys(getRunning(pregels)).length})</Heading>

      <Box>
        {Object.keys(getRunning(pregels)).length === 0 &&
        <Text>No pregel algorithm started yet.</Text>
        }
        {Object.keys(getRunning(pregels)).length > 0 &&
        <Table alignSelf='stretch'>
          <TableHeader>
            <TableRow>
              <TableCell scope="col" border="bottom">
                ID
              </TableCell>
              <TableCell scope="col" border="bottom">
                ResultField
              </TableCell>
            </TableRow>
          </TableHeader>
          <TableBody>

            {
              getRunning(pregels).map((pregel) =>
                <TableRow key={pregel.pid}>
                  <TableCell scope="row">
                    <strong>{pregel.pid}</strong>
                  </TableCell>
                  <TableCell>{pregel.resultField}</TableCell>
                </TableRow>
              )
            }

          </TableBody>
        </Table>
        }

      </Box>

      <Heading level="3">Done ({Object.keys(getDone(pregels)).length})</Heading>
      <Box>
        {Object.keys(getDone(pregels)).length === 0 &&
        <Text>No pregel algorithm finished yet.</Text>
        }
        {Object.keys(getDone(pregels)).length > 0 &&

        <Table alignSelf='stretch'>
          <TableHeader>
            <TableRow>
              <TableCell scope="col" border="bottom">
                ID
              </TableCell>
              <TableCell scope="col" border="bottom">
                Runtime
              </TableCell>
            </TableRow>
          </TableHeader>
          <TableBody>

            {
              getDone(pregels).map((pregel) =>
                <TableRow key={pregel.pid}>
                  <TableCell scope="row">
                    <strong>{pregel.pid}</strong>
                  </TableCell>
                  <TableCell>{pregel.totalRuntime}</TableCell>
                </TableRow>
              )
            }

          </TableBody>
        </Table>

        }
      </Box>

    </div>
  );
}

export default RunningPregelList;