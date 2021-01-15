import { render } from "react-dom";
import React from "react";
import { Widget, Props } from "../";

const botUrl = process.env.NLX_BOT_URL as string;

const apiKey = process.env.NLX_BOT_API_KEY as string;

const props: Props = {
  config: {
    botUrl,
    headers: {
      "nlx-api-key": apiKey,
    },
  },
  titleBar: {
    downloadable: true,
    title: "My Chat",
  },
};

render(<Widget {...props} />, document.querySelector("#app"));
