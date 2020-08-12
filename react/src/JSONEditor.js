import React, {useContext, useEffect, useState, useRef} from 'react';

import AceEditor from "react-ace";
import "ace-builds/src-noconflict/theme-monokai";
import "ace-builds/src-noconflict/ext-language_tools"
import "ace-builds/src-noconflict/mode-json";
import "./css/customList.css"

import {Box, Button, DataTable, Select, Text, Paragraph, List} from "grommet/index";
import {post} from "axios";
import {toast} from "react-toastify";

import {usePregel} from "./PregelContext";
import {SmartGraphListContext} from "./SmartGraphListContext";
import {useExecution} from "./ExecutionContext";

const exampleAlgorithm = require('./algos/exampleAlgorithm.js').exampleAlgo;

const EditorActionsBar = (props) => (
  <Box
    direction='row'
    align='center'
    background='#272822'
    pad={{left: 'small', right: 'small', vertical: 'small'}}
    elevation='medium'
    style={{zIndex: '1'}}
    {...props}
  />
);

let editorRef = React.createRef();
let outputEditorRef = React.createRef();
let previewEditorRef = React.createRef();

const notifyUser = function (msg) {
  toast(msg);
}

function useInterval(callback, delay) {
  const savedCallback = useRef();

  // Remember the latest callback.
  useEffect(() => {
    savedCallback.current = callback;
  }, [callback]);

  // Set up the interval.
  useEffect(() => {
    function tick() {
      savedCallback.current();
    }

    if (delay !== null) {
      let id = setInterval(tick, delay);
      return () => clearInterval(id);
    }
  }, [delay]);
}

