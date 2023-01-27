import { render } from "react-dom";
import React from "react";
import { Widget, Props, standalone } from "../";

const botUrl = process.env.NLX_BOT_URL as string;

const apiKey = process.env.NLX_BOT_API_KEY as string;

const props: Props = {
  config: {
    botUrl,
    languageCode: "en-US",
    headers: {
      "nlx-api-key": apiKey,
    },
    userId: "1234",
    context: {
      a: "b",
    },
  },
  initiallyExpanded: true,
  titleBar: {
    downloadable: true,
    title: "My Chat",
  },
};

// render(<Widget {...props} />, document.querySelector("#app"));
const { expand, collapse } = standalone(props);

setTimeout(() => {
  collapse();
}, 4000);

setTimeout(() => {
  expand();
}, 6000);
