import React, {useContext, useState} from "react";

import {
  Box,
  Button,
  Collapsible,
  Grommet,
  Layer,
  ResponsiveContext,
} from 'grommet';
import {FormClose, Notification} from 'grommet-icons';

import {ToastContainer, toast} from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import ace from 'brace';
import 'brace/mode/json';
import 'brace/theme/monokai';

import 'axios';

import {JsonEditor as Editor} from 'jsoneditor-react';
import 'jsoneditor-react/es/editor.min.css';
import './css/customEditor.css';
import {post} from "axios";

import {PregelProvider} from './PregelContext';
import {SmartGraphListContext, SmartGraphListProvider} from "./SmartGraphListContext";
import RunningPregelList from "./RunningPregelList";
import AppBarInfo from "./AppBarInfo";
import JSONEditor from "./JSONEditor";

const theme = {
  global: {
    colors: {
      brand: '#7D4CDB',
    },
    font: {
      family: 'Roboto',
      size: '18px',
      height: '20px',
    },
  },
};

const AppBar = (props) => (
  <Box
    tag='header'
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

const waitForPregelResult = async function () {
  const response = await post(
    'http://localhost:8529/_db/_system/pregeli/status',
    {
      pid: 123
    },
    {
      headers:
        {'Content-Type': 'application/json'}
    });
}

function App() {
  const [showSidebar, setShowSidebar] = useState(false);

  return (
    <PregelProvider>
      <SmartGraphListProvider>
        <Grommet theme={theme} full>
          <ResponsiveContext.Consumer>
            {size => (
              <Box fill>
                <AppBar>
                  <AppBarInfo></AppBarInfo>
                  <Button
                    icon={<Notification/>}
                    onClick={() => setShowSidebar(!showSidebar)}
                  />
                </AppBar>
                <ToastContainer/>
                <Box direction='row' flex overflow={{horizontal: 'hidden'}}>
                  <Box flex>
                    <JSONEditor>
                    </JSONEditor>
                  </Box>

                  {(!showSidebar || size !== 'small') ? (
                    <Collapsible direction="horizontal" open={showSidebar}>
                      <Box
                        flex
                        pad='small'
                        width='medium'
                        background='light-2'
                        elevation='small'
                      >
                        <RunningPregelList/>
                      </Box>
                    </Collapsible>
                  ) : (
                    <Layer>
                      <Box
                        background='light-2'
                        tag='header'
                        justify='end'
                        align='center'
                        direction='row'
                      >
                        <Button
                          icon={<FormClose/>}
                          onClick={() => setShowSidebar(false)}
                        />
                      </Box>
                      <Box
                        fill
                        background='light-2'
                        align='center'
                        justify='center'
                      >
                        sidebar
                      </Box>
                    </Layer>
                  )}
                </Box>
              </Box>
            )}
          </ResponsiveContext.Consumer>
        </Grommet>
      </SmartGraphListProvider>
    </PregelProvider>
  );
}

export default App;
