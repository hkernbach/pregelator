import React, {useContext} from 'react';
import {PregelContext} from "./PregelContext";
import {Heading} from "grommet/index";

const AppBarInfo = () => {
  const [pregels] = useContext(PregelContext);
  return (
    <div>
      <Heading level='4' margin='none'>Pregelator</Heading>
      <Heading level='6' margin='none'>Executed algorithms: {Object.keys(pregels).length}</Heading>
    </div>
  )
}

export default AppBarInfo;