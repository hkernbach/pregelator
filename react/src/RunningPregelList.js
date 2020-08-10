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
import {Button} from "grommet/index";

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
  const [pregels, setPregels] = useContext(PregelContext);

  const fetchExecutionResult = (execution) => {
    toast(`Fetching status now of pid: ${execution.pid}`);

    post(
      process.env.REACT_APP_ARANGODB_COORDINATOR_URL + 'status',
      {
        pid: execution.pid
      },
      {
        headers:
          {'Content-Type': 'application/json'}
      }).then((responseStatus) => {
      if (responseStatus.data && responseStatus.data.state === 'done') {
        post(
          process.env.REACT_APP_ARANGODB_COORDINATOR_URL + 'resultDetails',
          {
            graphName: execution.selectedGraph,
            resultField: execution.resultField
          },
          {
            headers:
              {'Content-Type': 'application/json'}
          }).then((responseDetails) => {
          if (responseDetails.data) {
            let reports = [];

            if (responseStatus.data.reports && responseStatus.data.reports.length >= 0) {
              for (let [, report] of Object.entries(responseStatus.data.reports)) {
                reports.push(report);
              }
              reports = responseStatus.data.reports;
              delete responseStatus.data.reports;
            }

            // State the output editor will be filled automatically
            let result = {
              summary: responseStatus.data,
              preview: responseDetails.data,
              reports: reports
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

  let clearPids = async function () {
    setPregels({});
  }

  return (
    <div>
      <Box width={'full'}>
        <Button
          primary
          label="Clear"
          alignSelf={'end'}
          onClick={clearPids}
        />
      </Box>

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
              header: <Text>ID</Text>
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