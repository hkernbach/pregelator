import React, {useContext} from 'react';
import {PregelContext} from "./PregelContext";
import {JsonEditor as Editor} from "jsoneditor-react";
import ace from "brace";
import {Box, Button} from "grommet/index";
import {post} from "axios";
import {toast} from "react-toastify";

const exampleAlgorithm = require('./algos/exampleAlgorithm.js').exampleAlgo;

const EditorActionsBar = (props) => (
  <Box
    direction='row'
    align='center'
    justify='between'
    background='brand'
    pad={{left: 'medium', right: 'small', vertical: 'small'}}
    elevation='medium'
    style={{zIndex: '1'}}
    {...props}
  />
);

let editorRef = React.createRef();
let outputEditorRef = React.createRef();

const notifyUser = function (msg) {
  outputEditorRef.current.jsonEditor.set([msg]);
  toast(msg);
}

const JSONEditor = ({pid, state}) => {
  const [pregels, setPregels] = useContext(PregelContext);

  const executeAlgorithm = async function () {
    try {
      let algorithm = editorRef.current.jsonEditor.get();

      const response = await post(
        'http://localhost:8529/_db/_system/pregeli/start',
        {
          name: "customAlgo",
          graphName: "PageRankGraph",
          algorithm: algorithm
        },
        {
          headers:
            {'Content-Type': 'application/json'}
        });

      setPregels(prevPregels => [...prevPregels, {
        "pid": response.data.pid,
        "state": "running"
      }]);
      notifyUser("Pregel started, PID: " + response.data.pid);
    } catch (e) {
      console.log(e);
      toast.error("Parse error!");
    }
  }

  return (
    <Box flex direction="column" flex="grow" fill="horizontal">
      <Box direction='row'>
        <Box flex>
          <Editor ref={editorRef}
                  value={exampleAlgorithm}
                  navigationBar={false}
                  mainMenuBar={false}
                  mode={Editor.modes.code}
                  ace={ace}
                  theme="ace/theme/monokai"
                  style={{border: 0}}
          />
        </Box>
        <Box flex>
          <Editor ref={outputEditorRef}
                  value={["no pregel algorithm executed."]}
                  navigationBar={false}
                  mainMenuBar={false}
                  mode={Editor.modes.code}
                  ace={ace}
                  theme="ace/theme/monokai"
                  style={{border: 0}}
          />
        </Box>
      </Box>

      <EditorActionsBar>
        <Button
          primary
          label="Execute"
          onClick={executeAlgorithm}
        />
      </EditorActionsBar>
    </Box>
  )
}

export default JSONEditor;