const JSONEditor = () => {
  useInterval(() => {
      // Update logic
      let checkState = (pregels) => {
        for (let [, pregel] of Object.entries(pregels)) {
          if (pregel.state === 'running') {
            post(
              process.env.REACT_APP_ARANGODB_COORDINATOR_URL + 'status',
              {
                pid: pregel.pid
              },
              {
                headers:
                  {'Content-Type': 'application/json'}
              }).then((response) => {
              if (response.data && response.data.state === 'done') {
                setPregels(prevPregels => {
                  let updated = prevPregels;
                  updated[pregel.pid].state = response.data.state;
                  updated[pregel.pid].totalRuntime = response.data.totalRuntime.toFixed(5);
                  return {...updated};
                });

                // auto update if changed to done
                fetchExecutionResult(pregel);
              }
            });
          }
        }

        // check output editor changes
        let outputCursorPosition = outputEditorRef.current.editor.getCursorPosition();
        let previewCursorPosition = previewEditorRef.current.editor.getCursorPosition();
        let outputVal = "";
        if (execution.summary) {
          outputVal = JSON.stringify(execution.summary, null, 2)
        }
        let previewVal = "";
        if (execution.preview) {
          previewVal = JSON.stringify(execution.preview, null, 2)
        }

        // only update if changed
        if (outputEditorRef.current.editor.getValue() !== outputVal) {
          outputEditorRef.current.editor.setValue(outputVal, outputCursorPosition);
        }
        if (previewEditorRef.current.editor.getValue() !== previewVal) {
          previewEditorRef.current.editor.setValue(previewVal, previewCursorPosition)
        }
      }

      checkState(pregels);
    },
    1000
  )
  ;

  let executeAlgorithm = async function () {
    try {
      let algorithm = editorRef.current.editor.getValue();

      //remove comments
      algorithm = algorithm.replace(/\s*\/\/.*\n/g, '\n').replace(/\s*\/\*[\s\S]*?\*\//g, '');
      algorithm = JSON.parse(algorithm);

      let resultField;
      if ('resultField' in algorithm) {
        resultField = algorithm.resultField;
      } else {
        toast.error("Attribute resultField is missing!");
        return;
      }

      if (!selectedGraph) {
        toast.error("No SmartGraph selected!");
        return;
      }

      const response = await post(
        process.env.REACT_APP_ARANGODB_COORDINATOR_URL + 'start',
        {
          name: "AIR",
          graphName: selectedGraph,
          algorithm: algorithm
        },
        {
          headers:
            {'Content-Type': 'application/json'}
        });

      setPregels(prevPregels => {
        let updated = prevPregels;
        updated[response.data.pid] = {
          "pid": response.data.pid,
          "totalRuntime": null,
          "resultField": resultField,
          "selectedGraph": selectedGraph,
          "state": "running"
        }
        return {...updated};
      });
      notifyUser("Pregel started, PID: " + response.data.pid);
    } catch (e) {
      console.log(e);
      toast.error("Parse error!");
    }
  }

// global states
  const [graphs] = useContext(SmartGraphListContext);
  const [pregels, setPregels] = usePregel();
  const [execution, setExecution] = useExecution();

// local state
  const [selectedGraph, setSelectedGraph] = useState(null);

  // TODO: export function - copy & paste of RunningPregelList
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

  return (
    <Box direction="column" flex="grow" fill="horizontal">

      <EditorActionsBar>
        <Select
          options={graphs}
          placeholder={'Select SmartGraph'}
          value={selectedGraph}
          onChange={({option}) => {
            setSelectedGraph(option);
          }}
        />

        <Button
          primary
          label="Execute"
          margin={{left: 'small'}}
          onClick={executeAlgorithm}
        />
      </EditorActionsBar>

      <Box direction='row' fill="vertical">
        <Box flex>
          <AceEditor ref={editorRef}
                     value={JSON.stringify(exampleAlgorithm, null, 2)}
                     mode="json"
                     width={'full'}
                     height={'100%'}
                     theme="monokai"
                     commands={[
                       /*{
                         name: "executeAlgorithm",
                         bindKey: {win: "Ctrl-Enter", mac: "Command-Enter"},
                         exec: executeAlgorithm
                       }*/
                     ]
                     }
                     name="aceInputEditor"
                     setOptions={{useWorker: false}}
                     editorProps={{$blockScrolling: true}}
          />
        </Box>

        <Box flex direction='column'>
          <Box flex direction='row' width={'full'} height="small">
            <Box basis={'1/2'} background='#272822'>
              <Text margin={'xsmall'} weight={'bold'}>Summary</Text>
              <AceEditor ref={outputEditorRef}
                         readOnly={true}
                         value={""}
                         mode="json"
                         width={'full'}
                         height={'100%'}
                         theme="monokai"
                //onChange={{}}
                         name="aceSummaryEditor"
                         setOptions={{useWorker: false}}
                         editorProps={{$blockScrolling: true}}
              />
            </Box>
            <Box basis={'1/2'} background='#272822'>
              <Text margin={'xsmall'} weight={'bold'}>Preview</Text>
              <AceEditor ref={previewEditorRef}
                         value={""}
                         readOnly={true}
                         mode="json"
                         width={'full'}
                         height={'100%'}
                         theme="monokai"
                //onChange={{}}
                         name="aceSummaryEditor"
                         setOptions={{useWorker: false}}
                         editorProps={{$blockScrolling: true}}
              />
            </Box>
          </Box>
          <Box basis='2/3' overflow={"scroll"} background='#272822'>
            <Text margin={'xsmall'} weight={'bold'}>Reports</Text>
            <DataTable resizeable={false} size={"full"} alignSelf={"stretch"} primaryKey={false}
                       columns={[
                         {
                           property: 'msg',
                           header: 'Message',
                           size: 'medium',
                           render: datum => (
                             <Paragraph size={'small'}>
                               {datum.msg}
                             </Paragraph>
                           )
                         },
                         {
                           property: "vertex",
                           header: "Vertex",
                           size: 'small',
                           render: datum => (
                             <Box>
                               <Text size={'small'}>{datum.annotations.vertex}</Text>
                             </Box>
                           )
                         },
                         {
                           property: "info",
                           header: "Info",
                           size: 'small',
                           render: datum => (
                             <List className={"smallList"}
                                   pad={'xxsmall'}
                                   primaryKey="name"
                                   secondaryKey="content"
                                   data={[
                                     {name: 'Level', content: datum.level},
                                     {name: 'Shard', content: datum.annotations["pregel-id"]?.shard},
                                     {
                                       name: 'Step / Superstep',
                                       content: (datum.annotations["phase-step"] || 'nA') + " / " + (datum.annotations["global-superstep"] || 'nA')
                                     },
                                     {name: 'Phase', content: datum.annotations["phase"]}
                                   ]}
                             />
                           )
                         }
                       ]}
                       data={execution.reports || []}
            />
          </Box>

        </Box>
      </Box>
    </Box>
  )
}

export default JSONEditor;