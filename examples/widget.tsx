import * as React from "react";
import { render } from "react-dom";
import Widget from "../src/widget";

const botUrl = process.env.BOT_URL as string;
const authorization = process.env.AUTHORIZATION as string;

render(
  <Widget
    botUrl={botUrl}
    headers={{
      authorization
    }}
  />,
  document.getElementById("app")
);
