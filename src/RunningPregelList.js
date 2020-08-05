import React, {useContext} from 'react';
import {
  Heading,
  Box,
  DataTable,
  Text
} from 'grommet';

import {PregelContext} from './PregelContext';
import {useExecution} from "./ExecutionContext";
import {post} from "axios";
import {toast} from "react-toastify";

const getRunning = (pregels) => {
  let filteredArr = [];
  for (let [, pregel] of Object.entries(pregels)) {
    if (pregel.state === 'running') {
      filteredArr.push(pregel);
    }
  }
  return filteredArr;
};

const getDone = (pregels) => {
  let filteredArr = [];
  for (let [, pregel] of Object.entries(pregels)) {
    if (pregel.state === 'done') {
      filteredArr.push(pregel);
    }
  }
  return filteredArr;
};

const RunningPregelList = () => {
  const [, setExecution] = useExecution();
  const [pregels] = useContext(PregelContext);

  const fetchExecutionResult = (execution) => {
    toast(`Fetching status now of pid: ${execution.pid}`);

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
        <DataTable
          columns={[
            {
              property: 'pid',
              header: <Text>ID</Text>,
              primary: true,
            },
            {
              property: 'percent',
              header: 'Result field',
              render: datum => (
                <Box>
                  <Text>{datum.resultField}</Text>
                </Box>

              )
            },
          ]}
          data={getRunning(pregels)}
        />
        }

      </Box>

      <Heading level="3">Done ({Object.keys(getDone(pregels)).length})</Heading>
      <Box>
        {Object.keys(getDone(pregels)).length === 0 &&
        <Text>No pregel algorithm finished yet.</Text>
        }
        {Object.keys(getDone(pregels)).length > 0 &&

        <DataTable
          columns={[
            {
              property: 'pid',
              header: <Text>ID</Text>,
              primary: true,
            },
            {
              property: 'percent',
              header: 'Execution time',
              render: datum => (
                <Box>
                  <Text>{datum.totalRuntime}</Text>
                </Box>

              )
            },
          ]}
          onClickRow={(datum) => {
            fetchExecutionResult(datum.datum);
          }}
          data={getDone(pregels)}
        />

        }
      </Box>

    </div>
  );
}

export default RunningPregelList;