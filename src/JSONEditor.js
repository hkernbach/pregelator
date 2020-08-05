import React, {useContext, useEffect, useState, useRef} from 'react';

import {JsonEditor as Editor} from "jsoneditor-react";
import 'jsoneditor-react/es/editor.min.css';
import './css/customEditor.css';

import ace from "brace";
import 'brace/mode/json';
import 'brace/theme/monokai';

import {Box, Button, Select} from "grommet/index";
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
              'http://localhost:8529/_db/_system/pregeli/status',
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
              }
            });
          }
        }

        // check output editor changes
        outputEditorRef.current.jsonEditor.set(execution);
      }

      checkState(pregels);
    },
    1000
  )
  ;

  let executeAlgorithm = async function () {
    try {
      let algorithm = editorRef.current.jsonEditor.get();

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
        'http://localhost:8529/_db/_system/pregeli/start',
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
      toast.error("Parse error!");
    }
  }

// global states
  const [graphs] = useContext(SmartGraphListContext);
  const [pregels, setPregels] = usePregel();
  const [execution] = useExecution();

// local state
  const [selectedGraph, setSelectedGraph] = useState(null);

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
          <Editor ref={editorRef}
                  value={exampleAlgorithm}
                  navigationBar={false}
                  mainMenuBar={false}
                  mode={Editor.modes.code}
                  ace={ace}
                  theme="ace/theme/monokai"
                  htmlElementProps={{"className": "editorWrapper"}}
          />
        </Box>
        <Box flex>
          <Editor ref={outputEditorRef}
                  value={{}}
                  navigationBar={false}
                  mainMenuBar={false}
                  mode={Editor.modes.code}
                  ace={ace}
                  theme="ace/theme/monokai"
                  style={{border: 0}}
                  htmlElementProps={{"className": "editorWrapper"}}
          />
        </Box>
      </Box>
    </Box>
  )
}

export default JSONEditor;