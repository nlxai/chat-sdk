import createConversation, { Config } from "../src/index";

import * as React from "react";
import { render } from "react-dom";

const App = () => {
  const [count, setCount] = React.useState(0);

  return <div>{count}</div>;
};

render(<App />, document.querySelector("#app"));
